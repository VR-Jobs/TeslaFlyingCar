export function createOrbitUI() {
  const root = document.createElement("output");
  root.id = "orbit-status";
  root.hidden = true;
  root.innerHTML =
    '<span id="orbit-section"></span><span id="orbit-action"></span><i id="orbit-beat" aria-hidden="true"></i>';
  const style = document.createElement("style");
  style.textContent = `#orbit-status{position:fixed;left:calc(18px + var(--safe-l));top:calc(118px + var(--safe-t));z-index:8;display:flex;gap:8px;align-items:center;max-width:min(310px,34vw);pointer-events:none;font:10px/1.45 system-ui;color:#d8e7ec;background:#07090ab8;padding:4px 7px;border-left:1px solid #a9ecff;box-sizing:border-box}#orbit-status[hidden]{display:none}#orbit-action{color:#ffe0a3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#orbit-beat{flex:none;width:4px;height:4px;border-radius:50%;background:#b3edff;opacity:.3}#orbit-status[data-beat=on] #orbit-beat{opacity:1;box-shadow:0 0 6px #b3edff}#orbit-section{white-space:nowrap}.orbit-preparing{position:fixed;inset:0;z-index:90;display:grid;place-items:center;background:#020406de;color:white;font:14px system-ui}.orbit-preparing[hidden]{display:none}@media(max-width:760px){#orbit-status{left:50%;transform:translateX(-50%);top:calc(166px + var(--safe-t) + var(--driving-coach-height,0px));max-width:90vw;font-size:9px;padding:3px 6px}}@media(max-height:500px){#orbit-status{top:calc(68px + var(--safe-t));left:calc(140px + var(--safe-l));transform:none;max-width:230px;font-size:9px}}`;
  document.head.append(style);
  (document.querySelector("#hud") || document.body).append(root);
  const preparing = document.createElement("div");
  preparing.className = "orbit-preparing";
  preparing.hidden = true;
  preparing.textContent = "正在准备太空航线…";
  preparing.setAttribute("role", "status");
  document.body.append(preparing);
  const section = root.querySelector("#orbit-section"),
    action = root.querySelector("#orbit-action");
  return {
    preparing(value) {
      preparing.hidden = !value;
    },
    update(live, label, text, beat) {
      root.hidden = !live;
      if (!live) return;
      if (section.textContent !== label) section.textContent = label;
      if (action.textContent !== text) action.textContent = text;
      root.dataset.beat = beat ? "on" : "off";
    },
  };
}
