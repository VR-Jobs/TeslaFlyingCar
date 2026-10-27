import {
  B as Group,
  R as Mesh,
  Jr as Geometry,
  H as Standard,
  Fr as Basic,
  _u as Torus,
  ci as Box,
  L as Attribute,
  P as Vector3,
  F as Matrix4,
  I as Color,
} from "../vendor/rendering.js";
import { finishBuild, finishBuildAsync } from "./build-scheduler.js";
import { createGlassTrack, createGlassTrackAsync } from "./glass-track.js";
import { getTrackSurface, prepareTrackSurface } from "./track-surface.js";
import { add, mul, sub } from "./course.js";
function orient(o, f) {
  o.quaternion.setFromRotationMatrix(
    new Matrix4().makeBasis(
      new Vector3(...f.right),
      new Vector3(...f.up),
      new Vector3(...f.t).negate(),
    ),
  );
}
export function createAdventureView(...args) {
  return finishBuild(buildAdventureView(...args));
}
export async function createAdventureViewAsync(root, course, mainGlass, sharedGlow, yieldTask) {
  const prepared = new Map();
  for (const b of course.adventures?.branches || []) {
    const solid = await prepareTrackSurface(b, yieldTask);
    await yieldTask();
    const glass = await createGlassTrackAsync(root, b, solid, yieldTask, mainGlass);
    prepared.set(b.id, { solid, glass });
    await yieldTask();
  }
  return finishBuildAsync(
    buildAdventureView(root, course, mainGlass, sharedGlow, prepared),
    yieldTask,
  );
}
function* buildAdventureView(root, course, mainGlass, sharedGlow, prepared = new Map()) {
  const branches = [],
    gates = [],
    pads = [],
    guides = [];
  const glow = sharedGlow || new Basic({ color: "#ffffff", vertexColors: true, toneMapped: false });
  glow.userData.ringBloom = { gain: 1.8 };
  const metal = new Standard({ color: "#667585", metalness: 0.65, roughness: 0.3 });
  const palette = ["#b7efff", "#ffca75", "#9cebcf"];
  const ringGeos = palette.map((c, i) => {
    const g = new Torus(2.7, 0.05, 6, 48),
      rgb = new Color(c),
      values = [];
    for (let j = 0; j < g.attributes.position.count; j++) values.push(rgb.r, rgb.g, rgb.b);
    g.setAttribute("color", new Attribute(values, 3));
    return g;
  });
  const rimGeos = [new Torus(2.82, 0.055, 6, 48), new Torus(2.32, 0.055, 6, 48)];
  const iconGeo = new Box(0.11, 0.6, 0.11),
    arrowGeo = new Box(0.07, 0.65, 0.06),
    dotGeo = new Torus(0.12, 0.035, 4, 12);
  const iconMat = new Basic({ color: "#deecf3", toneMapped: false });
  const guideMat = new Basic({
    color: "#eac68d",
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
  });
  function mesh(parent, g, m, x = 0, y = 0, z = 0) {
    const o = new Mesh(g, m);
    o.position.set(x, y, z);
    parent.add(o);
    return o;
  }
  function pad(path, s, lane = 0, side = 0) {
    const f = path.pose(s, lane),
      group = new Group();
    group.position.fromArray(add(f.p, mul(f.up, 0.06)));
    orient(group, f);
    root.add(group);
    for (let j = 0; j < 3; j++) {
      const a = mesh(group, arrowGeo, guideMat, -0.25, 0.02, -j * 1.05),
        b = mesh(group, arrowGeo, guideMat, 0.25, 0.02, -j * 1.05);
      a.rotation.set(Math.PI / 2, 0, -0.7);
      b.rotation.set(Math.PI / 2, 0, 0.7);
    }
    pads.push({ group, s, side });
  }
  for (const b of course.adventures?.branches || []) {
    yield;
    const solid = prepared.get(b.id)?.solid || getTrackSurface(b),
      glass = prepared.get(b.id)?.glass || createGlassTrack(root, b, solid, mainGlass);
    branches.push({ path: b, solid, glass });
    // The narrow center ribbon stays visible at distance, sharing the gate glow.
    const positions = [],
      colors = [],
      rgb = new Color("#ffd59a");
    for (let s = b.start; s < b.end; s += 2) {
      const end = Math.min(b.end, s + 2),
        a = b.pose(s, -0.022),
        d = b.pose(s, 0.022),
        e = b.pose(end, -0.022),
        f = b.pose(end, 0.022);
      for (const p of [a, d, e, d, f, e]) {
        positions.push(...add(p.p, mul(p.up, 0.022)));
        colors.push(rgb.r, rgb.g, rgb.b);
      }
    }
    const ribbon = new Geometry();
    ribbon.setAttribute("position", new Attribute(positions, 3));
    ribbon.setAttribute("color", new Attribute(colors, 3));
    const line = mesh(root, ribbon, glow);
    line.name = "Shortcut center guide";
    pad(course, b.launchS, b.side * 3.2, b.side);
    pad(b, b.end - 14);
    const from = course.pose(b.launchS, b.side * 3.2),
      to = b.pose(b.start + 7);
    for (let j = 0; j < 9; j++) {
      const t = (j + 1) / 10,
        p = add(add(from.p, mul(sub(to.p, from.p), t)), mul(from.up, Math.sin(t * Math.PI) * 3));
      const dot = mesh(root, dotGeo, guideMat);
      dot.position.fromArray(p);
      orient(dot, from);
      guides.push({ mesh: dot, s: b.launchS });
    }
  }
  for (const chain of course.adventures?.chains || []) {
    const path = chain.routeId
      ? course.adventures.branches.find((b) => b.id === chain.routeId)
      : course;
    pad(path, chain.launchS);
    for (const gate of chain.gates) {
      yield;
      const f = path.pose(gate.s),
        anchor = new Group(),
        body = new Group();
      anchor.position.fromArray(add(f.p, mul(f.up, gate.height)));
      orient(anchor, f);
      anchor.add(body);
      root.add(anchor);
      mesh(body, ringGeos[gate.index], glow);
      for (const z of [-0.13, 0.13]) mesh(body, rimGeos[0], metal, 0, 0, z);
      const icon = new Group();
      icon.position.y = gate.radius + 0.55;
      body.add(icon);
      if (gate.index === 0) {
        for (const sign of [-1, 1]) {
          const arm = mesh(icon, iconGeo, iconMat, sign * 0.17, 0);
          arm.rotation.z = sign * -0.7;
        }
      }
      if (gate.index === 1) {
        const arc = new Torus(0.3, 0.035, 5, 20, Math.PI * 1.65);
        mesh(icon, arc, iconMat);
        const tip = mesh(icon, iconGeo, iconMat, 0.26, 0.15);
        tip.scale.set(0.6, 0.4, 0.6);
        tip.rotation.z = -1;
      }
      if (gate.index === 2) {
        const arc = new Torus(0.25, 0.045, 5, 16, Math.PI);
        const m = mesh(icon, arc, iconMat, 0, -0.06);
        m.rotation.z = Math.PI;
        for (const sign of [-1, 1]) mesh(icon, iconGeo, iconMat, sign * 0.25, 0.16).scale.y = 0.5;
      }
      gates.push({ anchor, body, gate, chain });
    }
  }
  let visible = 0;
  return {
    update(run, time, beat = 0, reduced = false) {
      visible = 0;
      for (const b of branches) b.glass.setVisibleRange(run.s);
      for (const v of gates) {
        v.anchor.visible = v.gate.s - run.s > -28 && v.gate.s - run.s < 210;
        if (!v.anchor.visible) continue;
        visible++;
        const done = run.adventure?.gates.has(v.chain.id + "-" + v.gate.index);
        if (done && !v.wasDone) v.passedAt = time;
        v.wasDone = done;
        const pulse = done && !reduced ? Math.max(0, 1 - (time - v.passedAt) / 0.45) : 0;
        v.body.scale.setScalar(done ? 0.93 + 0.23 * pulse : 1 + (reduced ? 0 : beat * 0.025));
        v.body.rotation.z = done ? 0.08 * (1 - pulse) : 0;
      }
      for (const p of pads) p.group.visible = p.s - run.s > -12 && p.s - run.s < 140;
      for (const p of guides) p.mesh.visible = p.s - run.s > -15 && p.s - run.s < 140;
    },
    solidFor(run) {
      return branches.find((b) => b.path.id === run.routeId)?.solid;
    },
    status: () => ({
      branches: branches.length,
      gates: gates.length,
      visibleGates: visible,
      style: "glass-shortcut-and-three-stage-stunt-gates",
      gateSequence: ["jump", "spin", "suction"],
      branchPhysicalLengths: branches.map((b) => ({
        route: b.path.id,
        span: b.path.end - b.path.start,
        metric: b.path.metric(b.path.start),
      })),
    }),
  };
}
