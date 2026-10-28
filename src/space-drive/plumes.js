// Keep the native nozzle hierarchy and layered geometry, including flips.
// One uniform switches this refinement off in the other driving modes.
export function refineOrbitPlumes(car) {
  const enabled = { value: 0 },
    objects = [];
  for (const plume of Object.values(car.plumes || {})) {
    const mesh = plume.mesh,
      material = mesh.material;
    const vertex = "vNormalW = normalize(mat3(modelMatrix) * normal);";
    const fragment = "if (alpha < 0.004) discard;";
    if (!material.vertexShader.includes(vertex) || !material.fragmentShader.includes(fragment))
      continue;
    material.uniforms.uOrbitRefinement = enabled;
    material.vertexShader =
      "varying float vOrbitHeight;\n" +
      material.vertexShader.replace(vertex, "vOrbitHeight=world.y;" + vertex);
    material.fragmentShader =
      "varying float vOrbitHeight;uniform float uOrbitRefinement;\n" +
      material.fragmentShader.replace(
        fragment,
        `
        if(uOrbitRefinement>.5){
          // Fine stationary pressure cells near the nozzle, flowing shear
          // further out, and a less opaque outer condensation layer.
          if(vLayer<.5){
            float cell=.92+.08*cos(along*52.-slow.r*.8);
            color*=cell*1.12;
          }else{
            float filaments=.86+.14*smoothstep(.25,.72,fast.b);
            alpha*=filaments*(vLayer>1.5?.78:1.);
            color*=mix(vec3(.82,.94,1.04),vec3(1.),smoothstep(.15,.85,along));
          }
          alpha*=smoothstep(.025,.10,vOrbitHeight);
        }
        ` + fragment,
      );
    material.needsUpdate = true;
    objects.push(mesh);
  }
  return {
    objects,
    set: (value) => {
      enabled.value = +!!value;
    },
  };
}
