export const cosmicNoise = `
float hash3(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),
 mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float cosmicFbm(vec3 p){float n=0.0,a=.57;for(int i=0;i<3;i++){n+=a*noise3(p);p=p*2.07+vec3(13.3,7.9,17.1);a*=.47;}return n;}
`;
export const cosmicSkyVertex = `varying vec3 vDirection;void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
export const cosmicSkyFragment = `${cosmicNoise}
varying vec3 vDirection;
void main(){vec3 d=normalize(vDirection);float latitude=dot(d,normalize(vec3(.52,.79,.20)));
 vec3 color=vec3(.00006,.000075,.00012);
 if(abs(latitude)<.34){
   float band=exp(-pow(abs(latitude)*9.0,1.6));
   float clouds=cosmicFbm(d*15.0+7.1);
   float fine=cosmicFbm(d*53.0-12.7);
   float dust=smoothstep(.43,.69,cosmicFbm(d*25.0+31.7));
   float light=band*(.18+clouds*clouds*1.2)*(.65+fine*.5)*(1.0-dust*.85);
   color+=vec3(.018,.019,.026)*light;
 }
 gl_FragColor=vec4(color,1.0);
}`;
export const starVertex = `attribute vec3 color;attribute float aSize;uniform float uPixelRatio;varying vec3 vColor;varying float vSize;
void main(){vColor=color;vSize=aSize;gl_PointSize=max(1.0,aSize*uPixelRatio);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
export const starFragment = `varying vec3 vColor;varying float vSize;
void main(){vec2 p=gl_PointCoord*2.0-1.0;float r=dot(p,p);if(r>1.0)discard;
 float core=exp(-r*6.8),halo=exp(-r*2.2)*.12;
 float spike=vSize>2.6 ? (exp(-abs(p.x)*35.0)*exp(-abs(p.y)*4.0)+exp(-abs(p.y)*35.0)*exp(-abs(p.x)*4.0))*.055 : 0.0;
 gl_FragColor=vec4(vColor*(core+halo+spike),min(1.0,core+halo+spike));}`;
export const moonVertex = `varying vec3 vLocal;varying vec3 vWorld;varying vec3 vNormalW;
void main(){vLocal=normal;vec4 world=modelMatrix*vec4(position,1.0);vWorld=world.xyz;vNormalW=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*world;}`;
export const moonFragment = `${cosmicNoise}
uniform vec3 uSunDirection;uniform float uRadius;varying vec3 vLocal;varying vec3 vWorld;varying vec3 vNormalW;
float terrain(vec3 n){float h=(cosmicFbm(n*14.0)-.5)*.014+(noise3(n*125.0)-.5)*.0018;
 for(int i=0;i<30;i++){float s=float(i)+1.0;vec3 c=normalize(vec3(hash3(vec3(s,2,7)),hash3(vec3(4,s,9)),hash3(vec3(8,3,s)))*2.0-1.0);
 float radius=.035+hash3(vec3(s,14,2))*.14;float r=length(n-c)/radius;
 h-=exp(-r*r*3.2)*radius*.075;h+=exp(-pow((r-.94)*9.0,2.0))*radius*.035;}
 return h;}
void main(){vec3 local=normalize(vLocal),normal=normalize(vNormalW);float h=terrain(local)*uRadius;
 vec3 dx=dFdx(vWorld),dy=dFdy(vWorld),r1=cross(dy,normal),r2=cross(normal,dx);float determinant=dot(dx,r1);
 normal=normalize(abs(determinant)*normal-sign(determinant)*(dFdx(h)*r1+dFdy(h)*r2));
 float diffuse=max(0.0,dot(normal,normalize(uSunDirection)));
 float maria=smoothstep(.36,.65,cosmicFbm(local*6.8+17.3));
 vec3 albedo=mix(vec3(.29,.285,.27),vec3(.13,.135,.145),maria*.75);
 albedo*=.88+noise3(local*180.0)*.2;
 gl_FragColor=vec4(albedo*(.003+diffuse*1.15),1.0);
}`;
