import {
  B as Group,
  R as Mesh,
  Lc as Instanced,
  pr as Object3D,
  _u as Torus,
  ci as Box,
  Ii as Plane,
  Fr as Basic,
  gi as Shader,
} from "../vendor/rendering.js";

export function createJourneyLandmarks(parent) {
  const root = new Group();
  parent.add(root);
  const station = new Group();
  station.name = "Distant orbital station / non-colliding";
  station.position.set(-520, 240, -1120);
  root.add(station);
  const hullMat = new Basic({ color: "#9eabb3", fog: false, transparent: true, opacity: 0 });
  const stationRing = new Mesh(new Torus(55, 2.5, 6, 56), hullMat);
  stationRing.rotation.y = 0.5;
  station.add(stationRing);
  const panelsMat = new Basic({ color: "#456582", fog: false, transparent: true, opacity: 0 });
  const panels = new Instanced(new Box(22, 11, 0.8), panelsMat, 12),
    dummy = new Object3D();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    dummy.position.set(Math.cos(a) * 75, Math.sin(a) * 75, 0);
    dummy.rotation.set(0, 0, a);
    dummy.updateMatrix();
    panels.setMatrixAt(i, dummy.matrix);
  }
  station.add(panels);
  const rim = new Mesh(
    new Torus(53, 0.4, 5, 56),
    new Basic({ color: "#a9e3ef", fog: false, toneMapped: false, transparent: true, opacity: 0 }),
  );
  rim.rotation.copy(stationRing.rotation);
  station.add(rim);
  const cometMat = new Shader({
    transparent: true,
    depthWrite: false,
    fog: false,
    uniforms: { uFade: { value: 0 } },
    vertexShader:
      "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `varying vec2 vUv;uniform float uFade;void main(){float x=vUv.x;
      float width=.018+x*.35;float y=abs(vUv.y-.5);
      float tail=exp(-y*y/(width*width))*pow(1.-x,1.8)*.35;
      float core=exp(-length((vUv-vec2(.055,.5))*vec2(12.,3.))*15.);
      gl_FragColor=vec4(mix(vec3(.14,.35,.5),vec3(.8,.9,1.),core),max(tail,core)*uFade);}`,
  });
  const comet = new Mesh(new Plane(440, 160), cometMat);
  comet.position.set(580, 360, -1150);
  comet.rotation.z = 0.3;
  root.add(comet);
  const ringMat = new Shader({
    transparent: true,
    side: 2,
    depthWrite: false,
    fog: false,
    uniforms: { uFade: { value: 0 } },
    vertexShader:
      "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `varying vec2 vUv;uniform float uFade;void main(){float r=length((vUv-.5)*2.);
      float a=smoothstep(.5,.55,r)*(1.-smoothstep(.89,.97,r));
      a*=.28+.18*sin(r*480.)+.08*sin(r*1130.);gl_FragColor=vec4(.64,.59,.46,a*uFade);}`,
  });
  const rings = new Mesh(new Plane(760, 760), ringMat);
  rings.rotation.x = 1.12;
  rings.rotation.z = -0.23;
  root.add(rings);
  return {
    objects: [stationRing, panels, rim, comet, rings],
    update(state, time, planet, detail = 2) {
      station.visible = state.station > 0.005;
      rim.material.opacity = state.station * 0.55;
      hullMat.opacity = state.station * 0.8;
      panelsMat.opacity = state.station * 0.7;
      stationRing.rotation.z = time * 0.008;
      rim.rotation.z = stationRing.rotation.z;
      comet.visible = state.comet > 0.005;
      cometMat.uniforms.uFade.value = state.comet * (detail === 0 ? 0.5 : 0.85);
      comet.position.x = 580 + Math.sin(time * 0.006) * 30;
      rings.visible = state.rings > 0.005;
      ringMat.uniforms.uFade.value = state.rings;
      rings.position.copy(planet.position);
    },
    status: () => ({
      station: station.visible,
      comet: comet.visible,
      rings: rings.visible,
      roadsideColliders: 0,
    }),
  };
}
