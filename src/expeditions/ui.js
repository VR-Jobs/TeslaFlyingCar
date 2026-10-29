import { currentLanguage } from "../local/language.js";
import { CATALOG, REASONS } from "./catalog.js";
import { MODES } from "./rules.js";
const text = (pair) => pair[currentLanguage() === "zh" ? 0 : 1];
export function createExpeditionUI(actions) {
  const root = document.createElement("section");
  root.id = "expedition-ui";
  root.hidden = true;
  root.tabIndex = -1;
  root.innerHTML = `<div class="exp-top"><button data-exp="pause"></button><div class="exp-heading"><strong id="exp-title"></strong><span id="exp-objective"></span><button data-exp="help"></button></div><button data-exp="mute"></button></div><div class="exp-readouts"><span id="exp-score"></span><span id="exp-distance"></span><span id="exp-combo"></span></div>
 <div class="exp-bottom"><div class="exp-cue"><span id="exp-pulse" aria-hidden="true"></span><div><strong id="exp-status"></strong><span id="exp-detail"></span></div></div><div class="exp-meter"><span id="exp-energy-copy"></span><strong id="exp-energy"></strong><progress id="exp-air" max="100" value="100"></progress></div><div class="exp-progress"><span id="exp-goal"></span><span id="exp-health"></span></div><progress id="exp-progress" max="1" value="0"></progress><p id="exp-keys"></p><div class="exp-touch"><button data-hold="left">←</button><button data-hold="suction">E</button><button data-hold="jump"></button><button data-hold="boost">Shift</button><button data-hold="right">→</button></div></div>
 <div id="exp-overlay" role="dialog" aria-modal="true" aria-labelledby="exp-result-title" hidden><div class="exp-card go-card"><h2 id="exp-result-title"></h2><ol id="exp-instructions"></ol><div id="exp-result-score" class="go-score mono"></div><p id="exp-result-copy"></p><div id="exp-result-stats"></div><div class="exp-actions"><button data-exp="play" class="primary"></button><button data-exp="continue" class="primary"></button><button data-exp="checkpoint"></button><button data-exp="retry"></button><button data-exp="menu"></button></div><button data-exp="end" class="exp-end"></button></div></div>`;
  const style = document.createElement("style");
  style.textContent = `
body.expedition-active #menu.minimal-home:not(.hidden),body.expedition-active #menu,body.expedition-active #hud,body.expedition-active .drive-coach,body.expedition-active .drive-feedback,body.expedition-active .drive-warning,body.expedition-active #quick-restart,body.expedition-active #handling-indicator,body.expedition-active #orbit-ui{display:none!important}
#expedition-ui{position:fixed;inset:0;z-index:46;pointer-events:none;color:#fff;font:13px/1.5 "Noto Sans SC",system-ui,sans-serif;outline:none;isolation:isolate;--exp-accent:#bceafa}#expedition-ui[hidden],#expedition-ui [hidden],#expedition-loading[hidden]{display:none!important}
#expedition-ui button{pointer-events:auto;border:1px solid #ffffff4a;border-radius:5px;background:#080b13da;color:#fff;font:inherit;padding:8px 13px;cursor:pointer}#expedition-ui button:focus-visible{outline:2px solid #fff;outline-offset:3px}
.exp-top{display:flex;gap:12px;justify-content:space-between;align-items:flex-start;padding:16px 22px}.exp-heading{position:relative;width:min(480px,60vw);background:#080b13cf;border:1px solid #ffffff28;border-top:2px solid var(--exp-accent);border-radius:7px;padding:7px 50px 9px;text-align:center}.exp-heading strong{display:block;font-size:17px;letter-spacing:.08em}.exp-heading span{display:block;font-size:11px;color:#c4d5e2}.exp-heading button{position:absolute;right:5px;top:7px;padding:3px 6px!important;font-size:10px!important}.exp-readouts{display:flex;justify-content:center;gap:22px;font:600 13px monospace;text-shadow:0 1px 5px #000}#exp-combo{color:var(--exp-accent)}
.exp-bottom{position:absolute;left:50%;transform:translateX(-50%);bottom:17px;width:min(570px,calc(100vw - 30px));background:#080b13df;border:1px solid #ffffff32;border-radius:8px;padding:10px 14px 8px;box-sizing:border-box}.exp-cue{display:flex;gap:11px;align-items:center;margin-bottom:8px;min-height:35px}.exp-cue strong{display:block;font-size:12px;color:var(--exp-accent)}.exp-cue div>span{display:block;font-size:11px;color:#bdccd6}#exp-pulse{display:block;width:28px;height:28px;flex:0 0 28px;border-radius:50%;border:2px solid var(--exp-accent);background:conic-gradient(var(--exp-accent) calc(var(--cue-value,0)*360deg),#ffffff12 0);box-shadow:0 0 10px #b9e8ff15}.exp-meter{display:flex;flex-wrap:wrap;justify-content:space-between;font-size:11px}.exp-meter progress{width:100%;height:5px;accent-color:#d7f2ff;margin-top:5px}.exp-progress{display:flex;justify-content:space-between;gap:10px;margin-top:5px;font-size:10px;color:#b1c6d7}#exp-progress{width:100%;height:3px;display:block;margin-top:4px;accent-color:var(--exp-accent)}#exp-keys{font-size:9px;color:#acbdcd;text-align:center;margin:7px 0 0}.exp-touch{display:none;gap:7px;justify-content:center;margin-top:8px}.exp-touch button{min-height:42px;min-width:42px;touch-action:none}.exp-touch button.is-held{background:#204735!important;border-color:#b9ffe4!important}
#exp-overlay{position:absolute;inset:0;pointer-events:auto;background:#0009;backdrop-filter:blur(5px);display:grid;place-items:center}.exp-card{box-sizing:border-box;width:min(610px,calc(100vw - 28px));max-height:90dvh;overflow:auto;background:#0b0f15ed!important;border:1px solid #ffffff60!important;padding:28px;text-align:center}.exp-card h2{font-size:25px;margin:0 0 14px}.exp-card ol{text-align:left;padding:0 0 0 22px;margin:15px 0 24px;color:#cfdee8;font-size:13px;line-height:1.8}.exp-card li{margin:9px 0}.exp-card p{font-size:13px;color:#c9d9e5}.exp-card #exp-result-stats{margin:15px 0 20px;font-size:12px;color:#a9c6d9}.exp-actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}.exp-actions button{min-height:45px;flex:1;min-width:120px}.exp-actions .primary{background:#fff!important;color:#090c12!important;border-color:#fff!important}.exp-card.intro .primary{background:#e31937!important;color:#fff!important;border-color:#e31937!important}.exp-end{font-size:11px!important;color:#b8c7d5!important;background:transparent!important;border:0!important;margin-top:15px}
#expedition-loading{position:fixed;inset:0;z-index:112;background:#03060cf5;color:#fff;display:grid;place-items:center;font:15px system-ui}#expedition-loading span{padding:22px 30px;border-bottom:2px solid #e31937}
@media(pointer:coarse){.exp-touch{display:flex}#exp-keys{display:none}}
@media(max-width:600px){.exp-top{padding:10px;gap:6px}.exp-top>button{font-size:10px!important;padding:7px!important}.exp-heading{padding:6px 34px 7px;width:62vw}.exp-heading strong{font-size:14px;letter-spacing:.02em}.exp-heading span{font-size:10px}.exp-heading button{font-size:8px!important;right:3px;top:6px;padding:3px!important}.exp-readouts{font-size:11px;gap:13px}.exp-bottom{bottom:10px;padding:8px 10px}.exp-cue{gap:8px;margin-bottom:6px}.exp-cue strong{font-size:11px}.exp-cue div>span{font-size:10px}.exp-meter,.exp-progress{font-size:10px}.exp-touch{gap:5px}.exp-touch button{padding:7px 9px!important;font-size:11px!important}#exp-keys{font-size:8px}.exp-card{padding:23px}.exp-card h2{font-size:22px}.exp-card ol{font-size:12px}.exp-card .go-score{font-size:60px}}
@media(max-height:480px){.exp-top{padding:6px 12px}.exp-heading strong{font-size:12px}.exp-heading{padding:4px 35px}.exp-readouts{font-size:10px}.exp-bottom{bottom:5px;padding:6px 11px;width:min(500px,calc(100vw - 30px))}.exp-cue{min-height:24px;margin-bottom:4px}.exp-cue strong,.exp-cue div>span{font-size:10px}#exp-pulse{width:22px;height:22px;flex-basis:22px}#exp-keys{display:none}.exp-touch{position:absolute;right:-90px;bottom:0;flex-direction:column}.exp-touch button{min-height:25px;min-width:38px;padding:3px 6px!important}.exp-card{padding:16px 22px}.exp-card ol{font-size:12px;line-height:1.6;margin-bottom:15px}.exp-card li{margin:6px 0}.exp-card h2{font-size:21px;margin-bottom:8px}}
`;
  document.head.append(style);
  document.body.append(root);
  const get = (id) => root.querySelector("#exp-" + id),
    button = (id) => root.querySelector(`[data-exp=${id}]`),
    set = (node, value) => {
      if (node.textContent !== value) node.textContent = value;
    };
  for (const b of root.querySelectorAll("[data-exp]")) b.onclick = () => actions[b.dataset.exp]();
  for (const b of root.querySelectorAll("[data-hold]")) {
    const release = () => {
      b.classList.remove("is-held");
      actions.hold(b.dataset.hold, false);
    };
    b.onpointerdown = (e) => {
      e.preventDefault();
      b.setPointerCapture(e.pointerId);
      b.classList.add("is-held");
      actions.hold(b.dataset.hold, true);
    };
    b.onpointerup = b.onpointercancel = b.onlostpointercapture = release;
  }
  const loading = document.createElement("div");
  loading.id = "expedition-loading";
  loading.hidden = true;
  loading.append(document.createElement("span"));
  document.body.append(loading);
  let previousOverlay = false,
    instructionKey = "";
  return {
    root,
    show(value) {
      root.hidden = !value;
      if (value) root.focus();
    },
    preparing(value, id) {
      loading.hidden = !value;
      loading.firstChild.textContent =
        text(["正在准备 ", "Preparing "]) +
        text([CATALOG.get(id)?.zh || "挑战", CATALOG.get(id)?.en || "Challenge"]) +
        "…";
    },
    update(r, { paused, instructions, hasCheckpoint, profile }) {
      const c = CATALOG.get(r.id),
        h = MODES[r.id].hud(r),
        zh = currentLanguage() === "zh",
        jump = document.documentElement.dataset.jumpKeyLabel || (zh ? "空格" : "Space");
      root.style.setProperty("--exp-accent", c.color);
      set(get("title"), zh ? c.zh : c.en);
      set(
        get("objective"),
        r.endless
          ? text(["无尽续航 · 挑战更高纪录", "Endless flight · Set a new record"])
          : text(c.goal),
      );
      set(button("pause"), text(["暂停 · P", "Pause · P"]));
      set(button("help"), text(["玩法", "Help"]));
      set(
        button("mute"),
        actions.isMuted() ? text(["静音 · M", "Muted · M"]) : text(["声音 · M", "Sound · M"]),
      );
      button("mute").setAttribute("aria-pressed", String(actions.isMuted()));
      set(get("score"), Math.floor(r.score) + text([" 分", " pts"]));
      set(get("distance"), Math.floor(Math.max(0, r.distance ?? r.s)) + " m");
      set(get("combo"), r.combo > 1 ? "×" + r.combo : "");
      set(get("status"), text(h.status));
      set(get("detail"), text(h.detail));
      get("pulse").style.setProperty("--cue-value", String(h.value));
      set(get("energy-copy"), text(["喷气气量", "Air supply"]));
      set(get("energy"), Math.round(r.energy) + "%");
      get("air").value = r.energy;
      get("air").setAttribute("aria-label", text(["喷气气量", "Air supply"]));
      set(get("goal"), text(["进度 ", "Progress "]) + r.metric + " / " + r.goal);
      set(
        get("health"),
        text(["护盾 ", "Shields "]) +
          "◆".repeat(Math.max(0, r.health)) +
          "◇".repeat(Math.max(0, 3 - r.health)),
      );
      get("progress").value = Math.min(1, r.metric / Math.max(1, r.goal));
      set(
        get("keys"),
        text([
          `← → 操作 · ${jump} 喷气 / 特殊动作 · E 吸气 · Shift 加速 · P 暂停 · R 检查点`,
          `← → Steer · ${jump} Jets / action · E Suction · Shift Boost · P Pause · R Checkpoint`,
        ]),
      );
      set(root.querySelector("[data-hold=jump]"), jump);
      const terminal = ["dead", "finished", "ended"].includes(r.phase),
        overlay = paused || instructions || terminal,
        focusKey = r.id + ":" + (instructions ? "instructions" : paused ? "paused" : r.phase);
      get("overlay").hidden = !overlay;
      for (const background of root.querySelectorAll(".exp-top,.exp-readouts,.exp-bottom"))
        background.inert = overlay;
      if (overlay) {
        root.querySelector(".exp-card").classList.toggle("intro", instructions);
        get("instructions").hidden = !instructions;
        get("result-score").hidden = instructions;
        get("result-stats").hidden = instructions;
        button("play").hidden = terminal && !instructions;
        button("continue").hidden = r.phase !== "finished" || instructions;
        button("checkpoint").hidden = !hasCheckpoint || instructions || r.phase === "finished";
        button("retry").hidden = instructions;
        button("end").hidden = terminal || instructions;
        set(
          get("result-title"),
          instructions
            ? zh
              ? c.zh
              : c.en
            : r.phase === "finished"
              ? text(["挑战完成", "Challenge Complete"])
              : r.phase === "dead"
                ? text(["航行中断", "Flight Interrupted"])
                : r.phase === "ended"
                  ? text(["本局结束", "Run Complete"])
                  : text(["已暂停", "Paused"]),
        );
        if (instructions) {
          const key = r.id + currentLanguage() + jump;
          if (key !== instructionKey) {
            instructionKey = key;
            get("instructions").replaceChildren(
              ...c.steps.map((step) => {
                const li = document.createElement("li");
                li.textContent = text(step).replaceAll(zh ? "空格" : "Space", jump);
                return li;
              }),
            );
          }
          set(get("result-copy"), text(c.goal));
        } else {
          set(get("result-score"), String(Math.floor(r.score)));
          set(
            get("result-copy"),
            r.phase === "dead"
              ? text(REASONS[r.reason] || REASONS.impact)
              : r.phase === "finished"
                ? text([
                    "可以继续无尽续航，或返回选择其他挑战。",
                    "Continue in endless flight, or choose another challenge.",
                  ])
                : r.phase === "ended"
                  ? text([
                      "成绩已保存，可选择其他挑战。",
                      "Your score is saved. Choose another challenge.",
                    ])
                  : text(["休息一下，再继续本次航行。", "Take a break, then resume this flight."]),
          );
          set(
            get("result-stats"),
            text([
              `累计进度 ${r.metric} · 最长连击 ×${r.bestCombo} · 本机最高 ${profile.bestScore || 0} 分`,
              `Progress ${r.metric} · Best combo ×${r.bestCombo} · Local best ${profile.bestScore || 0} pts`,
            ]),
          );
        }
        set(
          button("play"),
          instructions ? text(["开始挑战", "Start Challenge"]) : text(["继续", "Resume"]),
        );
        set(button("continue"), text(["继续无尽续航", "Continue Endless"]));
        set(button("checkpoint"), text(["返回检查点 · R", "Checkpoint · R"]));
        set(button("retry"), text(["重试本条路线", "Retry Route"]));
        set(button("menu"), text(["菜单", "Menu"]));
        set(button("end"), text(["结束并保存成绩", "End and bank score"]));
        if (previousOverlay !== focusKey)
          button(
            instructions
              ? "play"
              : r.phase === "finished"
                ? "continue"
                : ["dead", "ended"].includes(r.phase)
                  ? "retry"
                  : "play",
          ).focus();
      }
      previousOverlay = overlay ? focusKey : false;
    },
  };
}
