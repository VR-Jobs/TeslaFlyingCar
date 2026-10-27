import { COAST } from "../config/coast.js";
export const noiseGLSL = `
float hash21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise2(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash21(i),hash21(i+vec2(1,0)),f.x),mix(hash21(i+vec2(0,1)),hash21(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p) {
  float n = 0.0, a = .5;
  for(int i=0;i<4;i++){n+=a*noise2(p);p=mat2(.8,.6,-.6,.8)*p*2.03+17.3;a*=.5;}
  return n;
}
float shoreAt(float z) { return ${COAST.shoreX.toFixed(3)} + sin(z*.012)*1.35 + sin(z*.037+.7)*.55; }
`;

// Height and analytic derivatives share the same dispersive wave field in both
// shader stages. Unequal wavelengths and directions avoid repeating stripe patterns.
export const wavesGLSL = `
vec3 waveTerm(vec2 p, float t, vec2 direction, float k, float amplitude, float phase) {
  vec2 d=normalize(direction);
  float a=dot(p,d)*k-sqrt(9.81*k)*t+phase;
  float s=sin(a)+.10*sin(2.0*a);
  float slope=cos(a)+.20*cos(2.0*a);
  return vec3(s, d.x*k*slope, d.y*k*slope)*amplitude;
}
vec3 seaWaves(vec2 p,float t) {
  vec3 w=waveTerm(p,t,vec2(.94,.34),.21,.115,.3);
  w+=waveTerm(p,t,vec2(.82,-.57),.34,.062,2.8);
  w+=waveTerm(p,t,vec2(.42,.91),.57,.028,5.1);
  w+=waveTerm(p,t,vec2(-.36,.93),.93,.014,1.6);
  w+=waveTerm(p,t,vec2(.97,-.22),1.63,.006,4.3);
  return w;
}
`;

export const oceanVertex = `
uniform float uCoastTime;
uniform float uCoastTravel;
varying vec3 vCoastWorld;
${noiseGLSL}
${wavesGLSL}
void main() {
  vec4 world = modelMatrix * vec4(position,1.0);
  vec2 p = vec2(world.x,world.z-uCoastTravel);
  float edge = smoothstep(0.0,5.0,shoreAt(p.y)-p.x);
  world.y += seaWaves(p,uCoastTime).x * edge;
  vCoastWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

export const oceanFragment = `
uniform float uCoastTime;
uniform float uCoastTravel;
uniform vec3 uShallow;
uniform vec3 uDeep;
uniform vec3 uScatter;
uniform vec3 uSkyTop;
uniform vec3 uHorizon;
uniform vec3 uSunDirection;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
varying vec3 vCoastWorld;
${noiseGLSL}
${wavesGLSL}
vec3 skyReflection(vec3 ray) {
  float h=clamp(ray.y,0.0,1.0);
  vec3 c=mix(uHorizon,uSkyTop,pow(h,.55)*.75);
  float haze=pow(max(dot(ray,uSunDirection),0.0),18.0);
  vec2 cp=ray.xz/(max(ray.y,.025)+.18)*2.3+vec2(uCoastTime*.004,0.0);
  float clouds=smoothstep(.53,.70,fbm(cp))*smoothstep(.025,.16,h);
  c=mix(c,vec3(.83,.87,.87),clouds*.38);
  return c+vec3(.24,.22,.17)*haze;
}
void main() {
  vec2 p=vec2(vCoastWorld.x,vCoastWorld.z-uCoastTravel);
  float shore=shoreAt(p.y)-p.x;
  if(shore<-.8) discard;
  float edge=smoothstep(0.0,5.0,shore);
  float t=uCoastTime;
  vec3 wave=seaWaves(p,t);
  vec2 slope=wave.yz*edge;
  float detailFade=1.0-smoothstep(100.0,550.0,length(cameraPosition-vCoastWorld));
  vec2 rip=p*1.7+vec2(t*.13,-t*.09);
  float micro=noise2(rip);
  slope+=vec2(noise2(rip+vec2(.07,0.0))-micro,noise2(rip+vec2(0.0,.07))-micro)*.19*detailFade;
  vec3 n=normalize(vec3(-slope.x,1.0,-slope.y));
  vec3 view=normalize(cameraPosition-vCoastWorld);
  float nv=max(dot(n,view),.001);
  float fresnel=.0204+.9796*pow(1.0-nv,5.0);
  float depth=max(.0,shore*.19);
  vec3 transmission=exp(-vec3(.28,.09,.035)*depth);
  vec3 bottom=mix(uShallow,uDeep,1.0-exp(-depth*.12));
  // Shallow sandy bottom with moving refracted-light ribbons; no screen-space readback.
  vec2 bedP=p+n.xz*min(depth,4.0)*1.4;
  float causticA=sin(bedP.x*1.89+sin(bedP.y*1.47+t*.29)*1.7+t*.34);
  float causticB=sin(bedP.y*1.83+sin(bedP.x*1.61-t*.21)*1.5-t*.27);
  float caustic=pow(clamp(1.0-abs(causticA+causticB)*.65,0.0,1.0),15.0);
  bottom+=vec3(.045,.07,.065)*caustic*exp(-depth*.32)*detailFade;
  float ripple=sin(p.x*4.7+sin(p.y*.41)*.9)*.009*exp(-depth*.6)*detailFade;
  bottom+=ripple;
  vec3 water=bottom*(.70+.30*transmission)+uScatter*(1.0-transmission)*.16;
  vec3 reflected=skyReflection(reflect(-view,n));
  vec3 color=mix(water,reflected,clamp(fresnel*.64,0.0,.74));
  vec3 halfVector=normalize(view+uSunDirection);
  float nh=max(dot(n,halfVector),0.0);
  float spec=pow(nh,580.0)*.9+pow(nh,80.0)*.035;
  color+=vec3(1.0,.94,.80)*spec;
  float crest=smoothstep(.09,.18,wave.x)*.022;
  color+=uScatter*crest*edge;
  // Thin broken swash follows the same shoreline function as the sand mesh.
  float tide=.45+.65*sin(t*.83+p.y*.056+fbm(vec2(p.y*.15,t*.05))*1.8);
  float swash=shore-tide;
  float holes=fbm(p*vec2(4.1,2.3)+vec2(t*.11,-t*.07));
  float lace=smoothstep(.38,.62,holes);
  float foam=(1.0-smoothstep(.09,.56,abs(swash)))*lace;
  float backwash=1.0-smoothstep(.04,.22,abs(shore-1.45-.28*sin(t*.71+p.y*.11)));
  foam+=backwash*exp(-shore*.4)*smoothstep(.45,.63,holes)*.42;
  color=mix(color,vec3(.85,.92,.91),clamp(foam*.85,0.0,.92));
  float fog=smoothstep(uFogNear,uFogFar,length(cameraPosition-vCoastWorld));
  color=mix(color,uFogColor,fog);
  // The shallow surface blends over actual sand and submerged rocks. Deep water
  // becomes opaque before the finite sand mesh ends; no external render texture.
  float alpha=.46+.51*(1.0-exp(-depth*.28));
  alpha=max(alpha,smoothstep(5.0,10.0,depth));
  alpha=clamp(alpha+fresnel*.15+foam*.30,.38,1.0);
  gl_FragColor=vec4(color,alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export const skyVertex = `
varying vec3 vDirection;
void main(){vDirection=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;

export const skyFragment = `
uniform vec3 uSkyTop;
uniform vec3 uSkyMid;
uniform vec3 uHorizon;
uniform vec3 uSunDirection;
uniform float uCoastTime;
varying vec3 vDirection;
${noiseGLSL}
void main(){
  vec3 ray=normalize(vDirection);
  float h=max(ray.y,0.0);
  vec3 sky=mix(uHorizon,uSkyMid,smoothstep(0.0,.33,h));
  sky=mix(sky,uSkyTop,smoothstep(.12,.95,h));
  float sun=max(dot(ray,uSunDirection),0.0);
  sky+=vec3(1.0,.85,.62)*pow(sun,1800.0)*2.6;
  sky+=vec3(.12,.105,.075)*pow(sun,18.0);
  // Perspective-projected layers, with soft illuminated tops and cooler undersides.
  vec2 p=ray.xz/(max(ray.y,.025)+.18)*2.3+vec2(uCoastTime*.004,0.0);
  float shape=fbm(p), fine=noise2(p*8.0)*.045;
  float cloud=smoothstep(.51,.69,shape+fine)*smoothstep(.025,.16,h);
  float rim=clamp((fbm(p+vec2(.0,.13))-shape)*4.0+.58,.0,1.0);
  vec3 cloudColor=mix(vec3(.62,.71,.75),vec3(.99,.98,.94),rim);
  sky=mix(sky,cloudColor,cloud*.88);
  gl_FragColor=vec4(sky,1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
