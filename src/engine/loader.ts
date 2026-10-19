// First-load sequence. Progress follows REAL work (fonts, critical images and any task added with
// addCriticalTask, here the elevation texture), eased by GSAP, with a floor so it reads as
// intentional and a ceiling so it never becomes a usability problem.
// Markup (#loader) lives in the layout; its look is authored per project.
import { gsap } from 'gsap';
import { ease, prefersReducedMotion } from './env';

let format = (p: number) => String(Math.round(p)).padStart(3, '0');
/** Customize the counter text. p goes 0 → 100. */
export const setLoaderFormat = (fn: (p: number) => string) => { format = fn; };
type Exit = (root: HTMLElement, late: boolean) => gsap.core.Timeline | Promise<unknown>;
let exit: Exit | null = null;
/** Replace the exit choreography (the loader → hero handoff). `late`: the page booted after the
 *  designed pause, so the visitor has already waited; the exit should be short. */
export const setLoaderExit = (fn: Exit) => { exit = fn; };
const extra: Promise<unknown>[] = [];
/** Add real work the loader waits for (call during setup, before the loader runs). */
export const addCriticalTask = (p: Promise<unknown>) => { extra.push(p.catch(() => {})); };

const MIN = 0.45; // seconds: long enough to read as a designed moment
export const MAX = 2.6; // seconds: progress + exit; a longer loader is a usability problem
export const PROGRESS_CAP = 1.4; // seconds: leaves room for the exit inside MAX
// The designed pause is for the first visit to a page that asks for it (#loader[data-pause]). A
// later hard load in the same tab session (a reload, a link opened in place) has <html class="seen">
// from the head script, and a deep link has no data-pause: no designed pause, only the work.
const SEEN = 'loader-seen';
const designed = (root: HTMLElement) => !document.documentElement.classList.contains('seen') && 'pause' in root.dataset;

function criticalAssets(): Promise<unknown>[] {
  // A lazy image is not critical: it may never be on screen during the intro.
  const imgs = [...document.querySelectorAll<HTMLImageElement>('img[data-critical], [data-intro] img:not([loading="lazy"])')];
  return [document.fonts.ready, ...extra, ...imgs.map((i) => (i.complete ? Promise.resolve() : i.decode().catch(() => {})))];
}

export async function runLoader(): Promise<void> {
  const root = document.getElementById('loader');
  if (!root) return;
  if (prefersReducedMotion()) {
    await Promise.race([Promise.all(criticalAssets()), wait(Math.max(0, MAX - performance.now() / 1000))]);
    await gsap.to(root, { autoAlpha: 0, duration: 0.3 });
    return finish(root);
  }
  const count = root.querySelector<HTMLElement>('[data-loader-count]');
  const min = designed(root) ? MIN : 0, cap = designed(root) ? PROGRESS_CAP : 1;
  // Booting after the designed pause (a slow network): the visitor has already sat through it while
  // the page downloaded. The counter follows the real work closely, and the exit starts as soon as
  // the work is done, while the counter runs out, instead of after it.
  const late = performance.now() / 1000 > min;
  const tasks = criticalAssets();
  let done = 0;
  const shown = { v: 0 };
  const target = { v: 0 };
  tasks.forEach((t) => t.then(() => { done++; target.v = (done / tasks.length) * 100; }));
  const rate = late ? 0.4 : 0.2;
  await new Promise<void>((resolve) => {
    let go = false;
    const tick = () => {
      // Timed from navigation start: the loader has been on screen since the first paint, so a slow
      // script download does not add a second wait on top of the first.
      const elapsed = performance.now() / 1000;
      const timeCap = min ? Math.min(100, (elapsed / min) * 100) : 100; // never faster than min
      const goal = elapsed > cap ? 100 : Math.min(target.v, timeCap);
      shown.v += (goal - shown.v) * rate;
      if (goal === 100 && shown.v > 99.5) shown.v = 100;
      if (count) count.textContent = format(shown.v);
      if (shown.v === 100) gsap.ticker.remove(tick);
      if (!go && (shown.v === 100 || (late && exit && goal === 100))) { go = true; resolve(); }
    };
    gsap.ticker.add(tick);
  });

  if (exit) { await exit(root, late); return finish(root); }
  await gsap.timeline()
    .to(root.querySelectorAll('[data-loader-out]'), { yPercent: -110, duration: 0.7, ease: ease.inOut, stagger: 0.05 })
    .to(root, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1, ease: ease.inOut }, '-=0.35');
  finish(root);
}

// Hide rather than remove.
function finish(root: HTMLElement) {
  root.hidden = true;
  document.documentElement.classList.add('is-loaded');
  try { sessionStorage.setItem(SEEN, '1'); } catch {}
}

const wait = (s: number) => new Promise((r) => setTimeout(r, s * 1000));
