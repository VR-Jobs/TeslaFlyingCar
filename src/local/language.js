const LANGUAGE_KEY = "tesla-music.language.v1";
export const currentLanguage = () =>
  document.documentElement.lang.split("-")[0] === "zh" ? "zh" : "en";

// The redesigned cover starts in English, independently of old recovery saves.
function initialLanguage() {
  const explicit = new URLSearchParams(location.search).get("lang");
  if (["en", "zh"].includes(explicit)) return explicit;
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (["en", "zh"].includes(saved)) return saved;
  } catch {}
  return "en";
}

export function localizeText(node, zh, en) {
  node.dataset.localZh = zh;
  node.dataset.localEn = en;
  node.textContent = currentLanguage() === "zh" ? zh : en;
  return node;
}
export function localizeAria(node, zh, en) {
  node.dataset.localAriaZh = zh;
  node.dataset.localAriaEn = en;
  node.setAttribute("aria-label", currentLanguage() === "zh" ? zh : en);
}
function refreshLocalizedText() {
  const zh = currentLanguage() === "zh";
  for (const node of document.querySelectorAll("[data-local-zh]"))
    node.textContent = zh ? node.dataset.localZh : node.dataset.localEn;
  for (const node of document.querySelectorAll("[data-local-aria-zh]"))
    node.setAttribute("aria-label", zh ? node.dataset.localAriaZh : node.dataset.localAriaEn);
}

export function setGameLanguage(language) {
  const select = document.getElementById("language-select");
  if (!select || !["zh", "en"].includes(language)) return;
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
  } catch {}
  select.value = language;
  select.dispatchEvent(new Event("change", { bubbles: true }));
}

export function installLanguageButton() {
  const button = document.createElement("button");
  button.id = "language-toggle";
  setGameLanguage(initialLanguage());
  button.hidden = false;
  button.type = "button";
  const style = document.createElement("style");
  style.textContent = `#language-toggle{position:fixed;right:calc(170px + env(safe-area-inset-right,0px));top:calc(16px + env(safe-area-inset-top,0px));z-index:90;min-width:78px;min-height:36px;padding:6px 12px;border:1px solid #ffffff70;border-radius:5px;background:#101116dd;color:#fff;font:600 14px/1.4 system-ui,sans-serif;cursor:pointer}#language-toggle:hover{background:#30333e}#language-toggle:focus-visible{outline:2px solid #6ff6ff;outline-offset:3px}@media(max-width:600px){#language-toggle{top:auto;bottom:calc(10px + env(safe-area-inset-bottom,0px));right:12px;min-width:68px;min-height:34px}}`;
  document.head.append(style);
  document.body.append(button);
  let previous;
  const sync = () => {
    const current = currentLanguage();
    if (current === previous) return;
    refreshLocalizedText();
    document.title = current === "zh" ? "特斯拉音乐跑酷" : "Tesla Music Run";
    button.textContent = current === "en" ? "中文" : "English";
    button.lang = current === "en" ? "zh" : "en";
    button.title = current === "en" ? "Switch to Chinese" : "Switch to English";
    button.setAttribute("aria-label", current === "en" ? "Switch to Chinese" : "切换为英文");
    if (current !== previous && parent !== window) {
      parent.postMessage({ type: "roadster:language", language: current }, location.origin);
    }
    previous = current;
  };
  button.onclick = () => setGameLanguage(document.documentElement.lang === "en" ? "zh" : "en");
  for (const event of ["keydown", "keyup"])
    button.addEventListener(event, (e) => e.stopPropagation());
  new MutationObserver(sync).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"],
  });
  sync();
}
