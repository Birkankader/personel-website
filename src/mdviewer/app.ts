// The Markdown viewer's page script: opening, drawing, following saves, links between files and
// history. Everything stays in the browser; nothing a document refers to by a relative path is
// ever requested from the server.
import type { MdViewerClient } from '../data/mdviewer';
import { createRenderer, decode, countWords, ID_PREFIX } from './render';
import {
  MARKDOWN_EXTENSIONS, isMarkdown, isRelative, splitRef, resolvePath,
  fileDoc, fileHandleDoc, folderDoc, folderFromHandle, folderFromInput, folderFromEntry,
  type Doc, type Folder,
} from './sources';
import { loadRecent, saveRecent, canRead, type Recent } from './recent';

interface HistoryState { mv: string | null; y?: number; hash?: string }
interface ShowOptions { push?: boolean; replace?: boolean; keepScroll?: boolean; y?: number; hash?: string; file?: File }

const MAX_BYTES = 20 * 1024 * 1024;
const POLL_MS = 1000;
const WORDS_PER_MINUTE = 220;
// Files a link may open in a new tab. Never HTML or SVG: as a document from this origin they could run script.
const VIEWABLE: Record<string, string> = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', avif: 'image/avif',
  bmp: 'image/bmp', ico: 'image/x-icon', pdf: 'application/pdf', txt: 'text/plain', log: 'text/plain',
  csv: 'text/plain', json: 'text/plain', mp4: 'video/mp4', webm: 'video/webm', mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg',
};
const IMAGE_TYPES: Record<string, string> = { svg: 'image/svg+xml', ...VIEWABLE };

const ext = (path: string) => path.slice(path.lastIndexOf('.') + 1).toLowerCase();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel)!;

export function start() {
  const copy: MdViewerClient = JSON.parse($('#mv-copy').textContent!);
  const render = createRenderer(copy.footnotes);
  const fill = (template: string, values: Record<string, string | number>) =>
    template.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));
  const num = (n: number, digits = 0) =>
    n.toLocaleString(copy.locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });

  const root = document.documentElement;
  const el = {
    welcome: $('[data-welcome]'),
    doc: $('[data-doc]'),
    docName: $('[data-doc-name]'),
    side: $('[data-side]'),
    list: $('[data-file-list]'),
    filter: $<HTMLInputElement>('[data-filter]'),
    folderName: $('[data-folder-name]'),
    folderCount: $('[data-folder-count]'),
    filesBtn: $('[data-act="files"]'),
    toast: $('[data-toast]'),
    drop: $('[data-drop]'),
    pickFile: $<HTMLInputElement>('[data-pick-file]'),
    pickFolder: $<HTMLInputElement>('[data-pick-folder]'),
    recent: $('[data-recent]'),
    recentBtn: $('[data-act="resume"]'),
    support: $('[data-support]'),
    status: Object.fromEntries(
      [...document.querySelectorAll<HTMLElement>('[data-s]')].map((node) => [node.dataset.s!, node]),
    ) as Record<'file' | 'size' | 'words' | 'read' | 'saved' | 'mode', HTMLElement>,
  };
  const baseTitle = document.title;

  let current: Doc | null = null;
  let folder: Folder | null = null;
  let stamp = { mod: 0, size: -1 };
  let seq = 0;
  let loading = 0;
  const docs = new Map<string, Doc>();
  const folderDocs = new WeakMap<Folder, Map<string, Doc>>();
  let sample: Doc | null = null;

  // ---------- Messages ----------
  let toastTimer = 0;
  function say(text: string) {
    el.toast.textContent = text;
    el.toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => el.toast.classList.remove('is-on'), 6000);
  }

  // ---------- Images and media next to the document ----------
  const urls = new Map<string, { url: string; mod: number; size: number }>();
  let urlsFolder: Folder | null = null;

  function typed(file: File, types: Record<string, string>) {
    const type = types[ext(file.name)];
    return type && file.type !== type ? new File([file], file.name, { type, lastModified: file.lastModified }) : file;
  }

  async function assetUrl(f: Folder, path: string | null): Promise<string | null> {
    if (path === null) return null;
    if (urlsFolder !== f) {
      for (const u of urls.values()) URL.revokeObjectURL(u.url);
      urls.clear();
      urlsFolder = f;
    }
    const file = await f.get(path);
    if (!file) return null;
    const known = urls.get(path);
    if (known && known.mod === file.lastModified && known.size === file.size) return known.url;
    if (known) URL.revokeObjectURL(known.url);
    const url = URL.createObjectURL(typed(file, IMAGE_TYPES));
    urls.set(path, { url, mod: file.lastModified, size: file.size });
    return url;
  }

  /** Points relative images and media at the folder's files and marks up links. Returns how many
   *  relative references could not be followed for want of a folder. */
  async function resolveRefs(frag: DocumentFragment, doc: Doc): Promise<number> {
    let unresolved = 0;
    for (const a of frag.querySelectorAll<HTMLAnchorElement>('a[href]')) {
      a.dataset.astroPrefetch = 'false';
      const href = a.getAttribute('href')!;
      if (!isRelative(href)) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      } else if (!href.startsWith('#') && !doc.folder) {
        unresolved++;
      }
    }
    for (const node of frag.querySelectorAll('[srcset]')) {
      if (node.getAttribute('srcset')!.split(',').some((c) => isRelative(c.trim()))) node.removeAttribute('srcset');
    }
    const jobs: Promise<void>[] = [];
    for (const node of frag.querySelectorAll('img, video, audio, source')) {
      for (const attr of ['src', 'poster']) {
        const ref = node.getAttribute(attr);
        if (!ref || !isRelative(ref)) continue;
        node.removeAttribute(attr);
        if (!doc.folder) { unresolved++; continue; }
        const path = resolvePath(doc.path, splitRef(ref).path);
        jobs.push(assetUrl(doc.folder, path).then((url) => {
          if (url) node.setAttribute(attr, url);
          else node.setAttribute('data-missing', path ?? ref);
        }));
      }
    }
    await Promise.all(jobs);
    return unresolved;
  }

  async function openAsset(f: Folder, path: string) {
    const name = path.slice(path.lastIndexOf('/') + 1);
    if (!VIEWABLE[ext(path)]) { say(fill(copy.msg.cannotOpen, { name })); return; }
    const file = await f.get(path);
    if (!file) { say(fill(copy.msg.missing, { path })); return; }
    const url = URL.createObjectURL(typed(file, VIEWABLE));
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  // ---------- Scroll ----------
  function holdScroll(y: number) {
    window.scrollTo(0, y);
    // Images inside the folder load a moment later and push the text down: hold the place until
    // they have, unless the reader scrolls first.
    const waiting = [...el.doc.querySelectorAll('img')].filter((img) => !img.complete);
    if (!waiting.length) return;
    let held = true;
    const release = () => { held = false; };
    const events = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
    events.forEach((type) => addEventListener(type, release, { once: true, passive: true }));
    waiting.forEach((img) => img.addEventListener('load', () => held && window.scrollTo(0, y), { once: true }));
    setTimeout(() => events.forEach((type) => removeEventListener(type, release)), 2000);
  }

  function goHash(id: string, push: boolean) {
    let name = id;
    try { name = decodeURIComponent(id); } catch { /* keep it as written */ }
    const q = (v: string) => CSS.escape(v);
    const target = name
      ? el.doc.querySelector(`[id="${q(ID_PREFIX + name)}"], [name="${q(ID_PREFIX + name)}"], [id="${q(name)}"]`)
      : null;
    if (push && current) {
      saveScroll();
      const state: HistoryState = { mv: current.key, hash: name };
      history.pushState(state, '', name ? `#${encodeURIComponent(name)}` : location.pathname);
    }
    if (target) target.scrollIntoView();
    else if (!name) window.scrollTo(0, 0);
  }

  function saveScroll() {
    if (!history.state) return;
    history.replaceState({ ...history.state, y: Math.round(window.scrollY) }, '');
  }
  let scrollTimer = 0;
  addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(saveScroll, 250);
  }, { passive: true });

  // ---------- Folder list ----------
  function showFolder(f: Folder) {
    folder = f;
    root.dataset.folder = '';
    el.side.hidden = false;
    el.folderName.textContent = f.name;
    el.folderName.title = f.name;
    el.folderCount.textContent = fill(copy.folderCount, { n: num(f.files.length) });

    const groups = new Map<string, string[]>();
    for (const path of f.files) {
      const dir = path.slice(0, Math.max(0, path.lastIndexOf('/')));
      groups.set(dir, [...(groups.get(dir) ?? []), path]);
    }
    const frag = document.createDocumentFragment();
    for (const [dir, paths] of groups) {
      const group = document.createElement('li');
      group.className = 'mv-files__group';
      if (dir) {
        const label = document.createElement('span');
        label.className = 'mv-files__dir mono';
        label.textContent = `${dir}/`;
        group.append(label);
      }
      const list = document.createElement('ul');
      for (const path of paths) {
        const item = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'mv-file';
        button.dataset.path = path;
        button.title = path;
        button.innerHTML = '<span class="mv-file__pt" aria-hidden="true"></span>';
        button.append(path.slice(path.lastIndexOf('/') + 1));
        item.append(button);
        list.append(item);
      }
      group.append(list);
      frag.append(group);
    }
    el.list.replaceChildren(frag);
    el.filter.value = '';
    el.filter.hidden = f.files.length < 12;
  }

  function leaveFolder() {
    folder = null;
    delete root.dataset.folder;
    closeDrawer();
    el.side.hidden = true;
    el.list.replaceChildren();
  }

  function markCurrent() {
    for (const button of el.list.querySelectorAll<HTMLElement>('[data-path]')) {
      const on = current?.folder === folder && button.dataset.path === current?.path;
      if (on) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    }
    el.list.querySelector('[aria-current]')?.scrollIntoView({ block: 'nearest' });
  }

  el.filter.addEventListener('input', () => {
    const q = el.filter.value.trim().toLocaleLowerCase(copy.locale);
    for (const group of el.list.children) {
      let any = false;
      for (const button of group.querySelectorAll<HTMLElement>('[data-path]')) {
        const hit = !q || button.dataset.path!.toLocaleLowerCase(copy.locale).includes(q);
        button.parentElement!.hidden = !hit;
        any ||= hit;
      }
      (group as HTMLElement).hidden = !any;
    }
  });

  el.list.addEventListener('click', (e) => {
    const button = (e.target as Element).closest<HTMLElement>('[data-path]');
    if (!button || !folder) return;
    closeDrawer();
    if (current?.folder === folder && current.path === button.dataset.path) return;
    void openInFolder(folder, button.dataset.path!, { push: true });
  });

  // ---------- Drawing a document ----------
  function failMessage(err: unknown, doc: Doc) {
    const name = (err as DOMException | null)?.name;
    if (name === 'NotFoundError') return fill(copy.msg.missing, { path: doc.path ?? doc.name });
    if (name === 'NotReadableError') return fill(copy.msg.changed, { name: doc.name });
    return fill(copy.msg.unreadable, { name: doc.name });
  }

  async function show(doc: Doc, opts: ShowOptions = {}): Promise<boolean> {
    const mine = ++seq;
    loading++;
    try {
      let file: File;
      let text: string;
      try {
        file = opts.file ?? (await doc.read());
        if (file.size > MAX_BYTES) { say(fill(copy.msg.tooLarge, { name: doc.name })); return false; }
        text = decode(await file.arrayBuffer());
      } catch (err) {
        if (mine === seq) say(failMessage(err, doc));
        return false;
      }
      const frag = render(text);
      const unresolved = await resolveRefs(frag, doc);
      if (mine !== seq) return false;

      const y = window.scrollY;
      const same = current === doc;
      if (opts.push) {
        saveScroll();
        history.pushState({ mv: doc.key } satisfies HistoryState, '', location.pathname);
      } else if (opts.replace) {
        history.replaceState({ mv: doc.key } satisfies HistoryState, '', location.pathname);
      }
      docs.set(doc.key, doc);
      if (doc.folder && doc.folder !== folder) showFolder(doc.folder);
      else if (!doc.folder && folder) leaveFolder();

      el.doc.replaceChildren(frag);
      el.doc.hidden = false;
      el.welcome.hidden = true;
      root.dataset.state = 'doc';
      current = doc;
      stamp = { mod: file.lastModified, size: file.size };
      describe(doc, file);
      markCurrent();

      if (opts.keepScroll) holdScroll(y);
      else if (opts.y !== undefined) holdScroll(opts.y);
      else if (opts.hash) goHash(opts.hash, false);
      else window.scrollTo(0, 0);
      if (unresolved && !same) say(copy.msg.needFolder);
      remember(doc);
      return true;
    } finally {
      loading--;
    }
  }

  function describe(doc: Doc, file: File) {
    const label = doc.path ?? doc.name;
    document.title = `${doc.name} | ${copy.title}`;
    el.docName.textContent = label;
    el.docName.title = label;
    const words = countWords(el.doc.textContent ?? '');
    const s = el.status;
    s.file.textContent = label;
    s.size.textContent = file.size < 1024 ? `${num(file.size)} B`
      : file.size < 1024 * 1024 ? `${num(file.size / 1024, 1)} KB` : `${num(file.size / 1048576, 1)} MB`;
    s.words.textContent = num(words);
    s.read.textContent = `${num(Math.max(1, Math.round(words / WORDS_PER_MINUTE)))} ${copy.minutes}`;
    const saved = new Date(file.lastModified);
    s.saved.textContent = saved.toDateString() === new Date().toDateString()
      ? saved.toLocaleTimeString(copy.locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : saved.toLocaleString(copy.locale, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    s.mode.textContent = doc.live ? copy.status.live : copy.status.still;
    s.mode.classList.toggle('is-live', doc.live);
  }

  function showWelcome(push: boolean) {
    seq++;
    if (push) {
      saveScroll();
      history.pushState({ mv: null } satisfies HistoryState, '', location.pathname);
    }
    current = null;
    delete root.dataset.state;
    el.doc.hidden = true;
    el.doc.replaceChildren();
    el.welcome.hidden = false;
    el.docName.textContent = '';
    document.title = baseTitle;
    markCurrent();
    window.scrollTo(0, 0);
  }

  // ---------- Opening ----------
  async function openFileHandle(handle: FileSystemFileHandle) {
    if (!isMarkdown(handle.name)) { say(fill(copy.msg.notMarkdown, { name: handle.name })); return; }
    await show(fileHandleDoc(handle), { push: true });
  }

  async function openFile(file: File) {
    if (!isMarkdown(file.name)) { say(fill(copy.msg.notMarkdown, { name: file.name })); return; }
    await show(fileDoc(file), { push: true });
  }

  async function openInFolder(f: Folder, path: string, opts: ShowOptions) {
    let known = folderDocs.get(f);
    if (!known) folderDocs.set(f, (known = new Map()));
    const doc = known.get(path) ?? folderDoc(f, path);
    if (await show(doc, opts)) known.set(path, doc);
  }

  async function openFolder(f: Folder | null, prefer?: string, opts: ShowOptions = { push: true }) {
    if (!f) return;
    if (!f.files.length) { say(fill(copy.msg.empty, { name: f.name })); return; }
    showFolder(f);
    if (f.truncated) say(fill(copy.msg.truncated, { n: num(f.files.length) }));
    const path = (prefer && f.files.includes(prefer) ? prefer : null)
      ?? f.files.find((p) => /^(readme|index)\.(md|markdown)$/i.test(p))
      ?? f.files[0];
    await openInFolder(f, path, opts);
  }

  async function scanFolder(handle: FileSystemDirectoryHandle) {
    say(fill(copy.msg.reading, { name: handle.name }));
    const f = await folderFromHandle(handle);
    el.toast.classList.remove('is-on');
    return f;
  }

  const isAbort = (err: unknown) => (err as DOMException | null)?.name === 'AbortError';

  async function pickFile() {
    if (!window.showOpenFilePicker) { el.pickFile.click(); return; }
    try {
      const [handle] = await window.showOpenFilePicker({
        id: 'md-viewer',
        types: [{ description: 'Markdown', accept: { 'text/markdown': MARKDOWN_EXTENSIONS } }],
      });
      await openFileHandle(handle);
    } catch (err) {
      if (!isAbort(err)) say(copy.msg.denied);
    }
  }

  async function pickFolder() {
    if (!window.showDirectoryPicker) { el.pickFolder.click(); return; }
    try {
      await openFolder(await scanFolder(await window.showDirectoryPicker({ id: 'md-viewer', mode: 'read' })));
    } catch (err) {
      if (!isAbort(err)) say(copy.msg.denied);
    }
  }

  el.pickFolder.webkitdirectory = true;
  el.pickFile.addEventListener('change', () => {
    const file = el.pickFile.files?.[0];
    el.pickFile.value = '';
    if (file) void openFile(file);
  });
  el.pickFolder.addEventListener('change', () => {
    const f = el.pickFolder.files?.length ? folderFromInput(el.pickFolder.files) : null;
    el.pickFolder.value = '';
    void openFolder(f);
  });

  async function reload() {
    if (!current) return;
    const doc = current;
    if (doc.folder?.refresh) {
      await doc.folder.refresh();
      if (doc.folder === folder) showFolder(doc.folder);
    }
    await show(doc, { keepScroll: true });
  }

  function showSample() {
    sample ??= fileDoc(new File([copy.sample], copy.sampleName, { type: 'text/markdown' }));
    void show(sample, { push: true });
  }

  // ---------- Following saves ----------
  let polling = false;
  let misses = 0;
  async function poll() {
    const doc = current;
    if (!doc?.live || document.hidden || polling || loading) return;
    polling = true;
    try {
      let file = await doc.read();
      misses = 0;
      if (file.lastModified === stamp.mod && file.size === stamp.size) return;
      // Editors save in bursts (truncate, write, rename): let the file settle before drawing it.
      await sleep(150);
      file = await doc.read();
      if (current === doc && !loading) await show(doc, { keepScroll: true, file });
    } catch {
      // A save that replaces the file can leave it missing for a moment.
      if (++misses >= 3 && current === doc) {
        doc.live = false;
        el.status.mode.textContent = copy.status.still;
        el.status.mode.classList.remove('is-live');
        say(fill(copy.msg.gone, { name: doc.name }));
      }
    } finally {
      polling = false;
    }
  }
  setInterval(poll, POLL_MS);
  document.addEventListener('visibilitychange', poll);

  // ---------- Coming back to the last file ----------
  function remember(doc: Doc) {
    let recent: Recent | null = null;
    if (doc.handle) recent = { kind: 'file', handle: doc.handle };
    else if (doc.folder?.handle && doc.path) recent = { kind: 'folder', handle: doc.folder.handle, path: doc.path };
    if (recent) void saveRecent(recent);
  }

  async function resume(recent: Recent, opts: ShowOptions) {
    try {
      if (recent.kind === 'file') await show(fileHandleDoc(recent.handle), opts);
      else await openFolder(await scanFolder(recent.handle), recent.path, opts);
    } catch {
      el.recent.hidden = true;
    }
  }

  async function offerRecent() {
    const recent = await loadRecent();
    if (!recent?.handle) return;
    // Already allowed (a reload, or "allow on every visit"): open it straight away.
    if (await canRead(recent.handle, false).catch(() => false)) {
      if (!current) await resume(recent, { replace: true });
      return;
    }
    el.recentBtn.textContent = recent.kind === 'folder' ? `${recent.handle.name}/${recent.path}` : recent.handle.name;
    el.recent.hidden = false;
    el.recentBtn.addEventListener('click', async () => {
      if (await canRead(recent.handle, true).catch(() => false)) await resume(recent, { push: true });
      else say(copy.msg.denied);
    });
  }

  // ---------- Dropping ----------
  let dragDepth = 0;
  const hasFiles = (e: DragEvent) => !!e.dataTransfer?.types.includes('Files');
  const dropOff = () => { dragDepth = 0; el.drop.classList.remove('is-on'); };
  addEventListener('dragenter', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    if (dragDepth++ === 0) el.drop.classList.add('is-on');
  });
  addEventListener('dragover', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'copy';
  });
  addEventListener('dragleave', (e) => {
    if (hasFiles(e) && --dragDepth <= 0) dropOff();
  });
  addEventListener('drop', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    dropOff();
    // Everything a dropped item offers has to be asked for now, before the event ends.
    const items = [...e.dataTransfer!.items].filter((i) => i.kind === 'file').map((i) => ({
      handle: i.getAsFileSystemHandle?.().catch(() => null) ?? Promise.resolve(null),
      entry: i.webkitGetAsEntry?.() ?? null,
      file: i.getAsFile(),
    }));
    void (async () => {
      const dropped = await Promise.all(items.map(async (i) => ({ ...i, handle: await i.handle })));
      const dir = dropped.find((d) => (d.handle ? d.handle.kind === 'directory' : d.entry?.isDirectory));
      if (dir) {
        if (dir.handle) await openFolder(await scanFolder(dir.handle as FileSystemDirectoryHandle));
        else await openFolder(await folderFromEntry(dir.entry as FileSystemDirectoryEntry));
        return;
      }
      const md = dropped.find((d) => isMarkdown(d.handle?.name ?? d.file?.name ?? '')) ?? dropped[0];
      if (!md) return;
      if (md.handle) await openFileHandle(md.handle as FileSystemFileHandle);
      else if (md.file) await openFile(md.file);
    })();
  });

  // ---------- Links in the document ----------
  el.doc.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href]');
    const doc = current;
    if (!a || !doc) return;
    const href = a.getAttribute('href')!;
    if (!isRelative(href)) return; // the web: opens in a new tab
    e.preventDefault();
    const { path, hash } = splitRef(href);
    if (!path) { goHash(hash, true); return; }
    if (!doc.folder) { say(copy.msg.needFolder); return; }
    const target = resolvePath(doc.path, path);
    if (target === null) { say(fill(copy.msg.missing, { path })); return; }
    if (target === doc.path) { goHash(hash, true); return; }
    if (isMarkdown(target)) void openInFolder(doc.folder, target, { push: true, hash });
    else void openAsset(doc.folder, target);
  });
  // A middle click on a relative link would ask the server for the file; it stays here instead.
  el.doc.addEventListener('auxclick', (e) => {
    const a = (e.target as Element).closest('a[href]');
    if (a && isRelative(a.getAttribute('href')!)) e.preventDefault();
  });

  // ---------- History: Alt+← goes back a file ----------
  history.scrollRestoration = 'manual';
  history.replaceState({ mv: null } satisfies HistoryState, '', location.pathname);
  addEventListener('popstate', (e) => {
    const state = e.state as HistoryState | null;
    if (!state) {
      if (current && location.hash) goHash(location.hash.slice(1), false);
      return;
    }
    const doc = state.mv ? docs.get(state.mv) : null;
    if (!doc) { showWelcome(false); return; }
    if (doc !== current) { void show(doc, { y: state.y, hash: state.hash }); return; }
    if (state.y !== undefined) window.scrollTo(0, state.y);
    else goHash(state.hash ?? '', false);
  });

  // ---------- Buttons and keys ----------
  function closeDrawer() {
    delete root.dataset.drawer;
    el.filesBtn.setAttribute('aria-expanded', 'false');
  }

  // A tap beside the open file list (on the dimmed page) only closes it.
  document.addEventListener('click', (e) => {
    const target = e.target as Element;
    if (!('drawer' in root.dataset) || el.side.contains(target) || target.closest('[data-act="files"]')) return;
    e.preventDefault();
    e.stopPropagation();
    closeDrawer();
  }, true);

  document.addEventListener('click', (e) => {
    const target = (e.target as Element).closest<HTMLElement>('[data-act]');
    switch (target?.dataset.act) {
      case 'open': void pickFile(); break;
      case 'folder': void pickFolder(); break;
      case 'sample': showSample(); break;
      case 'reload': void reload(); break;
      case 'home':
        e.preventDefault();
        if (current) showWelcome(true);
        break;
      case 'files': {
        const open = !('drawer' in root.dataset);
        if (open) root.dataset.drawer = ''; else delete root.dataset.drawer;
        target.setAttribute('aria-expanded', String(open));
        break;
      }
    }
  });

  addEventListener('keydown', (e) => {
    const mod = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();
    if (mod && !e.altKey && key === 'o') {
      e.preventDefault();
      void (e.shiftKey ? pickFolder() : pickFile());
    } else if (current && !e.shiftKey && ((e.key === 'F5' && !mod) || (mod && !e.altKey && key === 'r'))) {
      e.preventDefault();
      void reload();
    } else if (e.key === 'Escape' && 'drawer' in root.dataset) {
      closeDrawer();
      el.filesBtn.focus();
    }
  });

  document.querySelector<HTMLElement>('[data-lang-switch]')?.addEventListener('click', (e) => {
    try { localStorage.setItem('lang', (e.currentTarget as HTMLElement).dataset.langSwitch!); } catch { /* private mode */ }
  });

  if (!window.showOpenFilePicker) el.support.hidden = false;
  void offerRecent();
}
