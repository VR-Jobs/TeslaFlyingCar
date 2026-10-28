import { finishBuild, finishBuildAsync } from "./build-scheduler.js";
import {
  B as Group,
  R as Mesh,
  Jr as Geometry,
  L as Attribute,
  gi as Shader,
} from "../vendor/rendering.js";
import { dot, sub } from "./course.js";
import { trackTheme } from "./track-detail.js";

export const GLASS_TRACK = {
  laneCount: 3,
  longitudinalEdges: 3,
  baseOpacity: 0.06,
  rimWidth: 0.024,
  haloWidth: 0.11,
  chunkLength: 96,
};
const vertex = `attribute float aRoute,aAcross,aDepth,aHalfWidth,aStyle;attribute vec3 aAccent;varying float vRoute,vAcross,vDepth,vHalfWidth,vStyle;varying vec3 vWorld,vNormal,vAccent;
void main(){vRoute=aRoute;vAcross=aAcross;vDepth=aDepth;vHalfWidth=aHalfWidth;vStyle=aStyle;vAccent=aAccent;vec4 p=modelMatrix*vec4(position,1.);vWorld=p.xyz;vNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*p;}`;
const fragment = `precision highp float;varying float vRoute,vAcross,vDepth,vHalfWidth,vStyle;varying vec3 vWorld,vNormal,vAccent;
uniform float uFace,uBeat,uBase,uRim,uHalo,uGrip,uTravel,uTime,uCurveMotion;
float ink(float d,float width){float aa=max(fwidth(d),.0015);return 1.-smoothstep(width-aa,width+aa,d);}
void main(){
 float outer=abs(vHalfWidth-abs(vAcross));
 float rail=min(abs(vAcross),outer);
 float footprint=fwidth(vAcross);
 float farFade=1.-smoothstep(.5,2.5,footprint);
 float fine=ink(rail,uRim*.85)*farFade;
 float rim=ink(outer,uRim*1.7);
 float glow=ink(rail,uHalo*.7)*farFade;
 float fresnel=pow(1.-abs(dot(normalize(vNormal),normalize(cameraPosition-vWorld))),4.);
 float faceScale=uFace<.5?1.:uFace<1.5?.42:.6;
 if(uFace>1.5){fine*=ink(min(vDepth,1.-vDepth),.035);glow=fine*.4;rim=0.;}
 float lit=max(fine*.72,rim*.91)*faceScale;
 float alpha=(uBase+fresnel*.055)*faceScale+lit+glow*.1*faceScale;
 vec3 glass=mix(vec3(.025,.10,.145),vec3(.34,.65,.77),fresnel*.25);
 vec3 edge=mix(mix(vAccent,vec3(.84,.94,1.),.48),vec3(.88,.97,1.),rim*.55);
 float danger=uGrip*(1.-smoothstep(12.,26.,abs(vRoute-uTravel)));
 edge=mix(edge,vec3(1.8,.46,.045),danger*(.86+.1*sin(uTime*13.)));
 vec3 color=mix(glass,edge,clamp(lit*1.7+glow*.34,0.,1.));
 float curve=vStyle>3.5?1.:0.;
 float flow=pow(max(0.,cos(vRoute*.42-uTime*3.*uCurveMotion)),12.);
 float guide=curve*flow*(1.-smoothstep(70.,180.,vRoute-uTravel))*smoothstep(-15.,0.,vRoute-uTravel);
 color*=1.+uBeat*.035*lit+guide*.22*lit;
 gl_FragColor=vec4(color,min(.91,alpha));
 gl_FragColor.rgb=pow(max(gl_FragColor.rgb,vec3(0.)),vec3(2.2));
 #ifdef RING_BLOOM_MASK
 gl_FragColor=vec4(edge,clamp(lit+glow*.1*faceScale,0.,.95));
 // A narrow geometric ribbon supplies stable subpixel coverage for the center.
 if(abs(vAcross)<vHalfWidth*.5)gl_FragColor.a=0.;
 #endif
}`;

// Every rendered vertex comes from the same solid triangles used for collisions.
export function createGlassTrack(scene, course, solid, shared = null) {
  return finishBuild(buildGlassTrack(scene, course, solid, shared));
}
export function createGlassTrackAsync(scene, course, solid, yieldTask, shared = null) {
  return finishBuildAsync(buildGlassTrack(scene, course, solid, shared), yieldTask);
}
function* buildGlassTrack(scene, course, solid, shared = null) {
  const group = new Group();
  group.name = "Three continuous longitudinal glass edges";
  scene.add(group);
  const uniforms = shared?.uniforms || {
    uBeat: { value: 0 },
    uGrip: { value: 0 },
    uTravel: { value: 0 },
    uTime: { value: 0 },
    uCurveMotion: { value: 1 },
    uBase: { value: GLASS_TRACK.baseOpacity },
    uRim: { value: GLASS_TRACK.rimWidth },
    uHalo: { value: GLASS_TRACK.haloWidth },
  };
  const materials = shared?.materials || {};
  if (!shared)
    for (const [kind, face] of [
      ["top", 0],
      ["bottom", 1],
      ["wall", 2],
    ])
      materials[kind] = new Shader({
        uniforms: { ...uniforms, uFace: { value: face } },
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        toneMapped: false,
      });
  const batches = new Map();
  for (const [kind, material] of Object.entries(materials))
    material.userData.ringBloom = { gain: kind === "top" ? 4.6 : 2.5 };
  let work = 0;
  for (const t of solid.triangles) {
    if (++work % 128 === 0) yield;
    const key = t.kind + ":" + Math.floor((t.sa + t.sb + t.sc) / 3 / GLASS_TRACK.chunkLength);
    if (!batches.has(key))
      batches.set(key, {
        kind: t.kind,
        p: [],
        route: [],
        across: [],
        depth: [],
        width: [],
        accent: [],
        style: [],
      });
    const b = batches.get(key);
    for (const [p, s] of [
      [t.a, t.sa],
      [t.b, t.sb],
      [t.c, t.sc],
    ]) {
      const f = course.frame(s),
        delta = sub(p, f.p);
      b.p.push(...p);
      b.route.push(s);
      b.across.push(dot(delta, f.right));
      b.depth.push(Math.max(0, Math.min(1, -dot(delta, f.up) / solid.thickness)));
      b.width.push(!course.endless && s < 0 ? 7 : course.width / 2);
      const theme = trackTheme(course, s);
      b.accent.push(...theme.color);
      b.style.push(theme.style);
    }
  }
  let count = 0;
  for (const b of batches.values()) {
    yield;
    const g = new Geometry();
    g.setAttribute("position", new Attribute(b.p, 3));
    g.setAttribute("aRoute", new Attribute(b.route, 1));
    g.setAttribute("aAcross", new Attribute(b.across, 1));
    g.setAttribute("aDepth", new Attribute(b.depth, 1));
    g.setAttribute("aHalfWidth", new Attribute(b.width, 1));
    g.setAttribute("aAccent", new Attribute(b.accent, 3));
    g.setAttribute("aStyle", new Attribute(b.style, 1));
    g.computeVertexNormals();
    g.computeBoundingSphere();
    const mesh = new Mesh(g, materials[b.kind]);
    mesh.name = "Glass " + b.kind;
    mesh.renderOrder = 1;
    mesh.userData.routeRange = [Math.min(...b.route), Math.max(...b.route)];
    group.add(mesh);
    count += b.p.length / 9;
  }
  return {
    group,
    materials,
    uniforms,
    setVisibleRange(travel) {
      for (const mesh of group.children) {
        const [lo, hi] = mesh.userData.routeRange;
        mesh.visible = hi > travel - 96 && lo < travel + 650;
      }
    },
    update(beat, grip = 0, travel = 0, time = 0, reduced = false) {
      this.setVisibleRange(travel);
      uniforms.uBeat.value = beat;
      uniforms.uGrip.value = grip;
      uniforms.uTravel.value = travel;
      uniforms.uTime.value = time;
      uniforms.uCurveMotion.value = reduced ? 0 : 1;
    },
    status: () => ({
      style: "rim-lit-glass",
      baseOpacity: GLASS_TRACK.baseOpacity,
      gripWarning: uniforms.uGrip.value,
      laneCount: GLASS_TRACK.laneCount,
      longitudinalEdges: GLASS_TRACK.longitudinalEdges,
      transverseLines: 0,
      sectionAccents: true,
      sourceTriangles: count,
      batches: batches.size,
      depthWrite: false,
    }),
  };
}
