import {
  B as Group,
  R as Mesh,
  Jr as Geometry,
  L as Attribute,
  gi as Shader,
  gu as Sphere,
  Uc as Points,
  P as Vector3,
} from "../vendor/rendering.js";
import { add, mul } from "./course.js";

const noise = `float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);}float fbm(vec2 p){return .56*noise(p)+.28*noise(p*2.03+3.)+.14*noise(p*4.11+11.);}`;
const bodyVertex = `varying vec3 vLocal,vNormal;void main(){vLocal=position;vNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const bodyFragment = `${noise}varying vec3 vLocal,vNormal;uniform float uTime;uniform vec3 uSun;
void main(){vec3 n=normalize(vLocal);float latitude=asin(n.y),longitude=atan(n.z,n.x)+uTime*.0015;
 float cloud=fbm(vec2(longitude*4.,latitude*34.));float warped=latitude+.012*sin(longitude*7.+latitude*13.)+.009*(cloud-.5);
 float broad=.5+.5*sin(warped*44.+cloud*.8);float fine=.5+.5*sin(warped*178.+cloud*2.);
 vec3 albedo=mix(vec3(.53,.43,.31),vec3(.91,.83,.65),broad*.68+fine*.13);albedo+=vec3(.06,.065,.058)*(cloud-.5);
 float sun=max(0.,dot(normalize(vNormal),uSun));float limb=pow(1.-abs(dot(normalize(vNormal),normalize(cameraPosition-(modelMatrix*vec4(vLocal,1.)).xyz))),3.);
 gl_FragColor=vec4(albedo*(.025+.93*pow(sun,.8))+vec3(.18,.24,.3)*limb*.14,1.);gl_FragColor.rgb=pow(max(gl_FragColor.rgb,vec3(0.)),vec3(2.2));}`;
// The fragment shader gets world position explicitly; no screen-space readback.
const planetVertex = bodyVertex
  .replace("varying vec3 vLocal,vNormal;", "varying vec3 vLocal,vNormal,vWorld;")
  .replace("vLocal=position;", "vLocal=position;vWorld=(modelMatrix*vec4(position,1.)).xyz;");
const planetFragment = bodyFragment
  .replace("varying vec3 vLocal,vNormal;", "varying vec3 vLocal,vNormal,vWorld;")
  .replace("(modelMatrix*vec4(vLocal,1.)).xyz", "vWorld");
const ringVertex = `varying vec3 vLocal,vWorld;void main(){vLocal=position;vec4 p=modelMatrix*vec4(position,1.);vWorld=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;}`;
const ringFragment = `${noise}varying vec3 vLocal,vWorld;uniform vec3 uSunLocal;uniform float uRadius;
void main(){float r=length(vLocal.xz),q=(r-1116.)/(4800.-1116.);if(q<0.||q>1.)discard;
 float bands=.5+.5*sin(r*.024+noise(vec2(r*.006,0.))*7.);float threads=.5+.5*sin(r*.38);
 float cassini=1.-.9*exp(-pow((r-2070.)/32.,2.));float outer=1.-smoothstep(4600.,4800.,r);
 vec2 grain=vWorld.xz*.7;float ice=noise(grain)*.45+noise(grain*3.1)*.2;
 float density=(.14+.16*bands+.055*threads)*cassini*outer;density*=smoothstep(1116.,1190.,r);
 float b=dot(vLocal,uSunLocal),d=b*b-(dot(vLocal,vLocal)-uRadius*uRadius);float shadow=(d>0.&&b<0.)?.16:1.;
 vec3 tint=mix(vec3(.28,.32,.37),vec3(.66,.59,.45),bands*.64);tint=mix(tint,vec3(.8,.86,.9),ice*.25);
 gl_FragColor=vec4(pow(tint*shadow,vec3(2.2)),density*(.62+ice));}`;

export function createSaturnScene(scene, course) {
  const root = new Group();
  root.name = "Saturn-inspired ice ring environment";
  root.rotation.set(0.02, 0, 0.08);
  scene.add(root);
  const sun = new Vector3(-0.65, 0.38, 0.65).normalize();
  const bodyMat = new Shader({
    uniforms: { uTime: { value: 0 }, uSun: { value: sun } },
    vertexShader: planetVertex,
    fragmentShader: planetFragment,
    toneMapped: false,
  });
  const planet = new Mesh(new Sphere(900, 64, 40), bodyMat);
  planet.name = "Banded gas giant";
  root.add(planet);
  const positions = [],
    indices = [];
  for (let i = 0; i <= 256; i++) {
    const a = (i / 256) * Math.PI * 2;
    for (const r of [1116, 4800]) positions.push(Math.cos(a) * r, 0, Math.sin(a) * r);
    if (i < 256) {
      const b = i * 2;
      indices.push(b, b + 2, b + 1, b + 1, b + 2, b + 3);
    }
  }
  const geometry = new Geometry();
  geometry.setAttribute("position", new Attribute(positions, 3));
  geometry.setIndex(indices);
  root.updateMatrixWorld(true);
  const inverse = root.quaternion.clone().invert(),
    sunLocal = sun.clone().applyQuaternion(inverse);
  const rings = new Mesh(
    geometry,
    new Shader({
      uniforms: { uSunLocal: { value: sunLocal }, uRadius: { value: 900 } },
      vertexShader: ringVertex,
      fragmentShader: ringFragment,
      transparent: true,
      depthWrite: false,
      side: 2,
      toneMapped: false,
    }),
  );
  rings.name = "Layered ice-and-dust annulus";
  rings.renderOrder = -2;
  root.add(rings);
  let seed = 20461026;
  const random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
  const dustPos = [],
    sizes = [],
    routes = [];
  for (let i = 0; i < 2200; i++) {
    const s = random() * course.length,
      f = course.pose(s),
      outside = i % 4 !== 0;
    const x = outside ? (random() < 0.5 ? -1 : 1) * (14 + random() * 65) : (random() - 0.5) * 10;
    const h = outside ? -(3 + random() * 12) : -(8 + random() * 14);
    dustPos.push(...add(f.p, add(mul(f.right, x), mul(f.up, h))));
    sizes.push(0.045 + random() * 0.14);
    routes.push(s);
  }
  const dustG = new Geometry();
  dustG.setAttribute("position", new Attribute(dustPos, 3));
  dustG.setAttribute("aSize", new Attribute(sizes, 1));
  dustG.setAttribute("aRoute", new Attribute(routes, 1));
  const dustU = { uCar: { value: 0 }, uPixel: { value: 1 } };
  const dust = new Points(
    dustG,
    new Shader({
      uniforms: dustU,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      vertexShader: `attribute float aSize,aRoute;uniform float uCar,uPixel;varying float vAlpha;void main(){vec4 p=modelViewMatrix*vec4(position,1.);float span=abs(aRoute-uCar);vAlpha=(1.-smoothstep(80.,200.,span))*.5;gl_PointSize=clamp(aSize*420.*uPixel/max(1.,-p.z),.6,3.);gl_Position=projectionMatrix*p;}`,
      fragmentShader: `varying float vAlpha;void main(){vec2 p=gl_PointCoord*2.-1.;float d=dot(p,p);if(d>1.)discard;gl_FragColor=vec4(.76,.87,.95,vAlpha*exp(-d*4.));}`,
    }),
  );
  dust.name = "Local ice particles below and beside the road";
  dust.frustumCulled = false;
  dust.renderOrder = 0;
  scene.add(dust);
  // Position the broad annulus about 20 m below the level straight sections.
  const normal = new Vector3(0, 1, 0).applyQuaternion(root.quaternion);
  const planetY = -20 + (normal.x * 1400 + normal.z * 4300) / normal.y;
  return {
    root,
    planet,
    rings,
    dust,
    update(camera, s, time, pixel, detail) {
      root.position.set(camera.position.x - 1400, planetY, camera.position.z - 4300);
      bodyMat.uniforms.uTime.value = time;
      dustU.uCar.value = s;
      dustU.uPixel.value = Math.min(2, pixel);
      dustG.setDrawRange(0, detail === 0 ? 900 : detail === 1 ? 1500 : 2200);
    },
    status: () => ({
      style: "saturn-inspired",
      planetRadius: 900,
      ringInner: 1116,
      ringOuter: 4800,
      dustCount: 2200,
      ringPlaneBelowStraight: 20,
    }),
  };
}
