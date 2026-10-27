import { installCoastScene } from "./coast.js";
export function createLazyCoast(context) {
  let instance = null;
  return {
    select(name) {
      if (!instance && name !== "coast") return;
      instance ||= installCoastScene(context);
      instance.select(name);
    },
    status: () =>
      instance
        ? { ...instance.status(), initialized: true }
        : { selected: "original", initialized: false, palms: 0 },
  };
}
