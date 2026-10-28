import { homeStyles } from "./home-styles.js";
import { minimalHomeStyles } from "./minimal-home-styles.js";
import { installSpaceMenu } from "../scenery/space-menu.js";
import { currentLanguage, localizeText, localizeAria } from "./language.js";
import { createScenePicker } from "./scene-picker.js";
import { scenePickerStyles } from "./scene-picker-styles.js";

const node = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
};

export function installHome(context, driving, scenery, starRing, gravityFlip) {
  const presentation = installSpaceMenu(context.showroom, context.renderer, {
    sound: context.sound,
    settings: context.settings,
    isHome: () =>
      context.getScreen() === "menu" &&
      !document.body.classList.contains("star-ring-active") &&
      !document.body.classList.contains("gravity-flip-active") &&
      !document.querySelector("dialog[open], .modal:not(.hidden), #garage:not(.hidden)"),
  });
  const style = node("style");
  style.id = "minimal-home-styles";
  style.textContent = homeStyles + minimalHomeStyles + scenePickerStyles;
  document.head.append(style);
  const get = (id) => document.getElementById(id),
    menu = get("menu");
  // Retain native IDs and hidden data for save/game compatibility. The visible
  // cover consists solely of the new title and four requested entry points.
  const legacy = node("div");
  legacy.id = "legacy-menu-data";
  legacy.hidden = true;
  legacy.style.display = "none";
  for (const child of [...menu.children]) legacy.append(child);
  menu.append(legacy);
  menu.classList.add("minimal-home");
  const shell = node("main", "minimal-shell"),
    panel = node("section", "minimal-panel");
  const title = node("h1", "minimal-title");
  title.id = "game-title";
  title.append(
    localizeText(node("span"), "特斯拉", "Tesla"),
    localizeText(node("strong"), "音乐跑酷", "Music Run"),
  );
  const line = node("p", "minimal-tagline", "随音乐出发，让每次飞跃更尽兴。");
  localizeText(line, "随音乐出发，让每次飞跃更尽兴。", "Follow the music. Make every leap count.");
  const nav = node("nav", "minimal-actions");
  localizeAria(nav, "主菜单", "Main menu");
  const play = get("play-btn"),
    academy = node("button"),
    help = get("help-btn"),
    settings = get("settings-btn");
  academy.id = "home-academy";
  academy.type = "button";
  localizeText(academy, "教学引导", "Tutorial");
  academy.onclick = () => driving.ui.openAcademy();
  for (const [button, label, english] of [
    [play, "开始游戏", "Start Game"],
    [help, "操作指南", "Controls"],
    [settings, "设置", "Settings"],
  ]) {
    button.removeAttribute("data-i18n");
    localizeText(button, label, english);
    button.type = "button";
  }
  const scenePicker = createScenePicker(
    scenery,
    async (selected, replayBest = false) => {
      if (selected === "gravityFlip") {
        await gravityFlip.launch();
        return;
      }
      if (selected === "starRing") {
        await starRing.launch({ replayBest });
        return;
      }
      driving.selectMode("free");
      driving.ui.render();
      await driving.start();
    },
    () => starRing.ghostStatus(),
  );
  play.onclick = () => scenePicker.open();
  nav.append(play, academy, help, settings);
  panel.append(title, line, nav);
  shell.append(panel);
  menu.append(shell, get("language-toggle"));
  const legacyToast = get("toast");
  new MutationObserver(() => {
    legacyToast.classList.toggle(
      "unrelated-reward",
      /^(任务完成|Quest complete)/i.test(legacyToast.textContent),
    );
  }).observe(legacyToast, { childList: true, subtree: true, characterData: true });
  // Schedule from the visible menu, including a return from gameplay.
  let menuVisible = false;
  const loading = get("loading");
  const updateEntry = () => {
    const visible =
      context.getScreen() === "menu" &&
      !menu.classList.contains("hidden") &&
      (!loading || loading.classList.contains("hidden"));
    if (visible && !menuVisible) presentation.entry.arm();
    menuVisible = visible;
  };
  const entryObserver = new MutationObserver(updateEntry);
  entryObserver.observe(menu, { attributes: true, attributeFilter: ["class"] });
  if (loading) entryObserver.observe(loading, { attributes: true, attributeFilter: ["class"] });
  updateEntry();
  const helpTitle = get("help").querySelector(".modal-title");
  helpTitle.removeAttribute("data-i18n");
  localizeText(helpTitle, "操作指南", "Controls");
  const helpHint = node(
    "p",
    "modal-desc",
    "首次点击页面后启用声音；音效、音乐与静音可在设置中调整。点击开始游戏或按空格选择场景，再开始驾驶。左右方向键变道。",
  );
  localizeText(
    helpHint,
    helpHint.textContent,
    "Click any menu button to enable sound. Adjust music, effects and mute in Settings. Choose Start Game or press Space to select a scene. Use the arrow keys to change lanes.",
  );
  get("help").querySelector(".modal-card").append(helpHint);

  // Source/author and third-party license notices remain accessible in settings.
  // The standalone adapter replaces this fallback with its embedded notices.
  const infoSlot = node("div", "minimal-info-slot");
  infoSlot.id = "space-save-slot";
  const source = node("button", "", "作品来源与许可");
  localizeText(source, "作品来源与许可", "Sources and licenses");
  source.type = "button";
  source.onclick = () => get("about-game-btn").click();
  infoSlot.append(source);
  const settingsCard = get("settings").querySelector(".modal-card");
  settingsCard.insertBefore(infoSlot, settingsCard.querySelector(".modal-buttons"));
  const settingHint = node(
    "p",
    "modal-desc",
    "首次点击任意入口即可启用音效。按 M 键也可切换静音。",
  );
  localizeText(
    settingHint,
    settingHint.textContent,
    "Click any menu button to enable sound. Press M to toggle mute.",
  );
  settingsCard.insertBefore(settingHint, infoSlot);

  for (const type of ["keydown", "keyup"])
    menu.addEventListener(type, (event) => {
      if (event.target.closest("button") && ["Space", "Enter"].includes(event.code))
        event.stopPropagation();
    });
  addEventListener(
    "keydown",
    (event) => {
      if (
        context.getScreen() !== "menu" ||
        event.repeat ||
        !["Space", "Enter"].includes(event.code) ||
        event.target.closest("button,input,select,textarea") ||
        document.querySelector("dialog[open], .modal:not(.hidden)")
      )
        return;
      event.preventDefault();
      event.stopImmediatePropagation();
      play.click();
    },
    true,
  );
  const refresh = () => {
    document.body.classList.toggle("home-visible", context.getScreen() === "menu");
    document.title = currentLanguage() === "zh" ? "特斯拉音乐跑酷" : "Tesla Music Run";
  };
  refresh();
  setInterval(refresh, 350);
}
