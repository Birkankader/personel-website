#!/usr/bin/env node
// Builds the hero terrain from real elevation data (SRTM through the open Mapzen terrain tiles on
// AWS): a 16-bit heightfield packed into the R and G channels of public/terrain/ankara.webp (lossless), plus
// src/data/terrain.json with bounds, scale and spot heights. Run once; outputs are committed.
//   npm run terrain            (tiles are cached in .cache/terrain, which git ignores)
// The site decodes it on the client: elevation = base + (R * 256 + G) * step metres.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ORIGIN = { name: 'Kızılay', lat: 39.9208, lon: 32.8541 };
const WINDOW_KM = { west: 16, east: 16, north: 15, south: 23 };
const ZOOM = 12;
const TARGET_MPP = 40; // metres per texel in the output
const BASE = 500; // metres
const STEP = 0.5; // metres per stored unit: (h - BASE) / STEP fits 16 bits
const CACHE = path.resolve('.cache/terrain');
const OUT_IMG = path.resolve('public/terrain/ankara.webp');
const OUT_JSON = path.resolve('src/data/terrain.json');

const n = 2 ** ZOOM;
const rad = (d) => (d * Math.PI) / 180;
const toPx = (lat, lon) => ({
  x: ((lon + 180) / 360) * n * 256,
  y: ((1 - Math.log(Math.tan(rad(lat)) + 1 / Math.cos(rad(lat))) / Math.PI) / 2) * n * 256,
});
const toLatLon = (x, y) => {
  const lon = (x / (n * 256)) * 360 - 180;
  const k = Math.PI - (2 * Math.PI * y) / (n * 256);
  return { lat: (180 / Math.PI) * Math.atan(0.5 * (Math.exp(k) - Math.exp(-k))), lon };
};

const o = toPx(ORIGIN.lat, ORIGIN.lon);
const mpp = (156543.03392 * Math.cos(rad(ORIGIN.lat))) / n; // native metres per global pixel
const left = o.x - (WINDOW_KM.west * 1000) / mpp;
const right = o.x + (WINDOW_KM.east * 1000) / mpp;
const top = o.y - (WINDOW_KM.north * 1000) / mpp;
const bottom = o.y + (WINDOW_KM.south * 1000) / mpp;

// 1. Fetch and decode every tile the window touches.
fs.mkdirSync(CACHE, { recursive: true });
const tx0 = Math.floor(left / 256), tx1 = Math.floor(right / 256);
const ty0 = Math.floor(top / 256), ty1 = Math.floor(bottom / 256);
const SW = (tx1 - tx0 + 1) * 256, SH = (ty1 - ty0 + 1) * 256;
const src = new Float32Array(SW * SH);
for (let ty = ty0; ty <= ty1; ty++) {
  for (let tx = tx0; tx <= tx1; tx++) {
    const file = path.join(CACHE, `${ZOOM}-${tx}-${ty}.png`);
    if (!fs.existsSync(file)) {
      const url = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${ZOOM}/${tx}/${ty}.png`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`tile ${url}: HTTP ${res.status}`);
      fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    }
    const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        const i = (y * 256 + x) * info.channels;
        src[((ty - ty0) * 256 + y) * SW + (tx - tx0) * 256 + x] = data[i] * 256 + data[i + 1] + data[i + 2] / 256 - 32768;
      }
    }
  }
}

// 2. Resample the window to the target resolution (bilinear), then a light blur against SRTM speckle.
const scale = TARGET_MPP / mpp; // global pixels per output texel
const W = Math.round((right - left) / scale);
const H = Math.round((bottom - top) / scale);
const sample = (gx, gy) => {
  const x = gx - tx0 * 256, y = gy - ty0 * 256;
  const x0 = Math.max(0, Math.min(SW - 2, Math.floor(x))), y0 = Math.max(0, Math.min(SH - 2, Math.floor(y)));
  const fx = x - x0, fy = y - y0;
  const a = src[y0 * SW + x0], b = src[y0 * SW + x0 + 1], c = src[(y0 + 1) * SW + x0], d = src[(y0 + 1) * SW + x0 + 1];
  return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
};
let elev = new Float32Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) elev[y * W + x] = sample(left + (x + 0.5) * scale, top + (y + 0.5) * scale);

const kernel = [0.2, 0.6, 0.2];
const blur = (a, horizontal) => {
  const b = new Float32Array(a.length);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let s = 0;
    for (let k = -1; k <= 1; k++) {
      const xx = horizontal ? Math.max(0, Math.min(W - 1, x + k)) : x;
      const yy = horizontal ? y : Math.max(0, Math.min(H - 1, y + k));
      s += a[yy * W + xx] * kernel[k + 1];
    }
    b[y * W + x] = s;
  }
  return b;
};
elev = blur(blur(elev, true), false);

// 3. Pack into RG (STEP units above BASE) and write a lossless WebP.
let min = Infinity, max = -Infinity;
const rgb = Buffer.alloc(W * H * 3);
for (let i = 0; i < W * H; i++) {
  const h = elev[i];
  if (h < min) min = h;
  if (h > max) max = h;
  const v = Math.max(0, Math.min(65535, Math.round((h - BASE) / STEP)));
  rgb[i * 3] = v >> 8;
  rgb[i * 3 + 1] = v & 255;
}
fs.mkdirSync(path.dirname(OUT_IMG), { recursive: true });
await sharp(rgb, { raw: { width: W, height: H, channels: 3 } }).webp({ lossless: true, effort: 6 }).toFile(OUT_IMG);

// 4. Spot heights: local maxima that stand at least 25 m above a 1.2 km ring, at least 3 km apart.
const ring = Math.round(1200 / TARGET_MPP);
const peaks = [];
for (let y = ring; y < H - ring; y += 2) {
  for (let x = ring; x < W - ring; x += 2) {
    const h = elev[y * W + x];
    let isMax = true, ringMax = -Infinity;
    for (let dy = -ring; dy <= ring && isMax; dy += 2) {
      for (let dx = -ring; dx <= ring; dx += 2) {
        if (!dx && !dy) continue;
        const v = elev[(y + dy) * W + x + dx];
        if (v > h) { isMax = false; break; }
        if (Math.abs(dx) === ring || Math.abs(dy) === ring) ringMax = Math.max(ringMax, v);
      }
    }
    if (isMax && h - ringMax > 25) peaks.push({ x, y, h });
  }
}
peaks.sort((a, b) => b.h - a.h);
const spots = [];
for (const p of peaks) {
  if (spots.every((s) => Math.hypot(s.x - p.x, s.y - p.y) * TARGET_MPP > 3000)) spots.push(p);
  if (spots.length >= 24) break;
}

const nw = toLatLon(left, top), se = toLatLon(right, bottom);
// Kızılay's height as the map reads it (bilinear between texel centres): the loader counts down to it.
const ox = +((o.x - left) / scale).toFixed(2), oy = +((o.y - top) / scale).toFixed(2);
const readHeight = (x, y) => {
  const fx = x - 0.5, fy = y - 0.5, x0 = Math.floor(fx), y0 = Math.floor(fy), dx = fx - x0, dy = fy - y0;
  const e = (i, j) => elev[j * W + i];
  return (e(x0, y0) * (1 - dx) + e(x0 + 1, y0) * dx) * (1 - dy) + (e(x0, y0 + 1) * (1 - dx) + e(x0 + 1, y0 + 1) * dx) * dy;
};
const meta = {
  source: 'SRTM via Mapzen Terrain Tiles (AWS Open Data), zoom 12, resampled',
  width: W,
  height: H,
  metresPerTexel: TARGET_MPP,
  base: BASE,
  step: STEP,
  min: Math.round(min),
  max: Math.round(max),
  bounds: { north: +nw.lat.toFixed(5), west: +nw.lon.toFixed(5), south: +se.lat.toFixed(5), east: +se.lon.toFixed(5) },
  origin: { ...ORIGIN, x: ox, y: oy, h: Math.round(readHeight(ox, oy)) },
  spots: spots.map((s) => ({ x: s.x, y: s.y, h: Math.round(s.h) })),
};
fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
fs.writeFileSync(OUT_JSON, JSON.stringify(meta, null, 2) + '\n');
console.log(`terrain ${W}x${H} @ ${TARGET_MPP} m, ${meta.min} to ${meta.max} m, ${spots.length} spot heights, ${Math.round(fs.statSync(OUT_IMG).size / 1024)} KB`);
