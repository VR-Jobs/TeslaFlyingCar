import {
  B as Group,
  R as Mesh,
  Jr as Geometry,
  L as Attribute,
  gi as Shader,
} from "../vendor/rendering.js";
import { add, mul } from "./course.js";

function surface(course, start, end, left, right) {
  const positions = [],
    routes = [],
    sides = [],
    indices = [];
  for (let s = start; s < end; s += 1.5) {
    const e = Math.min(end, s + 1.5),
      base = positions.length / 3;
    for (const [d, x, side] of [
      [s, left, -1],
      [s, right, 1],
      [e, left, -1],
      [e, right, 1],
    ]) {
      const f = course.pose(d, x);
      positions.push(...add(f.p, mul(f.up, 0.07)));
      routes.push(d);
      sides.push(side);
    }
    indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
  }
  const geometry = new Geometry();
  geometry.setAttribute("position", new Attribute(positions, 3));
  geometry.setAttribute("aRoute", new Attribute(routes, 1));
  geometry.setAttribute("aSide", new Attribute(sides, 1));
  geometry.setIndex(indices);
  return geometry;
}

const vertex = `attribute float aRoute;attribute float aSide;varying float vRoute;varying float vSide;void main(){vRoute=aRoute;vSide=aSide;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const fragment = `precision highp float;varying float vRoute;varying float vSide;
uniform float uTime,uCar,uStrength,uZoneStart,uZoneEnd,uEligible,uReady,uFlight,uMotion;
void main(){
 float zone=smoothstep(uZoneStart-.25,uZoneStart+.25,vRoute)*(1.-smoothstep(uZoneEnd-.25,uZoneEnd+.25,vRoute))*uEligible;
 float stripe=1.-smoothstep(.3,.75,abs(mod(vRoute-uTime*14.*uMotion,5.)-2.5));
 float ahead=smoothstep(-5.,2.,vRoute-uCar);
 float amber=(.22+.55*stripe)*(.5+.5*uStrength)*ahead;
 vec3 color=mix(vec3(1.,.43,.08)*(.6+.4*stripe),vec3(.54,.96,1.),zone);
 float alpha=ahead*mix(.78+.16*uStrength,.97,zone)*mix(1.,.28,uFlight);
 gl_FragColor=vec4(color,alpha);if(alpha<.01)discard;
}`;

export function createGapLights(scene, course) {
  const group = new Group();
  group.name = "Gap warning and launch-window edge lights";
  scene.add(group);
  const rows = course.gaps.map((gap, index) => {
    const root = new Group(),
      uniforms = {
        uTime: { value: 0 },
        uCar: { value: 0 },
        uStrength: { value: 0 },
        uZoneStart: { value: 0 },
        uZoneEnd: { value: 0 },
        uEligible: { value: 0 },
        uReady: { value: 0 },
        uFlight: { value: 0 },
        uMotion: { value: 1 },
      };
    const material = new Shader({
      uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      side: 2,
      toneMapped: false,
    });
    for (const side of [-1, 1])
      root.add(
        new Mesh(
          surface(
            course,
            gap.start - 140,
            gap.start - 0.25,
            side * 5.65 - 0.22,
            side * 5.65 + 0.22,
          ),
          material,
        ),
      );
    material.userData.ringBloom = { gain: 3.3 };
    root.visible = false;
    root.traverse((object) => {
      if (object.isMesh) object.renderOrder = 3;
    });
    group.add(root);
    return { index, root, uniforms };
  });
  let current = null;
  return {
    update(cue, time, reduced) {
      current = cue;
      for (const row of rows) {
        row.root.visible = !!cue && cue.index === row.index;
        if (!row.root.visible) continue;
        const u = row.uniforms;
        u.uTime.value = time;
        u.uCar.value = cue.start - cue.distance;
        u.uStrength.value = cue.strength;
        u.uZoneStart.value = cue.zoneStart;
        u.uZoneEnd.value = cue.zoneEnd;
        u.uEligible.value = +cue.eligible;
        u.uReady.value = +cue.ready;
        u.uFlight.value = +cue.flight;
        u.uMotion.value = reduced ? 0 : 1;
      }
    },
    status: () => ({
      active: !!current,
      state: current?.state || "off",
      zoneStart: current?.zoneStart,
      zoneEnd: current?.zoneEnd,
      rows: rows.length,
      layout: "longitudinal-edges-only",
    }),
  };
}
