// Type on the page is terrain the route cannot cross. Every box where type rests (typeBlockers:
// display type by the ink box of each letter, so a route can still thread between two lines of a
// name; other text by its line boxes, a paragraph as one block; figures and controls whole) closes
// the cells under it, measured where the page sits when a search starts.
import { CELL, type Grid } from './astar';
import type { View } from './view';
import type { Box } from './layer';

const MARGIN = 4; // px of clearance around text
// The search keeps a wider berth than the knockout. A route laid along the knockout's edge comes out
// as dashes wherever smoothing nudges it under the lettering, so every cell that comes within the
// route's own paper halo of the knockout is closed too (marked 2), except where a route starts or
// ends: the driver opens those.
const HALO = 3; // px: half the width of the paper stroke under a route
// Figures, images and controls are furniture: the linework breaks under the whole box, not just
// under the words inside it.
const FURNITURE = 'figure, img, input, textarea, select, button, .btn';
const WASH = 6; // px the paper wash on a phone reaches past its block, at full strength

let measure: CanvasRenderingContext2D | null = null;
const range = typeof document !== 'undefined' ? document.createRange() : null;

/** Closes the cells under the type on screen. `boxes` are typeBlockers(), in document coordinates. */
export function markObstacles(grid: Grid, view: View, boxes: Box[]) {
  grid.blocked.fill(0);
  const sx = scrollX, sy = scrollY;
  for (const b of boxes) {
    const top = b.top - sy, bottom = b.bottom - sy;
    if (bottom < 0 || top > view.h) continue;
    // typeBlockers pads every box by MARGIN, and block() pads it again: take the first one off.
    block(grid, view, { left: b.left - sx + MARGIN, right: b.right - sx - MARGIN, top: top + MARGIN, bottom: bottom - MARGIN });
  }
  markEdges(grid, view);
}

// On a phone, type runs from margin to margin: the only way around a paragraph is down the edge of
// the screen, or off it, and a route drawn there hugs the frame instead of crossing the sheet. The
// margins are closed on a phone (screen x within EDGE px of either side, at every height), so the
// route keeps to the sheet between them, and where the words close it off, it passes under them.
// Around a route's two ends they open again (openEnds): a link's point set on the margin line,
// beside its word, is reached down the margin instead of from under the word.
const EDGE = 16;
const EDGE_END = 48; // px around an end where the margin is open
export const WALL = 3; // a closed margin cell; type is 1, its berth 2
export function markEdges(grid: Grid, view: View) {
  if (view.w >= 768) return;
  for (let x = 0; x < grid.w; x++) {
    const sx = view.ox + (x + 0.5) * CELL * view.s;
    if (sx >= EDGE && sx <= view.w - EDGE) continue;
    for (let i = x; i < grid.blocked.length; i += grid.w) if (grid.blocked[i] !== 1) grid.blocked[i] = WALL;
  }
}

/** Opens the closed margins within EDGE_END px of each end (grid cells). */
export function openEnds(grid: Grid, view: View, ends: number[]) {
  if (view.w >= 768) return;
  const r = Math.ceil(EDGE_END / (CELL * view.s));
  for (const c of ends) {
    const cx = c % grid.w, cy = Math.floor(c / grid.w);
    for (let y = Math.max(0, cy - r); y <= Math.min(grid.h - 1, cy + r); y++) {
      for (let x = Math.max(0, cx - r); x <= Math.min(grid.w - 1, cx + r); x++) {
        if (grid.blocked[y * grid.w + x] === WALL) grid.blocked[y * grid.w + x] = 0;
      }
    }
  }
}

/** Sections printed in negative, in document coordinates: they hide the sheet under them. */
export function coverBoxes(): Box[] {
  const sx = scrollX, sy = scrollY;
  return [...document.querySelectorAll<HTMLElement>('main [data-tone="dark"]')].map((el) => {
    const r = el.getBoundingClientRect();
    return { left: r.left + sx, right: r.right + sx, top: r.top + sy, bottom: r.bottom + sy };
  });
}

/** Lists set as tables, whole, in document coordinates ([data-shy]). A map label in the gap between
 *  two of their columns would read as one of their cells: labels keep off the whole box. The planner
 *  still threads a route through their gaps, but behind reading text a route across one fades, as
 *  if type rested on it (layer.ts). */
export function shyBoxes(): Box[] {
  const sx = scrollX, sy = scrollY;
  return [...document.querySelectorAll<HTMLElement>('main [data-shy]')].map((el) => {
    const r = el.getBoundingClientRect();
    return { left: r.left + sx, right: r.right + sx, top: r.top + sy, bottom: r.bottom + sy };
  });
}

/** Where the type rests on the page, in document coordinates. Map labels keep clear of it, and the
 *  plotting layer is cut away under it, the way a printed sheet breaks its linework at the
 *  lettering. Display type counts by glyph, so a route threading between the letters of a name
 *  stays whole. Reveal transforms (inline, set by GSAP) are taken out: text on its way in will
 *  land where its layout box is. */
export function typeBlockers(): Box[] {
  if (!range) return [];
  const out: Box[] = [];
  const sx = scrollX, sy = scrollY;
  const shifts = new Map<Element, [number, number]>();
  const shift = (el: Element | null) => restShift(el, shifts);
  const push = (r: Box, [dx, dy]: [number, number]) => out.push({
    left: r.left + sx - dx - MARGIN, right: r.right + sx - dx + MARGIN,
    top: r.top + sy - dy - MARGIN, bottom: r.bottom + sy - dy + MARGIN,
  });
  // On a phone a paragraph set on the map sits on a wash of paper (site.css, [data-wash]) that
  // reaches past its lines: the whole washed block counts, so a route never ends faded under it.
  const washed = innerWidth < 768 ? `${FURNITURE}, [data-wash]` : FURNITURE;
  for (const region of document.querySelectorAll<HTMLElement>('main, footer')) {
    for (const el of region.querySelectorAll<HTMLElement>(washed)) {
      const r = el.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1) continue;
      const g = el.hasAttribute('data-wash') ? WASH : 0;
      push({ left: r.left - g, right: r.right + g, top: r.top - g, bottom: r.bottom + g }, shift(el));
    }
    for (const el of region.querySelectorAll<HTMLElement>('[data-obstacle="glyphs"]')) {
      const s = shift(el);
      for (const b of glyphBoxes(el)) push(b, s);
    }
    const lines: Box[] = [];
    const walk = document.createTreeWalker(region, NodeFilter.SHOW_TEXT);
    for (let node = walk.nextNode(); node; node = walk.nextNode()) {
      const el = node.parentElement;
      if (!el || !node.textContent?.trim() || el.closest('[data-obstacle="glyphs"], [data-live]')) continue;
      const [dx, dy] = shift(el);
      range.selectNodeContents(node);
      for (const r of range.getClientRects()) {
        if (r.width > 1 && r.height > 1) lines.push({ left: r.left - dx, right: r.right - dx, top: r.top - dy, bottom: r.bottom - dy });
      }
    }
    for (const b of lines) push(b, [0, 0]);
    // A paragraph or a list knocks out as one block: the thin strips between its lines would
    // otherwise leave crumbs of a route that drifted under it. Wider gaps (table rows, the
    // project index) stay open.
    lines.sort((a, b) => a.top - b.top);
    for (let i = 0; i < lines.length; i++) {
      const a = lines[i], reach = a.bottom + Math.min(18, 0.8 * (a.bottom - a.top));
      for (let j = i + 1; j < lines.length && lines[j].top <= reach; j++) {
        const b = lines[j];
        const left = Math.max(a.left, b.left), right = Math.min(a.right, b.right);
        if (b.top > a.bottom && right > left) push({ left, right, top: a.bottom, bottom: b.top }, [0, 0]);
      }
    }
  }
  return out;
}

/** Type that moves against the page ([data-live]: a section's name held in its column while the
 *  section scrolls past), by its line boxes, in document coordinates at the current scroll. It is
 *  measured every frame the layer draws, and at every search, instead of once like the rest. */
export function liveBoxes(els: HTMLElement[]): Box[] {
  if (!range || !els.length) return [];
  const out: Box[] = [];
  const sx = scrollX, sy = scrollY;
  const shifts = new Map<Element, [number, number]>();
  for (const el of els) {
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let node = walk.nextNode(); node; node = walk.nextNode()) {
      if (!node.textContent?.trim()) continue;
      const [dx, dy] = restShift(node.parentElement, shifts);
      range.selectNodeContents(node);
      for (const r of range.getClientRects()) {
        if (r.width <= 1 || r.height <= 1) continue;
        out.push({
          left: r.left + sx - dx - MARGIN, right: r.right + sx - dx + MARGIN,
          top: r.top + sy - dy - MARGIN, bottom: r.bottom + sy - dy + MARGIN,
        });
      }
    }
  }
  return out;
}

/** The reveal offset above an element (inline transforms set by GSAP), so type on its way in is
 *  measured where it will rest. */
function restShift(el: Element | null, cache: Map<Element, [number, number]>): [number, number] {
  if (!el || el === document.body) return [0, 0];
  let s = cache.get(el);
  if (s) return s;
  const [px, py] = restShift(el.parentElement, cache);
  s = [px, py];
  if ((el as HTMLElement).style?.transform) {
    const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
    s = [px + m.m41, py + m.m42];
  }
  cache.set(el, s);
  return s;
}

function block(grid: Grid, v: View, b: Box) {
  const tx0 = (b.left - MARGIN - v.ox) / v.s, tx1 = (b.right + MARGIN - v.ox) / v.s;
  const ty0 = (b.top - MARGIN - v.oy) / v.s, ty1 = (b.bottom + MARGIN - v.oy) / v.s;
  // Cells whose centre lies inside the box: the type itself.
  const cx0 = Math.ceil(tx0 / CELL - 0.5), cx1 = Math.floor(tx1 / CELL - 0.5);
  const cy0 = Math.ceil(ty0 / CELL - 0.5), cy1 = Math.floor(ty1 / CELL - 0.5);
  // Cells that touch the box grown by the halo: the berth around it.
  const pad = HALO / v.s;
  const rx0 = Math.max(0, Math.floor((tx0 - pad) / CELL)), rx1 = Math.min(grid.w - 1, Math.floor((tx1 + pad) / CELL));
  const ry0 = Math.max(0, Math.floor((ty0 - pad) / CELL)), ry1 = Math.min(grid.h - 1, Math.floor((ty1 + pad) / CELL));
  for (let y = ry0; y <= ry1; y++) {
    for (let x = rx0; x <= rx1; x++) {
      const i = y * grid.w + x;
      if (x >= cx0 && x <= cx1 && y >= cy0 && y <= cy1) grid.blocked[i] = 1;
      else if (!grid.blocked[i]) grid.blocked[i] = 2;
    }
  }
}

function glyphBoxes(el: HTMLElement): Box[] {
  if (!range) return [];
  measure ??= document.createElement('canvas').getContext('2d');
  const cs = getComputedStyle(el);
  const size = parseFloat(cs.fontSize);
  if (measure) measure.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
  const out: Box[] = [];
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let node = walk.nextNode(); node; node = walk.nextNode()) {
    const text = node.textContent ?? '';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (!ch.trim()) continue;
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const r = range.getBoundingClientRect();
      if (!r.width) continue;
      const m = measure?.measureText(ch);
      const asc = m?.fontBoundingBoxAscent || size * 0.9;
      const desc = m?.fontBoundingBoxDescent || size * 0.24;
      const baseline = r.top + (r.height * asc) / (asc + desc);
      const inkUp = m?.actualBoundingBoxAscent ?? size * 0.72;
      const inkDown = m?.actualBoundingBoxDescent ?? 0;
      out.push({ left: r.left, right: r.right, top: baseline - inkUp, bottom: baseline + inkDown });
    }
  }
  return out;
}
