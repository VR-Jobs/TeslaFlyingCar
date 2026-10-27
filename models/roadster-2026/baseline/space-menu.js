import {
  B as Group,
  Js as Scene,
  R as Mesh,
  Ii as PlaneGeometry,
  Fr as MeshBasicMaterial,
  sa as PMREMGenerator,
  Jr as BufferGeometry,
  L as Float32BufferAttribute,
  Rc as PointsMaterial,
  Uc as Points,
  I as Color,
} from "../vendor/rendering.js";
import { installShowroomClearance } from "./showroom-clearance.js";
import { installShowroomAudio } from "./showroom-audio.js";
import { enhanceShowroomJets } from "./showroom-jets.js";
import { installShowroomMotion } from "./showroom-motion.js";
import { installLandingSmoke } from "./showroom-landing.js";
import { installShowroomParallax } from "./showroom-parallax.js";

// Retain the recovered industrial showroom; replace only sunset sky and light.
export function installSpaceMenu(showroom, renderer, audioOptions) {
  const roots = [...showroom.scene.children];
  const sunsetSkies = roots.filter((root) => {
    const u = root.material?.uniforms;
    return u?.sunPower && u?.horizon && u?.top;
  });
  const black = new Color(0),
    prepared = new Set();
  showroom.set.parts.containers.visible = false;
  for (const root of roots) {
    const ground = root.children.some((node) => node.geometry?.parameters?.radius === 1040);
    // These unlit hills contain baked sunset haze.
    if (
      root.children.length === 2 &&
      root.children.every(
        (child) =>
          child.isMesh && child.material?.isMeshBasicMaterial && child.material.fog === false,
      )
    ) {
      for (const child of root.children) child.material.color.set("#050607");
    }
    root.traverse((node) => {
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      for (const material of materials) {
        if (!material?.isMeshStandardMaterial || prepared.has(material)) continue;
        prepared.add(material);
        // Isolate the original global warm height-fog uniforms from gameplay.
        const prepare = material.onBeforeCompile;
        const cacheKey = material.customProgramCacheKey();
        material.onBeforeCompile = function (shader, engine) {
          prepare.call(this, shader, engine);
          shader.uniforms.fogSunColor = { value: black };
        };
        material.customProgramCacheKey = () => `${cacheKey}|black-starfield`;
        material.needsUpdate = true;
      }
      if (node.geometry?.parameters?.radius === 1040 && node.material?.color)
        node.material.color.set("#101010");
      else if (ground && node.material?.color) node.material.color.set("#292929");
    });
  }
  // Dim the original turntable independently of the car's paint materials.
  for (const node of showroom.turn.children) {
    if (node !== showroom.lift && node.material?.color) node.material.color.set("#454545");
  }
  // A material-level white rim affects the car alone, keeping the floor dark.
  for (const name of ["body", "wing", "glass", "lower", "wheelSpoke"]) {
    const material = showroom.car.materials[name];
    if (!material?.isMeshStandardMaterial) continue;
    const prepare = material.onBeforeCompile,
      key = material.customProgramCacheKey();
    material.onBeforeCompile = function (shader, engine) {
      prepare.call(this, shader, engine);
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        `
        float rimWhite=pow(1.0-clamp(abs(dot(normal,normalize(vViewPosition))),0.0,1.0),2.8);
        outgoingLight+=vec3(rimWhite*0.9);
        #include <opaque_fragment>`,
      );
    };
    material.customProgramCacheKey = () => key + "|white-car-rim";
    material.envMapIntensity = Math.max(material.envMapIntensity, 1.25);
    material.needsUpdate = true;
  }
  const clearance = installShowroomClearance(showroom);
  const jets = enhanceShowroomJets(showroom);
  const audio = installShowroomAudio(audioOptions);
  const motion = installShowroomMotion(showroom);
  const landing = installLandingSmoke(showroom, renderer);
  const parallax = installShowroomParallax(showroom, audioOptions.isHome);
  showroom.presentation = { clearance, audio, jets, motion, landing, parallax };
  // Neutral reflection cards replace the original sunset cubemap, once at load.
  const studio = new Scene();
  studio.background = new Color("#080808");
  for (const [x, y, z, width, height, strength] of [
    [-6, 5, 5, 7, 5, 1.7],
    [5, 4, -5, 5, 4, 1.1],
    [0, 9, 0, 7, 4, 1.5],
  ]) {
    const card = new Mesh(
      new PlaneGeometry(width, height),
      new MeshBasicMaterial({
        color: new Color().setRGB(strength, strength, strength),
        side: 2,
        toneMapped: false,
      }),
    );
    card.position.set(x, y, z);
    card.lookAt(0, 0, 0);
    studio.add(card);
  }
  const generator = new PMREMGenerator(renderer);
  try {
    showroom.scene.environment = generator.fromScene(studio, 0).texture;
  } finally {
    generator.dispose();
    studio.traverse((node) => {
      if (node.isMesh) {
        node.geometry.dispose();
        node.material.dispose();
      }
    });
  }
  const group = new Group();
  group.name = "Original showroom / black starfield";
  const positions = [],
    colors = [];
  let seed = 74031;
  const rand = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < 2900; i++) {
    const angle = rand() * Math.PI * 2,
      y = 0.035 + rand() * 0.965;
    const radius = 720 + rand() * 220,
      horizontal = Math.sqrt(1 - y * y);
    positions.push(
      Math.cos(angle) * horizontal * radius,
      y * radius,
      Math.sin(angle) * horizontal * radius,
    );
    const light = 0.3 + Math.pow(rand(), 3) * 0.7;
    colors.push(light, light, light);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  const stars = new Points(
    geometry,
    new PointsMaterial({
      size: 1.7,
      sizeAttenuation: false,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      fog: false,
      toneMapped: false,
    }),
  );
  stars.name = "White stars / no nebula or planet";
  group.add(stars);
  showroom.scene.add(group);
  showroom.scene.background = black;
  showroom.scene.fog.color.copy(black);
  showroom.scene.fog.near = 65;
  showroom.scene.fog.far = 650;
  showroom.scene.environmentIntensity = 0.65;
  showroom.sun.color.set("#e9ecf1");
  showroom.sun.intensity = 0.95;
  showroom.sun.position.set(8, 14, 8);
  showroom.hemi.groundColor.set("#34373d");
  for (const root of roots)
    if (root.isSpotLight) {
      root.color.set("#ffffff");
      root.intensity = 12;
    }
  for (const sky of sunsetSkies) sky.visible = false;
  showroom.set.hold = true; // Prevent random rocket flashes across the black sky.
  showroom.set.dust.material.color.set("#c4c8cd");
  showroom.set.dust.material.opacity = 0.07;
  showroom.yaw = 2.75;
  showroom.yawVel = 0;
  showroom.demoIndex = 1; // First performance: jet lift and a full front flip.
  let entryAt = showroom.t,
    firstDemoDelay = null;
  showroom.presentation.entry = {
    arm() {
      entryAt = showroom.t;
      firstDemoDelay = null;
      showroom.demo = null;
      motion.reset();
      landing.clear();
      parallax.reset();
      showroom.idle = 2.6;
      showroom.nextDemoT = showroom.t + 1;
    },
    status: () => ({ requestedDelay: 1, firstDemoDelay }),
  };
  showroom.presentation.entry.arm();
  const applyCamera = showroom.applyCamera;
  showroom.applyCamera = function () {
    applyCamera.call(this);
    // A vertical car needs extra headroom, especially behind the top navigation.
    if (this.demo && !this.inspecting) {
      this.camera.fov = this.baseFov + this.demoView * 24;
      this.camera.updateProjectionMatrix();
    }
    parallax.apply();
  };
  const original = showroom.update;
  showroom.update = function (dt) {
    parallax.update(dt);
    const yaw = this.yaw;
    let previousDemo = this.demo;
    if (this.inspecting || this.dragging) {
      previousDemo = null;
      this.demo = null;
      this.nextDemoT = this.t + 8;
      this.idle = 0;
    } else {
      // Allow native nozzle plumes, wing deployment, lift and 360° stunts,
      // while keeping the platform still between performances.
      this.idle = Math.max(this.idle, 2.6);
      this.yawVel = 0;
    }
    original.call(this, dt);
    if (this.demo && !previousDemo && firstDemoDelay === null) firstDemoDelay = this.t - entryAt;
    let frame = null;
    if (!this.inspecting) frame = motion.apply(this.dragging ? null : this.demo || previousDemo);
    else {
      motion.reset();
      landing.clear();
    }
    if (!this.dragging) {
      this.yaw = yaw;
      this.turn.rotation.y = yaw;
      this.yawVel = 0;
    }
    const correction = clearance.apply(
      frame ? 0.008 + 0.052 * Math.min(1, frame.height / 0.35) : 0.008,
    );
    if (this.demo) this.demoFocus += correction * 0.65;
    this.applyCamera();
    this.shadow.material.opacity = 0.55 / (1 + this.lift.position.y * 1.5);
    if (frame?.impact) {
      landing.emit(this.yaw);
      if (!this.presentation.testing) audio.land();
    }
    if (this.dragging) landing.clear();
    landing.update(dt);
    audio.update(this.inspecting || this.dragging || this.presentation.testing ? 0 : frame?.audio);
    this.hemi.color.set("#c0c5ce");
    this.hemi.intensity = 0.32;
    this.set.ledMat.color.setRGB(0.28, 0.28, 0.28);
    this.post.sunVis = 0;
    this.post.sunColor.set(0);
    this.post.shadowTint.set(0, 0, 0);
    this.post.highTint.set(0, 0, 0);
    this.post.sat = 1;
    this.post.grain = 0.003;
    this.post.vignette = 0.13;
    this.post.curve = 0.18;
  };
  return showroom.presentation;
}
