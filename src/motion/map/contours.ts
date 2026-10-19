// The GL layer: contour lines drawn straight from the elevation texture, one tap per pixel.
// The texture holds height (coarse + fine, so half floats keep sub-metre precision) and the
// gradient computed on the CPU. The gradient gives each line a constant width in pixels whatever
// the slope, fades the 20 m lines where they crowd together, and shades the hills.
// The sheet prints at full strength only over the sections where the map is the subject (their
// screen bands), and faint behind reading text, so words above or below a map section never sit on
// heavy linework; pointing at a project lifts the whole sheet.
import { Texture } from 'ogl';
import { getGL, glSize, invalidateGL, setBackground } from '../../engine';
import { gpuData, H_BASE, type Terrain } from './terrain';
import type { View } from './view';

const FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uDem;
uniform vec2 uDemSize;
uniform vec2 uResolution;
uniform vec3 uView;     // ox, oy, px per texel (CSS px)
uniform float uDpr;
uniform float uSection; // strength over the sections where the map is the subject (data-map="full")
uniform float uLift;    // the whole sheet, raised while a project is pointed at
uniform float uFaint;   // behind reading text
uniform vec4 uBands;    // up to two screen bands (top, bottom; CSS px) held by those sections
uniform float uBase;
uniform vec3 uInk;

// Coverage of a line of half width hw (CSS px) at distance d (CSS px), antialiased per device px.
float line(float d, float hw) { return clamp((hw - d) * uDpr + 0.5, 0.0, 1.0); }

// 1 inside a band, easing to 0 over its last 72 px: text just outside a map section stays on a faint sheet.
float band(vec2 b, float y) {
  if (b.y <= b.x) return 0.0;
  return smoothstep(b.x, b.x + 72.0, y) * (1.0 - smoothstep(b.y - 72.0, b.y, y));
}

void main() {
  vec2 css = vec2(vUv.x, 1.0 - vUv.y) * uResolution;
  vec2 texel = (css - uView.xy) / uView.z;
  vec2 uv = texel / uDemSize;
  if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) { fragColor = vec4(0.0); return; }
  vec4 d = texture(uDem, uv);
  float h = uBase + d.r + d.g;
  vec2 grad = d.ba;                                   // metres per texel
  float mpp = max(length(grad) / uView.z, 1e-4);      // metres per CSS px across the slope

  float d20 = abs(fract(h / 20.0 + 0.5) - 0.5) * 20.0 / mpp;
  float d100 = abs(fract(h / 100.0 + 0.5) - 0.5) * 100.0 / mpp;
  float minor = line(d20, 0.42) * smoothstep(3.0, 8.0, 20.0 / mpp);
  float index = line(d100, 0.72) * smoothstep(2.0, 5.0, 100.0 / mpp);
  float a = max(minor * 0.24, index * 0.5);

  // Hillshade: light from the north west; only slopes turned away from it darken, flat ground
  // stays paper, and the lines remain the drawing.
  vec3 n = normalize(vec3(-grad.x / 40.0 * 2.5, grad.y / 40.0 * 2.5, 1.0));
  vec3 L = normalize(vec3(-0.6, 0.65, 0.75));
  float shade = clamp(L.z - dot(n, L), 0.0, 1.0) * 0.3;
  a = a + (1.0 - a) * shade;

  float held = max(band(uBands.xy, css.y), band(uBands.zw, css.y));
  a *= max(mix(min(uFaint, uSection), uSection, held), uLift);
  fragColor = vec4(uInk * a, a);
}`;

export function initContours(t: Terrain) {
  const gl = getGL() as (WebGL2RenderingContext & { renderer: unknown }) | null;
  if (!gl) return null;
  const texture = new Texture(gl as never, {
    image: gpuData(t),
    width: t.w,
    height: t.h,
    internalFormat: gl.RGBA16F,
    format: gl.RGBA,
    type: gl.FLOAT,
    generateMipmaps: false,
    minFilter: gl.LINEAR,
    magFilter: gl.LINEAR,
    wrapS: gl.CLAMP_TO_EDGE,
    wrapT: gl.CLAMP_TO_EDGE,
    flipY: false,
    premultiplyAlpha: false,
    unpackAlignment: 1,
  });
  const program = setBackground(FRAG, {
    uDem: { value: texture },
    uDemSize: { value: [t.w, t.h] },
    uView: { value: [0, 0, 1] },
    uDpr: { value: glSize().dpr },
    uSection: { value: 0 },
    uLift: { value: 0 },
    uFaint: { value: 0 },
    uBands: { value: [0, 0, 0, 0] },
    uBase: { value: H_BASE },
    uInk: { value: [14 / 255, 17 / 255, 15 / 255] },
  }, { onDemand: true });
  if (!program) return null;
  const u = program.uniforms;
  return {
    texture,
    set(view: View, sheet: { section: number; lift: number; faint: number; bands: number[] }) {
      u.uView.value = [view.ox, view.oy, view.s];
      u.uSection.value = sheet.section;
      u.uLift.value = sheet.lift;
      u.uFaint.value = sheet.faint;
      u.uBands.value = sheet.bands;
      u.uDpr.value = glSize().dpr;
      invalidateGL();
    },
  };
}
