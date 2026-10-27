import { LESSONS } from "./lessons.js";

export function installItemTraining(context, options, metrics, suspended) {
  const { game, backend, config } = context;
  const current = () =>
    !suspended() && options().mode === "academy" && options().lesson >= 3
      ? LESSONS[options().lesson]
      : null;
  const data = () => (metrics().demo ||= {});
  function pickup(id, distance) {
    const z = game.distance - distance;
    if (id === "airCan") game.pickups.addCan(0, z, 0.8);
    else if (id === "star") game.pickups.addStar(0, z);
    else game.pickups.addItem(id, 0, z);
  }
  function obstacle(distance) {
    game.traffic.add("sedan", 0, game.distance - distance);
  }
  const grant = game.grantItem;
  game.grantItem = function (id) {
    const air = this.player.air,
      out = grant.call(this, id);
    if (current() && out) {
      const d = data();
      d[id] = (d[id] || 0) + 1;
      d.airRestored = (d.airRestored || 0) + Math.max(0, this.player.air - air);
      if (id === "overpressure") d.fullRefill = this.player.air >= config.AIR.capacity - 0.01;
    }
    return out;
  };
  const use = game.useItem;
  game.useItem = function () {
    const id = this.item,
      out = use.call(this);
    if (current() && id && this.item !== id) {
      const d = data();
      d[id + "Used"] = true;
      if (id === "shockwave") d.shockwaveCleared = this.stats.maxShockwave > 0;
    }
    return out;
  };
  for (const [method, key] of [
    ["startStar", "star"],
    ["startRocket", "rocket"],
    ["startHeadStart", "headStart"],
  ]) {
    const original = game[method];
    game[method] = function (...args) {
      const out = original.apply(this, args);
      if (current()) data()[key] = true;
      return out;
    };
  }
  const revive = game.revive;
  game.revive = function (...args) {
    const downed = this.state === "downed",
      out = revive.apply(this, args);
    if (current() && downed && this.state === "playing") {
      const d = data();
      d[args[0]?.start ? "autoRevived" : "manualRevived"] = true;
      d.waitingRevive = false;
    }
    return out;
  };
  const canRevive = game.canRevive,
    downed = game.onDowned;
  game.canRevive = function (...args) {
    return current()?.id === "revive" ? this.revives < 1 : canRevive?.apply(this, args);
  };
  game.onDowned = function (...args) {
    if (current()?.id === "revive") {
      data().waitingRevive = true;
      return;
    }
    return downed?.apply(this, args);
  };
  function beforeStep() {
    const lesson = current();
    if (!lesson) return;
    const d = data();
    if (game.state === "playing" && !d.prepared) {
      d.prepared = true;
      game.traffic.clear();
      game.pickups.clear();
      if (
        ["airCan", "overpressure", "shield", "shockwave", "ludicrous", "star"].includes(lesson.id)
      )
        pickup(lesson.id, game.distance + 45);
      if (lesson.id === "rocket") {
        game.fever = 1 - (3 * config.ROCKET.gain.can) / config.ROCKET.chargeRequired + 0.00001;
        for (const ahead of [35, 65, 95]) pickup("airCan", game.distance + ahead);
      }
      if (["shield", "shockwave", "ludicrous", "star", "revive"].includes(lesson.id))
        obstacle(game.distance + 125);
    }
    if (game.state === "playing") {
      if (lesson.id === "airCan" && !d.airCan)
        game.player.air = Math.min(game.player.air, config.AIR.capacity * 0.42);
      if (lesson.id === "overpressure" && !d.overpressure)
        game.player.air = Math.min(game.player.air, config.AIR.capacity * 0.25);
    }
  }
  function afterStep(dt) {
    const lesson = current();
    if (!lesson) return;
    const d = data();
    if (game.stats.shieldSaves > 0) d.shieldSaved = true;
    if (
      (lesson.id === "ludicrous" && game.ludT > 0) ||
      (lesson.id === "star" && game.starT > 0) ||
      (lesson.id === "rocket" && game.rocketT > 0)
    )
      d.powerTime = (d.powerTime || 0) + dt;
    if (
      lesson.id === "head_start" &&
      d.headStart &&
      game.state === "playing" &&
      game.distance >= 4999
    )
      d.headStartFinished = true;
  }
  function action() {
    const lesson = current();
    if (!lesson) return;
    const d = data();
    if (lesson.id === "revive" && d.waitingRevive) {
      game.revive();
      return;
    }
    if (["shockwave", "ludicrous"].includes(lesson.id)) {
      game.useItem();
      return;
    }
    if (game.state !== "playing" || d.armed) return;
    d.armed = true;
    if (lesson.id === "head_start") game.startHeadStart();
    if (lesson.id === "start_revive") {
      game.startRevives = 1;
      game.startItems.push("start_revive");
      obstacle(game.distance + 80);
    }
    if (lesson.id === "coin_double") {
      d.coinDouble = true;
      game.startItems.push("coin_double");
      const run = backend.state.activeRuns[game.runId];
      if (run && !run.startItems.includes("coin_double")) run.startItems.push("coin_double");
    }
  }
  function button() {
    const lesson = current();
    if (!lesson) return null;
    const d = data(),
      en = document.documentElement.lang === "en";
    if (lesson.id === "revive" && d.waitingRevive)
      return { text: en ? "Free revive" : "免费复活", enabled: true };
    if (["shockwave", "ludicrous"].includes(lesson.id) && game.item === lesson.id)
      return { text: en ? "Use item · Z" : "使用道具 · Z", enabled: game.state === "playing" };
    if (["head_start", "start_revive", "coin_double"].includes(lesson.id) && !d.armed)
      return { text: en ? "Free trial" : "免费试用", enabled: game.state === "playing" };
    return null;
  }
  function coach() {
    const lesson = current();
    if (!lesson) return null;
    const d = data(),
      en = document.documentElement.lang === "en";
    if (d.waitingRevive)
      return en
        ? "The car has crashed. Tap Free revive to continue without using an inventory item."
        : "已发生示范碰撞。点击“免费复活”继续，不会消耗背包道具。";
    if (d.autoRevived || d.manualRevived)
      return en
        ? "Revive successful. Continue to the finish; watch the brief invincibility period."
        : "复活成功！继续驶向终点，留意复活后的短暂无敌。";
    if (lesson.id === "head_start" && d.headStart)
      return game.state === "headstart"
        ? en
          ? "Head start active. Enjoy the 5 km flight; regular driving resumes afterwards."
          : "开局冲刺进行中：体验 5 公里飞行，结束后会恢复普通驾驶。"
        : en
          ? "Head start complete. Drive a little further to finish this lesson."
          : "开局冲刺已完成。再行驶一小段路，完成本关。";
    if (lesson.id === "start_revive" && d.armed)
      return en
        ? "Automatic revive equipped. Stay in the middle lane for the demonstration collision."
        : "自动复活已装配。留在中间车道，体验碰撞后的自动恢复。";
    if (d.coinDouble)
      return en
        ? "Double coins equipped. Reach 200 m and check the doubled base coins in the results."
        : "双倍金币已开启。行驶至 200 米，在结算查看基础金币翻倍。";
    if (d.shieldSaved)
      return en
        ? "The shield absorbed the collision. Continue to the finish."
        : "护盾已经挡住一次碰撞！继续驶向终点。";
    if (d.shield)
      return en
        ? "Shield ready. Stay in the middle lane to test one protected collision."
        : "护盾已就绪。留在中间车道，体验一次受保护的碰撞。";
    if (d.shockwaveCleared)
      return en
        ? "Traffic cleared by the shockwave. Continue to the finish."
        : "冲击波已清开前方车辆！继续驶向终点。";
    if (d.ludicrousUsed || d.star || d.rocket)
      return en
        ? "Power-up active. Watch its countdown, then continue to the finish."
        : "增益已生效。观察剩余时间，再继续驶向终点。";
    if ((lesson.id === "airCan" && d.airCan) || (lesson.id === "overpressure" && d.overpressure))
      return en
        ? "Air restored automatically. Continue to the finish."
        : "空气已经自动补充。继续驶向终点。";
    return null;
  }
  return {
    beforeStep,
    afterStep,
    action,
    coach,
    button,
    waiting: () => !!current() && !!data().waitingRevive,
    active: () => !!current(),
  };
}
