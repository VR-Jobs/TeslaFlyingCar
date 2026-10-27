// Values extracted from the original deployment. Edit and reload to change gameplay.
export var LANES = [-3.4, 0, 3.4];
export var WIDE_LANES = [-6.8, -3.4, 0, 3.4, 6.8];
export var ROAD = {
  widenStart: 5e3,
  widenEnd: 5200,
  width: 12,
  extraWidth: 6.8,
};
export var CAR_BOUNDS = {
  halfWidth: 0.95,
  halfLength: 2.2,
  height: 1.15,
};
export var AIR = {
  capacity: 600,
  laneShift: 3,
  airLaneShift: 15,
  jump: 20,
  hoverPerSec: 120,
  trick: 40,
  flipMin: 20,
  slam: 20,
  boostPerSec: 40,
  cell: 15,
  can: 150,
  kickflipReward: 10,
  rollReward: 40,
  lowRatio: 0.2,
};
export var PHYSICS = {
  gravity: 28,
  jumpHeight: 2.5,
  maxHeight: 6.2,
  hoverExtraAccel: 7,
  holdDelay: 0.12,
  laneShiftTime: 0.15,
  laneShiftTimeNoAir: 0.35,
  trickTime: 0.55,
  flipApex: 5,
  flipMinLift: 2.5,
  flipGravity: 0.55,
  flipTime: 0.7,
  slamSpeed: -22,
};
export var SPEED_CURVE = [
  [0, 25],
  [1e3, 32],
  [3e3, 42],
  [6e3, 55],
  [1e4, 65],
  [2e4, 77],
  [3e4, 86],
  [4e4, 94],
  [5e4, 100],
];
export var REFILL_CURVE = [
  [0, 20],
  [1e3, 18],
  [3e3, 14],
  [6e3, 10],
  [1e4, 8],
];
export var TRAFFIC_INTERVAL = [
  [0, 5],
  [1e3, 3.15],
  [3e3, 2.75],
  [5200, 1.95],
  [1e4, 1.65],
  [2e4, 1.57],
  [3e4, 1.48],
];
export var PICKUP_INTERVAL = [
  [0, 2.2],
  [3e3, 1.7],
  [1e4, 1.4],
  [3e4, 1.1],
];
export var BOOST = {
  mult: 1.4,
  powerSpeed: 1.85,
  scoreAfter: 3,
  scoreEvery: 1,
  score: 10,
};
export var INVINCIBILITY = {
  duration: 5,
  mult: 1.6,
};
export var ROCKET = {
  duration: 8,
  chargeRequired: 1.5,
  hover: 0.5,
  scoreMult: 3,
  speedMult: 1.6,
  gain: {
    trick: 0.03,
    nearMiss: 0.05,
    cleared: 0.04,
    perfect: 0.02,
    cell: 0.015,
    can: 0.15,
  },
};
export var SLOW_MOTION = {
  duration: 0.45,
  scale: 0.25,
  cooldown: 15,
  chance: {
    multi: 0.5,
    trailer: 0.25,
    trick: 0.25,
  },
};
export var STARMAN = {
  duration: 8,
  speedMult: 1.6,
  scoreMult: 2,
  firstAt: 1500,
  gapMin: 2500,
  gapRand: 1e3,
  smash: 80,
};
export var SCORE = {
  nearMiss: 10,
  cleared: 20,
  clearedSemi: 50,
  trick: 20,
  perfect: 10,
  stuntExtra: 10,
  multiPerCar: 30,
  rammed: 50,
  cell: 5,
};
