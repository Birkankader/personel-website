// Framing: the same on every page, so the map never jumps during a transition. Kızılay sits at a
// fixed point of the viewport, the scale always covers the screen, and scrolling pans the sheet a
// little (8% of the scroll, at most a quarter of the viewport).
import { T } from './terrain';

export type View = { w: number; h: number; s: number; ox: number; oy: number; pan: number };

const PAN_FACTOR = 0.08;
const PAN_MAX = 0.25;
const anchor = (w: number) => ({ x: 0.62, y: w < 768 ? 0.43 : 0.4 });

export function computeView(w: number, h: number, scrollY: number, still = false): View {
  const a = anchor(w);
  const ax = w * a.x, ay = h * a.y;
  const pan = still ? 0 : Math.min(scrollY * PAN_FACTOR, h * PAN_MAX);
  const cover = Math.max(
    ax / T.origin.x,
    (w - ax) / (T.width - T.origin.x),
    ay / T.origin.y,
    (h - ay + h * PAN_MAX) / (T.height - T.origin.y),
  ) * 1.02;
  const s = Math.max(cover, w < 768 ? 1.45 : 2);
  return { w, h, s, pan, ox: ax - T.origin.x * s, oy: ay - pan - T.origin.y * s };
}

export const toScreenX = (v: View, x: number) => v.ox + x * v.s;
export const toScreenY = (v: View, y: number) => v.oy + y * v.s;
export const toTexel = (v: View, sx: number, sy: number) => ({ x: (sx - v.ox) / v.s, y: (sy - v.oy) / v.s });
