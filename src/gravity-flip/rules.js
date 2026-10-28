import { clamp } from "../star-ring/course.js";
import { HALF, CLEARANCE, FACE_UP, facePoint, faceDistance } from "./course.js";

export function createGravityRun({ tutorial = true } = {}) {
  return {
    phase: "running",
    s: 0,
    x: 0,
    y: -HALF + CLEARANCE,
    vx: 0,
    vy: 0,
    face: 0,
    target: 1,
    sourceFace: 0,
    direction: 1,
    attached: true,
    input: { suction: false, jump: false, boost: false },
    time: 0,
    speed: 25,
    pressure: 100,
    warning: 0,
    airTime: 0,
    jetTime: 0,
    grace: 0,
    flightStart: 0,
    landedAt: -10,
    landingImpact: 0,
    combo: 0,
    bestCombo: 0,
    transfers: 0,
    gates: 0,
    cells: 0,
    score: 0,
    visited: 1,
    circuits: 0,
    lastGate: -1,
    lastCell: -1,
    checkpoint: { s: 0, face: 0 },
    tutorial: tutorial ? { step: 0, held: 0 } : null,
    events: [],
    death: 0,
    reason: "",
    maxPenetration: 0,
  };
}
export function selectGravityTarget(run, direction) {
  if (run.tutorial) return;
  if (run.phase !== "running" || (!run.attached && run.airTime > 0.35)) return;
  run.direction = direction < 0 ? -1 : 1;
  run.target = (run.face + run.direction + 4) % 4;
  run.events.push({ type: "aim" });
}
export function commandGravity(run, course, action, down = true) {
  if (run.phase !== "running") return;
  if (action === "left" || action === "right") {
    if (down) selectGravityTarget(run, action === "left" ? -1 : 1);
    return;
  }
  if (!(action in run.input)) return;
  const was = run.input[action];
  run.input[action] = down;
  if (action !== "jump" || !down || was || !run.attached) return;
  if (run.tutorial?.step === 0 || run.pressure < 12) {
    run.events.push({ type: "blocked", reason: run.pressure < 12 ? "air" : "hold" });
    return;
  }
  const n = FACE_UP[run.face],
    destination = facePoint(run.target, -0.8),
    duration = 1.02;
  run.sourceFace = run.face;
  run.vx = (destination[0] - run.x) / duration + n[0] * 0.4;
  run.vy = (destination[1] - run.y) / duration + n[1] * 0.4;
  run.attached = false;
  run.airTime = 0;
  run.jetTime = 0.32;
  run.flightStart = run.time;
  run.pressure -= 12;
  run.warning = 0;
  run.events.push({ type: "jump" });
  if (run.tutorial?.step === 1) run.tutorial.step = 2;
}
function die(run, reason) {
  if (run.phase !== "running") return;
  run.phase = "dying";
  run.reason = reason;
  run.combo = 0;
  run.events.push({ type: "death", reason });
}
export function restartGravityCheckpoint(run) {
  const point = { ...run.checkpoint },
    time = run.time,
    score = run.score;
  const fresh = createGravityRun({ tutorial: false });
  Object.assign(run, fresh, {
    s: point.s,
    face: point.face,
    sourceFace: point.face,
    target: (point.face + 1) % 4,
    checkpoint: point,
    time,
    score: Math.max(0, score - 120),
    gates: run.gates,
    transfers: run.transfers,
    cells: run.cells,
    circuits: run.circuits,
    lastGate: run.lastGate,
    lastCell: run.lastCell,
    visited: 1 << point.face,
  });
  [run.x, run.y] = facePoint(point.face);
  run.grace = 0.65;
  run.input.suction = false;
}
function land(run, course, face, impact) {
  const n = FACE_UP[face],
    d = faceDistance(face, run.x, run.y);
  run.x -= n[0] * d;
  run.y -= n[1] * d;
  // Only the car's normal velocity is absorbed by the suspension. Tangential
  // drift settles gradually instead of snapping the vehicle to the face centre.
  const vn = run.vx * n[0] + run.vy * n[1];
  run.vx -= n[0] * vn;
  run.vy -= n[1] * vn;
  const changed = face !== run.sourceFace;
  run.attached = true;
  run.face = face;
  run.sourceFace = face;
  run.airTime = 0;
  run.warning = 0;
  run.landedAt = run.time;
  run.landingImpact = clamp(impact / 15, 0.1, 1);
  if (changed) {
    run.transfers++;
    run.combo++;
    run.bestCombo = Math.max(run.bestCombo, run.combo);
    run.score += 100 + Math.min(run.combo, 10) * 20;
    run.pressure = Math.min(100, run.pressure + 7);
    run.visited |= 1 << face;
    if (run.visited === 15) {
      run.circuits++;
      run.score += 400;
      run.visited = 1 << face;
      run.events.push({ type: "circuit" });
    }
  }
  const next = course.nextGate(run.s),
    delta = (next.face - face + 4) % 4;
  run.target = delta === 1 || delta === 3 ? next.face : (face + run.direction + 4) % 4;
  if (run.tutorial?.step === 2 && !changed) {
    run.tutorial.step = 1;
    run.target = 1;
    run.input.jump = false;
  }
  if (run.tutorial?.step === 2 && changed) {
    run.tutorial = null;
    run.events.push({ type: "tutorialComplete" });
  }
  run.events.push({ type: "land", impact: run.landingImpact, face, changed });
}
export function stepGravity(run, course, dt) {
  dt = clamp(dt, 0, 1 / 30);
  if (run.phase === "dead" || run.phase === "finished") return;
  if (run.phase === "dying") {
    run.death += dt;
    if (run.death >= 1.8) run.phase = "dead";
    return;
  }
  run.time += dt;
  run.grace = Math.max(0, run.grace - dt);
  const teaching = !!run.tutorial;
  if (teaching && run.tutorial.step === 0) {
    run.tutorial.held = run.input.suction ? run.tutorial.held + dt : 0;
    if (run.tutorial.held > 0.5) {
      run.tutorial.step = 1;
      run.events.push({ type: "tutorialStep" });
    }
  }
  const previousS = run.s;
  const targetSpeed = teaching
    ? 0
    : Math.min(38, 25 + run.gates * 0.3) + (run.input.boost && run.pressure > 8 ? 7 : 0);
  run.speed += (targetSpeed - run.speed) * (1 - Math.exp(-3 * dt));
  if (!teaching) run.s += run.speed * dt;
  run.jetTime = Math.max(0, run.jetTime - dt);
  if (run.attached) {
    const n = FACE_UP[run.face];
    const missing = !course.exists(run.face, run.s, 2.6);
    const lost = run.grace <= 0 && run.face !== 0 && (!run.input.suction || run.pressure <= 0);
    run.warning = lost ? Math.min(1.1, run.warning + dt) : Math.max(0, run.warning - dt * 4);
    if (missing || run.warning >= 0.85) {
      run.attached = false;
      run.airTime = 0;
      run.sourceFace = run.face;
      run.vx = n[0] * (missing ? -1.2 : 2.8);
      run.vy = n[1] * (missing ? -1.2 : 2.8);
      run.events.push({ type: "detach", missing });
    } else {
      // Settle along the surface; the continuous face contact remains exact.
      const tangent = [-n[1], n[0]],
        lateral = run.x * tangent[0] + run.y * tangent[1];
      const velocity = run.vx * tangent[0] + run.vy * tangent[1];
      const nextV = velocity + (-lateral * 10 - velocity * 6) * dt;
      run.vx = tangent[0] * nextV;
      run.vy = tangent[1] * nextV;
      run.x += run.vx * dt;
      run.y += run.vy * dt;
      const d = faceDistance(run.face, run.x, run.y);
      run.x -= n[0] * d;
      run.y -= n[1] * d;
      run.pressure = clamp(
        run.pressure + (run.face === 0 ? 12 : run.input.suction ? 1.5 : 0) * dt,
        0,
        100,
      );
    }
  }
  if (!run.attached) {
    // A lost car outside a broken surface must not re-enter the back of the
    // next panel when that surface resumes. Stop at the open gap boundary.
    for (let face = 0; face < 4; face++) {
      if (
        !course.exists(face, previousS, 2.6) &&
        course.exists(face, run.s, 2.6) &&
        faceDistance(face, run.x, run.y) < -0.01
      ) {
        run.s = previousS;
        die(run, "gap");
        return;
      }
    }
    const oldX = run.x,
      oldY = run.y;
    run.airTime += dt;
    const held = run.input.suction && run.pressure > 0;
    if (held) {
      const goal = facePoint(run.target, -0.8);
      run.vx += clamp((goal[0] - run.x) * 17 - run.vx * 4.5, -22, 22) * dt;
      run.vy += clamp((goal[1] - run.y) * 17 - run.vy * 4.5, -22, 22) * dt;
      run.pressure = Math.max(0, run.pressure - 5 * dt);
    } else run.vy -= 6.5 * dt;
    if ((run.input.jump || run.jetTime > 0) && run.pressure > 0) {
      const n = FACE_UP[run.sourceFace];
      run.vx += n[0] * 2 * dt;
      run.vy += n[1] * 2 * dt;
      run.pressure = Math.max(0, run.pressure - 4 * dt);
    }
    run.x += run.vx * dt;
    run.y += run.vy * dt;
    for (let face = 0; face < 4; face++) {
      if (face === run.sourceFace && run.airTime < 0.2) continue;
      const d0 = faceDistance(face, oldX, oldY),
        d1 = faceDistance(face, run.x, run.y);
      const n = FACE_UP[face],
        vn = run.vx * n[0] + run.vy * n[1];
      const alpha = clamp(d0 / Math.max(0.0001, d0 - d1), 0, 1);
      const crossingS = previousS + (run.s - previousS) * alpha;
      if (!course.exists(face, crossingS, 2.6) || !course.exists(face, run.s, 2.6)) continue;
      if (face === run.target && held && d1 < 0.38 && vn < 0 && run.airTime > 0.2 && d0 >= -0.01) {
        land(run, course, face, Math.abs(vn));
        break;
      }
      // Swept plane collision prevents tunnelling at high speed and low FPS.
      if (d0 >= -0.001 && d1 < 0) {
        run.x -= n[0] * d1;
        run.y -= n[1] * d1;
        if (face === 0 && vn < 0) {
          if (vn < -13 && !teaching) die(run, "impact");
          else land(run, course, face, Math.abs(vn));
          break;
        }
        run.vx -= n[0] * vn * 1.25;
        run.vy -= n[1] * vn * 1.25;
        run.pressure = Math.max(0, run.pressure - 8);
        run.combo = 0;
        run.events.push({ type: "impact", impact: Math.abs(vn) });
      }
    }
    if (
      !run.attached &&
      (run.airTime > 3.2 || Math.max(Math.abs(run.x), Math.abs(run.y)) > HALF + 12)
    )
      die(run, run.pressure < 1 ? "air" : course.exists(run.sourceFace, run.s) ? "grip" : "gap");
  }
  if (run.input.boost && run.pressure > 0) run.pressure = Math.max(0, run.pressure - 8 * dt);
  if (run.s >= 250) {
    const first = Math.max(0, Math.floor((previousS - 340) / 190) - 1);
    for (let k = first; k <= first + 2; k++) {
      const g = course.gate(k);
      if (k > run.lastGate && previousS < g.end + 3 && run.s >= g.end + 3) {
        run.lastGate = k;
        if (run.attached && run.face === g.face) {
          run.gates++;
          run.score += 240;
          run.checkpoint = { s: g.end + 10, face: g.face };
          run.events.push({ type: "gate" });
        }
      }
      if (k > run.lastCell && previousS < g.cell && run.s >= g.cell) {
        run.lastCell = k;
        if (run.attached && run.face === g.face) {
          run.cells++;
          run.pressure = Math.min(100, run.pressure + 24);
          run.score += 60;
          run.events.push({ type: "cell" });
        }
      }
    }
  }
  for (let face = 0; face < 4; face++)
    if (course.exists(face, run.s, 2.6))
      run.maxPenetration = Math.max(
        run.maxPenetration,
        Math.max(0, -faceDistance(face, run.x, run.y)),
      );
  if (run.tutorial && (run.airTime > 2.7 || run.phase === "dying")) {
    const fresh = createGravityRun({ tutorial: true });
    Object.assign(run, fresh);
    run.tutorial.step = 1;
    run.input.suction = true;
  }
}
export function gravityCue(run, course) {
  const gate = course.nextGate(run.s),
    distance = gate.start - run.s;
  const delta = (gate.face - run.face + 4) % 4;
  return {
    gate,
    distance,
    urgent: distance < 68 && distance > -48,
    target: delta === 1 || delta === 3 ? gate.face : (run.face + run.direction + 4) % 4,
    launch: distance < 59 && distance > 33 && run.attached && run.face !== gate.face,
  };
}
export function gravityPilot(run, course) {
  run.input.suction = true;
  if (run.tutorial?.step === 1 && run.attached) commandGravity(run, course, "jump");
  if (!run.tutorial) {
    const cue = gravityCue(run, course);
    if (run.attached && run.face !== cue.gate.face && cue.distance < 65 && cue.distance > 26) {
      selectGravityTarget(run, (cue.target - run.face + 4) % 4 === 3 ? -1 : 1);
      commandGravity(run, course, "jump");
    }
  }
  if (run.jetTime < 0.15) run.input.jump = false;
}
