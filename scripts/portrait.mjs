#!/usr/bin/env node
// Traces a photo as contour lines (marching squares on blurred brightness) for the About page.
//   node scripts/portrait.mjs <photo> [out.svg]
// Output: public/about/portrait-contours.svg, every fourth level drawn heavier like an index contour.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = process.argv[2];
const OUT = path.resolve(process.argv[3] || 'public/about/portrait-contours.svg');
if (!SRC) { console.error('usage: node scripts/portrait.mjs <photo> [out.svg]'); process.exit(1); }

const N = 240; // sampling grid
const LEVELS = 12;
const { data } = await sharp(SRC).resize(N, N, { fit: 'cover' }).greyscale().blur(1.5).normalise().raw().toBuffer({ resolveWithObject: true });
const g = Float32Array.from(data, (v) => v / 255);

function trace(level) {
  const key = (x, y) => `${x.toFixed(3)},${y.toFixed(3)}`;
  const segs = [];
  const lerp = (a, b) => (level - a) / (b - a);
  for (let y = 0; y < N - 1; y++) {
    for (let x = 0; x < N - 1; x++) {
      const a = g[y * N + x], b = g[y * N + x + 1], c = g[(y + 1) * N + x + 1], d = g[(y + 1) * N + x];
      const idx = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
      if (idx === 0 || idx === 15) continue;
      const T = [x + lerp(a, b), y], R = [x + 1, y + lerp(b, c)], B = [x + lerp(d, c), y + 1], L = [x, y + lerp(a, d)];
      const table = {
        1: [[L, B]], 2: [[B, R]], 3: [[L, R]], 4: [[T, R]], 5: [[L, T], [B, R]], 6: [[T, B]], 7: [[L, T]],
        8: [[L, T]], 9: [[T, B]], 10: [[L, B], [T, R]], 11: [[T, R]], 12: [[L, R]], 13: [[B, R]], 14: [[L, B]],
      };
      for (const s of table[idx]) segs.push(s);
    }
  }
  // Chain segments into polylines.
  const ends = new Map();
  const used = new Uint8Array(segs.length);
  segs.forEach((s, i) => {
    for (const p of s) { const k = key(...p); if (!ends.has(k)) ends.set(k, []); ends.get(k).push(i); }
  });
  const lines = [];
  for (let i = 0; i < segs.length; i++) {
    if (used[i]) continue;
    used[i] = 1;
    const line = [segs[i][0], segs[i][1]];
    for (const dir of [1, 0]) {
      for (;;) {
        const tip = dir ? line[line.length - 1] : line[0];
        const next = (ends.get(key(...tip)) || []).find((j) => !used[j]);
        if (next === undefined) break;
        used[next] = 1;
        const [p, q] = segs[next];
        const other = key(...p) === key(...tip) ? q : p;
        if (dir) line.push(other); else line.unshift(other);
      }
    }
    if (line.length > 12) lines.push(line);
  }
  return lines;
}

// Ramer-Douglas-Peucker
function simplify(pts, eps) {
  if (pts.length < 3) return pts;
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
  let max = 0, at = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / len;
    if (d > max) { max = d; at = i; }
  }
  if (max <= eps) return [pts[0], pts[pts.length - 1]];
  return [...simplify(pts.slice(0, at + 1), eps).slice(0, -1), ...simplify(pts.slice(at), eps)];
}

const paths = { minor: [], index: [] };
for (let i = 1; i <= LEVELS; i++) {
  const level = i / (LEVELS + 1);
  for (const line of trace(level)) {
    const pts = simplify(line, 0.35);
    const d = 'M' + pts.map(([x, y]) => `${(x * 2).toFixed(1)} ${(y * 2).toFixed(1)}`).join('L');
    (i % 4 === 0 ? paths.index : paths.minor).push(d);
  }
}
const size = N * 2;
// A radial mask fades the office behind the subject without adding contours of its own.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" fill="none" stroke="#0E110F" stroke-linecap="round" stroke-linejoin="round">
<defs><radialGradient id="v" cx="0.49" cy="0.48" r="0.5" gradientTransform="translate(0.49 0.48) scale(0.95 1.2) translate(-0.49 -0.48)"><stop offset="0.5" stop-color="#fff"/><stop offset="0.9" stop-color="#000"/></radialGradient>
<mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="url(#v)"/></mask></defs>
<g mask="url(#m)">
<path stroke-width="0.9" stroke-opacity="0.55" d="${paths.minor.join('')}"/>
<path stroke-width="1.6" d="${paths.index.join('')}"/>
</g>
</svg>
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`portrait: ${paths.minor.length + paths.index.length} lines, ${Math.round(svg.length / 1024)} KB → ${path.relative(process.cwd(), OUT)}`);
