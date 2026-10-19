// The map without WebGL (reduced motion, Save-Data, old devices): contour lines traced once on the
// CPU with marching squares over the visible window, drawn into a 2D canvas.
import type { Terrain } from './terrain';
import type { View } from './view';

export function drawStatic(canvas: HTMLCanvasElement, t: Terrain, v: View) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(v.w * dpr);
  canvas.height = Math.round(v.h * dpr);
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, v.w, v.h);

  // Visible texel window (sample points are texel centres).
  const x0 = Math.max(0, Math.floor(-v.ox / v.s - 1)), x1 = Math.min(t.w - 1, Math.ceil((v.w - v.ox) / v.s + 1));
  const y0 = Math.max(0, Math.floor(-v.oy / v.s - 1)), y1 = Math.min(t.h - 1, Math.ceil((v.h - v.oy) / v.s + 1));
  const minor = new Path2D();
  const index = new Path2D();
  const H = t.heights, W = t.w;
  const sx = (x: number) => v.ox + (x + 0.5) * v.s;
  const sy = (y: number) => v.oy + (y + 0.5) * v.s;

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const a = H[y * W + x], b = H[y * W + x + 1], c = H[(y + 1) * W + x + 1], d = H[(y + 1) * W + x];
      const lo = Math.min(a, b, c, d), hi = Math.max(a, b, c, d);
      for (let L = Math.ceil(lo / 20) * 20; L < hi; L += 20) {
        // Edge crossings: top (a-b), right (b-c), bottom (d-c), left (a-d).
        const pts: number[] = [];
        if ((a < L) !== (b < L)) pts.push(sx(x + (L - a) / (b - a)), sy(y));
        if ((b < L) !== (c < L)) pts.push(sx(x + 1), sy(y + (L - b) / (c - b)));
        if ((d < L) !== (c < L)) pts.push(sx(x + (L - d) / (c - d)), sy(y + 1));
        if ((a < L) !== (d < L)) pts.push(sx(x), sy(y + (L - a) / (d - a)));
        const p = L % 100 === 0 ? index : minor;
        for (let k = 0; k + 3 < pts.length; k += 4) {
          p.moveTo(pts[k], pts[k + 1]);
          p.lineTo(pts[k + 2], pts[k + 3]);
        }
      }
    }
  }
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(14, 17, 15, 0.22)';
  ctx.lineWidth = 0.8;
  ctx.stroke(minor);
  ctx.strokeStyle = 'rgba(14, 17, 15, 0.48)';
  ctx.lineWidth = 1.3;
  ctx.stroke(index);
}
