// One shared WebGL2 canvas (OGL) under the content, hosting a fullscreen background layer.
// This site has no DOM-synced image planes: its only GL is the terrain under every page, so the
// plane half of the standard module is left out and mountGL/unmountGL stay as lifecycle no-ops.
// The background renders on demand: a driver changes uniforms and calls invalidateGL(); idle
// frames cost nothing. Disabled under reduced motion, with Save-Data, or without WebGL2.
import { Renderer, Camera, Transform, Program, Mesh, Triangle, Vec2 } from 'ogl';
import { gsap } from 'gsap';
import { scrollState } from '../scroll';
import { prefersReducedMotion } from '../env';

let renderer: Renderer | null = null;
let camera: Camera;
let bg: { scene: Transform; program: Program; onDemand: boolean } | null = null;
let dirty = true;
let vw = 0;
let vh = 0;
let velocity = 0;
const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
const resizeFns = new Set<() => void>();

const VERTEX_300 = /* glsl */ `#version 300 es
in vec2 uv;
in vec2 position;
out vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`;
const VERTEX_100 = /* glsl */ `attribute vec2 uv; attribute vec2 position; varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`;

export function glSupported() {
  if (prefersReducedMotion()) return false;
  if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return false;
  return typeof WebGL2RenderingContext !== 'undefined';
}

export function initGL() {
  if (renderer || !glSupported()) return;
  try {
    renderer = new Renderer({ webgl: 2, dpr: Math.min(devicePixelRatio, 2), alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' });
  } catch {
    renderer = null;
    return;
  }
  if (!renderer.isWebgl2) { renderer = null; return; }
  const gl = renderer.gl;
  gl.canvas.classList.add('gl-canvas');
  gl.canvas.setAttribute('aria-hidden', 'true');
  gl.canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    document.documentElement.classList.remove('gl-on');
    document.documentElement.classList.add('gl-lost');
  });
  // Lives in a host element that persists across navigations (#gl in the layout).
  (document.getElementById('gl') || document.body).prepend(gl.canvas);
  camera = new Camera(gl);
  document.documentElement.classList.add('gl-on');
  resize();
  addEventListener('resize', resize);
  addEventListener('pointermove', (e) => { mouse.tx = e.clientX / vw; mouse.ty = 1 - e.clientY / vh; }, { passive: true });
  gsap.ticker.add(render);
}

export const getGL = () => renderer?.gl ?? null;
export const glSize = () => ({ width: vw, height: vh, dpr: renderer?.dpr ?? 1 });
/** Ask for one more frame of the on-demand background. */
export const invalidateGL = () => { dirty = true; };
/** Run fn after the canvas resized (before the next render). */
export const onGLResize = (fn: () => void) => { resizeFns.add(fn); return () => resizeFns.delete(fn); };

/**
 * Fullscreen shader layer under the content. Built-in uniforms: uTime (s), uResolution (px),
 * uScroll (0..1 page progress), uScrollY (px), uVelocity, uMouse (0..1, smoothed). Varying: vUv.
 * A fragment that starts with `#version 300 es` gets a GLSL 3 vertex shader.
 * onDemand: render only after invalidateGL() (the uniforms are then the driver's job).
 */
export function setBackground(fragment: string, uniforms: Record<string, { value: unknown }> = {}, opts: { onDemand?: boolean } = {}) {
  if (!renderer) return null;
  clearBackground();
  const gl = renderer.gl;
  const program = new Program(gl, {
    vertex: fragment.trimStart().startsWith('#version 300 es') ? VERTEX_300 : VERTEX_100,
    fragment,
    uniforms: {
      uTime: { value: 0 }, uResolution: { value: new Vec2(vw, vh) }, uScroll: { value: 0 }, uScrollY: { value: 0 },
      uVelocity: { value: 0 }, uMouse: { value: new Vec2(0.5, 0.5) }, ...uniforms,
    },
    depthTest: false,
    depthWrite: false,
    transparent: true,
  });
  const scene = new Transform();
  new Mesh(gl, { geometry: new Triangle(gl), program }).setParent(scene);
  bg = { scene, program, onDemand: !!opts.onDemand };
  dirty = true;
  return program;
}
export function clearBackground() { bg = null; dirty = true; }

function resize() {
  if (!renderer) return;
  vw = innerWidth;
  vh = innerHeight;
  renderer.setSize(vw, vh);
  resizeFns.forEach((fn) => fn());
  dirty = true;
}

// Lifecycle hooks kept for the engine contract (no DOM planes on this site).
export function mountGL(_root: ParentNode = document) {}
export function unmountGL() {}
export function hideGL(_duration = 0.6) { return gsap.timeline(); }

function render(t: number) {
  if (!renderer || document.hidden || !bg) return;
  const target = Math.max(-40, Math.min(40, scrollState().velocity));
  velocity += (target - velocity) * 0.12;
  mouse.x += (mouse.tx - mouse.x) * 0.08;
  mouse.y += (mouse.ty - mouse.y) * 0.08;
  if (bg.onDemand && !dirty) return;
  dirty = false;
  const u = bg.program.uniforms;
  const s = scrollState();
  u.uTime.value = t;
  u.uResolution.value.set(vw, vh);
  u.uScroll.value = s.progress;
  u.uScrollY.value = s.y;
  u.uVelocity.value = velocity;
  u.uMouse.value.set(mouse.x, mouse.y);
  renderer.render({ scene: bg.scene, camera });
}
