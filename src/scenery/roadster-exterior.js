import {
  B as Group,
  R as Mesh,
  Jr as BufferGeometry,
  L as Float32BufferAttribute,
  H as MeshStandardMaterial,
  yu as MeshPhysicalMaterial,
  ci as BoxGeometry,
  P as Vector3,
} from "../vendor/rendering.js";
import DATA from "../assets/roadster-exterior-data.js";

function decode(text, Type) {
  const bytes = Uint8Array.from(atob(text), (c) => c.charCodeAt(0));
  return new Type(bytes.buffer);
}

// The same evaluated Blender mesh is used by the native source and the game.
const geometryCache = new WeakMap();
export function createRoadsterExterior(materials, data = DATA) {
  const n = materials;
  Object.assign(n.body, {
    roughness: 0.24,
    metalness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
  });
  n.body.color.set("#e3e7eb");
  Object.assign(n.wing, { roughness: 0.24, metalness: 0.15, clearcoat: 1 });
  n.wing.color.copy(n.body.color);
  n.glass = new MeshPhysicalMaterial({
    color: "#05070a",
    roughness: 0.17,
    metalness: 0.02,
    clearcoat: 0.35,
    clearcoatRoughness: 0.07,
    envMapIntensity: 0.28,
    reflectivity: 0.25,
  });
  const standard = (color, metalness, roughness) =>
    new MeshStandardMaterial({ color, metalness, roughness });
  const palette = {
    paint: n.body,
    glass: n.glass,
    carbon: n.carbon,
    cavity: n.cavity,
    rubber: standard("#22262b", 0.02, 0.78),
    titanium: standard("#d7dce2", 0.55, 0.23),
    spoke: standard("#252c36", 0.84, 0.25),
    brake: standard("#62666c", 0.8, 0.43),
    caliper: standard("#852b23", 0.55, 0.3),
    light: n.headlight,
    red: n.taillight,
    amber: new MeshStandardMaterial({
      color: "#b85b10",
      emissive: "#ff6600",
      emissiveIntensity: 0.7,
    }),
    gold: n.gold,
  };
  n.wheelSpoke = palette.spoke;
  palette.titanium.emissive.set("#080a0d");
  palette.spoke.emissive.set("#030405");
  const slots = {},
    meshes = [];
  for (const [id, origin] of Object.entries(data.origins)) {
    slots[id] = new Group();
    slots[id].name = `Blender Roadster / ${id}`;
    slots[id].position.fromArray(origin);
  }
  for (const item of data.groups) {
    let geometry = geometryCache.get(item);
    if (!geometry) {
      geometry = new BufferGeometry();
      geometry.setAttribute(
        "position",
        new Float32BufferAttribute(decode(item.position, Float32Array), 3),
      );
      geometry.setAttribute(
        "normal",
        new Float32BufferAttribute(
          item.normalEncoding === "snorm16"
            ? Float32Array.from(decode(item.normal, Int16Array), (v) => v / 32767)
            : decode(item.normal, Float32Array),
          3,
        ),
      );
      geometry.setIndex(
        Array.from(decode(item.index, item.indexEncoding === "uint16" ? Uint16Array : Uint32Array)),
      );
      // Native surface shaders use UVs for microdetail; a consistent planar UV
      // supplies this on the texture-free Blender exterior.
      const p = geometry.attributes.position,
        uv = [];
      for (let i = 0; i < p.count; i++) uv.push(p.getX(i), p.getZ(i));
      geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));
      geometryCache.set(item, geometry);
    }
    const material =
      item.slot === "wing" && item.material === "paint" ? n.wing : palette[item.material];
    const mesh = new Mesh(geometry, material);
    mesh.name = `${item.slot} / ${item.material}`;
    mesh.userData.partIds = item.members;
    mesh.castShadow = mesh.receiveShadow = true;
    slots[item.slot].add(mesh);
    meshes.push(mesh);
  }
  const supports = new Group();
  supports.name = "Active wing / independent telescopic attachments";
  const rods = [];
  for (const sign of [-1, 1])
    for (const segment of ["outer", "inner"]) {
      const mesh = new Mesh(
        new BoxGeometry(1, 1, 1),
        segment === "outer" ? palette.spoke : palette.titanium,
      );
      mesh.castShadow = mesh.receiveShadow = true;
      mesh.name = `wing.pylon.${sign}.${segment}`;
      supports.add(mesh);
      meshes.push(mesh);
      rods.push({ mesh, sign, segment });
    }
  const bottom = new Vector3(),
    top = new Vector3(),
    delta = new Vector3(),
    up = new Vector3(0, 1, 0);
  let extension = 0,
    maximumAttachmentGap = 0;
  function setWing(value) {
    extension = Math.max(0, Math.min(1, value));
    slots.wing.position.fromArray(data.wing.pivot);
    slots.wing.position.y += extension * data.wing.lift;
    slots.wing.rotation.x = extension * data.wing.pitch;
    slots.wing.updateMatrix();
    maximumAttachmentGap = 0;
    for (const { mesh, sign, segment } of rods) {
      bottom.set(sign * data.wing.mount[0], data.wing.baseY, data.wing.baseZ ?? 2.065);
      top
        .set(sign * data.wing.mount[0], data.wing.mount[1], data.wing.mount[2])
        .applyMatrix4(slots.wing.matrix);
      if (segment === "outer") top.lerpVectors(bottom, top, 0.58);
      else bottom.lerpVectors(bottom, top, 0.45);
      delta.subVectors(top, bottom);
      const length = delta.length();
      mesh.position.copy(bottom).add(top).multiplyScalar(0.5);
      mesh.quaternion.setFromUnitVectors(up, delta.normalize());
      mesh.scale.set(
        segment === "outer" ? 0.047 : 0.026,
        Math.max(0.006, length),
        segment === "outer" ? 0.069 : 0.045,
      );
      // The upper endpoint is measured from the actual render matrix, not a
      // separate animation formula. Hinge overlap remains bounded at stow.
      mesh.updateMatrix();
      const endpoint = new Vector3(0, 0.5, 0).applyMatrix4(mesh.matrix);
      maximumAttachmentGap = Math.max(maximumAttachmentGap, endpoint.distanceTo(top));
    }
  }
  setWing(0);
  const triangles = data.groups.reduce(
    (sum, g) =>
      sum + decode(g.index, g.indexEncoding === "uint16" ? Uint16Array : Uint32Array).length / 3,
    0,
  );
  return {
    slots,
    supports,
    meshes,
    setWing,
    status: () => ({
      asset: data.schema,
      revision: data.revision ?? "previous-exterior",
      glassColor: n.glass.color.getHexString(),
      groups: data.groups.length,
      triangles,
      extension,
      maximumAttachmentGap,
    }),
  };
}

export function installRoadsterExterior(showroom, data = DATA) {
  const car = showroom.car;
  car.group.traverse((node) => {
    if (node.isMesh) node.visible = false;
  });
  const exterior = createRoadsterExterior(car.materials, data);
  car.body.add(exterior.slots.body, exterior.slots.wing, exterior.supports);
  for (const wheel of car.wheels) {
    const slot = `wheel_${wheel.front ? "F" : "R"}${wheel.wheel.position.x < 0 ? "L" : "R"}`;
    wheel.wheel.position.copy(exterior.slots[slot].position);
    exterior.slots[slot].position.set(0, 0, 0);
    wheel.spin.add(exterior.slots[slot]);
  }
  const nativeWing = car.setWing;
  car.setWing = function (value) {
    nativeWing.call(this, value);
    exterior.setWing(value);
  };
  car.presentationMeshes = exterior.meshes;
  car.setWing(car.wingT || 0);
  return exterior;
}
