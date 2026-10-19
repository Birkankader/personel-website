// The page transition: the terrain floods. Water rises from the lowest visible ground to the
// highest (leave) while "Routing to <page>" sets in it, then drains from the peaks down (enter).
// The first load starts flooded and drains into the hero. A second small WebGL2 renderer lives in
// the persistent #curtain, reading the same elevation model as the map. Without WebGL2 the solid
// panel wipes instead; under reduced motion the engine's short fade runs.
import { Mesh, Program, Renderer, Texture, Triangle } from 'ogl';
import { gsap } from 'gsap';
import { ease, glSupported, LOADER_MAX, scrollState, setLoaderExit, setLoaderFormat, setTransition } from '../engine';
import { gpuData, H_BASE, heightAt, loadTerrain, T, type Terrain } from './map/terrain';
import { computeView, type View } from './map/view';

const VERT = /* glsl */ `#version 300 es
in vec2 uv;
in vec2 position;
out vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`;

const FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uDem;
uniform vec2 uDemSize;
uniform vec2 uResolution;
uniform vec3 uView;
uniform float uDpr;
uniform float uBase;
uniform float uLevel;
uniform vec3 uInk;
uniform vec3 uPaper;
uniform vec3 uShore;
void main() {
  vec2 css = vec2(vUv.x, 1.0 - vUv.y) * uResolution;
  vec2 uv = clamp(((css - uView.xy) / uView.z) / uDemSize, vec2(0.0), vec2(1.0));
  vec4 d = texture(uDem, uv);
  float h = uBase + d.r + d.g;
  float mpp = max(length(d.ba) / uView.z, 2e-3);
  float depth = (uLevel - h) / mpp;                       // CSS px from the waterline, + under water
  float water = clamp(depth * uDpr + 0.5, 0.0, 1.0);
  float shore = clamp((1.0 - abs(depth)) * uDpr + 0.5, 0.0, 1.0);
  // Depth contours inside the water, faint, like a chart of a lake.
  float c = abs(fract(h / 20.0 + 0.5) - 0.5) * 20.0 / mpp;
  float iso = clamp((0.45 - c) * uDpr + 0.5, 0.0, 1.0) * smoothstep(3.0, 8.0, 20.0 / mpp) * 0.08;
  vec3 col = mix(mix(uInk, uPaper, iso), uShore, shore);
  float a = max(water, shore);
  fragColor = vec4(col * a, a);
}`;

type Names = {
  en: Record<'routing' | 'home' | 'about' | 'contact' | 'work', string>;
  tr: Record<'routing' | 'home' | 'about' | 'contact' | 'work', string>;
  projects: Record<string, string>;
};

let terrain: Terrain | null = null;
let renderer: Renderer | null = null;
let program: Program | null = null;
let mesh: Mesh | null = null;
let names: Names | null = null;
let next = { kicker: '', to: '' };

const curtainEl = () => document.getElementById('curtain') as HTMLElement;

function initGL(t: Terrain) {
  if (!glSupported()) return;
  try {
    renderer = new Renderer({ webgl: 2, dpr: Math.min(devicePixelRatio, 2), alpha: true, premultipliedAlpha: true, antialias: false, depth: false });
  } catch { renderer = null; return; }
  if (!renderer.isWebgl2) { renderer = null; return; }
  const gl = renderer.gl;
  const canvas = gl.canvas as HTMLCanvasElement;
  canvas.classList.add('flood-canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); renderer = null; curtainEl().classList.remove('is-gl'); });
  const curtain = curtainEl();
  curtain.insertBefore(canvas, curtain.querySelector('.curtain__label'));
  const texture = new Texture(gl, {
    image: gpuData(t), width: t.w, height: t.h,
    internalFormat: (gl as WebGL2RenderingContext).RGBA16F, format: gl.RGBA, type: gl.FLOAT,
    generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR,
    wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE, flipY: false, premultiplyAlpha: false, unpackAlignment: 1,
  });
  program = new Program(gl, {
    vertex: VERT,
    fragment: FRAG,
    uniforms: {
      uDem: { value: texture }, uDemSize: { value: [t.w, t.h] }, uResolution: { value: [1, 1] },
      uView: { value: [0, 0, 1] }, uDpr: { value: 1 }, uBase: { value: H_BASE }, uLevel: { value: 0 },
      uInk: { value: [14 / 255, 17 / 255, 15 / 255] }, uPaper: { value: [236 / 255, 238 / 255, 232 / 255] },
      uShore: { value: [142 / 255, 155 / 255, 255 / 255] },
    },
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
}

/** Water level as a function of flooded share p (0..1), from the elevations actually on screen. */
function levels(v: View) {
  const hs: number[] = [];
  if (terrain) {
    for (let j = 0; j < 32; j++) {
      for (let i = 0; i < 48; i++) {
        const sx = ((i + 0.5) / 48) * v.w, sy = ((j + 0.5) / 32) * v.h;
        hs.push(heightAt(terrain, (sx - v.ox) / v.s, (sy - v.oy) / v.s));
      }
    }
  }
  hs.sort((a, b) => a - b);
  const lo = (hs[0] ?? 800) - 30, hi = (hs[hs.length - 1] ?? 1300) + 30;
  return (p: number) => {
    if (p <= 0) return lo;
    if (p >= 1) return hi;
    const f = p * (hs.length - 1), i = Math.floor(f);
    const v0 = hs[i], v1 = hs[Math.min(hs.length - 1, i + 1)];
    // Blend toward the margins at both ends so the first and last pixels are covered.
    const q = v0 + (v1 - v0) * (f - i);
    return p < 0.05 ? lo + (q - lo) * (p / 0.05) : p > 0.95 ? q + (hi - q) * ((p - 0.95) / 0.05) : q;
  };
}

function draw(level: number, v: View) {
  if (!renderer || !program || !mesh) return;
  const w = innerWidth, h = innerHeight;
  if (renderer.width !== w || renderer.height !== h) renderer.setSize(w, h);
  const u = program.uniforms;
  u.uResolution.value = [w, h];
  u.uView.value = [v.ox, v.oy, v.s];
  u.uDpr.value = renderer.dpr;
  u.uLevel.value = level;
  renderer.render({ scene: mesh });
}

const viewNow = (scrollY: number) => computeView(innerWidth, innerHeight, scrollY);

// ---------- labels: "Routing to <page>" ----------
function readNames() {
  if (names) return names;
  try { names = JSON.parse(document.getElementById('route-names')?.textContent || 'null'); } catch { names = null; }
  return names;
}

function labelFor(url: URL) {
  const n = readNames();
  if (!n) return { kicker: '', to: '' };
  const p = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
  const tr = p === '/tr/' || p.startsWith('/tr/');
  const l = n[tr ? 'tr' : 'en'];
  const rest = tr ? p.slice(3) || '/' : p;
  let to = l.home;
  if (rest === '/') to = url.hash === '#work' ? l.work : l.home;
  else if (rest.startsWith('/about/')) to = l.about;
  else if (rest.startsWith('/contact/')) to = l.contact;
  else if (rest.startsWith('/work/')) to = n.projects[rest.split('/')[2]] ?? l.work;
  return { kicker: l.routing, to };
}

// The header of the page being left marks where the route is going as soon as it sets off, so it
// never shows two current places while the water rises.
function markNav(url: URL) {
  const key = /^(?:\/tr)?\/(about|contact|work)(?:\/|$)/.exec(url.pathname)?.[1] ?? null;
  for (const a of document.querySelectorAll<HTMLElement>('.nav__link[data-nav]')) {
    if (a.dataset.nav === key) a.setAttribute('aria-current', key === 'work' ? 'true' : 'page');
    else a.removeAttribute('aria-current');
  }
}

function setLabel(curtain: HTMLElement) {
  const k = curtain.querySelector<HTMLElement>('[data-curtain-kicker]');
  const t = curtain.querySelector<HTMLElement>('[data-curtain-to]');
  if (k) k.textContent = next.kicker;
  if (t) t.textContent = next.to;
  return curtain.querySelector<HTMLElement>('.curtain__label');
}

export function initFlood() {
  loadTerrain().then((t) => { terrain = t; initGL(t); }).catch(() => {});
  document.addEventListener('astro:before-preparation', (e) => {
    const to = (e as Event & { to: URL }).to;
    next = labelFor(to);
    markNav(to);
  });

  const panel = () => curtainEl().querySelector<HTMLElement>('.curtain__panel');

  setTransition({
    leave: (curtain) => new Promise<void>((resolve) => {
      const label = setLabel(curtain);
      const tl = gsap.timeline({ onComplete: () => resolve() });
      if (renderer && terrain) {
        const v = viewNow(scrollState().y);
        const level = levels(v);
        const s = { p: 0 };
        draw(level(0), v);
        curtain.classList.add('is-gl');
        tl.set(curtain, { autoAlpha: 1 })
          .to(s, { p: 1, duration: 0.85, ease: ease.inOut, onUpdate: () => draw(level(s.p), v) });
      } else {
        curtain.classList.remove('is-gl');
        tl.set(curtain, { autoAlpha: 1 }).fromTo(panel(), { yPercent: 100 }, { yPercent: 0, duration: 0.75, ease: ease.inOut });
      }
      if (label && next.to) tl.fromTo(label, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: ease.out }, 0.42);
    }),
    enter: (curtain) => new Promise<void>((resolve) => {
      const label = curtain.querySelector<HTMLElement>('.curtain__label');
      const tl = gsap.timeline({ onComplete: () => resolve() });
      if (label) tl.to(label, { autoAlpha: 0, y: -18, duration: 0.3, ease: ease.soft }, 0);
      if (renderer && terrain && curtain.classList.contains('is-gl')) {
        const v = viewNow(scrollY); // the top, or where back and forward restored the page
        const level = levels(v);
        const s = { p: 1 };
        draw(level(1), v);
        tl.to(s, { p: 0, duration: 0.9, ease: ease.inOut, onUpdate: () => draw(level(s.p), v) }, 0.12)
          .call(resolve, [], 0.6) // let the page intro overlap the last of the drain
          .set(curtain, { autoAlpha: 0 });
      } else {
        tl.to(panel(), { yPercent: -100, duration: 0.85, ease: ease.inOut }, 0.1)
          .call(resolve, [], 0.55)
          .set(curtain, { autoAlpha: 0 })
          .set(panel(), { yPercent: 0 });
      }
    }),
  });

  // First load: the screen starts flooded (CSS keeps the solid panel up), the counter tracks the
  // real work, then the water drains into the hero. If the elevation data is still on its way when
  // the counter tops out (a slow connection), the panel lifts instead and the map arrives after.
  // The counter is the water level: it falls from the highest ground on the sheet to Kızılay's
  // height as the work lands, and the drain takes it from there.
  const metres = new Intl.NumberFormat(document.documentElement.lang === 'tr' ? 'tr-TR' : 'en-US');
  setLoaderFormat((p) => metres.format(Math.round(T.max - (T.max - T.origin.h) * (p / 100))));
  setLoaderExit(async (root, waited) => {
    const curtain = curtainEl();
    // A slow load gets a shorter exit, never a longer one: the visitor has waited enough already,
    // and the handoff always lands inside the loader's time budget.
    const left = LOADER_MAX - performance.now() / 1000;
    const late = waited || left < 0.7;
    const delay = late ? 0 : 0.08, handoff = late ? Math.min(0.3, Math.max(0.2, left - 0.05)) : 0.34;
    gsap.set(curtain, { autoAlpha: 1 }); // hold it once .is-loaded lands
    gsap.to(root.querySelectorAll('[data-loader-out]'), { yPercent: -120, autoAlpha: 0, duration: late ? 0.28 : 0.55, ease: ease.inOut, stagger: late ? 0.02 : 0.04 });
    return new Promise<void>((resolve) => {
      if (renderer && terrain) {
        const v = viewNow(scrollState().y);
        const level = levels(v);
        const s = { p: 1 };
        draw(level(1), v);
        curtain.classList.add('is-gl');
        gsap.timeline({ delay })
          .to(s, { p: 0, duration: late ? 0.8 : 1.05, ease: ease.inOut, onUpdate: () => draw(level(s.p), v) })
          .call(resolve, [], handoff)
          .set(curtain, { autoAlpha: 0 });
      } else {
        gsap.timeline({ delay })
          .to(panel(), { yPercent: -100, duration: late ? 0.7 : 0.9, ease: ease.inOut })
          .call(resolve, [], handoff)
          .set(curtain, { autoAlpha: 0 })
          .set(panel(), { yPercent: 0 });
      }
    });
  });
}
