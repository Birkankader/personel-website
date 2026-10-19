// Ankara's elevation model. public/terrain/ankara.webp packs 16-bit heights into R and G
// (scripts/terrain.mjs): elevation = base + (R * 256 + G) * step metres, 40 m per texel.
// Coordinates are continuous texels: texel i covers [i, i + 1), so its centre is i + 0.5.
import meta from '../../data/terrain.json';

export const T = meta;
export const M_PER_TEXEL = meta.metresPerTexel;
/** Heights are stored relative to this in the GPU texture, so half floats keep sub-metre detail. */
export const H_BASE = 800;

export type Terrain = {
  w: number;
  h: number;
  heights: Float32Array; // metres
  gx: Float32Array; // metres per texel, +x east
  gy: Float32Array; // metres per texel, +y south
};

let pending: Promise<Terrain> | null = null;
export const loadTerrain = () => (pending ??= decode());

async function decode(): Promise<Terrain> {
  const res = await fetch('/terrain/ankara.webp');
  if (!res.ok) throw new Error(`terrain: HTTP ${res.status}`);
  const bmp = await createImageBitmap(await res.blob(), { premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
  const w = bmp.width, h = bmp.height;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(bmp, 0, 0);
  bmp.close();
  const px = ctx.getImageData(0, 0, w, h).data;
  const heights = new Float32Array(w * h);
  for (let i = 0, j = 0; i < heights.length; i++, j += 4) heights[i] = meta.base + (px[j] * 256 + px[j + 1]) * meta.step;
  despeckle(heights, w, h);
  const gx = new Float32Array(w * h);
  const gy = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const ym = y > 0 ? y - 1 : y, yp = y < h - 1 ? y + 1 : y;
    for (let x = 0; x < w; x++) {
      const xm = x > 0 ? x - 1 : x, xp = x < w - 1 ? x + 1 : x;
      const i = y * w + x;
      gx[i] = (heights[y * w + xp] - heights[y * w + xm]) / (xp - xm);
      gy[i] = (heights[yp * w + x] - heights[ym * w + x]) / (yp - ym);
    }
  }
  return { w, h, heights, gx, gy };
}

// Some privacy modes add noise to canvas reads. A flipped bit in the high byte is a 128 m spike,
// so any texel far from its neighbours takes their mean. Real terrain here never jumps that much.
function despeckle(a: Float32Array, w: number, h: number) {
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const mean = (a[i - 1] + a[i + 1] + a[i - w] + a[i + w]) / 4;
      if (Math.abs(a[i] - mean) > 40) a[i] = mean;
    }
  }
}

/** Bilinear height at a continuous texel coordinate. */
export function heightAt(t: Terrain, x: number, y: number) {
  const fx = Math.min(t.w - 1.001, Math.max(0, x - 0.5));
  const fy = Math.min(t.h - 1.001, Math.max(0, y - 0.5));
  const x0 = fx | 0, y0 = fy | 0, dx = fx - x0, dy = fy - y0;
  const i = y0 * t.w + x0, a = t.heights;
  return (a[i] * (1 - dx) + a[i + 1] * dx) * (1 - dy) + (a[i + t.w] * (1 - dx) + a[i + t.w + 1] * dx) * dy;
}

/** Slope at a texel, in percent. */
export function slopeAt(t: Terrain, x: number, y: number) {
  const xi = Math.min(t.w - 1, Math.max(0, x | 0)), yi = Math.min(t.h - 1, Math.max(0, y | 0));
  const i = yi * t.w + xi;
  return (Math.hypot(t.gx[i], t.gy[i]) / M_PER_TEXEL) * 100;
}

const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const mN = merc(meta.bounds.north), mS = merc(meta.bounds.south);
/** Web Mercator texel to latitude and longitude. */
export function latLonAt(x: number, y: number) {
  const lon = meta.bounds.west + (x / meta.width) * (meta.bounds.east - meta.bounds.west);
  const m = mN + (y / meta.height) * (mS - mN);
  return { lat: (2 * Math.atan(Math.exp(m)) - Math.PI / 2) * (180 / Math.PI), lon };
}

/** RGBA float data for the GPU: coarse height, fine residual, and both gradients. */
export function gpuData(t: Terrain) {
  const out = new Float32Array(t.w * t.h * 4);
  for (let i = 0; i < t.heights.length; i++) {
    const v = t.heights[i] - H_BASE;
    const coarse = Math.floor(v / 8) * 8;
    out[i * 4] = coarse;
    out[i * 4 + 1] = v - coarse;
    out[i * 4 + 2] = t.gx[i];
    out[i * 4 + 3] = t.gy[i];
  }
  return out;
}
