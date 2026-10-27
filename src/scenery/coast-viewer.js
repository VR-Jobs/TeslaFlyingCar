import {
  Js as Scene,
  xi as PerspectiveCamera,
  Ks as WebGLRenderer,
  Yu as DirectionalLight,
  Iu as HemisphereLight,
  P as Vector3,
} from "../vendor/rendering.js";
import { COAST } from "../config/coast.js";

// Reuses the real scene geometry and materials. This is an optional inspection view,
// with its own canvas so it never changes the driving camera or the saved run.
export function createCoastViewer(group, sourceRenderer, selectCoast, uniforms) {
  const dialog = document.createElement("dialog");
  dialog.id = "coast-viewer";
  dialog.style.cssText =
    "position:fixed;inset:0;width:100vw;height:100dvh;max-width:none;max-height:none;margin:0;padding:0;border:0;background:#b7dce6;color:white;overflow:hidden";
  const header = document.createElement("div");
  header.style.cssText =
    "position:absolute;top:20px;left:24px;right:24px;z-index:2;display:flex;justify-content:space-between;align-items:center;gap:20px;text-shadow:0 1px 12px #15324370;pointer-events:none";
  const title = document.createElement("strong"),
    close = document.createElement("button");
  title.style.font = "600 16px system-ui";
  close.type = "button";
  close.style.cssText =
    "pointer-events:auto;background:#162a39bb;color:#fff;border:1px solid #ffffff40;border-radius:20px;padding:10px 18px;font:14px system-ui;cursor:pointer";
  const hint = document.createElement("div");
  hint.style.cssText =
    "position:absolute;bottom:20px;left:24px;z-index:2;font:13px system-ui;background:#16364785;border:1px solid #ffffff30;border-radius:18px;padding:10px 16px;pointer-events:none";
  header.append(title, close);
  dialog.append(header, hint);
  document.body.append(dialog);
  const labels = () => {
    const zh = document.documentElement.lang === "zh";
    title.textContent = zh ? "浅蓝海岸 · 实时观景" : "Blue Lagoon Coast · Live view";
    close.textContent = zh ? "返回游戏" : "Back to game";
    hint.textContent = zh
      ? "拖动环顾 · 滚轮缩放 · Esc 返回"
      : "Drag to look around · Scroll to zoom · Esc to return";
  };
  let renderer = null,
    frame = null,
    snapshot = null,
    previewSun = null;
  const cleanup = () => {
    cancelAnimationFrame(frame);
    frame = null;
    // Retain one lazy canvas/context across openings. Dispose each snapshot's
    // instance buffers, but never dispose geometry/materials shared with the game.
    snapshot?.traverse((node) => {
      if (node.isInstancedMesh) node.dispose();
    });
    previewSun?.shadow.map?.dispose();
    previewSun = null;
    renderer?.renderLists.dispose();
    snapshot = null;
  };
  close.onclick = () => dialog.close();
  dialog.addEventListener("close", cleanup);
  dialog.addEventListener("keydown", (e) => e.stopPropagation());
  function open() {
    if (dialog.open) return;
    selectCoast();
    labels();
    const scene = new Scene();
    snapshot = group.clone(true);
    scene.add(snapshot);
    // Use the same atmosphere as the driving view.
    scene.fog = group.parent.fog.clone();
    const hemi = new HemisphereLight("#c3e1f2", "#8d846c", 0.8);
    const sun = new DirectionalLight("#fff1d9", COAST.sunIntensity);
    previewSun = sun;
    sun.position.set(...COAST.sunDirection).multiplyScalar(160);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, {
      left: -55,
      right: 55,
      top: 55,
      bottom: -55,
      near: 1,
      far: 360,
    });
    sun.shadow.camera.updateProjectionMatrix();
    sun.shadow.bias = -0.0003;
    sun.shadow.normalBias = 0.04;
    sun.shadow.radius = 2;
    scene.add(hemi, sun, sun.target);
    scene.environment = group.parent.environment;
    scene.environmentIntensity = 0.8;
    renderer ||= new WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setSize(innerWidth, innerHeight);
    renderer.toneMapping = sourceRenderer.toneMapping;
    renderer.toneMappingExposure = COAST.exposure;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = sourceRenderer.shadowMap.type;
    const canvas = renderer.domElement;
    canvas.style.cssText = "display:block;width:100%;height:100%;touch-action:none";
    dialog.prepend(canvas);
    const camera = new PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 1800);
    const target = new Vector3(-18, 3.5, -34);
    let yaw = -0.65,
      elevation = 0.08,
      distance = 32,
      dragging = false,
      lastX = 0,
      lastY = 0;
    const updateCamera = () => {
      camera.position.set(
        target.x + Math.sin(yaw) * distance,
        Math.max(0.8, target.y + Math.sin(elevation) * distance),
        target.z + Math.cos(yaw) * distance,
      );
      camera.lookAt(target);
    };
    canvas.onpointerdown = (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
      e.stopPropagation();
    };
    canvas.onpointermove = (e) => {
      if (!dragging) return;
      yaw -= (e.clientX - lastX) * 0.004;
      elevation = Math.max(-0.07, Math.min(0.65, elevation + (e.clientY - lastY) * 0.003));
      lastX = e.clientX;
      lastY = e.clientY;
      e.stopPropagation();
    };
    canvas.onpointerup = canvas.onpointercancel = () => {
      dragging = false;
    };
    canvas.onwheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      distance = Math.max(13, Math.min(65, distance + e.deltaY * 0.025));
    };
    dialog.showModal();
    let last = performance.now();
    const animate = () => {
      if (!renderer) return;
      const now = performance.now();
      uniforms.uCoastTime.value += Math.min(0.05, (now - last) / 1000);
      last = now;
      if (
        canvas.width !== Math.floor(innerWidth * renderer.getPixelRatio()) ||
        canvas.height !== Math.floor(innerHeight * renderer.getPixelRatio())
      ) {
        renderer.setSize(innerWidth, innerHeight);
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
      }
      updateCamera();
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();
  }
  return { open, close: () => dialog.open && dialog.close() };
}
