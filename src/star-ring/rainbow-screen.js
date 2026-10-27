import { STARMAN } from "../config/gameplay.js";
import { rainbowStatus } from "./rainbow-rules.js";

// CSS is shared with #star-overlay, #score.star and #flash in ordinary scenes.
// All changes derive from simulation time: pause, refresh and expiry need no timers.
export function createRainbowScreen(root) {
  const edge = root.querySelector("#ring-star-overlay"),
    flash = root.querySelector("#ring-star-flash"),
    score = root.querySelector("#ring-score"),
    meter = root.querySelector("#ring-rainbow"),
    copy = root.querySelector("#ring-rainbow-copy"),
    time = root.querySelector("#ring-rainbow-time"),
    fill = root.querySelector("#ring-rainbow-fill");
  function reset() {
    edge.classList.remove("on", "ending");
    edge.removeAttribute("data-paused");
    score.classList.remove("star");
    score.removeAttribute("data-paused");
    meter.hidden = true;
    meter.classList.remove("on", "ending");
    meter.removeAttribute("data-paused");
    root.classList.remove("ring-rainbow-active");
    copy.textContent = time.textContent = "";
    fill.style.transform = "scaleX(0)";
    flash.style.opacity = "0";
  }
  return {
    reset,
    update(run, paused) {
      const state = rainbowStatus(run),
        on = state.active && !run.tutorial?.active,
        ending = on && state.remaining < 2;
      edge.classList.toggle("on", on);
      edge.classList.toggle("ending", ending);
      edge.toggleAttribute("data-paused", paused);
      score.classList.toggle("star", on);
      score.toggleAttribute("data-paused", paused);
      meter.hidden = !on;
      meter.classList.toggle("on", on);
      meter.classList.toggle("ending", ending);
      meter.toggleAttribute("data-paused", paused);
      root.classList.toggle("ring-rainbow-active", on);
      copy.textContent = "★ 彩虹无敌 · 得分 ×2";
      time.textContent = state.remaining.toFixed(1) + " 秒";
      fill.style.transform = "scaleX(" + Math.min(1, state.remaining / STARMAN.duration) + ")";
      // Same short white edge flash as the other two scenes; never cover the car.
      const elapsed = STARMAN.duration - state.remaining;
      flash.style.opacity = on ? String(Math.max(0, 1 - elapsed / 0.35) * 0.9) : "0";
    },
    status() {
      return {
        edge: edge.classList.contains("on"),
        ending: edge.classList.contains("ending"),
        paused: edge.hasAttribute("data-paused"),
        score: score.classList.contains("star"),
        flash: Number(flash.style.opacity || 0),
        meter: !meter.hidden,
        sharedStyle: "ordinary-scene-starman",
      };
    },
  };
}
