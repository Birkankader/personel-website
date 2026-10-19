// Astro adapter (ClientRouter). Call start(setup) once from the layout's <script>.
// The leave animation runs IN PARALLEL with fetching the next page, so transitions add no latency.
import { boot, cleanup, enter, leave, syncFlags } from './index';

let navigating = false;
let traverse = false;
const afterSwap = new Set<() => void>();
/** Restore project classes on <html> after Astro swaps its attributes. */
export const onAfterSwap = (fn: () => void) => { afterSwap.add(fn); return () => afterSwap.delete(fn); };

export function start(setup?: () => void) {
  document.addEventListener('astro:before-preparation', (e) => {
    navigating = true;
    // Back and forward return to where the visitor left the page: Astro restores that scroll.
    traverse = e.navigationType === 'traverse';
    const load = e.loader;
    e.loader = async () => { await Promise.all([leave(), load()]); };
  });
  document.addEventListener('astro:before-swap', () => cleanup());
  document.addEventListener('astro:after-swap', () => {
    syncFlags(); // Astro replaces <html> attributes; restore flags before paint
    afterSwap.forEach((fn) => fn());
    document.getElementById('loader')?.remove(); // the loader is first-load only
  });
  document.addEventListener('astro:page-load', () => {
    if (!navigating) return void boot(setup); // first load (boot is idempotent)
    navigating = false;
    enter({ scrollTop: !traverse, settle: traverse });
  });
  // Module scripts run after parsing: boot now instead of waiting for the first astro:page-load.
  boot(setup);
}
