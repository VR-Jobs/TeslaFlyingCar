import { localizeText } from "../local/language.js";
const GOALS = [
  {
    id: "starRing",
    titleEn: "Star-Ring Navigator",
    descEn: "Complete a star-ring run",
    paintEn: "Orbital Silver Blue",
    title: "星环领航员",
    desc: "完成一次星环穿梭",
    check: () => false,
    color: "#b5d7e9",
    paint: "星环银蓝",
  },
  {
    id: "orbit",
    titleEn: "First Orbit",
    descEn: "Drive 1,000 m in one run",
    paintEn: "Red",
    title: "轨道初航",
    desc: "单局行驶 1,000 米",
    check: (m) => m.distance >= 1000,
    color: "#c81e32",
    paint: "正红",
  },
  {
    id: "landing",
    titleEn: "Smooth Landing",
    descEn: "Make 5 perfect landings in one run",
    paintEn: "Star Blue",
    title: "平稳着陆",
    desc: "单局完成 5 次完美落地",
    check: (m) => m.perfectLandings >= 5,
    color: "#6d91af",
    paint: "星蓝",
  },
  {
    id: "stunt",
    titleEn: "Air Acrobat",
    descEn: "Complete 10 stunts in one run",
    paintEn: "Graphite",
    title: "空中特技",
    desc: "单局完成 10 次完整特技",
    check: (m) => m.tricks >= 10,
    color: "#525861",
    paint: "石墨",
  },
  {
    id: "voyager",
    titleEn: "Deep-Space Voyager",
    descEn: "Drive 4,700 m in one run",
    paintEn: "Champagne Silver",
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
  localizeText(legend, "旅程记录与涂装", "Journey Records and Paints");
  const list = document.createElement("div"),
    label = document.createElement("label"),
    caption = document.createElement("span"),
    select = document.createElement("select");
  localizeText(caption, "车身涂装", "Body paint");
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
    localizeText(silver, "冰川银", "Glacier Silver");
    select.append(silver);
    for (const goal of GOALS) {
      const earned = profile().earned.includes(goal.id),
        row = document.createElement("p");
      localizeText(
        row,
        `${earned ? "✓" : "○"} ${goal.title} · ${goal.desc}`,
        `${earned ? "✓" : "○"} ${goal.titleEn} · ${goal.descEn}`,
      );
      row.className = earned ? "journey-earned" : "drive-muted";
      list.append(row);
      const option = document.createElement("option");
      option.value = goal.id;
      option.disabled = !earned;
      localizeText(
        option,
        goal.paint + (earned ? "" : " · 未解锁"),
        goal.paintEn + (earned ? "" : " · Locked"),
      );
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
