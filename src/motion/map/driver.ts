// The one driver. Everything that carries the concept reads from it: the GL contour layer (framing
// and strength), the plotting layer (frontier, route, waypoints, labels) and the status bar.
// A destination comes from, in order: a hovered project, a link the route ends at (data-route-target),
// the 404, the case study's project, the pointer, a tap, or at rest an idle tour of the project
// hilltops. Each new destination starts an A* search over Ankara's elevation from Kızılay.
import { gsap } from 'gsap';
import { ease, getGL, glSupported, onGLResize, onPage, onScroll, prefersReducedMotion, scrollState } from '../../engine';
import { T, heightAt, latLonAt, loadTerrain, slopeAt, type Terrain } from './terrain';
import { computeView, toTexel, type View } from './view';
import { CELL, Grid, Search, straighten } from './astar';
import { Frontier, Layer, makeRoute, smooth, type Box, type Marker, type Route } from './layer';
import { initContours } from './contours';
import { drawStatic } from './static';
import { WALL, coverBoxes, liveBoxes, markEdges, markObstacles, openEnds, shyBoxes, typeBlockers } from './obstacles';

type Kind = 'pointer' | 'tap' | 'place' | 'target' | 'fail';
type Dest = { x: number; y: number; key: string; kind: Kind; name: string };

const FAINT = 0.34;
const HOLD = 4.6; // seconds a tour stop stays before the next one
const IDLE = 4; // seconds without pointer input before the tour resumes
// A route search around type that has closed this many cells has probably been shut out: it runs
// again over the open sheet. Open searches close a few hundred to a few thousand. On a phone the
// sheet between the margins is narrow, and a way round shows itself sooner.
const TYPED_MAX = 15000;
const TYPED_MAX_PHONE = 5000;
// Px the page may scroll under a route drawn around type before the route is checked again.
const DRIFT = 24;

// Project waypoints come from the page (the #route-names JSON), centred on their texels; spot
// heights too close to a waypoint are dropped.
type Place = { slug: string; title: string; x: number; y: number };
let places: Place[] = [];
let spots: { x: number; y: number; label: string }[] = [];
function readPlaces() {
  try {
    const raw = JSON.parse(document.getElementById('route-names')?.textContent ?? '{}').places as Place[] | undefined;
    places = (raw ?? []).map((p) => ({ ...p, x: p.x + 0.5, y: p.y + 0.5 }));
  } catch { places = []; }
  spots = T.spots
    .filter((s) => places.every((p) => Math.hypot(p.x - s.x, p.y - s.y) > 8))
    .map((s) => ({ x: s.x + 0.5, y: s.y + 0.5, label: String(s.h) }));
  // The tour starts at the hilltop farthest from Kızılay: the first route anyone sees is the longest.
  const far = (p: Place) => Math.hypot(p.x - T.origin.x, p.y - T.origin.y);
  first = places.reduce((best, p, i) => (far(p) > far(places[best]) ? i : best), 0);
}
let first = 0;

const S = {
  terrain: null as Terrain | null,
  grid: null as Grid | null,
  view: null as View | null,
  gl: null as ReturnType<typeof initContours>,
  layer: null as Layer | null,
  staticMap: null as HTMLCanvasElement | null,
  frontier: new Frontier(),
  routes: [] as Route[],
  search: null as Search | null,
  // The running search treats the type on screen as terrain; `ends` are its first and last cells,
  // `at` the scroll position it measured the type at. A quiet search checks a route already on the
  // sheet: no frontier, no SEARCHING, and nothing changes if it finds the same road.
  typed: false,
  ends: { from: 0, to: 0 },
  at: 0,
  quiet: false,
  dest: null as Dest | null,
  marker: null as (Marker & { pulse: number }) | null,
  lifted: '', // the key of a link whose road was lifted when the link moved on
  origin: { x: T.origin.x, y: T.origin.y, name: 'KIZILAY', sub: '', alpha: 0 } as Marker,
  zone: null as { x: number; y: number; r: number; label: string; alpha: number } | null,
  // How strongly the sheet prints: section (eased to sectionTarget) over the map sections on screen,
  // whose screen bands are kept in bands; lift over the whole sheet while a project is pointed at.
  // strength, the larger of the two, sets the plotting layer and the static map.
  strength: FAINT,
  section: FAINT,
  lift: 0,
  bands: [0, 0, 0, 0],
  sectionTarget: FAINT,
  reduced: false,
  still: false,
  fine: false,
  ready: false,
  dirty: true,
  glDirty: true,
  scrollDirty: true,
  pointer: { x: 0, y: 0, at: -99, inFull: false },
  tap: null as Dest | null,
  tapAt: -99,
  hover: null as string | null,
  pending: { key: '', since: 0 },
  lastStart: -99,
  // When the page last scrolled, and whether the route has been checked against the type since.
  scrolledAt: -99,
  recheck: false,
  tour: { i: 0, until: 0 },
  failRetry: 0,
  page: { dest: null as string | null, fail: false, full: [] as HTMLElement[], targets: [] as HTMLElement[], live: [] as HTMLElement[] },
  // Type (terrain to the search), and the sections printed in negative, which hide the sheet:
  // the plotting layer reads both as `shade`.
  blockers: [] as Box[],
  covers: [] as Box[],
  shade: [] as Box[],
  shy: [] as Box[], // lists set as tables: labels keep off them whole
  status: new Map<string, HTMLElement>(),
  shown: new Map<string, string>(),
  lang: 'en',
};

const now = () => gsap.ticker.time;

export function initMap() {
  const host = document.getElementById('gl');
  if (!host) return Promise.resolve();
  S.reduced = prefersReducedMotion();
  readPlaces();
  S.tour.i = first;
  const useGL = glSupported() && !!getGL();
  S.still = S.reduced || !useGL;
  S.fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  S.layer = new Layer(host);
  resize();

  const ready = loadTerrain().then((t) => {
    S.terrain = t;
    S.grid = new Grid(t);
    S.origin.sub = `${fmt(heightAt(t, T.origin.x, T.origin.y), 0)} m`;
    if (useGL) S.gl = initContours(t);
    // On a slow connection the data can land after the loader: the map then inks in from blank.
    if (!S.reduced) S.strength = S.section = 0;
    if (!S.gl) {
      S.staticMap = document.createElement('canvas');
      S.staticMap.className = 'static-map';
      S.staticMap.setAttribute('aria-hidden', 'true');
      host.prepend(S.staticMap);
      drawStatic(S.staticMap, t, S.view!);
      // Faint behind reading text from the first frame, like the live map (the tick only writes
      // a change, and under reduced motion the strength may already sit at its target).
      S.staticMap.style.opacity = String(S.strength);
    }
    S.dirty = S.glDirty = true;
  }).catch(() => document.documentElement.classList.add('map-off'));

  document.fonts?.ready.then(measureText);
  if (useGL) onGLResize(resize);
  else {
    let timer = 0;
    addEventListener('resize', () => { clearTimeout(timer); timer = window.setTimeout(resize, 150); });
  }
  onScroll(() => { S.scrollDirty = true; });

  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    S.pointer.x = e.clientX;
    S.pointer.y = e.clientY;
    S.pointer.at = now();
    S.pointer.inFull = !!(e.target as Element | null)?.closest?.('[data-map="full"]');
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => { S.pointer.inFull = false; S.pointer.at = -99; });
  addEventListener('pointerdown', (e) => {
    const el = e.target as Element | null;
    if (!el?.closest?.('[data-map="full"]') || el.closest('a, button, input, textarea, select, label, [data-copy]')) return;
    if (S.fine && !S.reduced) return; // a mouse already drives the route
    const d = pointDest(e.clientX, e.clientY, 'tap');
    if (d) { S.tap = d; S.tapAt = now(); }
  }, { passive: true });
  const hoverOf = (e: Event) => ((e.target as Element | null)?.closest?.('[data-place]') as HTMLElement | null)?.dataset.place ?? null;
  document.addEventListener('pointerover', (e) => { if ((e as PointerEvent).pointerType === 'mouse') setHover(hoverOf(e)); });
  document.addEventListener('focusin', (e) => setHover(hoverOf(e)));
  document.addEventListener('focusout', () => setHover(null));

  gsap.ticker.add(tick);
  onPage(pageInit);
  return ready;
}

function setHover(slug: string | null) {
  if (S.hover === slug) return;
  S.hover = slug;
  S.dirty = true;
}

function resize() {
  const w = innerWidth, h = innerHeight;
  S.view = computeView(w, h, scrollState().y, S.still);
  S.layer?.resize(w, h);
  if (S.staticMap && S.terrain) drawStatic(S.staticMap, S.terrain, S.view);
  if (S.ready) measureText();
  updateScale();
  S.dirty = S.glDirty = S.scrollDirty = true;
}

/** Where the type rests, for the labels to keep clear of and the linework to break under. */
function measureText() {
  S.blockers = typeBlockers();
  S.covers = coverBoxes();
  S.shade = S.covers.length ? S.blockers.concat(S.covers) : S.blockers;
  S.shy = shyBoxes();
  S.dirty = true;
}

/** Per page: what the map should do here, and the status bar of the new page. */
function pageInit({ intro }: { intro: gsap.core.Timeline }) {
  S.lang = document.documentElement.lang === 'tr' ? 'tr' : 'en';
  S.page.full = [...document.querySelectorAll<HTMLElement>('[data-map="full"]')];
  S.page.targets = [...document.querySelectorAll<HTMLElement>('[data-route-target]')];
  // Type that moves against the page (a section name held in its column): measured live.
  S.page.live = [...document.querySelectorAll<HTMLElement>('main [data-live]')];
  S.page.dest = document.querySelector<HTMLElement>('[data-dest]')?.dataset.dest ?? null;
  S.page.fail = !!document.querySelector('[data-fail]');
  S.status.clear();
  S.shown.clear();
  document.querySelectorAll<HTMLElement>('[data-status] [data-s]').forEach((el) => S.status.set(el.dataset.s!, el));
  // The search for an address that is not there ends with its page: the next page plans its own
  // road, and its bar starts from zero instead of saying NO ROUTE.
  if (S.dest?.kind === 'fail' && !S.page.fail) {
    S.dest = null;
    S.search = null;
    S.marker = null;
    S.zone = null;
    S.frontier.clear();
    report = null;
  }
  // A route that crosses the page change stays on the map, so its numbers stay in the new bar,
  // in the new page's language.
  report?.();
  S.hover = null;
  S.tap = null;
  S.zone = null;
  S.failRetry = 0;
  measureText();
  S.scrollDirty = S.dirty = true;
  S.ready = false;
  S.view = computeView(innerWidth, innerHeight, 0, S.still);
  updateScale();
  // Searches wait for the page intro to settle, so type is measured where it rests.
  intro.call(() => {
    if (S.origin.alpha < 1) gsap.to(S.origin, { alpha: 1, duration: 0.5, ease: ease.soft, onUpdate: () => { S.dirty = true; } });
  }, [], 0);
  // A tour stop carried over from the last page holds for its full time here before the tour moves on.
  intro.call(() => { S.ready = true; S.tour.until = S.dest?.kind === 'place' ? now() + HOLD : 0; measureText(); }, [], S.reduced ? 0 : 1.15);
  return () => { S.ready = false; };
}

// ---------- the loop ----------
function tick(time: number) {
  if (!S.view) return;
  if (S.scrollDirty) onScrollChange();

  const lift = S.hover ? 0.75 : 0;
  if (Math.abs(S.sectionTarget - S.section) > 0.002 || Math.abs(lift - S.lift) > 0.002) {
    S.section = S.reduced ? S.sectionTarget : S.section + (S.sectionTarget - S.section) * 0.09;
    S.lift = S.reduced ? lift : S.lift + (lift - S.lift) * 0.09;
    S.strength = Math.max(S.section, S.lift);
    S.dirty = S.glDirty = true;
    if (S.staticMap) S.staticMap.style.opacity = String(S.strength);
  }

  if (S.terrain && S.grid) {
    if (S.search?.status === 'running') {
      const budget = S.dest?.kind === 'fail' ? 650 : 360;
      const G = S.grid;
      const state = S.search.step(budget, S.quiet ? undefined : (c) => S.frontier.push(G.cx(c), G.cy(c), time, clearance(G, c)));
      if (!S.quiet) {
        setStatus('nodes', fmt(S.search.expanded, 0), true);
        S.dirty = true;
      }
      if (state === 'found') found(time);
      else if (state === 'failed' || (S.typed && S.search.expanded > (S.view.w < 768 ? TYPED_MAX_PHONE : TYPED_MAX))) failed(time);
    }
    if (S.ready) decide(time);
  }

  if (S.frontier.live(time)) S.dirty = true;
  if (S.dirty && S.layer) {
    S.dirty = S.layer.draw({
      view: S.view, strength: S.strength, time, routes: S.routes, origin: S.origin, dest: S.marker,
      places, spots, zone: S.zone, blockers: S.page.live.length ? S.shade.concat(liveBoxes(S.page.live)) : S.shade, shy: S.shy, scrollY: scrollY,
    }, S.frontier);
  }
  if (S.glDirty && S.gl) { S.glDirty = false; S.gl.set(S.view, { section: S.section, lift: S.lift, faint: FAINT, bands: S.bands }); }
  readouts(time);
}

function onScrollChange() {
  S.scrollDirty = false;
  S.scrolledAt = now();
  S.recheck = true;
  const vh = innerHeight;
  // Type slides over the sheet while the map holds still: the knockout under it and the label
  // checks have to follow, at any strength.
  S.dirty = true;
  if (!S.still) {
    const v = computeView(innerWidth, vh, scrollState().y);
    if (!S.view || v.oy !== S.view.oy || v.s !== S.view.s) { S.view = v; S.dirty = S.glDirty = true; }
  }
  let cover = 0;
  const held: number[][] = [];
  for (const el of S.page.full) {
    const r = el.getBoundingClientRect();
    cover = Math.max(cover, Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) / vh);
    // An edge at or past the screen's edge has nothing beyond it to fade for.
    if (r.bottom > 0 && r.top < vh) held.push([r.top <= 1 ? -1e4 : r.top, r.bottom >= vh - 1 ? 1e4 : r.bottom]);
  }
  // The contours print at full strength only over these sections; text above or below them keeps
  // a faint sheet. Sections that touch hold one band.
  held.sort((a, b) => a[0] - b[0]);
  const merged: number[][] = [];
  for (const b of held) {
    const last = merged[merged.length - 1];
    if (last && b[0] <= last[1] + 2) last[1] = Math.max(last[1], b[1]);
    else merged.push([...b]);
  }
  const bands = [...(merged[0] ?? [0, 0]), ...(merged[1] ?? [0, 0])];
  if (bands.some((b, i) => b !== S.bands[i])) { S.bands = bands; S.glDirty = true; }
  // The sheet stays the subject only while a map section fills most of the screen; once reading
  // text takes half of it, the contours recede under the words.
  const k = Math.min(1, Math.max(0, (cover - 0.4) / 0.45));
  S.sectionTarget = FAINT + (1 - FAINT) * k * k * (3 - 2 * k);
}

// ---------- choosing the destination ----------
function placeDest(slug: string): Dest | null {
  const p = places.find((q) => q.slug === slug);
  return p ? { x: p.x, y: p.y, key: `place:${slug}`, kind: 'place', name: p.title.toUpperCase() } : null;
}

function pointDest(sx: number, sy: number, kind: Kind): Dest | null {
  if (!S.view || !S.grid) return null;
  const t = toTexel(S.view, sx, sy);
  if (t.x < 0 || t.y < 0 || t.x >= T.width || t.y >= T.height) return null;
  return { x: t.x, y: t.y, key: `${kind}:${S.grid.cellAt(t.x, t.y)}`, kind, name: '' };
}

function targetDest(): Dest | null {
  const vh = innerHeight;
  for (const el of S.page.targets) {
    const r = el.getBoundingClientRect();
    if (r.top < vh * 0.08 || r.bottom > vh * 0.92) continue;
    const pt = (el.querySelector('.cta-mega__pt') ?? el).getBoundingClientRect();
    return pointDest(pt.left + pt.width / 2, pt.top + pt.height / 2, 'target');
  }
  return null;
}

function failDest(): Dest | null {
  if (!S.view) return null;
  const c = toTexel(S.view, S.view.w * (S.view.w < 768 ? 0.72 : 0.76), S.view.h * (S.view.w < 768 ? 0.34 : 0.32));
  return { x: c.x, y: c.y, key: `fail:${S.failRetry}`, kind: 'fail', name: S.lang === 'tr' ? 'KISITLI' : 'RESTRICTED' };
}

function wanted(time: number): Dest | null {
  if (S.hover) return placeDest(S.hover);
  const target = targetDest();
  if (target) return target;
  if (S.page.fail) return failDest();
  if (S.page.dest) return placeDest(S.page.dest);
  if (S.fine && !S.reduced && S.pointer.inFull && time - S.pointer.at < IDLE) return pointDest(S.pointer.x, S.pointer.y, 'pointer');
  if (S.tap && (S.reduced || time - S.tapAt < 10)) return S.tap;
  if (!places.length) return null;
  if (S.reduced) return S.dest ?? placeDest(places[first].slug);
  // Idle tour of the project hilltops. It waits while reading text fills the screen: a new road
  // there would only fade under the words. A link that has left the screen is not waited on.
  if (S.dest && S.dest.kind !== 'target' && subject() <= 0.6) return S.dest;
  if (S.dest?.kind === 'place' && S.dest.key === `place:${places[S.tour.i % places.length].slug}` && (S.search?.status === 'running' || time < S.tour.until)) return S.dest;
  if (S.dest?.kind === 'place' && time >= S.tour.until && S.tour.until > 0) S.tour.i++;
  return placeDest(places[S.tour.i % places.length].slug);
}

function decide(time: number) {
  const d = wanted(time);
  if (!d || d.key === S.dest?.key) {
    S.pending.key = '';
    // A road lifted when its link moved on comes back if the link does.
    if (d && d.key === S.lifted) {
      S.lifted = '';
      start(d, time);
    } else if (d && reroute(time)) start(d, time, true);
    return;
  }
  // A link's point rides with the page while the sheet barely moves: a road that no longer meets
  // its link is lifted at once, and the next one is plotted when the page settles.
  if (d.kind === 'target' && S.dest?.kind === 'target' && S.lifted !== S.dest.key && S.view &&
      Math.hypot(d.x - S.dest.x, d.y - S.dest.y) * S.view.s > 24) {
    S.lifted = S.dest.key;
    const fade = { alpha: 0, duration: S.reduced ? 0 : 0.25, ease: ease.soft, onUpdate: dirty };
    for (const r of S.routes) gsap.to(r, fade);
    if (S.marker) gsap.to(S.marker, fade);
  }
  // Moving destinations (pointer, a link while scrolling) start once they settle.
  if (d.kind === 'pointer' || d.kind === 'target') {
    if (S.pending.key !== d.key) { S.pending.key = d.key; S.pending.since = time; }
    const far = S.dest && Math.hypot(d.x - S.dest.x, d.y - S.dest.y) > CELL * 8;
    if (time - S.pending.since < 0.14 && !(far && time - S.lastStart > 0.6)) return;
  }
  start(d, time);
}

/** How far the map is the subject on screen: the share its sections hold, raised while a project
 *  is pointed at. Above 0.6 a route is planned around the type; below, it is laid over the open
 *  sheet and fades where words rest on it (the layer). */
const subject = () => (S.hover ? Math.max(S.sectionTarget, 0.75) : S.sectionTarget);

// Once the page settles after a scroll, a finished route is checked against the type where it now
// rests, the way a navigator recalculates, quietly, and a new road is drawn only if it differs.
// Where the map is the subject: when type covers the road, or the road bends around type that has
// moved on. Behind reading text: only a road bent around type that has moved, which would read as
// a stray shape; it is laid again over the open sheet.
function reroute(time: number) {
  if (!S.recheck || time - S.scrolledAt < 0.3) return false;
  S.recheck = false;
  const r = S.routes[S.routes.length - 1];
  if (S.search?.status === 'running' || S.dest?.kind === 'fail' || !r || r.progress < 1) return false;
  const drifted = r.typed && Math.abs(scrollY - r.at) > DRIFT;
  return subject() > 0.6 ? r.broken || drifted : drifted;
}

/** Cells next to type: the search crowds the lettering there, and its dots are drawn lighter. */
function clearance(G: Grid, c: number) {
  const x = c % G.w, y = (c - x) / G.w;
  let d = 3;
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const xx = x + dx, yy = y + dy;
      const b = xx >= 0 && yy >= 0 && xx < G.w && yy < G.h ? G.blocked[yy * G.w + xx] : 0;
      if (b && b !== WALL) d = Math.min(d, Math.max(Math.abs(dx), Math.abs(dy)));
    }
  }
  return d <= 1 ? 0.2 : d === 2 ? 0.55 : 1;
}

function start(d: Dest, time: number, quiet = false) {
  const G = S.grid!, v = S.view!;
  const around = d.kind !== 'fail' && subject() > 0.6;
  const home = G.cellAt(T.origin.x, T.origin.y), cell = G.cellAt(d.x, d.y);
  if (d.kind === 'fail') {
    // The address is inside a closed zone: the search will cover everything it can reach, then stop.
    G.blocked.fill(0);
    const c = cell, cx = c % G.w, cy = Math.floor(c / G.w), r = 6;
    for (let y = cy - r - 1; y <= cy + r + 1; y++) {
      for (let x = cx - r - 1; x <= cx + r + 1; x++) {
        if (x < 0 || y < 0 || x >= G.w || y >= G.h) continue;
        if (Math.max(Math.abs(x - cx), Math.abs(y - cy)) >= r) G.blocked[y * G.w + x] = 1;
      }
    }
    // A retry keeps the zone on screen; a first search draws it in.
    S.zone = { x: G.cx(c), y: G.cy(c), r: r * CELL, label: d.name, alpha: S.zone?.alpha ?? 0 };
    if (S.reduced) S.zone.alpha = 1;
    else gsap.to(S.zone, { alpha: 1, duration: 0.5, ease: ease.soft, onUpdate: dirty });
  } else {
    if (around) {
      markObstacles(G, v, S.page.live.length ? S.blockers.concat(liveBoxes(S.page.live)) : S.blockers);
      openEnds(G, v, [home, cell]);
    } else openSheet(G, home, cell);
    // The route has somewhere else to go (a link on screen): the closed zone steps back.
    if (S.zone) gsap.to(S.zone, { alpha: 0, duration: S.reduced ? 0 : 0.5, ease: ease.soft, onUpdate: dirty });
  }
  // The berth around type keeps the run of a route clear of the lettering; its two ends stay put.
  if (G.blocked[home] === 2) G.blocked[home] = 0;
  if (G.blocked[cell] === 2) G.blocked[cell] = 0;
  let from = G.nearestFree(home);
  let to = d.kind === 'fail' ? cell : G.nearestFree(cell);
  // A place or a pointed spot under or against type, or walled off from Kızılay by it, is displaced
  // to the nearest open ground the route can reach, the way a cartographer moves a symbol clear of
  // a name: its point prints there and the road to it stays whole. A link's point stays beside its
  // words.
  if (d.kind === 'place' || d.kind === 'pointer') {
    const open = openGround(G, cell, reach(G, from));
    if (open >= 0) to = open;
  }
  S.typed = around;
  // An end buried deep in type has no way out: that search runs over the open sheet instead.
  if (S.typed && (G.blocked[from] || G.blocked[to])) {
    S.typed = false;
    from = home;
    to = cell;
    openSheet(G, from, to);
  }
  const end = to === cell ? { x: d.x, y: d.y } : { x: G.cx(to), y: G.cy(to) };
  // Checking the road to the same place keeps its point as it is: no second arrival.
  const pulse = S.marker && S.dest?.key === d.key ? S.marker.pulse : 0;
  S.dest = d;
  S.lastStart = time;
  S.pending.key = '';
  S.ends = { from, to };
  S.at = scrollY;
  S.quiet = quiet;
  S.search = new Search(G, from, to);
  // A project pointed at in the index is named by its own row: its point carries no label there.
  const named = d.kind !== 'fail' && !(S.hover && d.key === `place:${S.hover}`);
  S.marker = {
    x: d.kind === 'fail' ? G.cx(cell) : end.x, y: d.kind === 'fail' ? G.cy(cell) : end.y,
    name: named ? d.name : '',
    // A displaced place keeps its own height, as a displaced symbol keeps its attributes.
    sub: !named || d.kind === 'target' ? '' : `${fmt(d.kind === 'place' ? heightAt(S.terrain!, d.x, d.y) : heightAt(S.terrain!, end.x, end.y), 0)} m`,
    alpha: d.kind === 'fail' ? 0 : 1, pulse,
  };
  if (!quiet) setReport(() => setStatus('route', ui().searching, true));
  if (S.reduced) finish(time);
  S.dirty = true;
}

/** The cells a search from `from` can reach. Its diagonal steps never cut a corner, so the four
 *  straight ones reach the same cells. Reuses one buffer. */
let reached = new Uint8Array(0), queue = new Int32Array(0);
function reach(G: Grid, from: number) {
  const n = G.blocked.length;
  if (reached.length !== n) { reached = new Uint8Array(n); queue = new Int32Array(n); }
  reached.fill(0);
  let head = 0, tail = 0;
  const visit = (k: number) => {
    if (reached[k] || G.blocked[k]) return;
    reached[k] = 1;
    queue[tail++] = k;
  };
  reached[from] = 1;
  queue[tail++] = from;
  while (head < tail) {
    const c = queue[head++], x = c % G.w;
    if (x > 0) visit(c - 1);
    if (x < G.w - 1) visit(c + 1);
    if (c >= G.w) visit(c - G.w);
    if (c + G.w < n) visit(c + G.w);
  }
  return reached;
}

/** The nearest reachable cell with open ground around it: free, and no type in the eight cells
 *  next to it, so a point there has room to print. -1 when none lies within maxR cells. */
function openGround(G: Grid, c: number, ok: Uint8Array, maxR = 24) {
  const x0 = c % G.w, y0 = (c - x0) / G.w;
  const open = (x: number, y: number) => {
    if (!ok[y * G.w + x] || G.blocked[y * G.w + x]) return false;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= G.w || yy >= G.h) return false;
        const b = G.blocked[yy * G.w + xx];
        if (b && b !== WALL) return false;
      }
    }
    return true;
  };
  for (let r = 0; r <= maxR; r++) {
    let best = -1, bestD = Infinity;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = x0 + dx, y = y0 + dy;
        if (x < 0 || y < 0 || x >= G.w || y >= G.h || !open(x, y)) continue;
        if (dx * dx + dy * dy < bestD) { best = y * G.w + x; bestD = dx * dx + dy * dy; }
      }
    }
    if (best >= 0) return best;
  }
  return -1;
}

/** The open sheet, for a search that may pass under type. On a phone it still keeps off the
 *  margins (see markEdges), except around its two ends. */
function openSheet(G: Grid, from: number, to: number) {
  G.blocked.fill(0);
  markEdges(G, S.view!);
  openEnds(G, S.view!, [from, to]);
}

/** Under reduced motion a search runs to its end at once. */
function finish(time: number) {
  S.search!.step(Infinity);
  if (S.search!.status === 'found') found(time); else failed(time);
}

function found(time: number) {
  const G = S.grid!, res = S.search!.result();
  const key = res.cells.join(',');
  const quiet = S.quiet;
  S.quiet = false;
  const lead = S.routes[S.routes.length - 1];
  if (quiet && lead && lead.key === key && lead.alpha >= 1) {
    // The same road: it stays as drawn, now measured against the type where it rests.
    lead.typed = S.typed;
    lead.at = S.at;
    return;
  }
  const pts: number[] = [];
  for (const c of straighten(G, res.cells)) pts.push(G.cx(c), G.cy(c));
  pts[0] = T.origin.x;
  pts[1] = T.origin.y;
  if (S.marker && pts.length >= 4) { pts[pts.length - 2] = S.marker.x; pts[pts.length - 1] = S.marker.y; }
  const route = makeRoute(smooth(pts, 3));
  route.key = key;
  route.typed = S.typed;
  route.at = S.at;
  for (const old of S.routes) {
    if (S.reduced) old.alpha = 0;
    else gsap.to(old, { alpha: 0, duration: 0.4, ease: ease.soft, onUpdate: dirty });
  }
  S.routes = S.routes.filter((r) => r.alpha > 0).concat(route);
  const plot = S.dest?.kind === 'pointer' ? 0.5 : Math.min(1.1, Math.max(0.6, 0.4 + route.total / 220));
  if (S.reduced) {
    route.progress = 1;
    if (S.marker) S.marker.pulse = 1;
    S.routes = [route];
  } else {
    gsap.to(route, { progress: 1, duration: plot, ease: ease.pen, onUpdate: dirty, onComplete: () => { S.routes = S.routes.filter((r) => r === route || r.alpha > 0); } });
    if (S.marker) gsap.to(S.marker, { pulse: 1, duration: 0.55, delay: plot * 0.8, ease: ease.out, onUpdate: dirty });
  }
  S.tour.until = time + plot + HOLD;
  const nodes = S.search!.expanded;
  setReport(() => {
    setStatus('route', `${fmt(res.metres / 1000, 1)} km`);
    setStatus('climb', `+${fmt(res.climb, 0)} m`);
    setStatus('foot', duration(res.seconds));
    setStatus('nodes', fmt(nodes, 0));
  });
}

function failed(time: number) {
  if (S.typed) {
    // Type closed every way to the destination: search again over the open sheet, and the route
    // runs under the type where it has to.
    S.typed = false;
    openSheet(S.grid!, S.ends.from, S.ends.to);
    S.search = new Search(S.grid!, S.ends.from, S.ends.to);
    if (S.reduced) finish(time);
    return;
  }
  S.quiet = false;
  const nodes = S.search!.expanded;
  setReport(() => {
    setStatus('route', ui().none, true);
    setStatus('climb', '0 m');
    setStatus('foot', `0 ${ui().min}`);
    setStatus('nodes', fmt(nodes, 0));
  });
  for (const old of S.routes) gsap.to(old, { alpha: 0, duration: 0.4, onUpdate: dirty });
  S.tour.until = time + 2;
  if (S.page.fail && !S.reduced) gsap.delayedCall(6, () => { if (S.page.fail) { S.failRetry++; } });
}

const dirty = () => { S.dirty = true; };

// ---------- status bar ----------
const UI = {
  en: { searching: 'SEARCHING', none: 'NO ROUTE', h: 'h', min: 'min', n: 'N', e: 'E' },
  tr: { searching: 'ARANIYOR', none: 'ROTA YOK', h: 'sa', min: 'dk', n: 'K', e: 'D' },
};
const ui = () => UI[S.lang as 'en' | 'tr'];

// The route readouts as a function of the current search, so a new page can say them again in its
// own language.
let report: (() => void) | null = null;
function setReport(fn: () => void) {
  report = fn;
  fn();
}

function fmt(n: number, digits: number) {
  return n.toLocaleString(S.lang === 'tr' ? 'tr-TR' : 'en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
function duration(seconds: number) {
  const m = Math.max(1, Math.round(seconds / 60));
  return m < 60 ? `${m} ${ui().min}` : `${Math.floor(m / 60)} ${ui().h} ${m % 60} ${ui().min}`;
}
function setStatus(key: string, text: string, live = false) {
  if (S.shown.get(key) === text) return;
  S.shown.set(key, text);
  const el = S.status.get(key);
  if (!el) return;
  el.textContent = text;
  el.classList.toggle('is-live', live);
}

let lastReadout = -1;
function readouts(time: number) {
  if (!S.terrain || !S.view || time - lastReadout < 0.06) return;
  lastReadout = time;
  let x: number, y: number;
  if (S.fine && time - S.pointer.at < IDLE) {
    const t = toTexel(S.view, S.pointer.x, S.pointer.y);
    x = t.x; y = t.y;
  } else if (S.marker) { x = S.marker.x; y = S.marker.y; }
  else { x = T.origin.x; y = T.origin.y; }
  x = Math.min(T.width - 1, Math.max(0, x));
  y = Math.min(T.height - 1, Math.max(0, y));
  const ll = latLonAt(x, y);
  setStatus('lat', `${fmt(ll.lat, 5)} ${ui().n}`);
  setStatus('lon', `${fmt(ll.lon, 5)} ${ui().e}`);
  setStatus('elev', `${fmt(heightAt(S.terrain, x, y), 0)} m`);
  const slope = fmt(slopeAt(S.terrain, x, y), 1);
  setStatus('slope', S.lang === 'tr' ? `%${slope}` : `${slope}%`); // Turkish puts the sign first
}

function updateScale() {
  if (!S.view) return;
  const pxPerM = S.view.s / 40;
  const nice = [250, 500, 1000, 2000, 5000];
  // A phone's bar holds the route's two readouts and the scale in one line: a shorter bar.
  const m = nice.find((d) => d * pxPerM >= (S.view!.w < 768 ? 28 : 56)) ?? 5000;
  const bar = S.status.get('scalebar');
  if (bar) bar.style.width = `${Math.round(m * pxPerM)}px`;
  setStatus('scale', m >= 1000 ? `${m / 1000} km` : `${m} m`);
}
