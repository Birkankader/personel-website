// Project wiring, run once at boot (before the first page and the loader). Page-level effects live
// in onPage so the engine reverts them on navigation.
import { gsap } from 'gsap';
import { addCriticalTask, ease, LOADER_CAP, onPage, onScroll, prefersReducedMotion, scrollState, scrollToTarget } from '../engine';
import { onAfterSwap } from '../engine/astro';
import { loadTerrain } from './map/terrain';
import { initMap } from './map/driver';
import { initFlood } from './flood';

export function setupMotion() {
  // The elevation data is worth holding the loader for only while it can still land before the
  // progress cap (about 0.4 s to fetch and decode on a decent phone). A page that boots later, on a
  // slow network, drains with the solid panel and the map arrives after.
  const terrain = loadTerrain();
  if (performance.now() / 1000 < LOADER_CAP - 0.4) addCriticalTask(terrain);
  initMap();
  initFlood();
  // Astro swaps <html> attributes on navigation; the loader only ever runs once.
  onAfterSwap(() => document.documentElement.classList.add('is-loaded'));
  // After a page change the pointer still rests where it clicked, now over whatever the new page
  // put there. That hover waits until the pointer moves, so a nav item under it never reads as a
  // second current page. Touch has no hover to wait for.
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  onAfterSwap(() => {
    if (!fine.matches) return;
    const root = document.documentElement;
    root.classList.add('hover-hold');
    const release = () => root.classList.remove('hover-hold');
    addEventListener('pointermove', release, { once: true, passive: true });
    addEventListener('pointerdown', release, { once: true, capture: true });
    addEventListener('keydown', release, { once: true, capture: true });
  });
  document.addEventListener('click', onClick);
  document.addEventListener('submit', onSubmit);
  onPage(page);
}

function page() {
  const offs: (() => void)[] = [];
  const reduced = prefersReducedMotion();

  // Header: steps aside while reading down, returns on the way up, turns negative over dark ground.
  // It leaves once the page has moved a fifth of a screen, before display type slides under it.
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (header) {
    const darks = [...document.querySelectorAll<HTMLElement>('main [data-tone="dark"]')];
    let lastY = scrollState().y;
    const update = (y: number) => {
      header.classList.toggle('is-scrolled', y > 24);
      if (Math.abs(y - lastY) > 8) {
        header.classList.toggle('is-away', !reduced && y > lastY && y > innerHeight * 0.2);
        lastY = y;
      }
      const mid = header.offsetHeight / 2;
      const dark = darks.some((el) => { const r = el.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; });
      if (dark) header.dataset.tone = 'dark';
      else delete header.dataset.tone;
    };
    update(scrollState().y);
    const off = onScroll((s) => update(s.y));
    offs.push(() => { off(); header.classList.remove('is-away'); });
  }

  if (!reduced) {
    // Field log: the profile plots left to right, then the numbered points drop onto it.
    const chart = document.querySelector<HTMLElement>('[data-chart]');
    if (chart) {
      gsap.timeline({ scrollTrigger: { trigger: chart, start: 'top 82%', once: true } })
        .fromTo(chart.querySelectorAll('svg'), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.7, ease: ease.pen })
        .from(chart.querySelectorAll('[data-chart-mark]'), { autoAlpha: 0, y: -14, duration: 0.5, ease: ease.out, stagger: 0.09 }, 0.7);
    }
    // Career line: drawn like a route, a point dropped at each role.
    const roles = document.querySelector<HTMLElement>('[data-roles]');
    if (roles) {
      const vertical = innerWidth < 768;
      gsap.timeline({ scrollTrigger: { trigger: roles, start: 'top 86%', once: true } })
        .from(roles.querySelector('.roles__line'), { [vertical ? 'scaleY' : 'scaleX']: 0, duration: 1.4, ease: ease.pen })
        .from(roles.querySelectorAll('.role__pt'), { scale: 0, duration: 0.45, ease: ease.out, stagger: 0.32 }, 0.1)
        .from(roles.querySelectorAll('.role__date, .role__name'), { autoAlpha: 0, y: 10, duration: 0.6, ease: ease.out, stagger: 0.07 }, 0.25);
    }
  }

  // About: pointing at or focusing the photo toggle starts the photo's download.
  const portrait = document.querySelector<HTMLElement>('[data-portrait]');
  const reach = portrait?.querySelector('[data-portrait-toggle]');
  if (portrait && reach) {
    const want = () => reachForPhoto(portrait);
    reach.addEventListener('pointerenter', want, { once: true });
    reach.addEventListener('focus', want, { once: true });
    offs.push(() => { reach.removeEventListener('pointerenter', want); reach.removeEventListener('focus', want); });
  }

  // Arriving with a hash (/#work from another page): land on it once the page is laid out.
  if (location.hash.length > 1) {
    const id = decodeURIComponent(location.hash.slice(1));
    const el = document.getElementById(id);
    if (el) requestAnimationFrame(() => scrollToTarget(el, { immediate: true, offset: -24 }));
  }

  return () => offs.forEach((f) => f());
}

function onClick(e: MouseEvent) {
  const el = e.target as Element | null;
  if (!el?.closest) return;

  const lang = el.closest<HTMLElement>('[data-lang-switch]');
  if (lang) { try { localStorage.setItem('lang', lang.dataset.langSwitch!); } catch { /* private mode */ } }

  const copy = el.closest<HTMLButtonElement>('[data-copy]');
  if (copy) {
    const label = copy.querySelector<HTMLElement>('[data-copy-label]');
    const status = copy.closest('section')?.querySelector<HTMLElement>('[data-copy-status]');
    const original = label?.textContent ?? '';
    const done = () => {
      if (label) label.textContent = copy.dataset.copied ?? '';
      if (status) status.textContent = copy.dataset.copied ?? '';
      copy.dataset.state = 'done';
      window.setTimeout(() => { if (label) label.textContent = original; delete copy.dataset.state; if (status) status.textContent = ''; }, 2200);
    };
    navigator.clipboard?.writeText(copy.dataset.copy!).then(done, () => selectAddress(copy)) ?? selectAddress(copy);
  }

  const toggle = el.closest<HTMLButtonElement>('[data-portrait-toggle]');
  if (toggle) {
    const fig = toggle.closest<HTMLElement>('[data-portrait]');
    if (fig) {
      const photo = fig.dataset.show !== 'photo';
      toggle.setAttribute('aria-pressed', String(photo));
      toggle.textContent = (photo ? toggle.dataset.labelLines : toggle.dataset.labelPhoto) ?? '';
      // The photo fades in once it can paint, unless the visitor has toggled back meanwhile.
      const img = reachForPhoto(fig);
      const show = () => { if (toggle.getAttribute('aria-pressed') === String(photo)) fig.dataset.show = photo ? 'photo' : 'lines'; };
      if (photo && img && !img.complete) img.decode().then(show, show);
      else show();
    }
  }
}

/** The portrait photo is not fetched with the page; it loads when the visitor reaches for it. */
function reachForPhoto(fig: HTMLElement) {
  const img = fig.querySelector<HTMLImageElement>('.portrait__photo');
  if (img && !('photo' in fig.dataset)) {
    fig.dataset.photo = '';
    img.loading = 'eager';
  }
  return img;
}

function selectAddress(btn: HTMLElement) {
  const code = btn.parentElement?.querySelector('code');
  if (!code) return;
  const r = document.createRange();
  r.selectNodeContents(code);
  const sel = getSelection();
  sel?.removeAllRanges();
  sel?.addRange(r);
}

async function onSubmit(e: SubmitEvent) {
  const form = (e.target as Element | null)?.closest?.<HTMLFormElement>('[data-contact-form]');
  if (!form) return;
  e.preventDefault();
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const say = (text: string, kind: 'ok' | 'error' | '') => { if (status) { status.textContent = text; status.dataset.kind = kind; } };
  const { service, template, key, sending, sent, failed } = form.dataset;
  if (!service || !template || !key) return say(failed ?? '', 'error');
  if (button) { button.disabled = true; button.textContent = sending ?? ''; }
  say('', '');
  try {
    const { default: emailjs } = await import('@emailjs/browser');
    await emailjs.sendForm(service, template, form, { publicKey: key });
    form.reset();
    say(sent ?? '', 'ok');
  } catch {
    say(failed ?? '', 'error');
  } finally {
    if (button) { button.disabled = false; button.textContent = button.dataset.label ?? ''; }
  }
}
