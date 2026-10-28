import { finishBuild, finishBuildAsync } from "./build-scheduler.js";
import {
  B as Group,
  R as Mesh,
  Jr as Geometry,
  L as Attribute,
  H as Material,
  gi as Shader,
} from "../vendor/rendering.js";
import { add, mul } from "./course.js";

// Decorations sit beneath the solid deck or outside its edges; they never
// introduce a visible drivable surface that has no matching collision mesh.
export function trackTheme(course, s) {
  if (course.randomized) {
    const f = course.frame(s);
    return {
      color: f.tone || [0.65, 0.86, 1],
      style: f.steering
        ? f.signedCurvature < 0
          ? 4
          : 5
        : f.kind === "loop"
          ? 2
          : f.kind === "twist" || f.kind === "turn"
            ? 1
            : 0,
    };
  }
  if (course.endless) s = ((s % course.length) + course.length) % course.length;
  const i = Math.max(
    0,
    course.segments.findIndex((v) => s <= v.end),
  );
  const kind = course.segments[i].kind;
  if (i === course.segments.length - 1) return { color: [1, 0.78, 0.42], style: 3 };
  if (kind === "twist") return { color: [0.68, 0.57, 1], style: 1 };
  if (kind === "loop") return { color: i > 5 ? [1, 0.79, 0.46] : [0.38, 0.95, 0.85], style: 2 };
  if (kind === "turn") return { color: [0.38, 0.75, 1], style: 1 };
  return { color: [0.65, 0.86, 1], style: 0 };
}

export function createTrackDetail(scene, course, captureBounds = true) {
  return finishBuild(buildTrackDetail(scene, course, captureBounds));
}
export function createTrackDetailAsync(scene, course, yieldTask) {
  return finishBuildAsync(buildTrackDetail(scene, course, false), yieldTask);
}
function* buildTrackDetail(scene, course, captureBounds) {
  const root = new Group();
  root.name = "Segmented magnetic track chassis";
  scene.add(root);
  const chunks = new Map(),
    bounds = [],
    half = course.width / 2;
  const counters = { ribs: 0, fins: 0, terminals: 0, sectionMarkers: 0, cradles: 0, beacons: 0 };
  const metal = new Material({ color: "#26313e", metalness: 0.76, roughness: 0.38 });
  const uniforms = { uTime: { value: 0 }, uTravel: { value: 0 }, uMotion: { value: 1 } };
  const light = new Shader({
    uniforms,
    transparent: true,
    depthWrite: false,
    side: 2,
    toneMapped: false,
    vertexShader: `attribute vec3 aColor;attribute float aRoute,aFlow;varying vec3 vColor;varying float vRoute,vFlow;void main(){vColor=aColor;vRoute=aRoute;vFlow=aFlow;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `precision highp float;uniform float uTime,uTravel,uMotion;varying vec3 vColor;varying float vRoute,vFlow;void main(){float ahead=vRoute-uTravel;float fade=(1.-smoothstep(230.,360.,ahead))*smoothstep(-65.,-40.,ahead);float flow=pow(.5+.5*cos(vRoute*.52-uTime*2.2*uMotion),8.);float a=(.52+.24*vFlow*flow)*fade;gl_FragColor=vec4(vColor,a);}`,
  });
  light.userData.ringBloom = { gain: 3.4 };
  function at(s, x, y) {
    const f = course.pose(s);
    return add(f.p, add(mul(f.right, x), mul(f.up, y)));
  }
  function quad(local, luminous = false, flow = 0, color = null) {
    const center = local.reduce((n, p) => n + p[0], 0) / 4;
    const key = Math.floor(center / 80) + ":" + +luminous;
    if (!chunks.has(key))
      chunks.set(key, {
        p: [],
        colors: [],
        route: [],
        flow: [],
        luminous,
        lo: Infinity,
        hi: -Infinity,
      });
    const b = chunks.get(key);
    // Reversed faces are rendered only for the small lights; metal uses solid boxes.
    for (const j of [0, 1, 2, 1, 3, 2]) {
      const [s, x, y] = local[j];
      b.p.push(...at(s, x, y));
      b.route.push(s);
      b.flow.push(flow);
      b.colors.push(...(color || trackTheme(course, s).color));
      b.lo = Math.min(b.lo, s);
      b.hi = Math.max(b.hi, s);
      if (captureBounds) bounds.push({ s, x, y, luminous });
    }
  }
  function box(s0, s1, x0, x1, y0, y1, closed = true) {
    const p = [
      [s0, x0, y0],
      [s0, x1, y0],
      [s1, x0, y0],
      [s1, x1, y0],
      [s0, x0, y1],
      [s0, x1, y1],
      [s1, x0, y1],
      [s1, x1, y1],
    ];
    const faces = [
      [0, 2, 1, 3],
      [4, 5, 6, 7],
      [0, 1, 4, 5],
      [2, 6, 3, 7],
      [0, 4, 2, 6],
      [1, 3, 5, 7],
    ];
    for (const [i, f] of faces.entries())
      if (closed || (i !== 2 && i !== 3)) quad(f.map((i) => p[i]));
  }
  let work = 0;
  const intervals = [];
  let start = course.surfaceStart ?? 0;
  for (const gap of course.surfaceGaps || course.gaps) {
    intervals.push([start, gap.start]);
    start = gap.end;
  }
  intervals.push([start, course.surfaceEnd ?? course.length]);
  // Exact endpoints prevent beams or light strips from bridging a real gap.
  for (const [lo, hi] of intervals) {
    for (let s = lo; s < hi - 1e-5; s += 2) {
      if (++work % 16 === 0) yield;
      const end = Math.min(s + 2, hi);
      quad(
        [
          [s, -0.055, 0.012],
          [s, 0.055, 0.012],
          [end, -0.055, 0.012],
          [end, 0.055, 0.012],
        ],
        true,
        0,
      );
      for (const side of [-1, 1]) {
        const x = side * (half + 0.13);
        box(s, end, x - 0.13, x + 0.13, -0.57, -0.06, false);
        // The light is on the outside bevel rather than a glowing wall.
        quad(
          [
            [s, x - side * 0.03, -0.035],
            [s, x + side * 0.09, -0.035],
            [end, x - side * 0.03, -0.035],
            [end, x + side * 0.09, -0.035],
          ],
          true,
          1,
        );
      }
    }
    for (let s = Math.ceil((lo + 1) / 12) * 12; s < hi - 1; s += 12) {
      // Keep the locks outside the deck; no cross-lane ribs show through glass.
      for (const side of [-1, 1]) {
        const x = side * (half + 0.26);
        box(s - 0.28, s + 0.28, x - 0.23, x + 0.23, -0.74, -0.025);
        quad(
          [
            [s - 0.12, x - 0.055, -0.015],
            [s - 0.12, x + 0.055, -0.015],
            [s + 0.12, x - 0.055, -0.015],
            [s + 0.12, x + 0.055, -0.015],
          ],
          true,
          0,
        );
      }
      if (s % 36 === 0) {
        for (const side of [-1, 1]) {
          // Swept magnetic fins stay wholly outside the playable width.
          const x = side * (half + 0.3),
            out = side * (half + 1.12);
          quad([
            [s - 1.15, x, -0.5],
            [s - 0.35, out, -1.04],
            [s + 1.15, x, -0.5],
            [s + 0.45, out, -1.04],
          ]);
          quad([
            [s - 1.15, x, -0.54],
            [s + 1.15, x, -0.54],
            [s - 0.35, out, -1.08],
            [s + 0.45, out, -1.08],
          ]);
          quad(
            [
              [s - 0.3, out, -1.035],
              [s - 0.25, out - side * 0.12, -0.94],
              [s + 0.4, out, -1.035],
              [s + 0.45, out - side * 0.12, -0.94],
            ],
            true,
            0,
          );
          counters.fins++;
        }
      }
    }
    // End blocks expose layered glass and latch details at actual broken ends.
    for (const s of [lo, hi]) {
      const inward = s === lo ? 1 : -1,
        a = s + inward * 0.025,
        b = s + inward * 0.3;
      const s0 = Math.min(a, b),
        s1 = Math.max(a, b);
      for (const side of [-1, 1]) {
        const x = side * (half + 0.27);
        box(s0, s1, x - 0.24, x + 0.24, -0.8, -0.035);
      }
      counters.terminals++;
    }
  }
  // Small outer chevrons identify direction along bends, rolls and loops.
  for (let s = 16; s < course.length - 8; s += 8) {
    if (course.gaps.some((g) => s > g.start - 5 && s < g.end + 5)) continue;
    const f = course.frame(s),
      themed = trackTheme(course, s);
    if (f.kind === "straight" && s % 24 !== 0) continue;
    for (const side of [-1, 1]) {
      const x = side * (half + 0.45);
      quad(
        [
          [s - 0.65, x + side * 0.3, -0.05],
          [s - 0.55, x + side * 0.4, -0.05],
          [s, x, -0.05],
          [s + 0.1, x + side * 0.1, -0.05],
        ],
        true,
        1,
        themed.color,
      );
      quad(
        [
          [s, x, -0.05],
          [s + 0.1, x + side * 0.1, -0.05],
          [s + 0.65, x + side * 0.3, -0.05],
          [s + 0.75, x + side * 0.4, -0.05],
        ],
        true,
        1,
        themed.color,
      );
      counters.sectionMarkers++;
    }
  }
  // Paired navigation pylons mark transitions. All their silhouettes are
  // outside the deck, so the car and the road ahead remain unobstructed.
  for (const segment of course.segments.slice(1)) {
    const s = segment.start + 8;
    if (course.gaps.some((g) => s > g.start - 5 && s < g.end + 5)) continue;
    const color = trackTheme(course, s).color;
    for (const side of [-1, 1]) {
      const x = side * (half + 0.55),
        outer = side * (half + 1.05);
      box(s - 0.48, s + 0.48, Math.min(x, outer) - 0.08, Math.max(x, outer) + 0.08, -0.65, -0.16);
      for (let j = 0; j < 3; j++) {
        const xx = x + side * j * 0.24,
          height = 1.6 - j * 0.36;
        box(s - 0.16 + j * 0.25, s + 0.04 + j * 0.25, xx - 0.07, xx + 0.07, -0.3, height);
        quad(
          [
            [s - 0.165 + j * 0.25, xx - 0.045, 0.15],
            [s - 0.165 + j * 0.25, xx + 0.045, 0.15],
            [s - 0.165 + j * 0.25, xx - 0.045, height - 0.07],
            [s - 0.165 + j * 0.25, xx + 0.045, height - 0.07],
          ],
          true,
          0,
          color,
        );
      }
      counters.beacons++;
    }
  }
  let triangles = 0;
  for (const b of chunks.values()) {
    yield;
    const g = new Geometry();
    g.setAttribute("position", new Attribute(b.p, 3));
    g.setAttribute("aRoute", new Attribute(b.route, 1));
    if (b.luminous) {
      g.setAttribute("aColor", new Attribute(b.colors, 3));
      g.setAttribute("aFlow", new Attribute(b.flow, 1));
    }
    g.computeVertexNormals();
    g.computeBoundingSphere();
    const mesh = new Mesh(g, b.luminous ? light : metal);
    mesh.name = b.luminous ? "Track edge hardware lights" : "Track underdeck chassis";
    mesh.renderOrder = b.luminous ? 2 : 0;
    mesh.userData.routeRange = [b.lo, b.hi];
    root.add(mesh);
    triangles += b.p.length / 9;
  }
  return {
    root,
    bounds,
    update(s, time, reducedMotion = false) {
      uniforms.uTravel.value = s;
      uniforms.uTime.value = time;
      uniforms.uMotion.value = reducedMotion ? 0 : 1;
      for (const m of root.children) {
        const [lo, hi] = m.userData.routeRange;
        m.visible = hi > s - 65 && lo < s + 360;
      }
    },
    status: () => ({
      style: "magnetic-modular-chassis",
      ...counters,
      triangles,
      batches: root.children.length,
      clearDrivingWidth: course.width,
    }),
  };
}
