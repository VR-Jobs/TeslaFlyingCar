import { rainbowMultiplier } from "./rainbow-rules.js";
import { add, sub, mul, dot, clamp } from "./course.js";
import { routeCourse } from "./adventure-course.js";
function state(run, course) {
  const key = course.id ?? "baseline";
  if (!run.adventure || run.adventure.key !== key)
    run.adventure = {
      key,
      claimed: new Set(),
      gates: new Set(),
      branches: run.adventure?.branches || 0,
      chains: run.adventure?.chains || 0,
      attempt: null,
      transfer: null,
      cue: "",
      notice: 0,
    };
  return run.adventure;
}
function reward(run, a, key, points, air, type) {
  if (a.claimed.has(key)) return false;
  a.claimed.add(key);
  points *= rainbowMultiplier(run);
  run.score += points;
  run.pressure = clamp(run.pressure + air, 0, 100);
  run.events.push({ type, points });
  return true;
}
function returnToMain(run, course, branch, detach) {
  const f = course.pose(run.s),
    delta = sub(f.p, run.pos);
  detach(run, branch, 5.5, "branchReturn");
  run.velocity = add(run.velocity, mul(f.right, clamp(dot(delta, f.right) * 1.1, -11, 11)));
  run.routeId = null;
  run.targetLane = 0;
  run.near = null;
  const a = state(run, course);
  a.transfer = { id: branch.id, returning: true };
  run.events.push({ type: "branchReturn" });
}
export function adventureCommand(run, course, event, detach) {
  if (run.tutorial?.active) return false;
  const a = state(run, course),
    branch = course.adventures?.branches.find((b) => b.id === run.routeId);
  if (
    branch &&
    run.attached &&
    run.s >= branch.end - 18 &&
    (event === "jumpPress" || event === "suctionRelease")
  ) {
    if (event === "jumpPress") {
      if (run.pressure < 6) return false;
      run.pressure -= 6;
      run.input.jump = true;
    } else run.input.suction = false;
    returnToMain(run, course, branch, detach);
    return true;
  }
  if (event === "jumpPress" && run.attached && !run.routeId && run.pressure >= 6) {
    const entry = course.adventures?.branches.find(
      (b) => run.s >= b.launchStart && run.s <= b.launchEnd && run.lane * b.side > 2.1,
    );
    if (entry) {
      run.pressure -= 6;
      run.input.jump = true;
      const source = course.pose(run.s, run.lane);
      detach(run, course, 8, "branch");
      run.velocity = add(run.velocity, mul(source.right, entry.side * 5));
      run.routeId = entry.id;
      run.targetLane = 0;
      run.near = null;
      a.transfer = { id: entry.id, returning: false };
      run.events.push({ type: "branchLaunch" });
      return true;
    }
  }
  return false;
}
export function registerChainJump(run, course) {
  if (run.tutorial?.active || run.attached) return;
  const chain = course.adventures?.chains.find(
    (c) => (c.routeId || null) === (run.routeId || null) && Math.abs(c.launchS - run.s) < 10,
  );
  if (!chain) return;
  const a = state(run, course);
  run.gravityFactor = 1;
  a.attempt = { id: chain.id, step: 0, tricks: run.tricks, awaitLand: false };
  run.events.push({ type: "chainStart" });
}
export function adventureBeforeStep(run, course, dt, detach) {
  if (!course.adventures || run.tutorial?.active) return;
  const a = state(run, course);
  a.notice = Math.max(0, a.notice - dt);
  const branch = course.adventures.branches.find((b) => b.id === run.routeId);
  if (branch && run.attached && run.s >= branch.end - 3) returnToMain(run, course, branch, detach);
}
export function adventureAfterStep(run, course, path, previous, dt) {
  if (!course.adventures || run.tutorial?.active) return;
  const a = state(run, course),
    branch = course.adventures.branches.find((b) => b.id === run.routeId);
  if (run.attached && branch && a.transfer && !a.transfer.returning) {
    reward(run, a, branch.id + "-attach", 120, 10, "branchAttach");
    a.transfer = null;
  }
  if (run.attached && !run.routeId && a.transfer?.returning) {
    if (
      run.input.suction &&
      run.pressure > 0 &&
      a.claimed.has(a.transfer.id + "-attach") &&
      reward(run, a, a.transfer.id + "-complete", 320, 12, "branchComplete")
    )
      a.branches++;
    a.transfer = null;
  }
  const attempt = a.attempt,
    chain = course.adventures.chains.find((c) => c.id === attempt?.id);
  if (chain) {
    if ((chain.routeId || null) !== (run.routeId || null)) {
      a.attempt = null;
      return;
    }
    const gate = chain.gates[attempt.step];
    if (gate && previous.s < gate.s && run.s >= gate.s) {
      const t = clamp((gate.s - previous.s) / Math.max(0.001, run.s - previous.s), 0, 1);
      const p = add(previous.pos, mul(sub(run.pos, previous.pos), t)),
        f = path.pose(gate.s);
      const d = sub(p, f.p),
        x = dot(d, f.right),
        y = dot(d, f.up) + 0.55 - gate.height;
      const action =
        gate.action === "jump"
          ? true
          : gate.action === "spin"
            ? run.rollProgress > 0 || run.flipProgress > 0 || run.tricks > attempt.tricks
            : run.input.suction && run.pressure > 0;
      if (
        (!run.attached || gate.action === "suction") &&
        (gate.action === "suction" && run.attached
          ? Math.abs(x) < 1.65
          : Math.hypot(x, y) < 1.65) &&
        action
      ) {
        const k = chain.id + "-" + gate.index;
        a.gates.add(k);
        reward(run, a, k, 40 + 20 * gate.index, 4, "chainGate");
        attempt.step++;
        attempt.awaitLand = attempt.step === 3;
      } else {
        a.attempt = null;
        a.cue = "漏门仍可继续 · 先安全接轨";
        a.notice = 1.4;
        run.events.push({ type: "chainMiss" });
      }
    }
    if (a.attempt?.awaitLand && run.attached) {
      const earned = reward(run, a, chain.id + "-complete", 350, 20, "chainComplete");
      if (earned) a.chains++;
      a.attempt = null;
      a.cue = earned ? "三连环完成 · +350 分" : "三连环完成 · 本段奖励已领取";
      a.notice = 2;
    } else if (run.attached && attempt.step === 1 && !attempt.awaitLand) {
      a.attempt = null;
    }
  }
  if (a.notice > 0) return;
  if (branch) {
    if (!run.attached && a.transfer) {
      a.cue = "松开空格 · 按住 E 接入金色支路";
      return;
    }
    if (run.s > branch.end - 35) {
      a.cue = "返航箭头：空格弹回 · 按住 E 接主路";
      return;
    }
  }
  if (a.attempt) {
    const c = course.adventures.chains.find((c) => c.id === a.attempt.id);
    a.cue = a.attempt.awaitLand
      ? "按住 E 平稳接轨，领取连环奖励"
      : [
          "① 短喷后松空格和 E，穿过第一环",
          "② 松开 E，点方向键桶滚或空格前翻",
          "③ 按住 E 穿环并接轨",
        ][a.attempt.step];
    return;
  }
  const next = course.adventures.chains.find(
    (c) =>
      (c.routeId || null) === (run.routeId || null) &&
      c.launchS - run.s > -8 &&
      c.launchS - run.s < 36,
  );
  if (next) {
    a.cue = (run.speed > 40 ? "高速点喷起跳" : "箭头处起跳短喷") + " · ①飞跃 ②翻转 ③E接轨";
    return;
  }
  if (!run.routeId) {
    const entry = course.adventures.branches.find(
      (b) => b.launchS - run.s > -12 && b.launchS - run.s < 65,
    );
    if (entry) {
      a.cue = (entry.side < 0 ? "左" : "右") + "侧金色箭头：空格短喷，再按 E 换轨";
      return;
    }
  }
  a.cue = "";
}
export function adventureStatus(run) {
  const a = run?.adventure;
  return {
    route: run?.routeId || "main",
    branches: a?.branches || 0,
    chains: a?.chains || 0,
    gate: a?.attempt?.step || 0,
    cue: a?.cue || "",
    claimed: a?.claimed.size || 0,
  };
}
