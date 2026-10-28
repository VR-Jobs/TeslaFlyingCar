import { currentLanguage, localizeText, localizeAria } from "./language.js";
const defaults = {
  shake: 0.55,
  parallax: 1,
  blur: 0.6,
  musicVolume: 0.8,
  effectVolume: 0.85,
  rainbow: 0.75,
  bloom: 1,
  speedLines: 0.65,
  ghostOpacity: 0.4,
  ghost: true,
  autoQuality: true,
  compactHUD: true,
  rhythmOffset: 0,
  keys: {
    left: "ArrowLeft",
    right: "ArrowRight",
    jump: "Space",
    down: "ArrowDown",
    boost: "ShiftLeft",
    item: "KeyZ",
  },
};
const codes = [
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Space",
  "ShiftLeft",
  "KeyA",
  "KeyD",
  "KeyW",
  "KeyS",
  "KeyB",
  "KeyZ",
  "KeyJ",
  "KeyK",
  "KeyL",
  "KeyF",
];
export function installComfortSettings(context) {
  const { game, showroom, sound, input } = context;
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem("tesla-music.comfort.v1") || "{}");
  } catch {}
  const prefs = { ...defaults };
  for (const key of [
    "shake",
    "parallax",
    "blur",
    "musicVolume",
    "effectVolume",
    "rainbow",
    "bloom",
    "speedLines",
    "ghostOpacity",
  ])
    if (Number.isFinite(saved[key])) prefs[key] = Math.max(0, Math.min(1, saved[key]));
  for (const key of ["ghost", "autoQuality", "compactHUD"])
    if (typeof saved[key] === "boolean") prefs[key] = saved[key];
  if (Number.isFinite(saved.rhythmOffset))
    prefs.rhythmOffset = Math.max(-0.15, Math.min(0.15, saved.rhythmOffset));
  prefs.keys = { ...defaults.keys };
  for (const key of Object.keys(defaults.keys)) {
    const code = saved.keys?.[key];
    if (!codes.includes(code)) continue;
    const previous = prefs.keys[key],
      other = Object.keys(prefs.keys).find((k) => k !== key && prefs.keys[k] === code);
    if (other) prefs.keys[other] = previous;
    prefs.keys[key] = code;
  }
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  showroom.motionPreferences = prefs;
  function applyAudio() {
    if (!sound.ctx) return;
    sound.bus?.gain.setTargetAtTime(sound.enabled ? prefs.effectVolume : 0, sound.t, 0.04);
    sound.musicGain?.gain.setTargetAtTime(
      sound.musicOn ? 0.32 * prefs.musicVolume : 0,
      sound.t,
      0.04,
    );
  }
  for (const method of ["init", "setEnabled", "setMusic"]) {
    if (!sound[method]) continue;
    const original = sound[method];
    sound[method] = function (...args) {
      const out = original.apply(this, args);
      applyAudio();
      return out;
    };
  }
  const card = document.querySelector("#settings .modal-card"),
    field = document.createElement("fieldset");
  field.className = "comfort-settings";
  field.innerHTML = "<legend>声音与镜头</legend>";
  const sliders = new Map();
  const persist = () => {
    document.documentElement.dataset.jumpKeyLabel = keyName(prefs.keys.jump);
    document.documentElement.dataset.leftKeyLabel = keyName(prefs.keys.left);
    document.documentElement.dataset.rightKeyLabel = keyName(prefs.keys.right);
    syncControlLabels();
    document.documentElement.style.setProperty("--rainbow-strength", String(prefs.rainbow));
    try {
      localStorage.setItem("tesla-music.comfort.v1", JSON.stringify(prefs));
    } catch {}
  };
  for (const [key, title] of [
    ["musicVolume", "音乐音量"],
    ["effectVolume", "音效音量"],
    ["shake", "镜头晃动"],
    ["parallax", "鼠标视差"],
    ["blur", "速度模糊"],
    ["rainbow", "彩虹边框强度"],
    ["bloom", "驾驶光晕强度"],
    ["speedLines", "速度线强度"],
    ["ghostOpacity", "影车透明度"],
  ]) {
    const label = document.createElement("label"),
      text = document.createElement("span"),
      slider = document.createElement("input"),
      value = document.createElement("output");
    text.textContent = title;
    slider.type = "range";
    slider.min = 0;
    slider.max = 100;
    slider.step = 5;
    slider.id = `comfort-${key}`;
    slider.value = Math.round(prefs[key] * 100);
    slider.setAttribute("aria-label", title);
    value.textContent = slider.value + "%";
    slider.oninput = () => {
      prefs[key] = Number(slider.value) / 100;
      value.textContent = slider.value + "%";
      persist();
      applyAudio();
    };
    label.append(text, slider, value);
    field.append(label);
    sliders.set(key, slider);
  }
  for (const [key, title] of [
    ["ghost", "显示本地最佳影车"],
    ["autoQuality", "星环自动调节画质"],
    ["compactHUD", "驾驶时使用精简界面"],
  ]) {
    const label = document.createElement("label"),
      text = document.createElement("span"),
      input = document.createElement("input");
    text.textContent = title;
    input.type = "checkbox";
    input.id = "comfort-" + key;
    input.checked = prefs[key];
    input.setAttribute("aria-label", title);
    input.onchange = () => {
      prefs[key] = input.checked;
      persist();
    };
    label.append(text, input);
    field.append(label);
  }
  const timing = document.createElement("label"),
    timingName = document.createElement("span"),
    timingInput = document.createElement("input"),
    timingValue = document.createElement("output");
  timingName.textContent = "节拍时间校准";
  timingInput.type = "range";
  timingInput.id = "comfort-rhythmOffset";
  timingInput.min = -150;
  timingInput.max = 150;
  timingInput.step = 10;
  timingInput.value = Math.round(prefs.rhythmOffset * 1000);
  timingInput.setAttribute("aria-label", "节拍时间校准");
  timingValue.textContent = timingInput.value + " ms";
  timingInput.oninput = () => {
    prefs.rhythmOffset = Number(timingInput.value) / 1000;
    timingValue.textContent = timingInput.value + " ms";
    persist();
  };
  timing.append(timingName, timingInput, timingValue);
  field.append(timing);
  const audition = document.createElement("button");
  audition.type = "button";
  audition.textContent = "试听节拍";
  audition.onclick = () => {
    sound.init();
    for (let i = 0; i < 4; i++)
      sound.tone({ freq: i ? 660 : 880, dur: 0.075, gain: 0.035, delay: (i * 60) / 128 });
  };
  field.append(audition);
  const keys = document.createElement("fieldset");
  keys.className = "comfort-settings";
  keys.innerHTML = "<legend>按键设置</legend>";
  const keySelects = new Map();
  const keyName = (code) =>
    ({
      Space: currentLanguage() === "zh" ? "空格" : "Space",
      ShiftLeft: currentLanguage() === "zh" ? "左 Shift" : "Left Shift",
      ArrowLeft: "←",
      ArrowRight: "→",
      ArrowUp: "↑",
      ArrowDown: "↓",
    })[code] || code.replace("Key", "");
  function syncControlLabels() {
    const k = Object.fromEntries(Object.entries(prefs.keys).map(([a, b]) => [a, keyName(b)]));
    const rowLabels = [
      `${k.left} / ${k.right}`,
      `${k.jump} ${currentLanguage() === "zh" ? "点按" : "tap"}`,
      `${k.jump} ${currentLanguage() === "zh" ? "按住" : "hold"}`,
      `${k.jump} ${currentLanguage() === "zh" ? "空中再按" : "press again in the air"}`,
      `${k.left} / ${k.right} ${currentLanguage() === "zh" ? "空中点按" : "tap in the air"}`,
      k.down,
      k.boost,
      k.item,
      "P / Esc",
    ];
    [...document.querySelectorAll("#help-rows tr")].forEach((row, i) => {
      const cell = row.children[1];
      if (cell && cell.textContent !== rowLabels[i]) cell.textContent = rowLabels[i];
    });
    const hints = [`${k.left} ${k.right}`, k.jump, k.jump, k.down, k.boost, k.item, "P", "M"];
    [...document.querySelectorAll("#key-hints kbd")].forEach((node, i) => {
      if (hints[i] && node.textContent !== hints[i]) node.textContent = hints[i];
    });
  }
  for (const id of ["help-rows", "key-hints"]) {
    const node = document.getElementById(id);
    if (node)
      new MutationObserver(syncControlLabels).observe(node, { childList: true, subtree: true });
  }
  persist();
  for (const [key, title] of [
    ["left", "向左"],
    ["right", "向右"],
    ["jump", "跳跃 / 按住飞行"],
    ["down", "俯冲"],
    ["boost", "喷气加速"],
    ["item", "使用道具"],
  ]) {
    const label = document.createElement("label"),
      text = document.createElement("span"),
      select = document.createElement("select");
    text.textContent = title;
    select.setAttribute("aria-label", title + "按键");
    select.id = `key-${key}`;
    for (const code of codes) {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = keyName(code);
      select.append(option);
    }
    select.value = prefs.keys[key];
    select.onchange = () => {
      const previous = prefs.keys[key],
        other = Object.keys(prefs.keys).find((k) => k !== key && prefs.keys[k] === select.value);
      if (other) {
        prefs.keys[other] = previous;
        keySelects.get(other).value = previous;
      }
      prefs.keys[key] = select.value;
      input.queue.length = 0;
      input.jumpKeys.clear();
      input.boostSources.clear();
      game.player.releaseControls();
      persist();
    };
    keySelects.set(key, select);
    label.append(text, select);
    keys.append(label);
  }
  const reset = document.createElement("button");
  reset.type = "button";
  reset.textContent = "恢复默认按键";
  reset.onclick = () => {
    prefs.keys = { ...defaults.keys };
    for (const [key, select] of keySelects) select.value = prefs.keys[key];
    input.queue.length = 0;
    input.jumpKeys.clear();
    input.boostSources.clear();
    game.player.releaseControls();
    persist();
  };
  keys.append(reset);
  card.insertBefore(field, card.querySelector(".modal-buttons"));
  field.after(keys);
  const originalKey = input.onKey;
  input.onKey = function (event, down) {
    if (
      event.target instanceof Element &&
      event.target.closest("input,select,textarea,button,a[href],summary,[contenteditable]")
    )
      return originalKey.call(this, event, down);
    const key = Object.keys(prefs.keys).find((k) => prefs.keys[k] === event.code);
    const aliases = {
      left: ["KeyA"],
      right: ["KeyD"],
      jump: ["ArrowUp", "KeyW"],
      down: ["KeyS"],
      boost: ["ShiftRight", "KeyB"],
      item: [],
    };
    const fallback = Object.keys(aliases).find((k) => aliases[k].includes(event.code));
    const action =
      key || (fallback && !Object.values(prefs.keys).includes(event.code) ? fallback : null);
    if (action) {
      const code = defaults.keys[action];
      return originalKey.call(
        this,
        {
          code,
          target: event.target,
          repeat: event.repeat,
          preventDefault: () => event.preventDefault(),
        },
        down,
      );
    }
    if (codes.includes(event.code)) return;
    return originalKey.call(this, event, down);
  };
  const rigUpdate = game.rig.update;
  game.rig.update = function (...args) {
    const strength = reduced.matches ? 0 : prefs.shake;
    const trauma = this.trauma;
    this.trauma *= Math.sqrt(strength);
    const out = rigUpdate.apply(this, args);
    this.trauma = Math.max(0, trauma - Math.max(0, args[0]) * 1.6);
    const C = (frequency, phase) =>
      Math.sin(this.t * frequency + phase) * 0.6 +
      Math.sin(this.t * frequency * 2.13 + phase * 1.7) * 0.4;
    this.cam.position.x -= C(53, 4) * this.hyper * 0.06 * (1 - strength);
    this.cam.position.y -= C(47, 5) * this.hyper * 0.05 * (1 - strength);
    if (!this.cine) {
      const roll = this.cam.rotation.z;
      this.cam.lookAt(this.lookAt);
      this.cam.rotation.z += roll;
    }
    if (this.party > 0.01)
      this.cam.rotation.z -= Math.sin(this.t * 4.2) * 0.045 * this.party * (1 - strength);
    return out;
  };
  const visual = game.updateVisual;
  game.updateVisual = function (...args) {
    if (this._comfortMood && this.mood === this._comfortMood) this.mood.bloom = this._comfortBloom;
    const out = visual.apply(this, args);
    if (this.mood) {
      this._comfortMood = this.mood;
      this._comfortBloom = this.mood.bloom;
      this.mood.bloom *= prefs.bloom;
    }
    this.post.blur *= prefs.blur;
    this.post.roadBlur *= prefs.blur;
    return out;
  };
  const lineUpdate = game.lines.update;
  game.lines.update = function (...args) {
    const result = lineUpdate.apply(this, args);
    this.mat.opacity *= prefs.speedLines;
    if (!prefs.speedLines) this.mesh.visible = false;
    return result;
  };
  const cine = game.cinematic;
  game.cinematic = function (...args) {
    if (reduced.matches || prefs.shake === 0) return;
    return cine.apply(this, args);
  };
  const rhythmHelp = document.createElement("section");
  rhythmHelp.id = "star-ring-rhythm-help";
  rhythmHelp.style.cssText =
    "margin:18px 0;padding:12px;border:1px solid #ffffff28;border-radius:6px;font-size:13px;line-height:1.7";
  rhythmHelp.innerHTML =
    "<strong>星环：节奏三连与影车</strong><p>按住 E 吸附，在节拍上蓄力；随后踩拍弹射，再踩拍平稳接轨，可触发额外得分和短旋律层。错拍仍可继续驾驶。</p><p>蓝色主路稳定补气，金色支路挑战特技。驾驶记录保存在本机，开始游戏时可勾选挑战本地最佳影车。设置中可调整节拍校准、彩虹边框、光晕和速度线。</p>";
  document
    .querySelector("#help .modal-card")
    ?.insertBefore(rhythmHelp, document.querySelector("#help .modal-buttons"));
  const labels = new Map([
    ["声音与镜头", "Audio and Camera"],
    ["按键设置", "Key Bindings"],
    ["音乐音量", "Music volume"],
    ["音效音量", "Sound effects volume"],
    ["镜头晃动", "Camera shake"],
    ["鼠标视差", "Mouse parallax"],
    ["速度模糊", "Motion blur"],
    ["彩虹边框强度", "Rainbow border intensity"],
    ["驾驶光晕强度", "Bloom intensity"],
    ["速度线强度", "Speed line intensity"],
    ["影车透明度", "Ghost opacity"],
    ["显示本地最佳影车", "Show personal best ghost"],
    ["星环自动调节画质", "Automatic star-ring graphics quality"],
    ["驾驶时使用精简界面", "Compact driving HUD"],
    ["节拍时间校准", "Beat timing offset"],
    ["试听节拍", "Test beat"],
    ["恢复默认按键", "Reset key bindings"],
    ["向左", "Steer left"],
    ["向右", "Steer right"],
    ["跳跃 / 按住飞行", "Jump / hold to fly"],
    ["俯冲", "Dive"],
    ["喷气加速", "Boost"],
    ["使用道具", "Use item"],
  ]);
  for (const area of [field, keys]) {
    for (const node of area.querySelectorAll("legend, label > span, button")) {
      const zh = node.textContent,
        en = labels.get(zh);
      if (en) localizeText(node, zh, en);
    }
    for (const node of area.querySelectorAll("[aria-label]")) {
      const zh = node.getAttribute("aria-label");
      const en = labels.get(zh) || (zh.endsWith("按键") && labels.get(zh.slice(0, -2)) + " key");
      if (en) localizeAria(node, zh, en);
    }
  }
  localizeText(
    rhythmHelp.querySelector("strong"),
    "星环：节奏三连与影车",
    "Star Ring: Rhythm Combos and Ghost Racing",
  );
  const rhythmParagraphs = rhythmHelp.querySelectorAll("p");
  localizeText(
    rhythmParagraphs[0],
    rhythmParagraphs[0].textContent,
    "Hold E to attach and charge on the beat. Release on the beat to launch, then reconnect on the beat for a score bonus and an extra musical layer. Missing a beat will not end your run.",
  );
  localizeText(
    rhythmParagraphs[1],
    rhythmParagraphs[1].textContent,
    "The blue main route replenishes air; gold branches offer stunt challenges. Records are stored locally. Select your best ghost before starting, and adjust beat timing, rainbow borders, bloom and speed lines in Settings.",
  );
  const updateKeyNames = () => {
    for (const select of keySelects.values())
      for (const option of select.options) option.textContent = keyName(option.value);
    document.documentElement.dataset.jumpKeyLabel = keyName(prefs.keys.jump);
    document.documentElement.dataset.leftKeyLabel = keyName(prefs.keys.left);
    document.documentElement.dataset.rightKeyLabel = keyName(prefs.keys.right);
    syncControlLabels();
  };
  new MutationObserver(updateKeyNames).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"],
  });
  updateKeyNames();
  applyAudio();
  return { preferences: prefs, status: () => structuredClone(prefs) };
}
