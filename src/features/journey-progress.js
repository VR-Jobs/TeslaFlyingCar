const GOALS = [
  {
    id: "starRing",
    title: "星环领航员",
    desc: "完成一次星环穿梭",
    check: () => false,
    color: "#b5d7e9",
    paint: "星环银蓝",
  },
  {
    id: "orbit",
    title: "轨道初航",
    desc: "单局行驶 1,000 米",
    check: (m) => m.distance >= 1000,
    color: "#c81e32",
    paint: "正红",
  },
  {
    id: "landing",
    title: "平稳着陆",
    desc: "单局完成 5 次完美落地",
    check: (m) => m.perfectLandings >= 5,
    color: "#6d91af",
    paint: "星蓝",
  },
  {
    id: "stunt",
    title: "空中特技",
    desc: "单局完成 10 次完整特技",
    check: (m) => m.tricks >= 10,
    color: "#525861",
    paint: "石墨",
  },
  {
    id: "voyager",
    title: "深空旅人",
    desc: "单局行驶 4,700 米",
    check: (m) => m.distance >= 4700,
    color: "#d6c5a3",
    paint: "香槟银",
  },
];
export function installJourneyProgress(context, driving) {
  const { game, backend, showroom } = context;
  const saved = backend.state.driving.journey || {};
  backend.state.driving.journey = {
    earned: Array.isArray(saved.earned)
      ? [...new Set(saved.earned.filter((id) => GOALS.some((g) => g.id === id)))]
      : [],
    paint: ["silver", ...GOALS.map((g) => g.id)].includes(saved.paint) ? saved.paint : "silver",
  };
  const profile = () => backend.state.driving.journey;
  const card = document.createElement("fieldset");
  card.className = "comfort-settings journey-progress";
  const legend = document.createElement("legend");
  legend.textContent = "旅程记录与涂装";
  const list = document.createElement("div"),
    label = document.createElement("label"),
    caption = document.createElement("span"),
    select = document.createElement("select");
  caption.textContent = "车身涂装";
  select.id = "journey-paint";
  label.append(caption, select);
  card.append(legend, list, label);
  const parent = document.querySelector("#settings .modal-card");
  parent.insertBefore(card, parent.querySelector(".modal-buttons"));
  function paint() {
    const goal = GOALS.find((g) => g.id === profile().paint && profile().earned.includes(g.id));
    for (const car of [game.player.car, showroom.car])
      car.materials.body.color.set(goal?.color || "#e3e7eb");
  }
  function render() {
    list.replaceChildren();
    select.replaceChildren();
    const silver = document.createElement("option");
    silver.value = "silver";
    silver.textContent = "冰川银";
    select.append(silver);
    for (const goal of GOALS) {
      const earned = profile().earned.includes(goal.id),
        row = document.createElement("p");
      row.textContent = `${earned ? "✓" : "○"} ${goal.title} · ${goal.desc}`;
      row.className = earned ? "journey-earned" : "drive-muted";
      list.append(row);
      const option = document.createElement("option");
      option.value = goal.id;
      option.disabled = !earned;
      option.textContent = goal.paint + (earned ? "" : " · 未解锁");
      select.append(option);
    }
    select.value = profile().paint;
    paint();
  }
  select.onchange = () => {
    profile().paint = select.value;
    backend.persist();
    paint();
  };
  const over = game.onGameOver;
  game.onGameOver = async function (...args) {
    const m = driving.metrics();
    let changed = false;
    if (driving.options().mode !== "academy")
      for (const goal of GOALS)
        if (!profile().earned.includes(goal.id) && goal.check(m)) {
          profile().earned.push(goal.id);
          changed = true;
        }
    if (changed) backend.persist();
    render();
    return over.apply(this, args);
  };
  const intro = game.startIntro;
  game.startIntro = function (...args) {
    const out = intro.apply(this, args);
    paint();
    return out;
  };
  render();
  return {
    status: () => structuredClone(profile()),
    refresh: render,
    unlock(id) {
      if (GOALS.some((g) => g.id === id) && !profile().earned.includes(id)) {
        profile().earned.push(id);
        backend.persist();
        render();
      }
    },
  };
}
