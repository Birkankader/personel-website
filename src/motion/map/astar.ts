// A* over a coarse grid of the elevation model: 4 x 4 texels, 160 m per cell, eight neighbours.
// A step costs walking time from Tobler's hiking function, so the route bends around steep ground
// instead of taking the straight line. Searches are time-sliced: the driver asks for a few hundred
// cells per frame and draws each expanded cell, which is the frontier you see bloom.
import type { Terrain } from './terrain';

export const CELL = 4;
const STEP_M = CELL * 40;
const DIAG_M = STEP_M * Math.SQRT2;
const VMAX = 6000 / 3600; // m/s: Tobler's best case, 6 km/h on a gentle descent
const DX = [1, -1, 0, 0, 1, 1, -1, -1];
const DY = [0, 0, 1, -1, 1, -1, 1, -1];

export class Grid {
  readonly w: number;
  readonly h: number;
  readonly elev: Float32Array;
  readonly blocked: Uint8Array;
  g: Float32Array;
  parent: Int32Array;
  seen: Uint32Array;
  closed: Uint32Array;
  gen = 0;
  heapI: Int32Array;
  heapF: Float32Array;

  constructor(t: Terrain) {
    this.w = Math.ceil(t.w / CELL);
    this.h = Math.ceil(t.h / CELL);
    const n = this.w * this.h;
    this.elev = new Float32Array(n);
    for (let cy = 0; cy < this.h; cy++) {
      for (let cx = 0; cx < this.w; cx++) {
        let sum = 0, count = 0;
        for (let y = cy * CELL; y < Math.min(t.h, cy * CELL + CELL); y++) {
          for (let x = cx * CELL; x < Math.min(t.w, cx * CELL + CELL); x++) { sum += t.heights[y * t.w + x]; count++; }
        }
        this.elev[cy * this.w + cx] = sum / count;
      }
    }
    this.blocked = new Uint8Array(n);
    this.g = new Float32Array(n);
    this.parent = new Int32Array(n);
    this.seen = new Uint32Array(n);
    this.closed = new Uint32Array(n);
    this.heapI = new Int32Array(n * 2);
    this.heapF = new Float32Array(n * 2);
  }

  /** Cell under a continuous texel coordinate (clamped to the grid). */
  cellAt(x: number, y: number) {
    const cx = Math.min(this.w - 1, Math.max(0, Math.floor(x / CELL)));
    const cy = Math.min(this.h - 1, Math.max(0, Math.floor(y / CELL)));
    return cy * this.w + cx;
  }
  /** Texel coordinate of a cell's centre. */
  cx(i: number) { return (i % this.w) * CELL + CELL / 2; }
  cy(i: number) { return Math.floor(i / this.w) * CELL + CELL / 2; }

  /** The free cell nearest to i (rings of growing radius), or i if none is close. */
  nearestFree(i: number, maxR = 24) {
    if (!this.blocked[i]) return i;
    const x0 = i % this.w, y0 = Math.floor(i / this.w);
    for (let r = 1; r <= maxR; r++) {
      let best = -1, bestD = Infinity;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const x = x0 + dx, y = y0 + dy;
          if (x < 0 || y < 0 || x >= this.w || y >= this.h) continue;
          const j = y * this.w + x;
          const d = dx * dx + dy * dy;
          if (!this.blocked[j] && d < bestD) { best = j; bestD = d; }
        }
      }
      if (best >= 0) return best;
    }
    return i;
  }

  heuristic(a: number, b: number) {
    const dx = Math.abs((a % this.w) - (b % this.w));
    const dy = Math.abs(Math.floor(a / this.w) - Math.floor(b / this.w));
    const lo = Math.min(dx, dy), hi = Math.max(dx, dy);
    return ((hi - lo) * STEP_M + lo * DIAG_M) / VMAX;
  }
}

export type Found = { cells: number[]; seconds: number; metres: number; climb: number };

export class Search {
  status: 'running' | 'found' | 'failed' = 'running';
  expanded = 0;
  private size = 0;
  private readonly gen: number;

  constructor(private readonly grid: Grid, readonly from: number, readonly to: number) {
    this.gen = ++grid.gen;
    grid.g[from] = 0;
    grid.parent[from] = -1;
    grid.seen[from] = this.gen;
    this.push(from, grid.heuristic(from, to));
  }

  /** Expand up to `budget` cells. onExpand sees every cell as it closes (for drawing). */
  step(budget: number, onExpand?: (cell: number) => void) {
    const G = this.grid, w = G.w, h = G.h, gen = this.gen;
    const { g, parent, seen, closed, blocked, elev } = G;
    while (budget-- > 0 && this.status === 'running') {
      if (this.size === 0) { this.status = 'failed'; break; }
      const cur = this.pop();
      if (closed[cur] === gen) continue;
      closed[cur] = gen;
      this.expanded++;
      onExpand?.(cur);
      if (cur === this.to) { this.status = 'found'; break; }
      const x = cur % w, y = (cur - x) / w;
      for (let k = 0; k < 8; k++) {
        const nx = x + DX[k], ny = y + DY[k];
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const ni = ny * w + nx;
        if (blocked[ni] || closed[ni] === gen) continue;
        const diag = k >= 4;
        if (diag && (blocked[y * w + nx] || blocked[ny * w + x])) continue; // no corner cutting
        const dist = diag ? DIAG_M : STEP_M;
        const v = VMAX * Math.exp(-3.5 * Math.abs((elev[ni] - elev[cur]) / dist + 0.05));
        const ng = g[cur] + dist / v;
        if (seen[ni] !== gen || ng < g[ni]) {
          seen[ni] = gen;
          g[ni] = ng;
          parent[ni] = cur;
          this.push(ni, ng + G.heuristic(ni, this.to));
        }
      }
    }
    return this.status;
  }

  /** Cells from start to goal, with walking time, horizontal length and total ascent. */
  result(): Found {
    const G = this.grid;
    const cells: number[] = [];
    for (let c = this.to; c !== -1; c = G.parent[c]) cells.push(c);
    cells.reverse();
    let metres = 0, climb = 0;
    for (let k = 1; k < cells.length; k++) {
      const a = cells[k - 1], b = cells[k];
      metres += (a % G.w !== b % G.w) && Math.floor(a / G.w) !== Math.floor(b / G.w) ? DIAG_M : STEP_M;
      climb += Math.max(0, G.elev[b] - G.elev[a]);
    }
    return { cells, seconds: G.g[this.to], metres, climb };
  }

  private push(i: number, f: number) {
    const G = this.grid;
    if (this.size >= G.heapI.length) {
      const I = new Int32Array(G.heapI.length * 2); I.set(G.heapI); G.heapI = I;
      const F = new Float32Array(G.heapF.length * 2); F.set(G.heapF); G.heapF = F;
    }
    const I = G.heapI, F = G.heapF;
    let k = this.size++;
    while (k > 0) {
      const p = (k - 1) >> 1;
      if (F[p] <= f) break;
      I[k] = I[p]; F[k] = F[p]; k = p;
    }
    I[k] = i; F[k] = f;
  }

  private pop() {
    const I = this.grid.heapI, F = this.grid.heapF;
    const top = I[0];
    const n = --this.size;
    const li = I[n], lf = F[n];
    let k = 0;
    for (;;) {
      let c = 2 * k + 1;
      if (c >= n) break;
      if (c + 1 < n && F[c + 1] < F[c]) c++;
      if (F[c] >= lf) break;
      I[k] = I[c]; F[k] = F[c]; k = c;
    }
    I[k] = li; F[k] = lf;
    return top;
  }
}

// ---------- straightening ----------
// An eight-way grid turns every bearing into a staircase of square and diagonal steps. Where the
// straight line across a few cells of the path walks no slower than the steps it replaces and keeps
// clear of blocked cells, the route takes the line, so the steps melt into a drawn curve. The reach
// stays short on purpose: over long stretches the route would become a ruler line that no longer
// shows it was searched.

/** Walking time of one grid step, as the search counts it. */
function stepTime(G: Grid, a: number, b: number) {
  const diag = a % G.w !== b % G.w && Math.floor(a / G.w) !== Math.floor(b / G.w);
  const dist = diag ? DIAG_M : STEP_M;
  return dist / (VMAX * Math.exp(-3.5 * Math.abs((G.elev[b] - G.elev[a]) / dist + 0.05)));
}

/** Bilinear elevation at a continuous cell coordinate (cell centres at integers). */
function elevAt(G: Grid, x: number, y: number) {
  const x0 = Math.min(G.w - 2, Math.max(0, Math.floor(x))), y0 = Math.min(G.h - 2, Math.max(0, Math.floor(y)));
  const fx = Math.min(1, Math.max(0, x - x0)), fy = Math.min(1, Math.max(0, y - y0));
  const e = G.elev, i = y0 * G.w + x0;
  return (e[i] * (1 - fx) + e[i + 1] * fx) * (1 - fy) + (e[i + G.w] * (1 - fx) + e[i + G.w + 1] * fx) * fy;
}

/** Walking time along the straight line from cell a to cell b, sampled every quarter cell, or
 *  Infinity where it passes within a third of a cell of a blocked one. */
function lineTime(G: Grid, a: number, b: number) {
  const ax = a % G.w, ay = (a - ax) / G.w, bx = b % G.w, by = (b - bx) / G.w;
  const len = Math.hypot(bx - ax, by - ay);
  const n = Math.max(1, Math.ceil(len * 4));
  const d = (len * STEP_M) / n;
  let t = 0, prev = G.elev[a];
  for (let k = 1; k <= n; k++) {
    const x = ax + ((bx - ax) * k) / n, y = ay + ((by - ay) * k) / n;
    for (let c = 0; c < 4; c++) {
      const cx = Math.round(x + (c & 1 ? 0.33 : -0.33)), cy = Math.round(y + (c & 2 ? 0.33 : -0.33));
      if (cx >= 0 && cy >= 0 && cx < G.w && cy < G.h && G.blocked[cy * G.w + cx]) return Infinity;
    }
    const e = elevAt(G, x, y);
    t += d / (VMAX * Math.exp(-3.5 * Math.abs((e - prev) / d + 0.05)));
    prev = e;
  }
  return t;
}

const REACH = 4; // cells: the longest stretch of steps one straight piece may replace

/** The grid path with its stair steps taken out. */
export function straighten(G: Grid, cells: number[]) {
  if (cells.length < 3) return cells.slice();
  const out = [cells[0]];
  let i = 0;
  while (i < cells.length - 1) {
    let best = i + 1, path = stepTime(G, cells[i], cells[i + 1]), misses = 0;
    for (let j = i + 2; j < cells.length && j - i <= REACH; j++) {
      path += stepTime(G, cells[j - 1], cells[j]);
      if (lineTime(G, cells[i], cells[j]) <= path) { best = j; misses = 0; }
      else if (++misses > 4) break;
    }
    out.push(cells[best]);
    i = best;
  }
  return out;
}
