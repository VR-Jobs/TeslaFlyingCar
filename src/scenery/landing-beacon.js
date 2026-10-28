import {
  B as Group,
  R as Mesh,
  V as CylinderGeometry,
  gi as ShaderMaterial,
} from "../vendor/rendering.js";

// An open elliptical wall rising from the footprint's rim, with no center beam
// or caps. Depth testing lets vehicles occlude the transparent curtain.
export function createLandingBeacon(marker) {
  const height = 1.65;
  const group = new Group();
  group.name = "Predicted landing / hollow gradient rim curtain";
  marker.material.uniforms.uHazard ||= { value: 0 };
  const material = new ShaderMaterial({
    uniforms: marker.material.uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: 2,
    blending: 2,
    fog: false,
    toneMapped: false,
    vertexShader: `varying vec2 vUv;
      void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `varying vec2 vUv;uniform float uOpacity,uBlocked,uHazard;
      void main(){
        float fade=pow(1.-smoothstep(.02,1.,vUv.y),1.55);
        float a=uOpacity*fade*.75;
        if(a<.002)discard;
        vec3 tint=mix(vec3(.64,.84,1.),vec3(1.,.65,.18),uHazard);tint=mix(tint,vec3(1.,.28,.2),uBlocked);
        gl_FragColor=vec4(mix(tint,vec3(1.),(1.-vUv.y)*.35),a);
      }`,
  });
  // The ground shader's circle has radius .78 in [-1,1] UV coordinates.
  // Apply the plane's separate dimensions to match its actual ellipse exactly.
  const radiusX = marker.geometry.parameters.width * 0.5 * 0.78;
  const radiusZ = marker.geometry.parameters.height * 0.5 * 0.78;
  const shell = new Mesh(new CylinderGeometry(1, 1, height, 64, 1, true), material);
  shell.scale.set(radiusX, 1, radiusZ);
  shell.position.y = height / 2;
  shell.renderOrder = 4;
  shell.name = "Open light curtain / exact footprint rim";
  group.add(shell);
  group.visible = false;
  return {
    group,
    update() {
      group.visible = marker.visible;
      if (!group.visible) return;
      group.position.copy(marker.position);
      group.scale.set(marker.scale.x, marker.scale.z, marker.scale.y);
    },
    status: () => ({
      visible: group.visible,
      layout: "rim",
      height,
      radiusX,
      radiusZ,
      position: group.position.toArray(),
    }),
  };
}
