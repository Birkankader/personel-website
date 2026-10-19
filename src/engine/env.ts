export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isTouch = () => matchMedia('(hover: none), (pointer: coarse)').matches;
export const isMobile = () => matchMedia('(max-width: 767px)').matches;

// Shared easing vocabulary. Use these names everywhere; never invent per-component curves.
// `pen` is the plotter: lines draw at a steady speed with soft ends.
export const ease = {
  out: 'expo.out', // default entrance
  inOut: 'expo.inOut', // flood, page transitions
  soft: 'power3.out', // small UI
  pen: 'power2.inOut', // route plotting, drawn lines
  spring: 'back.out(1.6)', // unused on this site
} as const;
