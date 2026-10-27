// Stable indices preserve the three original lesson claims in existing saves.
export const LESSONS = [
  { id: "basics", title: ["变道与跳跃", "Lanes & jumping"], reward: 10, target: 150 },
  { id: "flight", title: ["飞行与补气", "Flight & refilling"], reward: 15, target: 200 },
  { id: "barrel", title: ["桶滚与落地", "Barrel rolls & landing"], reward: 20, target: 220 },
  {
    id: "airCan",
    title: ["空气补给", "Air canister"],
    reward: 15,
    target: 120,
    prompt: [
      "沿中间车道拾取气罐，观察气量增加。补给会自动生效。",
      "Collect the canister in the middle lane and watch your air rise. It activates automatically.",
    ],
  },
  {
    id: "overpressure",
    title: ["满气补充", "Full air refill"],
    reward: 15,
    target: 120,
    prompt: [
      "拾取前方蓝色满气道具，观察空气立即回满，无需按 Z。",
      "Collect the blue refill. It restores all your air automatically; no Z press needed.",
    ],
  },
  {
    id: "shield",
    title: ["护盾保护", "Protective shield"],
    reward: 15,
    target: 170,
    prompt: [
      "拾取护盾后留在中间车道，体验它抵挡前方一次碰撞。",
      "Collect the shield and stay in the middle lane to let it absorb one collision.",
    ],
  },
  {
    id: "shockwave",
    title: ["冲击波清障", "Shockwave"],
    reward: 15,
    target: 170,
    prompt: [
      "拾取冲击波后，靠近前方车辆时按 Z，或点击“使用道具”，清开障碍。",
      "Collect the shockwave. Press Z or tap Use item when close to the traffic to clear it.",
    ],
  },
  {
    id: "ludicrous",
    title: ["超加速", "Ludicrous boost"],
    reward: 15,
    target: 220,
    prompt: [
      "拾取超加速后按 Z 或点击“使用道具”，体验加速、无敌和双倍得分。",
      "Collect the boost, then press Z or tap Use item for speed, invincibility and double score.",
    ],
  },
  {
    id: "star",
    title: ["星光无敌", "Starman"],
    reward: 15,
    target: 220,
    prompt: [
      "沿中间车道拾取星星。它会自动提供限时无敌，观察状态条。",
      "Collect the star in the middle lane for automatic temporary invincibility. Watch its status bar.",
    ],
  },
  {
    id: "rocket",
    title: ["火箭能量", "Rocket charge"],
    reward: 15,
    target: 250,
    prompt: [
      "训练已预充部分能量。沿中间车道拾取三只气罐，充满火箭槽，体验自动增益。",
      "Your charge is partly filled for practice. Collect three middle-lane canisters to fill the rocket meter and activate it.",
    ],
  },
  {
    id: "head_start",
    title: ["开局冲刺", "Head start"],
    reward: 20,
    target: 5150,
    prompt: [
      "点击“免费试用”，体验一次 5 公里开局冲刺。正式游戏在开局道具界面选择。",
      "Tap Free trial to experience a 5 km head start. In normal play, select it before launch.",
    ],
  },
  {
    id: "start_revive",
    title: ["自动复活", "Automatic revive"],
    reward: 20,
    target: 170,
    prompt: [
      "点击“免费试用”装配自动复活，再留在中间车道体验碰撞后的自动恢复。",
      "Tap Free trial to equip an automatic revive, then stay in the middle lane to experience it.",
    ],
  },
  {
    id: "revive",
    title: ["碰撞后复活", "Revive after a crash"],
    reward: 20,
    target: 170,
    prompt: [
      "沿中间车道体验一次碰撞，随后点击“免费复活”，继续行驶。",
      "Stay in the middle lane for a demonstration crash, then tap Free revive to continue.",
    ],
  },
  {
    id: "coin_double",
    title: ["双倍金币", "Double coins"],
    reward: 20,
    target: 200,
    prompt: [
      "点击“免费试用”，行驶 200 米，在结算中查看本局基础金币翻倍。正式游戏需在开局选择。",
      "Tap Free trial and drive 200 m to see base run coins doubled in the results. In normal play, equip it before launch.",
    ],
  },
];
export const LESSON_COUNT = LESSONS.length;
export function nextAcademyLesson(completed, success, progress) {
  if (!success) return completed;
  return completed + 1 < LESSON_COUNT
    ? completed + 1
    : Math.max(0, Math.min(LESSON_COUNT, Number(progress) || 0));
}
export const lessonIndex = (n) =>
  Math.max(0, Math.min(LESSON_COUNT - 1, Math.trunc(Number(n) || 0)));
export const lessonText = (index, field = "title", english = false) =>
  LESSONS[lessonIndex(index)][field]?.[english ? 1 : 0] || "";
export function evaluateItemLesson(index, metrics) {
  const lesson = LESSONS[lessonIndex(index)],
    d = metrics.demo || {};
  const done = {
    airCan: d.airCan > 0 && d.airRestored > 0,
    overpressure: d.overpressure > 0 && d.fullRefill,
    shield: d.shield > 0 && d.shieldSaved,
    shockwave: d.shockwaveUsed && d.shockwaveCleared,
    ludicrous: d.ludicrousUsed && d.powerTime >= 2,
    star: d.star && d.powerTime >= 2,
    rocket: d.rocket && d.powerTime >= 2,
    head_start: d.headStart && d.headStartFinished,
    start_revive: d.autoRevived,
    revive: d.manualRevived,
    coin_double: d.coinDouble,
  }[lesson.id];
  const success = !!done && metrics.distance >= lesson.target;
  return {
    success,
    finished: success || metrics.distance >= Math.max(650, lesson.target + 500),
    target: lesson.target,
    progress: Math.min(1, metrics.distance / lesson.target) * 0.4 + (done ? 0.6 : 0),
  };
}
