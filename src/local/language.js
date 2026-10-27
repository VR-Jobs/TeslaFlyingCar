export function setGameLanguage(language) {
  const select = document.getElementById("language-select");
  if (!select || !["zh", "en"].includes(language)) return;
  select.value = language;
  select.dispatchEvent(new Event("change", { bubbles: true }));
}

export function installLanguageButton() {
  const button = document.createElement("button");
  button.id = "language-toggle";
  button.hidden = true;
  button.type = "button";
  const style = document.createElement("style");
  style.textContent = `#language-toggle{position:fixed;right:calc(170px + env(safe-area-inset-right,0px));top:calc(16px + env(safe-area-inset-top,0px));z-index:90;min-width:78px;min-height:36px;padding:6px 12px;border:1px solid #ffffff70;border-radius:5px;background:#101116dd;color:#fff;font:600 14px/1.4 system-ui,sans-serif;cursor:pointer}#language-toggle:hover{background:#30333e}#language-toggle:focus-visible{outline:2px solid #6ff6ff;outline-offset:3px}@media(max-width:600px){#language-toggle{top:auto;bottom:calc(10px + env(safe-area-inset-bottom,0px));right:12px;min-width:68px;min-height:34px}}`;
  document.head.append(style);
  document.body.append(button);
  let previous;
  const sync = () => {
    const current = document.documentElement.lang.split("-")[0];
    button.textContent = current === "en" ? "中文" : "English";
    button.lang = current === "en" ? "zh" : "en";
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
