import { directionCommand, stepSteering, syncSteeringProfile, snapToLane } from "./steering.js";
import { stepDirector } from "./director.js";
import {
  startRainbow,
  stepRainbow,
  resetRainbow,
  rainbowActive,
  rainbowProtected,
  rainbowMultiplier,
  rainbowSpeed,
  smashRainbowCar,
} from "./rainbow-rules.js";
import { add, sub, mul, dot, norm, clamp, nearestSurface } from "./course.js";
import { sweepCar } from "./track-surface.js";
import { advanceEndless, challengeSpeed } from "./endless.js";
import { updateGrip, requiresSuction, spinEase, GRIP } from "./grip.js";
import { beginDeath, stepDeath } from "./failure.js";
import { sweepTrafficCars } from "./traffic-rules.js";
import { stepTraffic, stepNearMiss } from "./traffic-motion.js";
import { stepEscort, releaseEscort, resetEscort } from "./escort-rules.js";
import { stepVoyage, flightGravity } from "./voyage-rules.js";
import { routeCourse } from "./adventure-course.js";
import {
  adventureCommand,
  registerChainJump,
  adventureBeforeStep,
  adventureAfterStep,
} from "./adventure-rules.js";
export function createRun(course, { planet = "earth" } = {}) {
  const run = {
    startPlanet: planet,
    controlMode: null,
    s: 0,
    routeId: null,
    adventure: null,
    rainbow: null,
    escort: null,
    trafficState: null,
    voyageState: null,
    voyageNotice: null,
    gravityFactor: 1,
    endless: !!course.endless,
    laps: 0,
    completedDistance: 0,
    worldOrigin: [0, 0, 0],
    distance: 0,
    bestDistance: 0,
    speed: 25,
    lane: 0,
    targetLane: 0,
    steering: null,
    pos: course.pose(0).p,
    velocity: [0, 0, -25],
    attached: true,
    pressure: 100,
    time: 0,
    penalty: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    rings: 0,
    tricks: 0,
    beatHits: 0,
    lands: 0,
    falls: 0,
    collisions: 0,
    trackImpacts: 0,
    impactLock: 0,
    lastTrackContact: null,
    checkpoint: 0,
    checkpointIndex: 0,
    phase: "running",
    airTime: 0,
    detachCooldown: 0,
    invuln: 0,
    respawnTime: 0,
    roll: 0,
    pitch: 0,
    flipProgress: 0,
    gripStress: 0,
    gripWarningLevel: 0,
    gripWarningReason: null,
    gripNextTone: 0,
    gripRequired: false,
    detachCause: null,
    driftSign: 1,
    death: null,
    spinBlocked: 0,
    rollProgress: 0,
    rollDir: 0,
    taken: new Set(),
    hit: new Set(),
    autoPads: new Set(),
    message: "按住 E 吸附 · 空格喷气 · 收集绿色气罐补气",
    messageTime: 7,
    feedback: "",
    feedbackTime: 0,
    events: [],
    pendingEvents: [],
    input: { suction: false, jump: false, boost: false, brake: false, left: false, right: false },
    assist: true,
  };
  syncSteeringProfile(run, course);
  return run;
}
export function detach(run, course, impulse = 6, cause = "jump") {
  if (!run.attached) return;
  const f = course.pose(run.s, run.lane);
  run.attached = false;
  run.pos = add(f.p, mul(f.up, 0.08));
  run.velocity = add(mul(f.t, run.speed), mul(f.up, impulse));
  run.airTime = 0;
  run.detachCooldown = 0.24;
  run.detachCause = cause;
  run.gravityFactor = flightGravity(run, course, cause);
  releaseEscort(run, course, cause);
  run.events.push({ type: cause === "grip" ? "drift" : "jump" });
}
export function command(run, course, event) {
  if (run.phase !== "running") return;
  const held = directionCommand(run, course, event);
  if (held === true) return;
  if (held) event = held;
  const before = run.events.length;
  const mainCourse = course;
  if (adventureCommand(run, mainCourse, event, detach)) {
    run.pendingEvents.push(...run.events.splice(before));
    return;
  }
  course = routeCourse(mainCourse, run);
  if (event === "left" || event === "right") {
    const dir = event === "left" ? -1 : 1;
    if (run.attached || !run.adventure?.attempt) {
      run.targetLane = clamp(
        run.targetLane + dir * (course.laneStep || 3.2),
        -(course.laneLimit ?? 3.2),
        course.laneLimit ?? 3.2,
      );
      if (run.controlMode === "fixed" && !(run.adventure?.transfer && !run.attached))
        snapToLane(run, course);
    }
    if (
      !run.attached &&
      run.airTime > 0.09 &&
      run.rollProgress === 0 &&
      !run.flipProgress &&
      run.pressure > 8 &&
      dot(sub(run.pos, (run.near || course.pose(run.s)).p), (run.near || course.pose(run.s)).up) >
        1.05
    ) {
      run.rollProgress = 0.001;
      run.rollDir = dir;
      run.pressure -= 8;
    }
  }
  if (event === "jumpPress") {
    run.input.jump = true;
    if (run.attached && run.pressure >= 6) {
      run.pressure -= 6;
      detach(run, course, 8);
      registerChainJump(run, mainCourse);
    } else if (!run.attached && run.airTime > 0.1 && !run.rollProgress && !run.flipProgress) {
      const near = run.near || course.pose(run.s, run.lane),
        height = dot(sub(run.pos, near.p), near.up);
      if (height > 2.6 && run.pressure >= 10) {
        run.pressure -= 10;
        run.flipProgress = 0.001;
        run.pendingEvents.push({ type: "flip" });
      } else {
        run.spinBlocked = 0.4;
        run.pendingEvents.push({ type: "spinBlocked" });
      }
    }
  }
  if (event === "jumpRelease") run.input.jump = false;
  if (event === "suctionPress") run.input.suction = true;
  if (event === "suctionRelease") {
    const wasHeld = run.input.suction;
    run.input.suction = false;
    if (
      wasHeld &&
      run.attached &&
      (!requiresSuction(course.pose(run.s), run.speed) || run.tutorial?.active)
    )
      detach(run, course, 4.5, "release");
  }
  if (event === "boostPress") run.input.boost = true;
  if (event === "boostRelease") run.input.boost = false;
  if (event === "brakePress") run.input.brake = true;
  if (event === "brakeRelease") run.input.brake = false;
  // Commands can arrive between physics ticks; preserve their sound/visual events.
  run.pendingEvents.push(...run.events.splice(before));
}
export function rescue(run, course) {
  resetEscort(run);
  resetRainbow(run);
  run.falls++;
  run.penalty += 4;
  run.combo = 0;
  run.pressure = Math.max(78, run.pressure);
  run.respawnTime = 0.65;
  run.phase = "rescue";
  run.feedback = "返回最近检查点";
  run.feedbackTime = 2;
  run.events.push({ type: "rescue" });
}
export function restartCheckpoint(run, course) {
  resetEscort(run);
  resetRainbow(run);
  run.gravityFactor = 1;
  run.routeId = null;
  if (run.adventure) {
    run.adventure.attempt = null;
    run.adventure.transfer = null;
    run.adventure.cue = "";
  }
  run.s = run.checkpoint;
  run.lane = run.targetLane = 0;
  run.pos = course.pose(run.s).p;
  run.attached = true;
  run.speed = 23;
  run.pressure = Math.max(78, run.pressure);
  run.near = null;
  run.velocity = mul(course.pose(run.s).t, 23);
  run.airTime = 0;
  run.rollProgress = run.roll = run.flipProgress = run.pitch = 0;
  run.death = null;
  run.detachCause = null;
  run.gripStress = run.gripWarningLevel = 0;
  run.gripWarningReason = null;
  run.phase = "running";
  run.detachCooldown = 0.3;
  run.invuln = 1.5;
  // Inputs are released after recovery; the HUD keeps the help visible.
  run.input.jump = run.input.boost = run.input.left = run.input.right = false;
  run.steering = null;
  run.gripNextTone = run.spinBlocked = 0;
  run.events = [];
  run.pendingEvents = [];
  for (const gap of course.gaps) if (gap.start > run.checkpoint) run.autoPads.delete(gap.start);
}
function award(run, points, text) {
  run.combo++;
  run.maxCombo = Math.max(run.maxCombo, run.combo);
  run.score += Math.round(points * (1 + Math.min(8, run.combo) * 0.12)) * rainbowMultiplier(run);
  run.feedback = text;
  run.feedbackTime = 1.3;
}
function attachToSurface(run, course, surface) {
  const impact = Math.min(1.4, Math.abs(dot(run.velocity, surface.up)) / 10);
  run.s = Math.max(0, surface.s);
  const limit = course.laneLimit ?? 3.2,
    step = course.laneStep || 3.2;
  run.lane = clamp(
    surface.lane,
    -Math.min(4.4, course.width / 2 - 1.03),
    Math.min(4.4, course.width / 2 - 1.03),
  );
  run.targetLane = clamp(Math.round(run.lane / step) * step, -limit, limit);
  if (syncSteeringProfile(run, course).mode === "fixed") run.lane = run.targetLane;
  run.attached = true;
  run.speed = clamp(dot(run.velocity, surface.t), 20, 45);
  run.pos = course.pose(run.s, run.lane).p;
  run.near = surface;
  run.velocity = mul(surface.t, run.speed);
  run.lands++;
  run.gravityFactor = 1;
  run.pressure -= 3;
  run.roll = run.rollProgress = run.pitch = run.flipProgress = 0;
  run.detachCause = null;
  run.gripStress = run.gripWarningLevel = 0;
  run.gripWarningReason = null;
  award(run, 70 + run.airTime * 35, "平稳接轨");
  run.events.push({ type: "land", impact });
}
export function stepRun(run, course, dt) {
  run.events = run.pendingEvents.splice(0);
  if (run.phase === "finished" || run.phase === "dead") return;
  if (run.phase === "dying") {
    stepDeath(run, dt);
    return;
  }
  run.messageTime = Math.max(0, run.messageTime - dt);
  run.feedbackTime = Math.max(0, run.feedbackTime - dt);
  if (run.phase === "rescue") {
    run.respawnTime -= dt;
    if (run.respawnTime <= 0) restartCheckpoint(run, course);
    return;
  }
  const mainCourse = course;
  syncSteeringProfile(run, mainCourse);
  stepTraffic(run, mainCourse, dt);
  stepVoyage(run, mainCourse, dt);
  adventureBeforeStep(run, mainCourse, dt, detach);
  course = routeCourse(mainCourse, run);
  const collisionStart = {
    s: run.s,
    lane: run.lane,
    pos: [...run.pos],
    roll: run.roll,
    pitch: run.pitch,
    attached: run.attached,
    velocity: [...run.velocity],
  };
  run.time += dt;
  stepRainbow(run, mainCourse, dt);
  run.detachCooldown = Math.max(0, run.detachCooldown - dt);
  run.invuln = Math.max(0, run.invuln - dt);
  run.impactLock = Math.max(0, run.impactLock - dt);
  run.spinBlocked = Math.max(0, run.spinBlocked - dt);
  const input = rainbowActive(run)
      ? { ...run.input, suction: run.attached || run.input.suction }
      : run.input,
    wasS = run.s,
    boost = input.boost && run.pressure > 2;
  const speeds = challengeSpeed(run);
  const target = input.brake
    ? 17
    : Math.min(48, (boost ? speeds.boost : speeds.cruise) * rainbowSpeed(run, mainCourse));
  run.speed += (target - run.speed) * (1 - Math.exp(-2 * dt));
  if (boost) run.pressure -= 13 * dt;
  const previous = course.pose(run.s, run.lane);
  if (run.attached) {
    const beforeMove = {
      s: run.s,
      lane: run.lane,
      roll: run.roll,
      pitch: run.pitch,
      pos: [...run.pos],
    };
    stepSteering(run, course, previous, dt, input.suction && run.pressure > 0);
    const demand = 8 * (1 - previous.up[1]) + run.speed * run.speed * previous.curvature * 0.3;
    const force =
      input.suction && run.pressure > 0 ? 65 : run.assist ? 22 : Math.max(0, previous.up[1]) * 12;
    const losesGrip = updateGrip(run, previous, dt);
    if (losesGrip) {
      run.driftSign =
        previous.right[1] < -0.05 ? -1 : previous.right[1] > 0.05 ? 1 : run.s % 2 < 1 ? 1 : -1;
      detach(run, course, 4.2, "grip");
      run.events.push({ type: "gripLost" });
    } else if (!run.gripRequired && demand > force + 0.2) detach(run, course, 0.4, "grip");
    else {
      run.s += (run.speed * dt) / (course.metric?.(run.s) || 1);
      run.pos = course.pose(run.s, run.lane).p;
      run.pressure +=
        dt *
        (previous.up[1] > 0.65 && previous.curvature < 0.008 ? 9 : -(4 + 5 * (1 - previous.up[1])));
      for (const gap of course.gaps) {
        if (
          gap.auto &&
          !run.autoPads.has(gap.start) &&
          run.s >= gap.start - 5 &&
          run.s <= gap.start
        ) {
          run.autoPads.add(gap.start);
          detach(run, course, 8, "pad");
          run.feedback = "弹射！按住 E 准备接轨";
          run.feedbackTime = 2;
          break;
        }
      }
      if (run.attached && !course.frame(run.s).exists) detach(run, course, 0, "gap");
      if (run.attached) {
        const blocked = sweepCar(course, beforeMove, run, true);
        if (blocked) {
          run.pos = beforeMove.pos;
          run.s = beforeMove.s;
          run.trackImpacts++;
          run.lastTrackContact = {
            kind: blocked.kind,
            s: blocked.s,
            normal: blocked.normal,
            point: blocked.point,
          };
          if (run.tutorial?.active) rescue(run, course);
          else beginDeath(run, course, "碰到交叉轨道");
          return;
        }
      }
    }
  }
  if (!run.attached) {
    const beforeFlight = {
      s: run.s,
      lane: run.lane,
      roll: run.roll,
      pitch: run.pitch,
      pos: [...run.pos],
    };
    let completedRoll = false,
      spinKind = "barrel";
    if (run.rollProgress > 0) {
      run.rollProgress = Math.min(1, run.rollProgress + dt / 0.62);
      run.roll = run.rollDir * Math.PI * 2 * spinEase(run.rollProgress);
      if (run.rollProgress >= 1) {
        run.rollProgress = 0;
        run.roll = 0;
        completedRoll = true;
      }
    }
    if (run.flipProgress > 0) {
      run.flipProgress = Math.min(1, run.flipProgress + dt / 0.74);
      run.pitch = -Math.PI * 2 * spinEase(run.flipProgress);
      if (run.flipProgress >= 1) {
        run.flipProgress = 0;
        run.pitch = 0;
        completedRoll = true;
        spinKind = "flip";
      }
    }
    run.airTime += dt;
    const f = course.frame(run.s);
    const thrust = input.jump && run.pressure > 0;
    let accel = [0, -16 * (run.gravityFactor || 1), 0];
    if (thrust) {
      accel = add(accel, mul(f.up, 23));
      run.pressure -= 20 * dt;
    }
    const lateral = dot(sub(run.pos, f.p), f.right);
    accel = add(
      accel,
      mul(
        f.right,
        clamp((run.targetLane - lateral) * 13 - dot(run.velocity, f.right) * 4, -25, 25),
      ),
    );
    run.velocity = add(run.velocity, mul(accel, dt));
    run.pos = add(run.pos, mul(run.velocity, dt));
    run.s = clamp(
      run.s + (Math.max(0, dot(run.velocity, f.t)) * dt) / (course.metric?.(run.s) || 1),
      0,
      run.endless ? course.length + 80 : course.length,
    );
    const near = nearestSurface(course, run.pos, run.s);
    run.near = near;
    const hit = sweepCar(course, beforeFlight, run);
    if (hit) {
      run.lastTrackContact = { kind: hit.kind, s: hit.s, normal: hit.normal, point: hit.point };
      const frame = course.frame(hit.s),
        lane = clamp(dot(sub(hit.point, frame.p), frame.right), -4.4, 4.4);
      const target = course.pose(hit.s, lane);
      const landing =
        hit.kind === "top" &&
        hit.foot &&
        Math.abs(hit.s - run.s) < 60 &&
        ((input.suction && run.pressure > 0) ||
          (!run.routeId && run.detachCause !== "grip" && target.up[1] > 0.6)) &&
        dot(run.velocity, target.t) > -0.1;
      if (landing) attachToSurface(run, course, { ...target, lane });
      else {
        completedRoll = false;
        const time = Math.max(0, hit.time - 0.002);
        run.pos = add(
          add(beforeFlight.pos, mul(sub(run.pos, beforeFlight.pos), time)),
          mul(hit.normal, 0.025),
        );
        run.s = beforeFlight.s + (run.s - beforeFlight.s) * time;
        const vn = dot(run.velocity, hit.normal);
        if (vn < 0) run.velocity = sub(run.velocity, mul(hit.normal, vn * 1.15));
        run.roll = run.rollProgress = 0;
        run.detachCooldown = 0.18;
        if (run.impactLock === 0) {
          run.trackImpacts++;
          run.collisions++;
          run.penalty += 2;
          run.combo = 0;
          run.impactLock = 0.45;
          run.feedback =
            hit.kind === "bottom"
              ? "碰到轨道底面"
              : hit.kind === "wall"
                ? "碰到轨道侧面"
                : "高度不足，触碰轨道";
          run.feedbackTime = 1.6;
          run.events.push({ type: "trackImpact" });
        }
      }
    }
    if (near && !hit) {
      run.lane = near.lane;
      const manual = input.suction && run.pressure > 0;
      const canPull =
        manual ||
        (!run.routeId &&
          run.detachCause !== "grip" &&
          run.assist &&
          near.up[1] > 0.45 &&
          near.distance < 1.4);
      if (
        canPull &&
        near.distance < 5.5 &&
        Math.abs(dot(sub(run.pos, near.p), near.t)) < 1.5 &&
        near.height >= -0.18 &&
        run.detachCooldown === 0 &&
        !(run.airTime < 0.5 && dot(run.velocity, near.up) > 1.5)
      ) {
        const vn = dot(run.velocity, near.up);
        const pull = clamp(near.height * (manual ? 27 : 16) + vn * 5, -8, manual ? 48 : 22);
        run.velocity = add(run.velocity, mul(near.up, -pull * dt));
      }
      if (
        near.height >= -0.18 &&
        near.height < 0.28 &&
        near.distance < 0.65 &&
        Math.abs(near.lane) < course.width / 2 - 1.05 &&
        dot(sub(beforeFlight.pos, near.p), near.up) >= -0.02 &&
        run.detachCooldown === 0 &&
        (manual || (!run.routeId && run.detachCause !== "grip" && near.up[1] > 0.6)) &&
        dot(run.velocity, near.up) <= 0.5
      ) {
        attachToSurface(run, course, near);
      }
    }
    if (
      (run.detachCause === "grip" && run.airTime > GRIP.recoverySeconds) ||
      run.airTime > 3.6 ||
      !near ||
      near.distance > 28
    ) {
      if (run.tutorial?.active) rescue(run, course);
      else
        beginDeath(
          run,
          course,
          run.detachCause === "grip"
            ? run.pressure <= 0
              ? "气量耗尽，无法维持吸附"
              : "未按 E 吸附，车辆失去抓地"
            : "未能重新接轨",
        );
    }
    if (completedRoll && run.phase === "running") {
      run.tricks++;
      award(run, 90, spinKind === "flip" ? "完整前空翻" : "完整桶滚");
      run.events.push({ type: "trick" });
    }
  }
  if (run.attached && run.rollProgress > 0) {
    run.rollProgress = 0;
    run.roll = 0;
  }
  if (run.phase === "dying" || run.phase === "dead") return;
  run.pressure = clamp(run.pressure, 0, 100);
  stepEscort(run, mainCourse, dt);
  if (run.invuln <= 0 && !run.tutorial?.active) {
    let contact = sweepTrafficCars(course, collisionStart, run);
    for (let i = 0; contact && rainbowProtected(run) && i < 6; i++) {
      smashRainbowCar(run, course, contact.index);
      contact = sweepTrafficCars(course, collisionStart, run);
    }
    if (contact) {
      const t = Math.max(0, contact.time - 0.002);
      run.pos = add(collisionStart.pos, mul(sub(run.pos, collisionStart.pos), t));
      run.s = collisionStart.s + (run.s - collisionStart.s) * t;
      run.lane = collisionStart.lane + (run.lane - collisionStart.lane) * t;
      run.collisions++;
      run.driftSign = dot(contact.normal, course.frame(run.s).right) < 0 ? -1 : 1;
      run.events.push({ type: "carImpact", index: contact.index });
      beginDeath(
        run,
        course,
        !collisionStart.attached && dot(collisionStart.velocity, course.frame(run.s).up) < 0
          ? "落地时撞到车辆"
          : "撞到前方车辆",
      );
      run.death.cause = "traffic";
      return;
    }
  }
  stepNearMiss(run, mainCourse, collisionStart);
  adventureAfterStep(run, mainCourse, course, collisionStart, dt);
  for (let i = 0; i < course.pickups.length; i++) {
    const item = course.pickups[i];
    if (item.type === "star" && run.tutorial?.active) continue;
    if (run.taken.has(i) || Math.abs(run.s - item.s) > 3.2) continue;
    const p = course.pose(item.s, item.lane),
      height = run.attached ? 0 : dot(sub(run.pos, p.p), p.up);
    if (
      Math.abs(run.lane - item.lane) > (item.type === "sky" ? 1.7 : 1.8) ||
      Math.abs(height - (item.height || 0)) > 1.7
    )
      continue;
    run.taken.add(i);
    run.rings++;
    if (item.type === "star") startRainbow(run, mainCourse);
    if (item.type === "air") run.pressure = clamp(run.pressure + 26, 0, 100);
    award(
      run,
      item.type === "sky" ? 160 : 35,
      item.type === "star"
        ? "彩虹无敌 · 8秒 · 得分×2"
        : item.type === "air"
          ? "气量补充 +26"
          : item.type === "sky"
            ? "穿越飞跃环"
            : "收集能量晶核",
    );
    run.events.push({ type: "pickup", index: i, kind: item.type });
  }
  for (let i = 0; i < course.hazards.length; i++) {
    const h = course.hazards[i];
    if (h.type === "car" || run.hit.has(i) || run.invuln > 0 || Math.abs(run.s - h.s) > 2) continue;
    const f = course.pose(h.s, h.lane),
      height = run.attached ? 0 : dot(sub(run.pos, f.p), f.up);
    if (Math.abs(run.lane - h.lane) < 1.6 && height < 1.1 && height > -0.2) {
      if (rainbowProtected(run)) {
        run.hit.add(i);
        run.score += 40 * rainbowMultiplier(run);
        run.events.push({ type: "rainbowClear" });
        continue;
      }
      run.hit.add(i);
      run.collisions++;
      run.penalty += 2;
      run.combo = 0;
      run.pressure = Math.max(0, run.pressure - 16);
      run.speed *= 0.65;
      run.invuln = 1.2;
      run.feedback = "擦碰障碍 · 换道或跳跃避开";
      run.feedbackTime = 2;
      run.events.push({ type: "hit" });
    }
  }
  for (let i = run.checkpointIndex + 1; i < course.checkpoints.length; i++) {
    if (run.attached && run.s >= course.checkpoints[i]) {
      run.checkpointIndex = i;
      run.checkpoint = course.checkpoints[i];
      run.feedback = "检查点已记录";
      run.feedbackTime = 1.4;
      run.events.push({ type: "checkpoint" });
    }
  }
  if (run.messageTime <= 0 && run.attached && previous.up[1] < 0.2) {
    run.message = "倒挂路段 · 按住 E 强吸附更稳";
    run.messageTime = 0.2;
  }
  if (!run.endless && run.s >= course.length - 2 && run.attached) {
    run.phase = "finished";
    run.score +=
      Math.round(1500 + Math.max(0, 120 - run.time - run.penalty) * 12) * rainbowMultiplier(run);
    run.events.push({ type: "finish" });
  }
  run.score += Math.max(0, run.s - wasS) * 0.3 * rainbowMultiplier(run);
  if (rainbowActive(run)) run.pressure = 100;
  stepDirector(run, mainCourse, wasS);
  advanceEndless(run, course);
  syncSteeringProfile(run, mainCourse);
}
