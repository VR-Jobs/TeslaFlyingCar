import { createJourneyLandmarks } from "./space-landmarks.js";
import {
  B as Group,
  R as Mesh,
  gu as SphereGeometry,
  gi as ShaderMaterial,
  P as Vector3,
} from "../vendor/rendering.js";
import { cosmicNoise, moonVertex } from "./space-shaders.js";
const smooth = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
export function journeyState(distance) {
  const d = Math.max(0, distance),
    moon = smooth(650, 1600, d),
    belt = smooth(1800, 2900, d),
    night = smooth(3400, 4700, d);
  const base = {
    chapter: d < 1100 ? "近地轨道" : d < 2400 ? "月球附近" : d < 3900 ? "小行星带" : "行星背光",
    moon,
    belt,
    night,
    orbit: 1 - moon,
    progress: Math.min(1, d / 4700),
    station: 0,
    comet: 0,
    rings: 0,
    sector: 0,
  };
  if (d < 4700) return base;
  const anchors = [
    { chapter: "行星背光", moon: 1, belt: 1, night: 1, orbit: 0, station: 0, comet: 0, rings: 0 },
    {
      chapter: "空间站外圈",
      moon: 0.6,
      belt: 0.3,
      night: 0.5,
      orbit: 0.45,
      station: 1,
      comet: 0,
      rings: 0,
    },
    {
      chapter: "月面远航",
      moon: 1,
      belt: 0.6,
      night: 0.1,
      orbit: 0,
      station: 0,
      comet: 0,
      rings: 0,
    },
    {
      chapter: "彗星尘尾",
      moon: 0.25,
      belt: 0.5,
      night: 0.25,
      orbit: 0.4,
      station: 0,
      comet: 1,
      rings: 0,
    },
    {
      chapter: "深空静海",
      moon: 0.4,
      belt: 0.1,
      night: 1,
      orbit: 0.15,
      station: 0,
      comet: 0.2,
      rings: 0,
    },
    {
      chapter: "行星环远眺",
      moon: 0.4,
      belt: 0.6,
      night: 0.2,
      orbit: 1,
      station: 0,
      comet: 0,
      rings: 1,
    },
    {
      chapter: "远日轨道",
      moon: 0.7,
      belt: 0.9,
      night: 0.8,
      orbit: 0.15,
      station: 0.25,
      comet: 0,
      rings: 0,
    },
  ];
  const section = Math.floor((d - 4700) / 1900),
    local = (d - 4700) % 1900;
  const a = anchors[section % anchors.length],
    b = anchors[(section + 1) % anchors.length];
  const fade = smooth(0, 1000, local);
  const state = {
    chapter: fade < 0.5 ? a.chapter : b.chapter,
    progress: 1,
    chapterProgress: local / 1900,
    sector: section + 1,
  };
  for (const key of ["moon", "belt", "night", "orbit", "station", "comet", "rings"])
    state[key] = a[key] + (b[key] - a[key]) * fade;
  return state;
}
export function createSpaceJourney(celestial, moon, asteroids) {
  const group = new Group();
  group.name = "Orbital journey / distant scenery only";
  celestial.add(group);
  const material = new ShaderMaterial({
    uniforms: {
      uSun: { value: new Vector3(-0.7, 0.5, 0.35).normalize() },
      uNight: { value: 0 },
      uFade: { value: 1 },
    },
    transparent: true,
    depthWrite: true,
    fog: false,
    vertexShader: moonVertex,
    fragmentShader: `${cosmicNoise}
      uniform vec3 uSun;uniform float uNight,uFade;varying vec3 vLocal,vWorld,vNormalW;
      void main(){vec3 n=normalize(vLocal),normal=normalize(vNormalW);
      float terrain=cosmicFbm(n*5.8+vec3(5.,1.,2.));
      float land=smoothstep(.48,.53,terrain+sin(n.y*13.)*.018);
      float ice=smoothstep(.78,.95,abs(n.y));float clouds=smoothstep(.57,.72,cosmicFbm(n*17.+vec3(3.,7.,9.)));
      vec3 sea=vec3(.018,.09,.19),ground=mix(vec3(.09,.16,.105),vec3(.30,.24,.14),smoothstep(.4,.67,terrain));
      vec3 albedo=mix(sea,ground,land);albedo=mix(albedo,vec3(.65,.73,.78),max(ice,clouds*.65));
      float light=max(0.,dot(normal,normalize(mix(uSun,vec3(-.45,.18,-.88),uNight))));
      vec3 view=normalize(cameraPosition-vWorld);float rim=pow(1.-max(0.,dot(normal,view)),3.5);
      vec3 color=albedo*(.006+light*1.3)+vec3(.045,.16,.3)*rim*(.06+light*.6);
      float city=pow(noise3(n*245.),18.)*land*(1.-smoothstep(.01,.15,light));
      color+=vec3(.65,.37,.12)*city*.20;gl_FragColor=vec4(color,uFade);}`,
  });
  const planet = new Mesh(new SphereGeometry(185, 64, 40), material);
  planet.name = "Procedural ocean planet / no external texture";
  planet.position.set(-390, -100, -1030);
  group.add(planet);
  // An outward-facing atmosphere halo. Angular extent remains away from track.
  const atmosphere = new Mesh(
    new SphereGeometry(190, 48, 32),
    new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      fog: false,
      side: 1,
      uniforms: { uFade: { value: 1 } },
      vertexShader: moonVertex,
      fragmentShader: `uniform float uFade;varying vec3 vWorld,vNormalW;
      void main(){float rim=pow(1.-abs(dot(normalize(vNormalW),normalize(cameraPosition-vWorld))),5.);
      gl_FragColor=vec4(.12,.36,.65,rim*.22*uFade);}`,
    }),
  );
  atmosphere.position.copy(planet.position);
  group.add(atmosphere);
  const landmarks = createJourneyLandmarks(celestial);
  let state = journeyState(0);
  return {
    warmObjects: () => landmarks.objects,
    update(distance, time, mood, detail = 2) {
      state = journeyState(distance);
      const scale = 1 + state.orbit * 0.14 + state.night * 0.24;
      planet.scale.setScalar(scale);
      atmosphere.scale.copy(planet.scale);
      planet.position.set(
        -390 - state.moon * 90 + state.night * 40,
        -100 + state.night * 270,
        -1030,
      );
      atmosphere.position.copy(planet.position);
      planet.rotation.y = 0.25 + distance / 45000;
      material.uniforms.uNight.value = state.night;
      const fade = 0.2 + 0.8 * Math.max(state.orbit, state.night);
      material.uniforms.uFade.value = fade;
      atmosphere.material.uniforms.uFade.value = fade;
      moon.scale.setScalar(0.7 + state.moon * 0.6 - state.night * 0.28);
      moon.position.set(390 - state.moon * 55, 235 + state.night * 70, -1080);
      // Density changes through opacity, not teleporting/reseeding instances.
      asteroids.mesh.material.transparent = true;
      asteroids.mesh.material.opacity = 0.15 + state.belt * 0.8;
      landmarks.update(state, time, planet, detail);
      // Never pulse astronomical objects; beat accents belong to road edges.
    },
    status: () => ({
      ...state,
      landmarks: landmarks.status(),
      planetRadius: 185 * planet.scale.x,
      planetPosition: planet.position.toArray(),
    }),
  };
}
