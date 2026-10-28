import { localizeText } from "../local/language.js";
import { MODES, UTC_DAY, dailySeed } from "./rules.js";
import { t } from "./messages.js";
import { LESSONS, LESSON_COUNT, lessonText } from "./lessons.js";
const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
export function createDrivingUI(api) {
  if (!document.getElementById("driving-styles")) {
    const stylesheet = el("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "/assets/driving.css";
    document.head.append(stylesheet);
  }
  const launcher = el("button", "drive-launcher");
  launcher.id = "driving-hub-button";
  launcher.type = "button";
  document.getElementById("play-btn").after(launcher);
  const selected = el("p", "drive-selected");
  launcher.after(selected);
  const dialog = el("dialog", "drive-hub");
  dialog.id = "driving-hub";
  const top = el("div", "drive-dialog-top"),
    title = el("h2"),
    close = el("button", "drive-close");
  close.type = "button";
  close.onclick = () => dialog.close();
  top.append(title, close);
  const intro = el("p", "drive-muted"),
    grid = el("div", "drive-mode-grid");
  const cards = new Map();
  for (const mode of MODES) {
    const button = el("button", "drive-mode");
    button.type = "button";
    button.dataset.mode = mode;
    button.append(el("strong"), el("span"));
    button.onclick = () => {
      api.selectMode(mode);
      render();
    };
    cards.set(mode, button);
    grid.append(button);
  }
  const lessonBar = el("div", "drive-lessons");
  for (let i = 0; i < LESSON_COUNT; i++) {
    const b = el("button");
    b.type = "button";
    b.dataset.lesson = String(i);
    b.textContent = String(i + 1);
    b.onclick = () => {
      api.selectLesson(i);
      render();
    };
    lessonBar.append(b);
  }
  const lessonButtons = [...lessonBar.children];
  const coreIntro = el("p", "drive-muted", "推荐先完成三节基础训练，之后即可自由驾驶。");
  const coreLessons = el("div", "core-lessons"),
    advanced = el("details", "item-lessons");
  const itemGrid = el("div", "item-lesson-grid");
  coreLessons.append(...lessonButtons.slice(0, 3));
  itemGrid.append(...lessonButtons.slice(3));
  localizeText(
    coreIntro,
    coreIntro.textContent,
    "Start with three core lessons, then enjoy free driving.",
  );
  advanced.append(
    localizeText(el("summary"), "道具专项训练 · 选学", "Item training · Optional"),
    itemGrid,
  );
  lessonBar.append(coreIntro, coreLessons, advanced);
  const settings = el("fieldset", "drive-settings"),
    legend = el("legend");
  settings.append(legend);
  const toggles = new Map();
  for (const key of ["coaching", "feedback", "fairTraffic"]) {
    const label = el("label"),
      input = el("input"),
      text = el("span");
    input.type = "checkbox";
    input.id = "drive-" + key;
    input.onchange = () => {
      api.toggle(key, input.checked);
      render();
    };
    label.append(input, text);
    settings.append(label);
    toggles.set(key, { input, text });
  }
  const start = el("button", "drive-start");
  start.type = "button";
  start.onclick = async () => {
    dialog.close();
    await api.start();
  };
  const boardTitle = el("h3"),
    filters = el("div", "drive-board-filters");
  boardTitle.className = "drive-board-heading";
  let category = "pure";
  const filterButtons = new Map();
  for (const key of ["pure", "assisted", "practice", "legacy"]) {
    const b = el("button");
    b.type = "button";
    b.onclick = () => {
      category = key;
      renderBoard();
    };
    filters.append(b);
    filterButtons.set(key, b);
  }
  const board = el("div", "drive-board");
  board.id = "driving-board";
  const note = el("p", "drive-muted");
  dialog.append(top, intro, grid, lessonBar, settings, start, boardTitle, filters, board, note);
  document.body.append(dialog);
  const coach = el("div", "drive-coach");
  coach.id = "driving-coach";
  coach.setAttribute("role", "status");
  const coachLabel = el("strong"),
    coachText = el("span"),
    bar = el("progress");
  bar.max = 1;
  coach.append(coachLabel, coachText, bar);
  const trainingAction = el("button", "training-action");
  trainingAction.id = "training-action";
  trainingAction.type = "button";
  trainingAction.onclick = () => api.trainingAction();
  trainingAction.addEventListener("keydown", (e) => e.stopPropagation());
  trainingAction.addEventListener("keyup", (e) => e.stopPropagation());
  coach.append(trainingAction);
  const feedback = el("div", "drive-feedback");
  feedback.id = "driving-feedback";
  feedback.setAttribute("role", "status");
  feedback.setAttribute("aria-live", "polite");
  const landing = el("div", "drive-landing");
  landing.id = "driving-landing";
  const warning = el("div", "drive-warning");
  warning.id = "driving-warning";
  document.body.append(coach, feedback, landing, warning);
  // On small screens reserve space for the top hint above the existing HUD.
  new ResizeObserver(() => {
    document.documentElement.style.setProperty(
      "--driving-coach-height",
      `${Math.ceil(coach.getBoundingClientRect().height)}px`,
    );
  }).observe(coach);
  const summary = el("section", "drive-review");
  summary.id = "driving-review";
  summary.hidden = true;
  const retryButton = document.getElementById("retry-btn"),
    retryLabel = retryButton.querySelector("[data-i18n]") || retryButton.firstElementChild;
  const originalRetry = retryButton.onclick;
  retryLabel?.removeAttribute("data-i18n");
  let reviewAt = 0;
  function resetRetry() {
    if (retryLabel) retryLabel.textContent = t("tryAgain");
    retryButton.onclick = originalRetry;
    retryButton.disabled = false;
  }
  document.getElementById("gameover").querySelector(":scope > div")?.append(summary);
  if (!summary.parentElement) document.getElementById("gameover").append(summary);
  launcher.onclick = () => {
    dialog.classList.remove("academy-only");
    render();
    dialog.showModal();
    close.focus();
  };
  function openBoard() {
    dialog.classList.remove("academy-only");
    render();
    if (!dialog.open) dialog.showModal();
    boardTitle.scrollIntoView({ block: "start" });
  }
  document.getElementById("go-rank-btn").onclick = openBoard;
  const originalBoardToggle = document.querySelector('summary[aria-controls="lb-menu-content"]');
  const boardCaption = el("span", "drive-board-caption");
  const oldTitle = document.getElementById("lb-menu-title");
  if (originalBoardToggle && oldTitle) {
    oldTitle.hidden = true;
    oldTitle.after(boardCaption);
    originalBoardToggle.onclick = (event) => {
      event.preventDefault();
      openBoard();
    };
  }
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener("keydown", (e) => e.stopPropagation());
  function renderBoard() {
    const prefs = api.preferences();
    if (prefs.mode === "academy" && ["pure", "assisted"].includes(category)) category = "practice";
    if (prefs.mode !== "academy" && category === "practice") category = "pure";
    const mode = category === "legacy" ? "legacy" : prefs.mode;
    const rows = api.board({
      mode,
      category,
      day: UTC_DAY(),
      ruleset: mode === "legacy" ? null : api.options().ruleset,
    });
    for (const [key, button] of filterButtons) {
      button.textContent = t(key);
      button.hidden =
        key === "practice"
          ? prefs.mode !== "academy"
          : ["pure", "assisted"].includes(key) && prefs.mode === "academy";
      button.setAttribute("aria-pressed", String(category === key));
    }
    board.replaceChildren();
    if (!rows.length) {
      board.append(el("p", "drive-muted", t("empty")));
      return;
    }
    rows.forEach((r, i) => {
      const row = el("div", "drive-record");
      row.append(
        el(
          "span",
          "",
          category === "practice" ? `L${(r.lesson || 0) + 1}` : String(i + 1).padStart(2, "0"),
        ),
        el("strong", "", `${r.score.toLocaleString()} ${t("points")}`),
        el(
          "span",
          "",
          `${r.distance} ${t("distance")} · ${Number(r.duration).toFixed(1)} ${t("seconds")}`,
        ),
      );
      board.append(row);
    });
  }
  function render() {
    const prefs = api.preferences(),
      profile = api.profile();
    launcher.textContent = t("hub");
    boardCaption.textContent = t("boards");
    selected.textContent = `${t("selected")} · ${t(prefs.mode)}${prefs.mode === "academy" ? " · " + t("lesson", { n: prefs.lesson + 1 }) : ""}`;
    title.textContent = t(dialog.classList.contains("academy-only") ? "academy" : "title");
    close.textContent = t("close");
    intro.textContent = dialog.classList.contains("academy-only")
      ? prefs.lesson < 3
        ? t("lesson" + prefs.lesson)
        : lessonText(prefs.lesson, "prompt", document.documentElement.lang === "en") +
          " · " +
          t("trainingFree")
      : prefs.mode === "daily"
        ? t("dailyCode", { day: UTC_DAY(), seed: dailySeed(UTC_DAY()) })
        : t("intro");
    for (const [mode, button] of cards) {
      button.querySelector("strong").textContent = t(mode);
      button.querySelector("span").textContent = t(mode + ".desc");
      button.setAttribute("aria-pressed", String(prefs.mode === mode));
    }
    lessonBar.hidden = prefs.mode !== "academy";
    lessonBar.setAttribute(
      "aria-label",
      profile.lesson >= LESSON_COUNT
        ? t("graduated")
        : t("lesson", { n: Math.min(LESSON_COUNT, profile.lesson + 1) }),
    );
    [...lessonBar.querySelectorAll("button[data-lesson]")].forEach((b, i) => {
      b.textContent = `${String(i + 1).padStart(2, "0")} · ${lessonText(i, "title", document.documentElement.lang === "en")}${profile.trainingClaims.includes(i) ? " ✓" : ""}`;
      b.setAttribute("aria-pressed", String(i === prefs.lesson));
    });
    legend.textContent = t("modules");
    for (const [key, { input, text }] of toggles) {
      input.checked = api.options().features[key];
      input.disabled = prefs.mode !== "free";
      text.textContent = t(key);
    }
    start.textContent = t("start");
    boardTitle.textContent = t("boards");
    note.textContent = t(dialog.classList.contains("academy-only") ? "trainingFree" : "localNote");
    renderBoard();
  }
  function live(state) {
    const inRun = state.screen === "game" && state.playing;
    coach.hidden = !inRun || !state.coach;
    document.body.classList.toggle("driving-coach-visible", !coach.hidden);
    if (state.coach) {
      coachLabel.textContent = state.label;
      coachText.textContent = state.coach.replaceAll(
        "空格",
        document.documentElement.dataset.jumpKeyLabel || "空格",
      );
      bar.value = state.progress;
    }
    feedback.hidden = !inRun || !state.toast;
    feedback.textContent = state.toast || "";
    trainingAction.hidden = !inRun || !state.trainingAction;
    if (state.trainingAction) {
      trainingAction.textContent = state.trainingAction.text;
      trainingAction.disabled = !state.trainingAction.enabled;
    }
    landing.hidden = !inRun || !state.landing;
    landing.textContent = state.landing || "";
    landing.classList.toggle("aligned", !!state.aligned);
    warning.hidden = !inRun || !state.warning;
    warning.textContent = state.warning || "";
    document.body.classList.toggle("drive-low-air", inRun && state.lowAir);
  }
  function review(data) {
    summary.hidden = false;
    summary.replaceChildren();
    if (data.mode === "academy") {
      document.getElementById("gameover").dataset.training = "true";
      reviewAt = performance.now();
      if (retryLabel)
        retryLabel.textContent = data.success
          ? t(
              data.nextLesson < LESSON_COUNT
                ? data.lesson + 1 < LESSON_COUNT
                  ? "nextLesson"
                  : "continueAcademy"
                : "finishAcademy",
            )
          : t("tryAgain");
      retryButton.onclick = async () => {
        if (retryButton.disabled) return;
        retryButton.disabled = true;
        try {
          await api.continueCourse();
        } finally {
          retryButton.disabled = false;
        }
      };
      document.getElementById("go-rank-btn").hidden = true;
      document.getElementById("share-btn").hidden = true;
      document.getElementById("go-rank").textContent = t("practiceOnly");
    } else {
      delete document.getElementById("gameover").dataset.training;
      resetRetry();
      document.getElementById("go-rank-btn").hidden = false;
      document.getElementById("share-btn").hidden = false;
    }
    summary.append(el("h3", "", t(data.mode === "academy" ? "lessonReview" : "result")));
    if (data.mode === "academy")
      summary.append(
        el(
          "strong",
          "drive-result",
          lessonText(data.lesson, "title", document.documentElement.lang === "en"),
        ),
      );
    if (!["classic", "free", "academy"].includes(data.mode))
      summary.append(
        el(
          "strong",
          "drive-result",
          t(data.success ? (data.mode === "academy" ? "lessonComplete" : "success") : "retry"),
        ),
      );
    if (data.mode !== "academy")
      summary.append(
        el(
          "p",
          "",
          `${t("best")} · ${t(data.metrics.bestAction)}  +${Math.round(data.metrics.bestActionPoints)}  |  ${t("combo")} ×${data.metrics.maxCombo}`,
        ),
        el("p", "", data.failureReason || `${t("tip")} · ${t(data.advice)}`),
      );
    if (data.mode === "academy")
      summary.append(
        el(
          "p",
          "",
          data.success
            ? t(data.nextLesson < LESSON_COUNT ? "objectivesComplete" : "academyComplete")
            : data.lesson < 3
              ? t("lesson" + data.lesson)
              : lessonText(data.lesson, "prompt", document.documentElement.lang === "en"),
        ),
      );
    if (data.trainingReward)
      summary.append(el("p", "drive-result", t("trainingReward", { n: data.trainingReward })));
    if (data.mode === "academy" && data.lesson === 2 && data.success) {
      const free = el("button", "drive-start", "基础训练完成 · 开始自由驾驶");
      free.type = "button";
      free.onclick = async () => {
        api.selectMode("free");
        await api.start();
      };
      summary.append(free);
    }
    if (data.mode === "academy" && data.success && data.nextLesson < LESSON_COUNT)
      summary.append(
        el(
          "p",
          "drive-next",
          t("upNext") +
            " · " +
            lessonText(data.nextLesson, "title", document.documentElement.lang === "en"),
        ),
      );
    if (data.metrics.demo?.coinDouble) summary.append(el("p", "drive-result", t("doubleDemo")));
  }
  addEventListener(
    "keydown",
    (event) => {
      if (
        !["Space", "Enter"].includes(event.code) ||
        event.repeat ||
        !api.lastReview() ||
        api.lastReview().mode !== "academy" ||
        document.getElementById("gameover").classList.contains("hidden") ||
        document.querySelector("dialog[open]")
      )
        return;
      if (event.target.closest?.("input,select,textarea,a[href]")) return;
      const button = event.target.closest?.("button");
      if (button && button !== retryButton) {
        event.stopImmediatePropagation();
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      if (performance.now() - reviewAt > 650) retryButton.click();
    },
    true,
  );
  new MutationObserver(() => {
    render();
    if (api.lastReview()) review(api.lastReview());
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  render();
  live({});
  return {
    render,
    live,
    review,
    dialog,
    openAcademy: () => {
      dialog.classList.add("academy-only");
      api.selectMode("academy");
      if (api.preferences().lesson >= 3) api.selectLesson(0);
      lessonBar.querySelector("details").open = false;
      render();
      dialog.showModal();
      close.focus();
    },
    openBoard,
    clearReview: () => {
      summary.hidden = true;
      delete document.getElementById("gameover").dataset.training;
      resetRetry();
      document.getElementById("go-rank-btn").hidden = false;
      document.getElementById("share-btn").hidden = false;
    },
  };
}
