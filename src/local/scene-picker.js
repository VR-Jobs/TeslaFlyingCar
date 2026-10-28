import { PLANETS, planetChoice, savePlanetChoice } from "../star-ring/planet-rules.js";
import PREVIEWS from "../assets/scene-preview-data.js";

const SCENES = [
  { id: "space", title: "黑暗星空", description: "穿过星海，驶向远处的行星。" },
  { id: "coast", title: "浅蓝海岸", description: "清透海水、金色沙滩与椰林。" },
  {
    id: "starRing",
    title: "星环穿梭",
    description: "八大行星航行：倾斜长弯、螺旋升降、分岔飞跃与无限挑战。",
  },
];

export function createScenePicker(scenery, start, ghostStatus = () => null) {
  const dialog = document.createElement("dialog");
  dialog.id = "scene-picker";
  dialog.className = "scene-picker";
  dialog.setAttribute("aria-labelledby", "scene-picker-title");
  dialog.setAttribute("aria-describedby", "scene-picker-description");
  const form = document.createElement("form");
  const title = document.createElement("h2");
  title.id = "scene-picker-title";
  title.textContent = "选择场景与玩法";
  const description = document.createElement("p");
  description.id = "scene-picker-description";
  description.className = "scene-picker-description";
  description.textContent = "自由跑酷，或挑战吸附与飞跃的星环赛道。";
  const choices = document.createElement("fieldset");
  choices.className = "scene-picker-choices";
  const legend = document.createElement("legend");
  legend.textContent = "场景与玩法";
  choices.append(legend);
  const inputs = new Map();
  for (const scene of SCENES) {
    const label = document.createElement("label");
    label.className = "scene-option";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "driving-scene";
    input.value = scene.id;
    input.id = `start-scene-${scene.id}`;
    const card = document.createElement("span");
    card.className = "scene-option-card";
    const art = document.createElement("span");
    art.className = `scene-art scene-art-${scene.id}`;
    art.setAttribute("aria-hidden", "true");
    const preview = document.createElement("img");
    const image = PREVIEWS[scene.id] || PREVIEWS.space;
    preview.src = image.src;
    preview.width = image.width;
    preview.height = image.height;
    preview.alt = "";
    preview.draggable = false;
    preview.decoding = "async";
    art.append(preview);
    const text = document.createElement("span");
    text.className = "scene-option-text";
    const heading = document.createElement("strong");
    heading.textContent = scene.title;
    const caption = document.createElement("span");
    caption.textContent = scene.description;
    text.append(heading, caption);
    card.append(art, text);
    label.append(input, card);
    choices.append(label);
    inputs.set(scene.id, input);
  }
  const planetOptions = document.createElement("div");
  planetOptions.className = "scene-planet-options";
  const planetLabel = document.createElement("label"),
    planetSelect = document.createElement("select");
  planetLabel.textContent = "起始行星";
  planetSelect.id = "start-planet";
  planetSelect.setAttribute("aria-label", "星环起始行星");
  for (const p of [{ id: "random", name: "随机出发" }, ...PLANETS]) {
    const option = document.createElement("option");
    option.value = p.id;
    option.textContent = p.name;
    planetSelect.append(option);
  }
  planetSelect.value = planetChoice();
  planetSelect.onchange = () => savePlanetChoice(planetSelect.value);
  planetLabel.append(planetSelect);
  const planetHint = document.createElement("small");
  planetHint.textContent = "每完成一个区段，继续飞向下一颗行星。";
  planetOptions.append(planetLabel, planetHint);
  const error = document.createElement("p");
  error.className = "scene-picker-error";
  error.setAttribute("role", "alert");
  error.hidden = true;
  const actions = document.createElement("div");
  actions.className = "scene-picker-actions";
  const back = document.createElement("button");
  back.type = "button";
  back.textContent = "返回";
  back.onclick = () => dialog.close();
  const launch = document.createElement("button");
  launch.type = "submit";
  launch.className = "scene-picker-launch";
  launch.textContent = "开始驾驶";
  actions.append(back, launch);
  const replayOption = document.createElement("label"),
    replay = document.createElement("input"),
    replayText = document.createElement("span");
  replay.type = "checkbox";
  replay.id = "start-replay-ghost";
  replay.setAttribute("aria-label", "挑战本地最佳影车");
  replayText.textContent = "挑战本地最佳影车（相同路线）";
  replayOption.append(replay, replayText);
  replayOption.style.cssText =
    "display:flex;gap:8px;align-items:center;font-size:12px;color:#badce9;margin:10px 0";
  const syncReplay = () => {
    const chosen = [...inputs].find(([, i]) => i.checked)?.[0];
    replayOption.hidden = chosen !== "starRing" || !ghostStatus()?.available;
    planetOptions.hidden = chosen !== "starRing";
  };
  for (const input of inputs.values()) input.addEventListener("change", syncReplay);
  form.append(title, description, choices, planetOptions, replayOption, error, actions);
  dialog.append(form);
  document.body.append(dialog);
  let starting = false;
  form.onsubmit = async (event) => {
    event.preventDefault();
    if (starting) return;
    starting = true;
    error.hidden = true;
    choices.disabled = back.disabled = launch.disabled = true;
    launch.textContent = "正在准备场景…";
    try {
      // Let the preparation state paint before the coast is first constructed.
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const selected = [...inputs].find(([, input]) => input.checked)?.[0] || "space";
      if (selected !== "starRing") scenery.select(selected);
      dialog.close();
      await start(selected, selected === "starRing" && replay.checked && !replayOption.hidden);
      try {
        localStorage.setItem("tesla-music.start-choice.v1", selected);
      } catch {}
    } catch (reason) {
      error.textContent = "场景准备失败，请返回后重试。";
      error.hidden = false;
      if (!dialog.open) dialog.showModal();
      console.error(reason);
    } finally {
      starting = false;
      choices.disabled = back.disabled = launch.disabled = false;
      launch.textContent = "开始驾驶";
    }
  };
  dialog.addEventListener("cancel", (event) => {
    if (starting) event.preventDefault();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog || starting) return;
    const box = dialog.getBoundingClientRect();
    if (
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom
    )
      dialog.close();
  });
  for (const type of ["keydown", "keyup"])
    dialog.addEventListener(type, (event) => event.stopPropagation());
  return {
    open() {
      if (dialog.open || starting) return;
      let previous = scenery.status().selected;
      try {
        if (localStorage.getItem("tesla-music.start-choice.v1") === "starRing")
          previous = "starRing";
      } catch {}
      const selected = inputs.has(previous) ? previous : "space";
      inputs.get(selected).checked = true;
      planetSelect.value = planetChoice();
      syncReplay();
      error.hidden = true;
      dialog.showModal();
      inputs.get(selected).focus({ preventScroll: true });
    },
  };
}
