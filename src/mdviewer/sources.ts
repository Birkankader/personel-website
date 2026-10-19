// Where documents come from. With the File System Access API (Chrome, Edge) a file or folder is a
// handle the page can read again, so it follows saves; elsewhere it is a File read once.

declare global {
  interface Window {
    showOpenFilePicker?: (options?: {
      id?: string;
      types?: { description: string; accept: Record<string, string[]> }[];
    }) => Promise<FileSystemFileHandle[]>;
    showDirectoryPicker?: (options?: { id?: string; mode?: 'read' | 'readwrite' }) => Promise<FileSystemDirectoryHandle>;
  }
  interface DataTransferItem {
    getAsFileSystemHandle?: () => Promise<FileSystemHandle | null>;
  }
  interface FileSystemHandle {
    queryPermission?: (options: { mode: 'read' }) => Promise<PermissionState>;
    requestPermission?: (options: { mode: 'read' }) => Promise<PermissionState>;
  }
}

export const MARKDOWN_EXTENSIONS = ['.md', '.markdown', '.mdown', '.mkd', '.mkdn', '.mdwn'];
export const isMarkdown = (name: string) => MARKDOWN_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext));

export interface Folder {
  name: string;
  /** Follows changes on disk. */
  live: boolean;
  /** Markdown files as paths relative to the folder, root first, then by folder. */
  files: string[];
  /** More Markdown files than FILE_LIMIT were found; only the first are listed. */
  truncated: boolean;
  /** Any file in the folder by its relative path. */
  get(path: string): Promise<File | null>;
  /** Lists the folder again (live folders only). */
  refresh?(): Promise<void>;
  handle?: FileSystemDirectoryHandle;
}

export interface Doc {
  key: string;
  name: string;
  /** Path inside its folder, when it has one. */
  path: string | null;
  folder: Folder | null;
  live: boolean;
  read(): Promise<File>;
  handle?: FileSystemFileHandle;
}

const FILE_LIMIT = 2000;
const SKIP_DIRS = new Set(['node_modules', 'bower_components', 'vendor', 'dist', 'build', 'target', 'bin', 'obj', '__pycache__']);
const skipDir = (name: string) => name.startsWith('.') || SKIP_DIRS.has(name);

/** Root files first, then folder by folder, each in natural order. */
function sortPaths(paths: string[]) {
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  const dir = (p: string) => p.slice(0, Math.max(0, p.lastIndexOf('/')));
  return paths.sort((a, b) => collator.compare(dir(a), dir(b)) || collator.compare(a, b));
}

let nextKey = 0;
export const newKey = (prefix: string) => `${prefix}${++nextKey}`;

export function fileHandleDoc(handle: FileSystemFileHandle): Doc {
  return { key: newKey('h'), name: handle.name, path: null, folder: null, live: true, read: () => handle.getFile(), handle };
}

export function fileDoc(file: File): Doc {
  return { key: newKey('f'), name: file.name, path: null, folder: null, live: false, read: async () => file };
}

async function listMarkdown(dir: FileSystemDirectoryHandle) {
  const found: string[] = [];
  let truncated = false;
  async function walk(handle: FileSystemDirectoryHandle, prefix: string, depth: number) {
    for await (const [name, entry] of handle.entries()) {
      if (found.length >= FILE_LIMIT) { truncated = true; return; }
      if (entry.kind === 'directory') {
        if (depth < 12 && !skipDir(name)) await walk(entry as FileSystemDirectoryHandle, `${prefix}${name}/`, depth + 1);
      } else if (isMarkdown(name)) {
        found.push(prefix + name);
      }
    }
  }
  await walk(dir, '', 0);
  return { files: sortPaths(found), truncated };
}

export async function folderFromHandle(dir: FileSystemDirectoryHandle): Promise<Folder> {
  const { files, truncated } = await listMarkdown(dir);
  return {
    name: dir.name,
    live: true,
    files,
    truncated,
    handle: dir,
    async refresh() {
      Object.assign(this, await listMarkdown(dir));
    },
    async get(path) {
      const parts = path.split('/');
      try {
        let at = dir;
        for (const part of parts.slice(0, -1)) at = await at.getDirectoryHandle(part);
        return await (await at.getFileHandle(parts[parts.length - 1])).getFile();
      } catch {
        return null;
      }
    },
  };
}

/** A folder picked with <input webkitdirectory> or dropped where only the old entries API exists:
 *  every file is a File as it was at that moment. */
export function folderFromFiles(name: string, files: Map<string, File>, truncated = false): Folder {
  const lower = new Map([...files].map(([p, f]) => [p.toLowerCase(), f]));
  const md = [...files.keys()].filter((p) => isMarkdown(p) && !p.split('/').slice(0, -1).some(skipDir));
  return {
    name,
    live: false,
    files: sortPaths(md).slice(0, FILE_LIMIT),
    truncated: truncated || md.length > FILE_LIMIT,
    get: async (path) => files.get(path) ?? lower.get(path.toLowerCase()) ?? null,
  };
}

export function folderFromInput(list: FileList): Folder | null {
  const files = new Map<string, File>();
  let name = '';
  for (const file of list) {
    const [root, ...rest] = file.webkitRelativePath.split('/');
    name ||= root;
    files.set(rest.join('/') || file.name, file);
  }
  return files.size ? folderFromFiles(name, files) : null;
}

/** Reads a dropped directory through the entries API (Firefox, Safari). */
export async function folderFromEntry(root: FileSystemDirectoryEntry): Promise<Folder> {
  const files = new Map<string, File>();
  const ENTRY_LIMIT = 20000;
  const readAll = (reader: FileSystemDirectoryReader) =>
    new Promise<FileSystemEntry[]>((resolve, reject) => {
      const out: FileSystemEntry[] = [];
      const next = () => reader.readEntries((batch) => (batch.length ? (out.push(...batch), next()) : resolve(out)), reject);
      next();
    });
  const fileOf = (entry: FileSystemFileEntry) => new Promise<File>((resolve, reject) => entry.file(resolve, reject));

  async function walk(dir: FileSystemDirectoryEntry, prefix: string, depth: number) {
    for (const entry of await readAll(dir.createReader())) {
      if (files.size >= ENTRY_LIMIT) return;
      if (entry.isDirectory) {
        if (depth < 12 && !skipDir(entry.name)) await walk(entry as FileSystemDirectoryEntry, `${prefix}${entry.name}/`, depth + 1);
      } else {
        try { files.set(prefix + entry.name, await fileOf(entry as FileSystemFileEntry)); } catch { /* unreadable: leave it out */ }
      }
    }
  }
  await walk(root, '', 0);
  return folderFromFiles(root.name, files, files.size >= ENTRY_LIMIT);
}

/** The document at `path` inside `folder`. */
export function folderDoc(folder: Folder, path: string): Doc {
  const name = path.slice(path.lastIndexOf('/') + 1);
  // Inside a live folder the file's own handle is kept, so a save that replaces the file
  // (write to a temporary file, then rename) is still read at the same path.
  let handle: Promise<FileSystemFileHandle | null> | null = null;
  const fileHandle = () => {
    handle ??= (async () => {
      if (!folder.handle) return null;
      const parts = path.split('/');
      let at = folder.handle;
      for (const part of parts.slice(0, -1)) at = await at.getDirectoryHandle(part);
      return at.getFileHandle(parts[parts.length - 1]);
    })().catch(() => null);
    return handle;
  };
  return {
    key: newKey('d'),
    name,
    path,
    folder,
    live: folder.live,
    async read() {
      const h = await fileHandle();
      const file = h ? await h.getFile() : await folder.get(path);
      if (!file) throw new DOMException(`${path} not found`, 'NotFoundError');
      return file;
    },
  };
}

/** Resolves a link written in the document at `from` (a folder path) to a path in the folder.
 *  A leading slash starts at the folder's root. Returns null for a path that leaves the folder. */
export function resolvePath(from: string | null, ref: string): string | null {
  const out = ref.startsWith('/') ? [] : (from ?? '').split('/').slice(0, -1);
  for (const raw of ref.split('/')) {
    let part = raw;
    try { part = decodeURIComponent(raw); } catch { /* keep it as written */ }
    if (part === '' || part === '.') continue;
    if (part === '..') {
      if (!out.length) return null;
      out.pop();
    } else {
      out.push(part);
    }
  }
  return out.join('/');
}

/** A reference with no scheme: a path next to the document (or an in-page #anchor). */
export const isRelative = (ref: string) => !/^[a-z][a-z\d+.-]*:/i.test(ref) && !ref.startsWith('//');

export function splitRef(ref: string): { path: string; hash: string } {
  const hashAt = ref.indexOf('#');
  const beforeHash = hashAt < 0 ? ref : ref.slice(0, hashAt);
  const queryAt = beforeHash.indexOf('?');
  return { path: queryAt < 0 ? beforeHash : beforeHash.slice(0, queryAt), hash: hashAt < 0 ? '' : ref.slice(hashAt + 1) };
}
