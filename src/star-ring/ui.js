import { currentLanguage } from "../local/language.js";
import { RING_UI_STYLES } from "./ui-styles.js";
import { drivingCue } from "./director.js";
import { rhythmStatus } from "./rhythm.js";
import { createRainbowScreen } from "./rainbow-screen.js";
import { voyageStatus } from "./voyage-rules.js";
import { tutorialCopy } from "./tutorial.js";
import { challengeSummary } from "./endless.js";

export function createRingUI(actions, preferences = {}) {
  const root = document.createElement("section");
  root.id = "star-ring-ui";
  root.tabIndex = -1;
  root.hidden = true;
  root.innerHTML = `
    <div class="ring-screen-fx" aria-hidden="true"><div id="ring-star-overlay"></div><div id="ring-star-flash" class="rainbow"></div></div>
    <div class="ring-top"><button type="button" data-ring="pause">暂停 · P</button><div class="ring-heading"><strong id="ring-heading-title" aria-live="polite">星环穿梭</strong><span id="ring-stage"></span><progress id="ring-progress" max="1" value="0"></progress><button type="button" data-ring="skip" hidden>跳过</button></div><button type="button" data-ring="mute">声音 · M</button></div>
    <div class="ring-readouts"><span id="ring-time" class="mono"></span><span id="ring-score" class="mono"></span><span id="ring-combo"></span><span id="ring-rhythm"></span><span id="ring-ghost-status"></span></div>
    <div class="ring-status-meters meters"><div id="ring-rainbow" class="inv-bar rainbow" hidden><div class="inv-label"><span id="ring-rainbow-copy" class="rainbow-text"></span><span id="ring-rainbow-time" class="mono"></span></div><div class="inv-track"><i id="ring-rainbow-fill"></i></div></div></div>
    <div id="ring-hint"></div><div id="ring-feedback" aria-live="polite"></div>
    <div class="ring-bottom">
      <div class="ring-pressure air">
        <div class="air-label"><span>动力气量 <small id="ring-state"></small></span><strong id="ring-air" class="mono"></strong></div>
        <progress id="ring-energy" class="ring-semantic-progress" aria-label="动力气量" max="100" value="100"></progress>
        <div class="air-bar" aria-hidden="true"><div id="ring-air-fill"></div><div class="air-ticks"></div></div>
        <span id="ring-gap-cue" aria-live="polite" hidden></span>
        <div class="ring-voyage air-sub"><span id="ring-escort"></span><span id="ring-event"></span></div>
      </div>
      <div class="ring-keys">弯轨按住 E 吸附 · 直道松 E 弹射 · 空格跳跃 / 喷气 / 高处再按前翻 · ← → 轻点微调 / 长按转向 / 空中桶滚 · Shift 加速</div>
      <div class="ring-touch"><button type="button" data-hold="left">←</button><button type="button" data-hold="right">→</button><button type="button" data-hold="suction">吸附 E</button><button type="button" data-hold="jump">跳跃 / 喷气</button><button type="button" data-hold="boost">加速</button></div>
    </div>
    <div id="ring-overlay" role="dialog" aria-modal="true" aria-labelledby="ring-overlay-title" aria-describedby="ring-overlay-copy" hidden>
      <div class="ring-modal go-card">
        <div class="ring-modal-summary"><h2 id="ring-overlay-title" class="modal-title"></h2>
        <div id="ring-terminal-stats"><div id="ring-result-score" class="go-score mono"></div><div class="go-stats"><div><span class="k">距离</span><span id="ring-result-distance" class="v mono"></span></div><div><span class="k">时间</span><span id="ring-result-time" class="v mono"></span></div></div></div>
        <p id="ring-overlay-copy" class="modal-desc"></p></div>
        <div id="ring-result" hidden></div>
        <label class="ring-assist"><input id="ring-assist" type="checkbox" checked>起步助航：平直路自动稳定，弯轨仍需按住 E</label>
        <div class="go-actions ring-modal-actions"><div class="go-buttons">
          <button type="button" class="primary" data-ring="resume">继续穿梭</button>
          <button type="button" class="ghost" data-ring="checkpoint">返回检查点 · R</button>
          <button type="button" class="ghost" data-ring="restart">再来一局</button>
          <button type="button" class="ghost" data-ring="menu">菜单</button>
        </div></div>
        <details class="ring-more"><summary>更多选项</summary><div class="go-buttons">
          <button type="button" class="ghost" data-ring="end">结束并结算</button>
          <button type="button" class="ghost" data-ring="replay">挑战最佳影车</button>
          <button type="button" class="ghost" data-ring="tutorial">重学新手教学</button>
        </div></details>
      </div>
    </div>`;
  const style = document.createElement("style");
  style.textContent = RING_UI_STYLES;
  const critical = document.createElement("div");
  critical.id = "ring-critical-cue";
  root.append(critical);
  document.head.append(style);
  document.body.append(root);
  for (const b of root.querySelectorAll("[data-ring]")) b.onclick = () => actions[b.dataset.ring]();
  root.querySelector("#ring-assist").onchange = (e) => actions.assist(e.target.checked);
  for (const b of root.querySelectorAll("[data-hold]")) {
    b.onpointerdown = (e) => {
      e.preventDefault();
      b.setPointerCapture(e.pointerId);
      b.classList.add("is-held");
      actions.hold(b.dataset.hold, true);
    };
    for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
      b.addEventListener(event, () => {
        b.classList.remove("is-held");
        actions.hold(b.dataset.hold, false);
      });
  }
  for (const type of ["keydown", "keyup"])
    root.addEventListener(type, (event) => event.stopPropagation());
  const preparing = document.createElement("div");
  preparing.id = "ring-preparing";
  preparing.hidden = true;
  preparing.setAttribute("role", "status");
  preparing.style.cssText =
    "position:fixed;inset:0;z-index:100;background:#020408f2;color:#fff;place-items:center;font:15px system-ui;text-align:center";
  preparing.innerHTML =
    '<div><p id="ring-preparing-text"></p><progress aria-label="准备场景" style="width:220px;height:4px;accent-color:#e31937"></progress></div>';
  document.body.append(preparing);
  const get = (id) => root.querySelector("#" + id);
  const rainbowScreen = createRainbowScreen(root);
  let modalState = "";
  const action = (name) => root.querySelector('[data-ring="' + name + '"]');
  // Keep keyboard focus in the visible dialog; driving keys are still handled by the manager.
  root.addEventListener("keydown", (event) => {
    if (event.key !== "Tab" || get("ring-overlay").hidden) return;
    const items = [...get("ring-overlay").querySelectorAll("button,input,summary")].filter(
      (node) => !node.disabled && node.getClientRects().length,
    );
    const first = items[0],
      last = items.at(-1);
    if (event.shiftKey && (document.activeElement === first || document.activeElement === root)) {
      event.preventDefault();
      last?.focus();
    } else if (
      !event.shiftKey &&
      (document.activeElement === last || document.activeElement === root)
    ) {
      event.preventDefault();
      first?.focus();
    }
  });
  return {
    root,
    rainbowScreen,
    preparing(value, text = "") {
      preparing.hidden = !value;
      preparing.style.display = value ? "grid" : "none";
      preparing.querySelector("p").textContent = text;
    },
    show(value) {
      root.hidden = !value;
      if (!value) {
        rainbowScreen.reset();
        modalState = "";
      }
      if (value) root.focus();
    },
    update(run, course, paused) {
      rainbowScreen.update(run, paused);
      const teaching = !!run.tutorial?.active;
      const fixedLanes = run.controlMode !== "continuous";
      const keys =
        currentLanguage() === "zh"
          ? `弯轨按住 E 吸附 · 直道松 E 弹射 · 空格跳跃 / 喷气 / 高处再按前翻 · ← → ${fixedLanes ? "每按一次整条换道" : "轻点微调 / 长按转向"} / 空中桶滚 · Shift 加速`
          : `Hold E to grip · Release E on straights to launch · Space jump / jet / flip · ← → ${fixedLanes ? "one press, one lane" : "tap to adjust / hold to steer"} / airborne roll · Shift boost`;
      const keysNode = root.querySelector(".ring-keys");
      if (keysNode.textContent !== keys) keysNode.textContent = keys;
      root.classList.toggle(
        "ring-compact",
        !teaching && preferences.compactHUD !== false && run.time > 8,
      );
      root.querySelector("#ring-critical-cue").textContent = drivingCue(run, course);
      const music = rhythmStatus(run);
      get("ring-rhythm").textContent = teaching
        ? ""
        : music.layer
          ? "♪ 节奏加层"
          : music.step
            ? "♪ " + music.step + " / 3"
            : music.chains
              ? "♪ 三连 ×" + music.chains
              : "";
      get("ring-ghost-status").textContent = run.ghostMatching ? "个人影车" : "";
      const dead = run.phase === "dead",
        dying = run.phase === "dying";
      root.classList.toggle("ring-dead", dead);
      root.querySelector("[data-ring=pause]").disabled = dead;
      const lesson = teaching
        ? tutorialCopy(run.tutorial, matchMedia("(any-pointer:coarse),(max-width:700px)").matches)
        : null;
      root.classList.toggle("ring-teaching", teaching);
      const heading = lesson?.title || (run.endless ? "星环穿梭 · 无限挑战" : "星环穿梭");
      const summary = challengeSummary(run, course);
      if (get("ring-heading-title").textContent !== heading)
        get("ring-heading-title").textContent = heading;
      root.querySelector("[data-ring=skip]").hidden = !teaching || paused;
      const difficulty =
        currentLanguage() === "zh"
          ? fixedLanes
            ? "简单 · 固定换道"
            : "困难 · 连续转向"
          : fixedLanes
            ? "Easy · Fixed lanes"
            : "Hard · Continuous steering";
      const destination =
        (run.planetName ? run.planetName + " · " : "") +
        difficulty +
        " · " +
        (run.routeId ? "外环捷径" : course.frame(run.s).title);
      const stage =
        lesson?.copy ||
        (run.endless
          ? "第 " +
            (run.laps + 1) +
            " 区段 · " +
            destination +
            " · " +
            Math.floor(summary.distance).toLocaleString() +
            " m"
          : destination + " · " + Math.floor(run.s) + " / " + Math.round(course.length) + " m");
      if (get("ring-stage").textContent !== stage) get("ring-stage").textContent = stage;
      get("ring-progress").value = lesson?.progress ?? run.s / course.length;
      get("ring-progress").setAttribute(
        "aria-label",
        teaching ? "新手教学进度" : run.endless ? "当前区段进度" : "赛道进度",
      );
      for (const button of root.querySelectorAll("[data-hold]"))
        button.disabled = teaching && button.dataset.hold !== "suction";
      get("ring-time").textContent = (run.time + run.penalty).toFixed(1) + " 秒";
      get("ring-score").textContent = Math.floor(run.score) + " 分";
      get("ring-combo").textContent = run.combo > 1 ? "连击 ×" + run.combo : "";
      get("ring-state").textContent =
        run.attached && rainbowScreen.status().edge
          ? "彩虹强吸附"
          : run.attached
            ? run.input.suction
              ? "强吸附"
              : "贴轨 / 助航"
            : run.input.jump
              ? "喷气修正"
              : "离轨飞行";
      if (run.attached && run.steering?.active && Math.abs(run.steering.direction) > 0)
        get("ring-state").textContent += run.steering.direction < 0 ? " · 左弯修正" : " · 右弯修正";
      const pressure = Math.max(0, Math.min(100, run.pressure));
      get("ring-air").textContent = Math.ceil(pressure) + "%";
      get("ring-air-fill").style.transform = "scaleX(" + pressure / 100 + ")";
      get("ring-energy").parentElement.classList.toggle("infinite", rainbowScreen.status().edge);
      const stars = run.escort?.count || 0,
        event = voyageStatus(run);
      get("ring-escort").textContent = teaching
        ? ""
        : "护航 " +
          "◆".repeat(stars) +
          "◇".repeat(3 - stars) +
          (stars === 0 ? " · E 收集" : " · 弹射释放");
      get("ring-event").textContent = teaching ? "" : event.notice || event.label;
      const grip = run.gripWarningLevel || 0;
      get("ring-energy").parentElement.classList.toggle("grip-warning", grip > 0.05);
      const cueOnly = "";
      if (get("ring-gap-cue").textContent !== cueOnly) get("ring-gap-cue").textContent = cueOnly;
      get("ring-gap-cue").dataset.state = grip > 0.05 ? "grip" : run.gapCue?.state || "off";
      get("ring-energy").value = pressure;
      get("ring-energy").parentElement.classList.toggle("low", run.pressure < 20);
      get("ring-hint").textContent =
        !dead &&
        !dying &&
        run.messageTime > 0 &&
        !root.querySelector("#ring-critical-cue").textContent
          ? run.message
          : "";
      get("ring-feedback").textContent =
        !dead && !dying && run.feedbackTime > 0 ? run.feedback : "";
      const finished = run.phase === "finished";
      const overlayOpen = paused || finished || dead;
      root.classList.toggle("ring-dialog-open", overlayOpen);
      action("end").hidden = finished || teaching || !run.endless;
      action("tutorial").hidden = finished;
      action("replay").hidden = teaching;
      action("resume").hidden = finished || dead;
      action("checkpoint").hidden = finished;
      action("restart").hidden = paused && !finished && !dead;
      action("checkpoint").textContent = teaching
        ? "重新练习 · R"
        : dead
          ? "重试 · R"
          : "检查点 · R";
      action("restart").textContent = finished ? "再来一局" : "新路线挑战";
      for (const name of ["resume", "checkpoint", "restart"]) {
        const primary = name === (dead ? "checkpoint" : finished ? "restart" : "resume");
        action(name).classList.toggle("primary", primary);
        action(name).classList.toggle("ghost", !primary);
      }
      get("ring-overlay").hidden = !overlayOpen;
      get("ring-terminal-stats").hidden = !finished && !dead;
      get("ring-result").hidden = !finished;
      get("ring-assist").parentElement.hidden = finished || dead;
      get("ring-assist").checked = run.assist !== false;
      root.classList.toggle("ring-recovering", run.phase === "rescue");
      if (overlayOpen) {
        get("ring-overlay-title").textContent = dead
          ? /撞到|碰到/.test(run.death?.reason || "")
            ? "发生碰撞"
            : "失去吸附"
          : finished
            ? run.endless
              ? "挑战完成"
              : "星环穿梭完成"
            : "已暂停";
        get("ring-overlay-copy").textContent = dead
          ? (run.death?.reason || "未能接轨") + "。可从检查点继续挑战。"
          : finished
            ? run.endless
              ? "本次无限挑战已结算"
              : "完成贴壁、绕环与飞跃"
            : "弯轨按住 E，直道松开弹射；越过断口后按住 E 重新接轨。";
        get("ring-result-score").textContent = Math.floor(run.score).toLocaleString();
        get("ring-result-distance").textContent =
          Math.floor(summary.distance).toLocaleString() + " m";
        const seconds = Math.floor(run.time + run.penalty);
        get("ring-result-time").textContent =
          Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
      }
      const nextModal = dead ? "dead" : finished ? "finished" : paused ? "paused" : "";
      root.dataset.panel = nextModal;
      if (nextModal !== modalState) {
        root.querySelector(".ring-more").open = false;
        if (nextModal)
          action(dead ? "checkpoint" : finished ? "restart" : "resume").focus({
            preventScroll: true,
          });
        else if (modalState) root.focus({ preventScroll: true });
        modalState = nextModal;
      }
    },
    result(run, reward, profile) {
      const time = run.time + run.penalty;
      const medal = run.endless
        ? "完成 " + run.laps + " 个区段"
        : !run.falls && !run.collisions && time < 105
          ? "星环大师"
          : run.falls <= 2 && time < 120
            ? "平稳穿梭"
            : "星环旅人";
      const record = run.endless
        ? "最远纪录 " +
          Math.floor(profile.bestEndlessDistance || 0).toLocaleString() +
          " m · 最高 " +
          Math.floor(profile.bestEndlessScore || 0).toLocaleString() +
          " 分"
        : "个人纪录 " +
          (profile.bestTime || time).toFixed(1) +
          " 秒 · " +
          (profile.bestScore || 0).toLocaleString() +
          " 分";
      get("ring-result").innerHTML = `
        <div class="go-rank">${medal}</div>
        <div class="ring-result-metrics"><span>收集 <b>${run.rings}</b></span><span>接轨 <b>${run.lands}</b></span><span>特技 <b>${run.tricks}</b></span></div>
        <p class="ring-record-line">${record}</p>
        <div class="go-rewards"><div class="go-coins"><svg class="coin" aria-hidden="true"><use href="#i-coin" /></svg><span class="k">获得金币</span><span class="v mono">+${reward}</span></div></div>
        <details class="ring-result-details"><summary>本局驾驶复盘</summary><p>捷径 ${run.adventure?.branches || 0} 次 · 三连环 ${run.adventure?.chains || 0} 次</p><p>节奏三连 ${run.rhythm?.chains || 0} 次 · 踩拍 ${run.beatHits}</p><p>恢复 ${run.falls} 次 · 擦碰 ${run.collisions} 次</p>${run.endless ? "" : "<p>解锁「星环银蓝」涂装</p>"}</details>`;
      get("ring-result").hidden = false;
    },
  };
}
