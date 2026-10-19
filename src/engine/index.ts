// Engine core: framework-agnostic page lifecycle. No DOM access at import time (SSR-safe).
// A framework adapter calls:
//   boot(setup)            once, on first load: setup → loader → page init → intro
//   leave() → cleanup()    before the route swaps (leave can run in parallel with the fetch)
//   enter()                after the new page is in the DOM: init → enter animation → intro
// Project code hooks in with onPage(fn): fn runs on every page load inside a gsap.context, so the
// tweens and ScrollTriggers it creates are reverted automatically. Return a cleanup for the rest.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initScroll, keepScroll, resetScroll, startScroll, stopScroll } from './scroll';
import { initReveals } from './reveal';
import { initGL, mountGL, unmountGL } from './gl'; // GL
import { initCursor, initMagnetic } from './interactions';
import { runLoader } from './loader';
import { playEnter, playLeave } from './transition';
import { prefersReducedMotion } from './env';

export { onScroll, scrollState, scrollToTarget, stopScroll, startScroll } from './scroll';
export { setTransition } from './transition';
export { setLoaderFormat, setLoaderExit, addCriticalTask, MAX as LOADER_MAX, PROGRESS_CAP as LOADER_CAP } from './loader';
export { hideGL, setBackground, clearBackground, glSupported, getGL, glSize, invalidateGL, onGLResize } from './gl'; // GL
export { ease, isTouch, isMobile, prefersReducedMotion } from './env';

export type PageFn = (page: { intro: gsap.core.Timeline; path: string }) => void | (() => void);
const pageFns = new Set<PageFn>();
const cleanups: (() => void)[] = [];
let ctx: gsap.Context | null = null;
let intro: gsap.core.Timeline | null = null;
let ready = false;
let booted = false;

/** Run fn on every page load (and now, if a page is ready). Returns an unsubscribe. */
export function onPage(fn: PageFn) {
  pageFns.add(fn);
  if (ready) runPageFn(fn);
  return () => { pageFns.delete(fn); };
}

function runPageFn(fn: PageFn) {
  ctx?.add(() => {
    const c = fn({ intro: intro!, path: location.pathname });
    if (typeof c === 'function') cleanups.push(c);
  });
}

// Flags on <html>. Re-applied on every page because some routers swap root attributes.
export function syncFlags() {
  const h = document.documentElement.classList;
  h.add('js', 'is-booted');
  h.toggle('motion', !prefersReducedMotion());
  if (document.querySelector('.gl-canvas')) h.add('gl-on');
}

function initPage() {
  syncFlags();
  ctx = gsap.context(() => {
    intro = initReveals(document);
    initMagnetic(document);
  });
  mountGL(document); // GL
  ready = true;
  pageFns.forEach(runPageFn);
  requestAnimationFrame(() => ScrollTrigger.refresh());
}

/** First load. `setup` runs once on the client after scroll/GL init and before the first page. */
export async function boot(setup?: () => void) {
  if (booted) return;
  booted = true;
  syncFlags();
  initScroll();
  initGL(); // GL
  initCursor();
  setup?.();
  stopScroll();
  initPage();
  await runLoader();
  startScroll();
  intro?.play();
}

/** Play the leave animation (resolve when the screen is covered). */
export async function leave() {
  stopScroll();
  await playLeave();
}

/** Tear down the current page: reverts every tween, ScrollTrigger and split. */
export function cleanup() {
  if (!ready) return;
  ready = false;
  cleanups.splice(0).forEach((c) => c());
  ctx?.revert();
  ctx = null;
  unmountGL(); // GL
}

/** Init the new page. Back and forward pass `scrollTop: false` (the router restored the scroll)
 *  and `settle: true`: the page returns as it was left, with no entrance to sit through.
 *  `transition: false` where no leave ran. */
export async function enter({ transition = true, scrollTop = true, settle = false } = {}) {
  if (!booted) return;
  cleanup(); // no-op if the adapter already cleaned up
  if (scrollTop) resetScroll();
  else keepScroll();
  initPage();
  if (settle) { intro?.data?.settle?.(); intro?.progress(1); }
  if (transition) await playEnter();
  startScroll();
  if (!settle) intro?.play();
}
