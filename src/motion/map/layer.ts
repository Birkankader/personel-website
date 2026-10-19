// The plotting layer over the contours: search frontier, routes, waypoints, spot heights and labels.
// A 2D canvas in the persistent #gl host, redrawn only while something on it changes.
import type { View } from './view';

const INK = '14, 17, 15';
const PAPER = '236, 238, 232';
const ROUTE = '34, 54, 245';
const FADE = 0.9; // seconds a frontier cell stays visible
const CRUMB = 96; // px: a stretch of route between two blocks of type shorter than this is a crumb

export type Box = { left: number; top: number; right: number; bottom: number };
export type Route = {
  pts: Float32Array; cum: Float32Array; total: number; progress: number; alpha: number;
  /** Eased 1 while no type rests on the drawn route, 0 once some does (-1 until first drawn). */
  clear: number;
  /** Type rests across the route's run, not just over an end: it shows in pieces. Set by draw(). */
  broken: boolean;
  /** Its search went around the type on screen, measured at scroll position `at`; `key` names its cells. */
  typed: boolean;
  at: number;
  key: string;
};
export type Marker = { x: number; y: number; name: string; sub: string; alpha: number };
export type Scene = {
  view: View;
  strength: number;
  time: number;
  routes: Route[];
  origin: Marker;
  dest: (Marker & { pulse: number }) | null;
  places: { x: number; y: number }[];
  spots: { x: number; y: number; label: string }[];
  zone: { x: number; y: number; r: number; label: string; alpha: number } | null;
  /** Where type rests, and the sections printed in negative, in document coordinates: labels never
   *  print over them, linework breaks under them. */
  blockers: Box[];
  /** Lists set as tables, whole, in document coordinates: labels keep off them, gaps included,
   *  and behind reading text a route across one fades as if type rested on it. */
  shy: Box[];
  scrollY: number;
};

export class Frontier {
  readonly xs: Float32Array;
  readonly ys: Float32Array;
  readonly ts: Float32Array;
  /** Weight of each dot: lighter where the search crowds the type. */
  readonly ws: Float32Array;
  head = 0;
  count = 0;
  constructor(readonly size = 6000) {
    this.xs = new Float32Array(size);
    this.ys = new Float32Array(size);
    this.ts = new Float32Array(size);
    this.ws = new Float32Array(size);
  }
  push(x: number, y: number, t: number, w = 1) {
    this.xs[this.head] = x;
    this.ys[this.head] = y;
    this.ts[this.head] = t;
    this.ws[this.head] = w;
    this.head = (this.head + 1) % this.size;
    this.count = Math.min(this.size, this.count + 1);
  }
  clear() { this.count = 0; }
  /** Still visible at time t? */
  live(t: number) {
    if (!this.count) return false;
    const last = (this.head - 1 + this.size) % this.size;
    return t - this.ts[last] < FADE;
  }
}

/** Chaikin corner cutting: a cell path becomes a drawn line. Endpoints stay put. */
export function smooth(pts: number[], iterations = 3) {
  let p = pts;
  for (let it = 0; it < iterations; it++) {
    if (p.length < 6) break;
    const out = [p[0], p[1]];
    for (let i = 0; i + 3 < p.length; i += 2) {
      const ax = p[i], ay = p[i + 1], bx = p[i + 2], by = p[i + 3];
      out.push(ax * 0.75 + bx * 0.25, ay * 0.75 + by * 0.25, ax * 0.25 + bx * 0.75, ay * 0.25 + by * 0.75);
    }
    out.push(p[p.length - 2], p[p.length - 1]);
    p = out;
  }
  return p;
}

export function makeRoute(pts: number[]): Route {
  const n = pts.length / 2;
  const cum = new Float32Array(n);
  for (let i = 1; i < n; i++) cum[i] = cum[i - 1] + Math.hypot(pts[i * 2] - pts[i * 2 - 2], pts[i * 2 + 1] - pts[i * 2 - 1]);
  return { pts: Float32Array.from(pts), cum, total: cum[n - 1] || 1, progress: 0, alpha: 1, clear: -1, broken: false, typed: false, at: 0, key: '' };
}

export class Layer {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private condensed = true;
  // Kızılay's label: 1 right of the point, -1 left, 0 hidden. It crosses 0 to change sides.
  private side = 1;
  private sideAt = 0;
  // The restricted zone's visibility, eased: 0 while type covers it.
  private zoneOpen = 1;

  constructor(host: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'route-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    host.append(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;
  }

  resize(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
  }

  private font(kind: 'label' | 'mono', size: number) {
    const c = this.ctx;
    if (kind === 'mono') { c.font = `500 ${size}px "JetBrains Mono", ui-monospace, monospace`; return; }
    c.font = `600 ${size}px Archivo, sans-serif`;
    if (this.condensed) {
      const before = c.font;
      c.font = `condensed 600 ${size}px Archivo, sans-serif`;
      if (c.font === before) this.condensed = false;
    }
  }

  private text(s: string, x: number, y: number, rgb: string, a: number, align: CanvasTextAlign = 'left') {
    const c = this.ctx;
    c.textAlign = align;
    c.lineJoin = 'round';
    c.lineWidth = 3.5;
    c.strokeStyle = `rgba(${PAPER}, ${0.92 * a})`;
    c.strokeText(s, x, y);
    c.fillStyle = `rgba(${rgb}, ${a})`;
    c.fillText(s, x, y);
  }

  /** Returns true while something on the sheet still needs another frame. */
  draw(s: Scene, frontier: Frontier) {
    const c = this.ctx, v = s.view;
    let more = false;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.clearRect(0, 0, this.w, this.h);
    const X = (x: number) => v.ox + x * v.s;
    const Y = (y: number) => v.oy + y * v.s;
    const st = s.strength;
    const dt = Math.min(0.05, Math.max(0, s.time - this.sideAt)); // since the last frame drawn
    // 0 where the map sits faint behind reading text, 1 where it is the subject (hero, footer,
    // a hovered project). Labels print only there; lines and points recede to a trace elsewhere.
    const k = Math.min(1, Math.max(0, (st - 0.45) / 0.45));
    const full = k * k * (3 - 2 * k);
    // Viewport box over any resting type (document coordinates in s.blockers)?
    const overType = (l: number, t: number, r: number, b: number) =>
      s.blockers.some((q) => l < q.right && r > q.left && t + s.scrollY < q.bottom && b + s.scrollY > q.top);
    // The same for a label: a table counts whole, since a label in the gap between two of its
    // columns would read as one of its cells.
    const overWords = (l: number, t: number, r: number, b: number) => overType(l, t, r, b) ||
      s.shy.some((q) => l < q.right && r > q.left && t + s.scrollY < q.bottom && b + s.scrollY > q.top);
    // Px from a viewport point to the nearest resting type, up to 24.
    const roomAt = (x: number, y: number) => {
      let best = 24;
      const dy = y + s.scrollY;
      for (const q of s.blockers) {
        const ex = Math.max(q.left - x, 0, x - q.right), ey = Math.max(q.top - dy, 0, dy - q.bottom);
        if (ex < best && ey < best) best = Math.min(best, Math.hypot(ex, ey));
      }
      return best;
    };
    // Does a route run through this viewport box within 150 px of its start (or its end)? Walked
    // every 6 px along the line, so a long straight stretch counts as well as its corners.
    const along = (q: Route, at: number) => {
      if (q.cum.length < 2) return [X(q.pts[0]), Y(q.pts[1])];
      let lo = 1, hi = q.cum.length - 1;
      while (lo < hi) { const mid = (lo + hi) >> 1; if (q.cum[mid] < at) lo = mid + 1; else hi = mid; }
      const f = Math.min(1, Math.max(0, (at - q.cum[lo - 1]) / (q.cum[lo] - q.cum[lo - 1] || 1)));
      return [X(q.pts[lo * 2 - 2] + (q.pts[lo * 2] - q.pts[lo * 2 - 2]) * f), Y(q.pts[lo * 2 - 1] + (q.pts[lo * 2 + 1] - q.pts[lo * 2 - 1]) * f)];
    };
    const routeNear = (l: number, t: number, r: number, b: number, end: boolean) => s.routes.some((q) => {
      if (q.alpha < 0.05) return false;
      const reach = Math.min(q.total, 150 / v.s), step = 6 / v.s;
      for (let d = 0; d <= reach + 1e-6; d += step) {
        const [px, py] = along(q, end ? q.total - d : d);
        if (px > l && px < r && py > t && py < b) return true;
      }
      return false;
    });
    // Labels already set this frame, as viewport boxes: a later label keeps off them.
    const set: [number, number, number, number][] = [];
    const onLabel = (l: number, t: number, r: number, b: number) => set.some((q) => l < q[2] && r > q[0] && t < q[3] && b > q[1]);
    if ('letterSpacing' in c) (c as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0.06em';

    // Spot heights: a small triangle and the height, like a printed sheet. Never over type, and
    // never close enough to it to read as part of a line of text.
    if (full > 0.01) {
      this.font('mono', 10.5);
      c.textBaseline = 'middle';
      for (const p of s.spots) {
        const x = X(p.x), y = Y(p.y);
        // Off screen, or under the fixed header and status bar.
        if (y < 76 || y > this.h - 44) continue;
        const right = x + 12 + c.measureText(p.label).width;
        if (x < 8 || right > this.w - 24 || overWords(x - 18, y - 16, right + 14, y + 16)) continue; // whole, clear of the scrollbar
        c.fillStyle = `rgba(${INK}, ${0.7 * full})`;
        c.beginPath();
        c.moveTo(x, y - 4);
        c.lineTo(x + 4, y + 3);
        c.lineTo(x - 4, y + 3);
        c.closePath();
        c.fill();
        this.text(p.label, x + 8, y, INK, 0.75 * full);
      }
    }

    // A restricted zone (the 404's unreachable address): hatched square, labelled above. It belongs
    // to open ground: where type slides over it, it fades instead of printing through the words.
    if (s.zone && s.zone.alpha > 0) {
      const z = s.zone;
      const x = X(z.x - z.r), y = Y(z.y - z.r), size = z.r * 2 * v.s;
      this.font('label', 11.5);
      const open = overType(x - 4, y - 24, x + Math.max(size, c.measureText(z.label).width) + 4, y + size + 4) ? 0 : 1;
      this.zoneOpen += (open - this.zoneOpen) * 0.2;
      if (Math.abs(open - this.zoneOpen) < 0.01) this.zoneOpen = open;
      else more = true;
      const a = z.alpha * this.zoneOpen * (0.4 + 0.6 * st);
      c.save();
      c.beginPath();
      c.rect(x, y, size, size);
      c.clip();
      c.strokeStyle = `rgba(${INK}, ${0.5 * a})`;
      c.lineWidth = 1;
      c.beginPath();
      for (let k = -size; k < size; k += 7) { c.moveTo(x + k, y + size); c.lineTo(x + k + size, y); }
      c.stroke();
      c.restore();
      c.strokeStyle = `rgba(${INK}, ${0.85 * a})`;
      c.lineWidth = 1.5;
      c.strokeRect(x, y, size, size);
      c.textBaseline = 'bottom';
      this.text(z.label, x, y - 6, INK, a);
    }

    // Frontier: every cell the search closed, fading as the search moves on.
    if (frontier.count) {
      const fa = 0.5 * (0.3 + 0.7 * full);
      const r = Math.max(1.1, v.s * 0.55);
      for (let k = 0; k < frontier.count; k++) {
        const i = (frontier.head - 1 - k + frontier.size) % frontier.size;
        const age = s.time - frontier.ts[i];
        if (age >= FADE) break;
        const a = fa * frontier.ws[i] * (1 - age / FADE) ** 1.6;
        c.fillStyle = `rgba(${ROUTE}, ${a})`;
        c.fillRect(X(frontier.xs[i]) - r / 2, Y(frontier.ys[i]) - r / 2, r, r);
      }
    }

    // Waypoints for every project.
    c.lineWidth = 1.25;
    for (const p of s.places) {
      const x = X(p.x), y = Y(p.y);
      const pa = 0.15 + 0.85 * full;
      c.strokeStyle = `rgba(${INK}, ${0.55 * pa})`;
      c.fillStyle = `rgba(${PAPER}, ${0.9 * pa})`;
      c.beginPath();
      c.arc(x, y, 3.5, 0, Math.PI * 2);
      c.fill();
      c.stroke();
    }

    // Routes: a paper halo, then the line itself, drawn up to its progress. A search goes around
    // the type on screen, but type slides over a route as the page scrolls, and the knockout below
    // breaks it into stretches. A short stretch caught between two blocks of type reads as a stray
    // mark, not as a road passing under the lettering, so it is left out. Behind reading text a
    // route prints only while it is whole: once type rests on it, it fades with the sheet. Where
    // the map is the subject it stays, and the driver searches again around the type.
    const shown: number[][] = [];
    for (const q of s.blockers) {
      const t = q.top - s.scrollY, b = q.bottom - s.scrollY;
      if (b > 0 && t < this.h) shown.push([q.left - 2, t - 2, q.right + 2, b + 2]);
    }
    // Behind reading text a table counts whole for a route too: a road threading the gaps between
    // its columns would read as drawn across the table, so it fades as if type rested on it.
    const tables: number[][] = [];
    if (full < 0.5) {
      for (const q of s.shy) {
        const t = q.top - s.scrollY, b = q.bottom - s.scrollY;
        if (b > 0 && t < this.h) tables.push([q.left, t, q.right, b]);
      }
    }
    // Kızılay and the destination print only with room around them: a point half under type is
    // left out, not cut in two, and behind reading text a point squeezed between two lines reads
    // as a stray dot. A stretch of route that ends at a printed point is anchored by it.
    const room = 7 + 17 * (1 - full);
    const roomy = (x: number, y: number) => !overType(x - room, y - room, x + room, y + room);
    const originAt = roomy(X(s.origin.x), Y(s.origin.y));
    const destAt = !!s.dest && s.dest.alpha > 0 && roomy(X(s.dest.x), Y(s.dest.y));
    c.lineJoin = 'round';
    c.lineCap = 'round';
    for (const r of s.routes) {
      if (r.alpha <= 0 || r.progress <= 0) continue;
      const limit = r.progress * r.total;
      // The drawn part, in screen px, ending at the head, with a point at least every 6 px: a line
      // of text crossed between two corners of the route still counts as type on it.
      const xs = [X(r.pts[0])], ys = [Y(r.pts[1])];
      const step = (x: number, y: number) => {
        const px = xs[xs.length - 1], py = ys[ys.length - 1], k = Math.ceil(Math.hypot(x - px, y - py) / 6);
        for (let j = 1; j <= k; j++) { xs.push(px + ((x - px) * j) / k); ys.push(py + ((y - py) * j) / k); }
      };
      for (let i = 1; i < r.cum.length; i++) {
        if (r.cum[i] <= limit) step(X(r.pts[i * 2]), Y(r.pts[i * 2 + 1]));
        else {
          const f = (limit - r.cum[i - 1]) / (r.cum[i] - r.cum[i - 1]);
          step(X(r.pts[i * 2 - 2] + (r.pts[i * 2] - r.pts[i * 2 - 2]) * f), Y(r.pts[i * 2 - 1] + (r.pts[i * 2 + 1] - r.pts[i * 2 - 1]) * f));
          break;
        }
      }
      const n = xs.length, hx = xs[n - 1], hy = ys[n - 1];
      const under = xs.map((x, i) => shown.some((q) => x > q[0] && x < q[2] && ys[i] > q[1] && ys[i] < q[3]));
      // The stretches clear of type: first point, last point, length in px.
      const runs: [number, number, number][] = [];
      for (let i = 0; i < n; ) {
        if (under[i]) { i++; continue; }
        let j = i, len = 0;
        while (j + 1 < n && !under[j + 1]) { len += Math.hypot(xs[j + 1] - xs[j], ys[j + 1] - ys[j]); j++; }
        runs.push([i, j, len]);
        i = j + 1;
      }
      r.broken = runs.length > 1;
      const across = tables.length > 0 && xs.some((x, i) => tables.some((q) => x > q[0] && x < q[2] && ys[i] > q[1] && ys[i] < q[3]));
      const whole = !across && runs.length === 1 && runs[0][0] === 0 && runs[0][1] === n - 1 ? 1 : 0;
      if (r.clear < 0) r.clear = whole;
      else if (r.clear !== whole) {
        r.clear = whole ? Math.min(1, r.clear + dt / 0.3) : Math.max(0, r.clear - dt / 0.3);
        if (r.clear !== whole) more = true;
      }
      const a = r.alpha * (0.3 + 0.7 * full) * (full + (1 - full) * r.clear);
      for (const [i, j, len] of runs) {
        const anchored = (i === 0 && originAt) || (j === n - 1 && (r.progress < 1 || destAt));
        const t = Math.min(1, Math.max(0, (len - CRUMB / 2) / (CRUMB / 2)));
        const w = anchored ? 1 : t * t * (3 - 2 * t);
        if (a * w > 0.01) {
          // One segment either side runs in under the type, where the knockout trims it.
          const from = Math.max(0, i - 1), to = Math.min(n - 1, j + 1);
          const p = new Path2D();
          p.moveTo(xs[from], ys[from]);
          for (let k = from + 1; k <= to; k++) p.lineTo(xs[k], ys[k]);
          c.strokeStyle = `rgba(${PAPER}, ${0.85 * a * w})`;
          c.lineWidth = 6;
          c.stroke(p);
          c.strokeStyle = `rgba(${ROUTE}, ${a * w})`;
          c.lineWidth = 2.25;
          c.stroke(p);
        }
      }
      if (r.progress < 1) {
        c.fillStyle = `rgba(${ROUTE}, ${a})`;
        c.beginPath();
        c.arc(hx, hy, 3.2, 0, Math.PI * 2);
        c.fill();
      }
    }

    // Behind reading text both ends go with their route: when type sits on the route and it fades,
    // its points fade too, so neither stands alone between the lines as a stray mark.
    const lead = s.routes[s.routes.length - 1];
    const follow = lead && lead.clear >= 0 ? full + (1 - full) * lead.clear : 1;

    // Origin: Kızılay.
    if (originAt) {
      const o = s.origin, x = X(o.x), y = Y(o.y), a = o.alpha * (0.35 + 0.65 * full) * follow;
      c.fillStyle = `rgba(${PAPER}, ${a})`;
      c.strokeStyle = `rgba(${INK}, ${a})`;
      c.lineWidth = 2;
      c.beginPath();
      c.arc(x, y, 5.5, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      c.fillStyle = `rgba(${INK}, ${a})`;
      c.beginPath();
      c.arc(x, y, 1.8, 0, Math.PI * 2);
      c.fill();
      if (full > 0.01) {
        c.textBaseline = 'alphabetic';
        this.font('label', 12);
        const wName = Math.max(c.measureText(o.name).width, 44);
        // Right of the point, unless type sits there or the route sets off that way: then left.
        // 2 clear, 1 crossed by the route, 0 under type.
        const open = (left: boolean) => {
          const l = left ? x - 14 - wName : x + 8, r = left ? x - 8 : x + 14 + wName;
          return overWords(l - 6, y - 19, r + 6, y + 22) ? 0 : routeNear(l, y - 13, r, y + 16, false) ? 1 : 2;
        };
        const R = open(false), L = open(true);
        const want = R === 2 ? 1 : L === 2 ? -1 : R ? 1 : L ? -1 : 0;
        // A change of side fades out and back in, never jumps.
        const step = dt / 0.22;
        this.side = want > this.side ? Math.min(want, this.side + step) : Math.max(want, this.side - step);
        if (this.side !== want) more = true;
        const la = full * o.alpha * Math.abs(this.side);
        if (la > 0.01) {
          const left = this.side < 0, tx = left ? x - 11 : x + 11, align = left ? 'right' : 'left';
          set.push(left ? [x - 14 - wName, y - 13, x - 8, y + 16] : [x + 8, y - 13, x + 14 + wName, y + 16]);
          this.text(o.name, tx, y - 1, INK, la, align);
          this.font('mono', 10.5);
          this.text(o.sub, tx, y + 12, INK, 0.7 * la, align);
        }
      }
    }
    this.sideAt = s.time;

    // Destination: a filled point, a ring that settles on arrival, then the label. The ring keeps
    // inside the room the point has, so it never runs under the type beside it or off the screen.
    if (s.dest && destAt) {
      const d = s.dest, x = X(d.x), y = Y(d.y), a = d.alpha * (0.4 + 0.6 * full) * follow;
      const ring = Math.max(5, Math.min(7 + 9 * (1 - d.pulse), roomAt(x, y) - 1.5, x - 2, this.w - x - 2));
      c.strokeStyle = `rgba(${ROUTE}, ${a * (0.35 + 0.65 * d.pulse)})`;
      c.lineWidth = 1.5;
      c.beginPath();
      c.arc(x, y, ring, 0, Math.PI * 2);
      c.stroke();
      c.fillStyle = `rgba(${ROUTE}, ${a})`;
      c.beginPath();
      c.arc(x, y, 4, 0, Math.PI * 2);
      c.fill();
      const la = full * d.alpha * d.pulse * follow;
      if (la > 0.01 && (d.name || d.sub)) {
        this.font('label', 12.5);
        const wl = Math.max(c.measureText(d.name).width, 44) + 4;
        // Right of the point unless that runs off screen, over type or across the arriving route,
        // then left, then centred under the point; no label where type takes all three.
        type Side = 'right' | 'left' | 'below';
        const box = (s: Side) => (s === 'below'
          ? [x - wl / 2 - 2, y + 9, x + wl / 2 + 2, y + 39]
          : s === 'left' ? [x - 14 - wl, y - 14, x - 10, y + 16] : [x + 10, y - 14, x + 14 + wl, y + 16]) as [number, number, number, number];
        const fits = (s: Side) => {
          const [l, t, r, b] = box(s);
          return l >= 4 && r <= this.w - 24 && !overWords(l - 6, t - 6, r + 6, b + 6) && !onLabel(l - 4, t - 4, r + 4, b + 4);
        };
        const clear = (s: Side) => fits(s) && !routeNear(...box(s), true);
        // Beside the point a label may touch the arriving route; under it, it would sit across it.
        const side = (['right', 'left', 'below'] as Side[]).find(clear) ?? (['right', 'left'] as Side[]).find(fits) ?? null;
        if (side) {
          const align: CanvasTextAlign = side === 'left' ? 'right' : side === 'below' ? 'center' : 'left';
          const tx = side === 'left' ? x - 14 : side === 'below' ? x : x + 14;
          const ty = side === 'below' ? y + 23 : y - 1;
          c.textBaseline = 'alphabetic';
          this.text(d.name, tx, ty, ROUTE, la, align);
          this.font('mono', 10.5);
          this.text(d.sub, tx, ty + 13, INK, 0.75 * la, align);
        }
      }
    }

    // Type sits above the sheet: everything plotted breaks under it, as linework does on a printed
    // map. The contours stay whole underneath; they are the paper.
    c.globalCompositeOperation = 'destination-out';
    c.fillStyle = '#000';
    for (const q of s.blockers) {
      const top = q.top - s.scrollY, bottom = q.bottom - s.scrollY;
      if (bottom > 0 && top < this.h) c.fillRect(q.left, top, q.right - q.left, bottom - top);
    }
    c.globalCompositeOperation = 'source-over';
    return more;
  }
}
