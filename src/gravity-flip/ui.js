import { currentLanguage, localizeText, localizeAria } from "../local/language.js";
import { FACE_NAMES, FACE_COLORS } from "./course.js";
import { gravityCue } from "./rules.js";

const copy = (zh, en) => (currentLanguage() === "zh" ? zh : en);
export function createGravityUI(actions) {
  const root = document.createElement("section");
  root.id = "gravity-ui";
  root.tabIndex = -1;
  root.hidden = true;
  root.innerHTML = `<div class="gravity-top"><button data-gravity="pause" type="button"></button><div class="gravity-heading"><strong></strong><span id="gravity-journey"></span><div id="gravity-instruction" aria-live="polite"></div><button data-gravity="skip" type="button" hidden></button></div><button data-gravity="mute" type="button"></button></div>
    <div class="gravity-readouts"><span id="gravity-score"></span><span id="gravity-distance"></span><span id="gravity-combo"></span></div>
    <div class="gravity-bottom"><div class="gravity-face-map" aria-label="Driving surfaces"></div><div class="gravity-meter"><div><span id="gravity-state"></span><strong id="gravity-pressure"></strong></div><progress id="gravity-air" max="100" value="100" aria-label="Air"></progress><p id="gravity-cue" aria-live="polite"></p></div><p class="gravity-key-hint"></p><div class="gravity-touch"><button data-hold="left">←</button><button data-hold="suction"></button><button data-hold="jump"></button><button data-hold="boost"></button><button data-hold="right">→</button></div></div>
    <div id="gravity-overlay" role="dialog" aria-modal="true" aria-labelledby="gravity-result-title" hidden><div class="go-card gravity-card"><h2 id="gravity-result-title"></h2><div id="gravity-result-score" class="go-score mono"></div><p id="gravity-result-copy"></p><div id="gravity-result-stats"></div><div class="go-buttons"><button data-gravity="resume" class="primary"></button><button data-gravity="checkpoint" class="ghost"></button><button data-gravity="restart" class="ghost"></button><button data-gravity="menu" class="ghost"></button></div><button data-gravity="end" class="gravity-end"></button></div></div>`;
  const style = document.createElement("style");
  style.textContent = `
body.gravity-flip-active #menu.minimal-home:not(.hidden),body.gravity-flip-active #menu,body.gravity-flip-active #hud,body.gravity-flip-active .drive-coach,body.gravity-flip-active .drive-feedback,body.gravity-flip-active .drive-warning,body.gravity-flip-active #quick-restart,body.gravity-flip-active #handling-indicator,body.gravity-flip-active #orbit-ui{display:none!important}
#gravity-ui{position:fixed;inset:0;z-index:45;color:#fff;font:13px/1.5 "Noto Sans SC",system-ui,sans-serif;pointer-events:none;outline:none;isolation:isolate}
#gravity-ui[hidden],#gravity-ui [hidden],#gravity-loading[hidden]{display:none!important}
#gravity-ui button{pointer-events:auto;cursor:pointer;font:inherit;color:#fff;border:1px solid #ffffff4a;background:#080a10d9;padding:8px 13px;border-radius:5px}
#gravity-ui button:focus-visible{outline:2px solid #fff;outline-offset:3px}
.gravity-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:17px 22px}.gravity-heading{width:min(460px,58vw);text-align:center;padding:8px 14px;background:#080b13c9;border:1px solid #ffffff28;border-radius:8px}.gravity-heading strong{display:block;font-size:17px;letter-spacing:.08em}.gravity-heading>span{font-size:11px;color:#b9cad7}#gravity-instruction{font-size:11px;color:#e3edf4;min-height:16px;margin-top:4px}#gravity-ui [data-gravity=skip]{font-size:10px;padding:2px 9px;margin-top:5px}
.gravity-readouts{display:flex;justify-content:center;gap:22px;font:600 13px monospace;text-shadow:0 1px 4px #000}#gravity-combo{color:#a4f6d5}
.gravity-bottom{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);width:min(570px,calc(100vw - 32px));text-align:center}.gravity-face-map{display:flex;gap:6px;justify-content:center;margin:0 0 9px}.gravity-face-map span{min-width:60px;padding:5px 10px;border:1px solid #ffffff26;border-radius:5px;background:#080b13c9;font-size:11px;color:#bac3cc}.gravity-face-map .current{background:#16312fd9;color:#fff;border-color:#91e4ce}.gravity-face-map .target{border-style:dashed;border-color:#ffda8c;color:#ffda8c}
.gravity-meter{background:#080b13df;border:1px solid #ffffff30;border-radius:8px;padding:10px 14px}.gravity-meter>div{display:flex;justify-content:space-between;gap:10px;font-size:12px}.gravity-meter progress{width:100%;height:6px;accent-color:#c9f4ff;display:block;margin-top:6px}.gravity-meter p{font-size:11px;color:#b6d4e4;margin:5px 0 0;min-height:17px}.gravity-meter.warning{border-color:#efb963}.gravity-meter.warning progress{accent-color:#efb963}.gravity-key-hint{font-size:10px;color:#b4c5d5;margin:7px 0 0;text-shadow:0 1px 4px #000}.gravity-touch{display:none;justify-content:center;gap:6px;margin-top:8px}.gravity-touch button.is-held{background:#234839!important;border-color:#baffdf!important}
#gravity-overlay{position:absolute;inset:0;display:grid;place-items:center;background:#0008;pointer-events:auto;backdrop-filter:blur(5px)}.gravity-card{width:min(560px,calc(100vw - 30px));box-sizing:border-box;max-height:90dvh;overflow:auto;text-align:center;padding:30px;background:#0b0e13ed!important;border:1px solid #ffffff70!important}.gravity-card h2{margin:0 0 12px;font-size:25px}.gravity-card #gravity-result-copy{color:#c4d0db;font-size:13px}.gravity-card #gravity-result-stats{font-size:13px;color:#a8c7d7;margin:16px 0 22px}.gravity-card .go-buttons{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}.gravity-card .go-buttons button{flex:1;min-width:115px;min-height:46px}.gravity-card .go-buttons .primary{background:#fff!important;color:#080a10!important;border-color:#fff!important}.gravity-card .gravity-end{font-size:11px!important;border:0!important;background:transparent!important;margin-top:16px;color:#adb6bf!important}
#gravity-loading{position:fixed;inset:0;z-index:110;background:#030509f2;color:#fff;display:grid;place-items:center;font:15px system-ui}#gravity-loading span{padding:20px 30px;border-bottom:2px solid #e31937}
@media(pointer:coarse){.gravity-touch{display:flex}.gravity-key-hint{display:none}.gravity-touch button{min-height:44px;touch-action:none;font-size:11px!important;padding:7px 11px!important}}
@media(max-width:600px){.gravity-top{padding:10px;gap:7px}.gravity-top>button{padding:7px!important;font-size:10px!important}.gravity-heading{padding:6px 8px;width:62vw}.gravity-heading strong{font-size:14px}#gravity-instruction{font-size:10px}.gravity-heading>span{font-size:10px}.gravity-readouts{font-size:11px;gap:14px}.gravity-bottom{bottom:12px}.gravity-face-map span{min-width:0;flex:1;padding:5px 3px;font-size:10px}.gravity-face-map{gap:4px}.gravity-meter{padding:8px 10px}.gravity-meter>div{font-size:11px}.gravity-meter p{font-size:10px}.gravity-key-hint{font-size:9px}.gravity-card{padding:22px}.gravity-card .go-score{font-size:58px}}
@media(max-height:480px){.gravity-top{padding:8px 13px}.gravity-heading{padding:4px 10px}.gravity-heading strong{font-size:13px}.gravity-readouts{font-size:11px}.gravity-bottom{bottom:7px;max-width:480px}.gravity-face-map{margin-bottom:4px}.gravity-face-map span{padding:2px 8px}.gravity-key-hint{display:none}.gravity-meter{padding:6px 12px}.gravity-touch{position:fixed;right:-100px;bottom:0;flex-direction:column}.gravity-touch button{min-height:30px!important;padding:4px 6px!important}}
`;
  document.head.append(style);
  document.body.append(root);
  const get = (id) => root.querySelector("#gravity-" + id);
  const buttons = (selector) => root.querySelector(selector);
  const set = (node, text) => {
    if (node.textContent !== text) node.textContent = text;
  };
  const faceNodes = FACE_NAMES.map((names, i) => {
    const node = document.createElement("span");
    localizeText(node, names[0], names[1]);
    node.style.setProperty("--face-color", FACE_COLORS[i]);
    root.querySelector(".gravity-face-map").append(node);
    return node;
  });
  for (const b of root.querySelectorAll("[data-gravity]"))
    b.onclick = () => actions[b.dataset.gravity]();
  for (const b of root.querySelectorAll("[data-hold]")) {
    const release = () => {
      b.classList.remove("is-held");
      actions.hold(b.dataset.hold, false);
    };
    b.onpointerdown = (event) => {
      event.preventDefault();
      b.setPointerCapture(event.pointerId);
      b.classList.add("is-held");
      actions.hold(b.dataset.hold, true);
    };
    b.onpointerup = b.onpointercancel = b.onlostpointercapture = release;
  }
  const loading = document.createElement("div");
  loading.id = "gravity-loading";
  loading.hidden = true;
  loading.append(document.createElement("span"));
  document.body.append(loading);
  localizeAria(root.querySelector(".gravity-face-map"), "四面轨道", "Driving surfaces");
  localizeAria(get("air"), "动力气量", "Air");
  let overlayWasVisible = false;
  const faceName = (face) => FACE_NAMES[face][currentLanguage() === "zh" ? 0 : 1];
  return {
    root,
    show(value) {
      root.hidden = !value;
      if (value) root.focus();
    },
    preparing(value) {
      loading.hidden = !value;
      loading.firstChild.textContent = copy("正在准备重力翻面…", "Preparing Gravity Flip…");
    },
    update(run, course, paused, profile) {
      const jumpKey = document.documentElement.dataset.jumpKeyLabel || copy("空格", "Space");
      const cue = gravityCue(run, course),
        teaching = run.tutorial;
      set(root.querySelector(".gravity-heading strong"), copy("重力翻面", "Gravity Flip"));
      set(
        get("journey"),
        teaching
          ? copy("初次接轨 · 三步教学", "First contact · 3-step tutorial")
          : copy(
              `四面接力 · 已穿过 ${run.gates} 个断轨门`,
              `Four-surface relay · ${run.gates} gates cleared`,
            ),
      );
      const hints = [
        copy(
          "1 / 3 · 按住 E，让吸气气流连接轨道。",
          "1 / 3 · Hold E to connect the intake stream to the track.",
        ),
        copy(
          `2 / 3 · 保持 E，点按 ${jumpKey} 弹射到右墙。`,
          `2 / 3 · Keep holding E and tap ${jumpKey} to launch onto the right wall.`,
        ),
        copy(
          "3 / 3 · 保持 E，等待轮胎吸附右墙。",
          "3 / 3 · Keep E held until the tires attach to the right wall.",
        ),
      ];
      set(
        get("instruction"),
        teaching
          ? hints[teaching.step]
          : copy(
              "跟随绿色灯带，提前弹射换面。",
              "Follow the green lights. Launch before the broken section.",
            ),
      );
      buttons("[data-gravity=skip]").hidden = !teaching;
      set(buttons("[data-gravity=skip]"), copy("跳过教学", "Skip tutorial"));
      set(buttons("[data-gravity=pause]"), copy("暂停 · P", "Pause · P"));
      set(
        buttons("[data-gravity=mute]"),
        actions.isMuted() ? copy("静音 · M", "Muted · M") : copy("声音 · M", "Sound · M"),
      );
      buttons("[data-gravity=mute]").setAttribute("aria-pressed", String(actions.isMuted()));
      set(get("score"), copy(`${Math.floor(run.score)} 分`, `${Math.floor(run.score)} pts`));
      set(get("distance"), `${Math.floor(run.s)} m`);
      set(
        get("combo"),
        run.combo > 1 ? copy(`换面连击 ×${run.combo}`, `Transfer combo ×${run.combo}`) : "",
      );
      faceNodes.forEach((node, i) => {
        node.classList.toggle("current", run.attached && run.face === i);
        node.classList.toggle("target", run.target === i);
      });
      set(
        get("state"),
        run.attached
          ? copy(`已吸附 · ${faceName(run.face)}`, `Attached · ${faceName(run.face)}`)
          : copy(`空中换面 → ${faceName(run.target)}`, `In flight → ${faceName(run.target)}`),
      );
      set(get("pressure"), `${Math.round(run.pressure)}%`);
      get("air").value = run.pressure;
      root
        .querySelector(".gravity-meter")
        .classList.toggle("warning", run.warning > 0.12 || cue.launch);
      set(
        get("cue"),
        run.warning > 0.12
          ? copy("吸附正在减弱 · 按住 E 稳定车身", "Grip weakening · Hold E to stabilize")
          : cue.urgent
            ? cue.launch
              ? copy(
                  `现在弹射 → ${faceName(cue.target)} · 保持 E`,
                  `Launch now → ${faceName(cue.target)} · Keep E held`,
                )
              : copy(
                  `前方断轨 ${Math.max(0, Math.ceil(cue.distance))} m · 安全路面：${faceName(cue.gate.face)}`,
                  `Gap in ${Math.max(0, Math.ceil(cue.distance))} m · Safe surface: ${faceName(cue.gate.face)}`,
                )
            : copy(
                "四面都可行驶 · 连续换面获得额外得分",
                "Drive on all four surfaces · Chain transfers for bonus points",
              ),
      );
      set(
        root.querySelector(".gravity-key-hint"),
        copy(
          `← → 选择换面方向 · ${jumpKey} 弹射 / 按住喷气 · E 持续吸附 · Shift 加速 · P 暂停`,
          `← → Choose transfer direction · ${jumpKey} launch / hold for jets · E attach · Shift boost · P pause`,
        ),
      );
      set(buttons("[data-hold=suction]"), copy("吸附 E", "Attach E"));
      set(buttons("[data-hold=jump]"), copy("弹射 / 喷气", "Launch / Jets"));
      set(buttons("[data-hold=boost]"), copy("加速", "Boost"));
      const terminal = ["dead", "finished"].includes(run.phase);
      get("overlay").hidden = !paused && !terminal;
      for (const background of root.querySelectorAll(
        ".gravity-top,.gravity-readouts,.gravity-bottom",
      ))
        background.inert = paused || terminal;
      if (paused || terminal) {
        set(
          get("result-title"),
          paused
            ? copy("航行已暂停", "Flight Paused")
            : run.phase === "finished"
              ? copy("航行完成", "Flight Complete")
              : copy("接轨中断", "Contact Lost"),
        );
        set(get("result-score"), String(Math.floor(run.score)));
        const reasons = {
          impact: copy(
            "下降过快，撞上了下方路面。",
            "The landing speed was too high for the lower surface.",
          ),
          air: copy("气量耗尽，未能维持吸附。", "Air depleted before contact could be restored."),
          gap: copy("未在断轨前换到安全路面。", "The broken section required a different surface."),
          grip: copy(
            "离开轨道后未能重新吸附。",
            "Contact was not restored after leaving the track.",
          ),
        };
        set(
          get("result-copy"),
          paused
            ? copy(
                "继续航行，或保存本局成绩并返回。",
                "Continue flying, or bank your score and return.",
              )
            : run.phase === "finished"
              ? copy(
                  `本机最高 ${profile.bestScore || 0} 分`,
                  `Local best: ${profile.bestScore || 0} pts`,
                )
              : reasons[run.reason] || "",
        );
        set(
          get("result-stats"),
          copy(
            `${Math.floor(run.s)} 米 · ${run.transfers} 次换面 · ${run.gates} 个断轨门 · ${run.circuits} 次四面循环`,
            `${Math.floor(run.s)} m · ${run.transfers} transfers · ${run.gates} gates · ${run.circuits} full circuits`,
          ),
        );
        buttons("[data-gravity=resume]").hidden = !paused;
        buttons("[data-gravity=checkpoint]").hidden =
          run.checkpoint.s === 0 || run.phase === "finished";
        buttons("[data-gravity=end]").hidden = !paused;
        set(buttons("[data-gravity=resume]"), copy("继续航行", "Resume"));
        set(buttons("[data-gravity=checkpoint]"), copy("返回检查点 · R", "Checkpoint · R"));
        set(buttons("[data-gravity=restart]"), copy("重新挑战", "Retry"));
        set(buttons("[data-gravity=menu]"), copy("菜单", "Menu"));
        set(buttons("[data-gravity=end]"), copy("结束并保存成绩", "End and bank score"));
        if (!overlayWasVisible)
          buttons(paused ? "[data-gravity=resume]" : "[data-gravity=restart]").focus();
      }
      overlayWasVisible = paused || terminal;
    },
  };
}
