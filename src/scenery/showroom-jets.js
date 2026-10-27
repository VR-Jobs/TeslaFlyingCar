export function enhanceShowroomJets(showroom) {
  const plumes = Object.values(showroom.car.plumes);
  for (const plume of plumes) {
    const { mesh } = plume;
    const material = mesh.material;
    // Keep exhaust above the opaque platform instead of drawing through it.
    material.vertexShader =
      "varying float vShowroomWorldY;\n" +
      material.vertexShader.replace(
        "gl_Position = projectionMatrix * viewMatrix * world;",
        "vShowroomWorldY=world.y;gl_Position = projectionMatrix * viewMatrix * world;",
      );
    material.fragmentShader =
      "varying float vShowroomWorldY;\n" +
      material.fragmentShader.replace(
        "gl_FragColor = vec4(color, min(alpha, 0.95));",
        `float floorFade=smoothstep(0.045,0.13,vShowroomWorldY);
       if(floorFade<=0.001)discard;
       gl_FragColor=vec4(color*1.65,min(alpha*1.35,0.95)*floorFade);`,
      );
    material.needsUpdate = true;
    const set = plume.set;
    // Native glow calls retain their timing and color; only this showroom grows.
    plume.set = function (level) {
      set.call(this, level);
      mesh.scale.x *= 1.25;
      mesh.scale.z *= 1.25;
      mesh.scale.y *= 1.35;
    };
  }
  return {
    level: () =>
      Math.max(
        0,
        ...plumes.map(({ mesh }) => (mesh.visible ? mesh.material.uniforms.uLevel.value : 0)),
      ),
  };
}
