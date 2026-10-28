export const planetVertex = `uniform float uPolar;varying vec3 vLocal,vWorld,vNormal;
void main(){vLocal=position;vec4 p=modelMatrix*vec4(position,1.);vWorld=p.xyz;
vNormal=normalize(mat3(modelMatrix)*vec3(normal.x,normal.y/(uPolar*uPolar),normal.z));
gl_Position=projectionMatrix*viewMatrix*p;}`;
const mapping = `
vec2 atlasUV(vec3 n){vec3 a=abs(n);vec2 q,cell;
 if(a.y>a.x&&a.y>a.z){if(n.y>0.){q=vec2(-n.z,n.x)/a.y;cell=vec2(2.,2.);}else{q=vec2(n.z,n.x)/a.y;cell=vec2(0.,0.);}}
 else if(a.x>a.z){if(n.x>0.){q=vec2(n.z,n.y)/a.x;cell=vec2(0.,1.);}else{q=vec2(-n.z,n.y)/a.x;cell=vec2(2.,1.);}}
 else {if(n.z>0.){q=vec2(-n.x,n.y)/a.z;cell=vec2(1.,1.);}else{q=vec2(n.x,n.y)/a.z;cell=vec2(3.,1.);}}
 return (cell+clamp(q*.5+.5,vec2(.003),vec2(.997)))/vec2(4.,3.);}
vec2 planetUV(vec3 n){return uAtlas>.5?atlasUV(n):vec2(atan(n.z,n.x)/6.2831853+.5,asin(clamp(n.y,-1.,1.))/3.14159265+.5);}
`;
export const planetFragment = `uniform sampler2D uMap,uNormalMap,uRingMap;uniform float uAtlas,uKind,uBump,uFade,uRadius,uInner,uOuter,uRings;
uniform vec3 uSun,uCenter,uRingNormal;varying vec3 vLocal,vWorld,vNormal;
${mapping}
void main(){vec3 local=normalize(vLocal);vec2 uv=planetUV(local);
 vec3 albedo=texture2D(uMap,uv).rgb;vec3 n=normalize(vNormal);
 if(uBump>0.){vec3 q1=dFdx(vWorld),q2=dFdy(vWorld);vec2 st1=dFdx(uv),st2=dFdy(uv);
   vec3 q2p=cross(q2,n),q1p=cross(n,q1);vec3 T=q2p*st1.x+q1p*st2.x,B=q2p*st1.y+q1p*st2.y;
   float m=max(dot(T,T),dot(B,B));if(m>.00000001){T*=inversesqrt(m);B*=inversesqrt(m);
   vec3 tex=texture2D(uNormalMap,uv).xyz*2.-1.;n=normalize(T*tex.x*uBump+B*tex.y*uBump+n*max(.3,tex.z));}}
 if(uKind>5.5){float lum=dot(albedo,vec3(.2126,.7152,.0722));
   vec3 natural=uKind>6.5?vec3(.53,.72,.78):vec3(.61,.79,.79);
   albedo=mix(albedo,natural+(lum-.5)*.35,uKind>6.5?.84:.52);}
 float light=max(0.,dot(n,uSun));float shadow=1.;
 if(uRings>.1){float den=dot(uSun,uRingNormal);if(abs(den)>.001){float t=-dot(vWorld-uCenter,uRingNormal)/den;
   float r=length(vWorld-uCenter+uSun*t)/uRadius;
   if(t>0.&&r>uInner&&r<uOuter){
     float opacity=texture2D(uRingMap,vec2((r-uInner)/(uOuter-uInner),.5)).a;
     float penumbra=smoothstep(uInner,uInner+.025,r)*(1.-smoothstep(uOuter-.025,uOuter,r));
     shadow=1.-opacity*penumbra*.58; }}}
 vec3 color=pow(max(albedo,vec3(.001)),vec3(2.2))*(.009+light*.98*shadow);
 if(uKind>1.5&&uKind<2.5){float ocean=smoothstep(.025,.16,albedo.b-albedo.r)*(1.-smoothstep(.55,.82,albedo.r));
  vec3 eye=normalize(cameraPosition-vWorld),halfway=normalize(uSun+eye);
  color+=vec3(.8,.9,1.)*pow(max(0.,dot(n,halfway)),75.)*ocean*light*.42;}
 gl_FragColor=vec4(color,uFade);}`;
export const atmosphereFragment = `uniform float uFade,uStrength;uniform vec3 uSun,uTint;
varying vec3 vWorld,vNormal;void main(){vec3 n=normalize(vNormal),v=normalize(cameraPosition-vWorld);
 float rim=pow(1.-max(0.,dot(n,v)),3.5);float day=smoothstep(-.2,.5,dot(n,uSun));
 float alpha=rim*day*uStrength*uFade;
 if(alpha<.001)discard;gl_FragColor=vec4(pow(uTint,vec3(2.2))*(.45+day*.65),alpha);}`;
export const ringVertex = `varying vec3 vLocal,vWorld;void main(){vLocal=position;vec4 p=modelMatrix*vec4(position,1.);vWorld=p.xyz;
gl_Position=projectionMatrix*viewMatrix*p;}`;
export const ringFragment = `uniform sampler2D uMap;uniform float uInner,uOuter,uFade,uStrength,uRadius,uKind;
uniform vec3 uCenter,uSun;varying vec3 vLocal,vWorld;
void main(){float r=length(vLocal.xz);if(r<uInner||r>uOuter)discard;
 float q=(r-uInner)/(uOuter-uInner);vec4 tex=texture2D(uMap,vec2(q,.5));
 float a=tex.a;vec3 tint=tex.rgb;
 if(uKind<4.5||uKind>5.5){float frequency=q*9.,width=max(.025,fwidth(frequency));
  float bands=(1.-smoothstep(.035,.035+width,abs(fract(frequency)-.5)))*min(1.,.12/width);
  a=bands;tint=vec3(.35,.39,.4);}
 float edge=smoothstep(0.,.012,q)*(1.-smoothstep(.985,1.,q));
 vec3 p=vWorld-uCenter;float b=dot(p,uSun),d=b*b-(dot(p,p)-uRadius*uRadius);
 float shadow=d>0.&&b<0.?.13:1.;
 gl_FragColor=vec4(pow(tint,vec3(2.2))*shadow,a*uStrength*uFade*edge);}`;
