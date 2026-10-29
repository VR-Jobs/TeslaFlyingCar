import { EXPEDITIONS, EXPEDITION_IDS } from "../expeditions/catalog.js";
import EXPEDITION_PREVIEWS from "../assets/expedition-previews.js";
import GRAVITY_PREVIEW from "../assets/gravity-preview.js";
import { localizeText, localizeAria } from "./language.js";
import { PLANETS, planetChoice, savePlanetChoice } from "../star-ring/planet-rules.js";
import PREVIEWS from "../assets/scene-preview-data.js";

const SCENES = [
  {
    id: "space",
    title: "黑暗星空",
    en: "Dark Space",
    description: "穿过星海，驶向远处的行星。",
    descriptionEn: "Race through the stars toward distant planets.",
  },
  {
    id: "coast",
    title: "浅蓝海岸",
    en: "Azure Coast",
    description: "清透海水、金色沙滩与椰林。",
    descriptionEn: "Clear blue water, golden sand and palm trees.",
  },
  {
    id: "starRing",
    title: "星环穿梭",
    en: "Star Ring",
    descriptionEn:
      "Visit eight planets on banked curves, spirals, branching jumps and an endless challenge.",
    description: "八大行星航行：倾斜长弯、螺旋升降、分岔飞跃与无限挑战。",
  },
  {
    id: "gravityFlip",
    title: "重力翻面",
    en: "Gravity Flip",
    description: "地面、侧墙、天花板：喷气换面，吸气接轨，挑战四面接力。",
    descriptionEn:
      "Launch between floor, walls and ceiling. Hold E to attach and chain four-surface transfers.",
  },
  ...EXPEDITIONS.map((mode) => ({
    id: mode.id,
    title: mode.zh,
    en: mode.en,
    description: mode.description[0],
    descriptionEn: mode.description[1],
    group: "special",
  })),
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
  localizeText(title, "选择场景与玩法", "Choose Your Adventure");
  const description = document.createElement("p");
  description.id = "scene-picker-description";
  description.className = "scene-picker-description";
  localizeText(
    description,
    "选择驾驶场景，或进入六种奇趣挑战。",
    "Choose a driving scene or one of six special challenges.",
  );
  const tabs = document.createElement("div");
  tabs.className = "scene-mode-tabs";
  tabs.setAttribute("role", "tablist");
  const tabButtons = new Map();
  for (const [id, zh, en] of [
    ["drive", "驾驶与场景 · 4", "Drive & Scenes · 4"],
    ["special", "奇趣挑战 · 6", "Special Modes · 6"],
  ]) {
    const button = document.createElement("button");
    button.type = "button";
    button.id = "scene-tab-" + id;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", "scene-mode-options");
    localizeText(button, zh, en);
    button.onclick = () => switchGroup(id);
    button.onkeydown = (event) => {
      if (["ArrowLeft", "ArrowRight"].includes(event.code)) {
        event.preventDefault();
        event.stopPropagation();
        const target = id === "drive" ? "special" : "drive";
        switchGroup(target);
        tabButtons.get(target).focus();
      }
    };
    tabs.append(button);
    tabButtons.set(id, button);
  }
  const choices = document.createElement("fieldset");
  choices.id = "scene-mode-options";
  choices.className = "scene-picker-choices";
  const legend = document.createElement("legend");
  localizeText(legend, "场景与玩法", "Scenes and modes");
  choices.append(legend);
  const inputs = new Map();
  for (const scene of SCENES) {
    const label = document.createElement("label");
    label.className = "scene-option";
    label.dataset.group = scene.group || "drive";
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
    const image =
      EXPEDITION_PREVIEWS[scene.id] ||
      (scene.id === "gravityFlip" ? GRAVITY_PREVIEW : PREVIEWS[scene.id]) ||
      PREVIEWS.space;
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
    localizeText(heading, scene.title, scene.en);
    const caption = document.createElement("span");
    localizeText(caption, scene.description, scene.descriptionEn);
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
  planetLabel.append(localizeText(document.createElement("span"), "起始行星", "Starting planet"));
  planetSelect.id = "start-planet";
  localizeAria(planetSelect, "星环起始行星", "Starting planet");
  for (const p of [{ id: "random", name: "随机出发" }, ...PLANETS]) {
    const option = document.createElement("option");
    option.value = p.id;
    localizeText(
      option,
      p.name,
      p.id === "random" ? "Random departure" : p.id[0].toUpperCase() + p.id.slice(1),
    );
    planetSelect.append(option);
  }
  planetSelect.value = planetChoice();
  planetSelect.onchange = () => {
    savePlanetChoice(planetSelect.value);
    syncReplay();
  };
  planetLabel.append(planetSelect);
  const planetHint = document.createElement("small");
  localizeText(
    planetHint,
    "航行过程中，继续飞向其他行星。",
    "Continue your voyage toward other planets.",
  );
  planetOptions.append(planetLabel, planetHint);
  const error = document.createElement("p");
  error.className = "scene-picker-error";
  error.setAttribute("role", "alert");
  error.hidden = true;
  const actions = document.createElement("div");
  actions.className = "scene-picker-actions";
  const back = document.createElement("button");
  back.type = "button";
  localizeText(back, "返回", "Back");
  back.onclick = () => dialog.close();
  const launch = document.createElement("button");
  launch.type = "submit";
  launch.className = "scene-picker-launch";
  localizeText(launch, "开始驾驶", "Start Driving");
  actions.append(back, launch);
  const replayOption = document.createElement("label"),
    replay = document.createElement("input"),
    replayText = document.createElement("span");
  replay.type = "checkbox";
  replay.id = "start-replay-ghost";
  localizeAria(replay, "挑战本地最佳影车", "Race your personal best ghost");
  localizeText(replayText, "挑战本地最佳影车（相同路线）", "Race your best ghost (same route)");
  replayOption.append(replay, replayText);
  replayOption.style.cssText =
    "display:flex;gap:8px;align-items:center;font-size:12px;color:#badce9;margin:10px 0";
  const syncReplay = () => {
    const chosen = [...inputs].find(([, i]) => i.checked)?.[0];
    replayOption.hidden = chosen !== "starRing" || !ghostStatus()?.available;
    planetOptions.hidden = !["starRing", "gravityFlip", ...EXPEDITION_IDS].includes(chosen);
    for (const option of planetSelect.options) {
      const p = PLANETS.find((p) => p.id === option.value);
      const en = p ? p.id[0].toUpperCase() + p.id.slice(1) : "Random departure";
      const suffix =
        chosen === "starRing" && p
          ? ["uranus", "neptune"].includes(p.id)
            ? [" · 困难", " · Hard"]
            : [" · 简单", " · Easy"]
          : ["", ""];
      localizeText(option, (p?.name || "随机出发") + suffix[0], en + suffix[1]);
    }
    localizeText(
      planetHint,
      chosen === "starRing"
        ? "水星至土星：简单，每按一次整条换道。天王星、海王星：困难，连续转向。随当前行星切换。"
        : "航行过程中，继续飞向其他行星。",
      chosen === "starRing"
        ? "Mercury–Saturn: easy, one press switches a full lane. Uranus/Neptune: hard, continuous steering. Changes with each destination."
        : "Continue your voyage toward other planets.",
    );
  };
  for (const input of inputs.values()) input.addEventListener("change", syncReplay);
  function switchGroup(group, choose = true) {
    for (const [id, tab] of tabButtons) {
      tab.setAttribute("aria-selected", String(id === group));
      tab.tabIndex = id === group ? 0 : -1;
    }
    for (const label of choices.querySelectorAll(".scene-option"))
      label.hidden = label.dataset.group !== group;
    choices.classList.toggle("special", group === "special");
    choices.setAttribute("aria-labelledby", "scene-tab-" + group);
    if (choose) {
      const selected = [...inputs].find(([, input]) => input.checked)?.[0];
      const scene = SCENES.find((s) => s.id === selected);
      if ((scene?.group || "drive") !== group)
        inputs.get(SCENES.find((s) => (s.group || "drive") === group).id).checked = true;
      syncReplay();
    }
  }
  switchGroup("drive", false);
  form.append(title, description, tabs, choices, planetOptions, replayOption, error, actions);
  dialog.append(form);
  document.body.append(dialog);
  let starting = false;
  form.onsubmit = async (event) => {
    event.preventDefault();
    if (starting) return;
    starting = true;
    error.hidden = true;
    choices.disabled = back.disabled = launch.disabled = true;
    for (const tab of tabButtons.values()) tab.disabled = true;
    localizeText(launch, "正在准备场景…", "Preparing scene…");
    try {
      // Let the preparation state paint before the coast is first constructed.
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const selected = [...inputs].find(([, input]) => input.checked)?.[0] || "space";
      if (!["starRing", "gravityFlip", ...EXPEDITION_IDS].includes(selected))
        scenery.select(selected);
      dialog.close();
      await start(selected, selected === "starRing" && replay.checked && !replayOption.hidden);
      try {
        localStorage.setItem("tesla-music.start-choice.v1", selected);
      } catch {}
    } catch (reason) {
      localizeText(
        error,
        "场景准备失败，请返回后重试。",
        "Could not prepare the scene. Go back and try again.",
      );
      error.hidden = false;
      if (!dialog.open) dialog.showModal();
      console.error(reason);
    } finally {
      starting = false;
      choices.disabled = back.disabled = launch.disabled = false;
      for (const tab of tabButtons.values()) tab.disabled = false;
      localizeText(launch, "开始驾驶", "Start Driving");
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
        const saved = localStorage.getItem("tesla-music.start-choice.v1");
        if (["starRing", "gravityFlip", ...EXPEDITION_IDS].includes(saved)) previous = saved;
      } catch {}
      const selected = inputs.has(previous) ? previous : "space";
      switchGroup(EXPEDITION_IDS.includes(selected) ? "special" : "drive", false);
      inputs.get(selected).checked = true;
      planetSelect.value = planetChoice();
      syncReplay();
      error.hidden = true;
      dialog.showModal();
      inputs.get(selected).focus({ preventScroll: true });
    },
  };
}
