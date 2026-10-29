export const EXPEDITIONS = [
  {
    id: "slingshot",
    zh: "引力弹弓",
    en: "Gravity Slingshot",
    color: "#9cc9ff",
    description: [
      "绕行微型天体，在绿色窗口释放引力，甩向下一颗星球。",
      "Orbit planetoids and launch through the green window toward the next world.",
    ],
    goal: ["接力到达 6 颗天体", "Reach 6 new planetoids"],
    steps: [
      [
        "按住 E 沿引力环运行，观察绿色释放窗口。",
        "Hold E to orbit and watch the green launch window.",
      ],
      ["窗口亮起时松开 E 或点按空格弹射。", "Release E or tap Space when the window turns green."],
      [
        "飞近下一颗天体时按住 E 接入引力环；左右键修正航向。",
        "Hold E near the next body to capture its orbit; steer with the arrows.",
      ],
    ],
  },
  {
    id: "salvage",
    zh: "太空打捞",
    en: "Orbital Salvage",
    color: "#91efcd",
    description: [
      "吸取漂浮核心，拖带货物，送回移动补给船。",
      "Recover drifting cores, tow a cargo chain and deliver it to supply ships.",
    ],
    goal: ["交付 12 个能量核心", "Deliver 12 energy cores"],
    steps: [
      ["左右键靠近核心，按住 E 将它吸到车后。", "Steer near a core and hold E to recover it."],
      [
        "货物有重量和弹性；喷气过猛会拉断拖带。",
        "Cargo has mass and elastic tethers; hard boosts can snap them.",
      ],
      [
        "靠近绿色补给船，松开喷气并按住 E 交货。",
        "Approach a green supply ship, release the jets and hold E to unload.",
      ],
    ],
  },
  {
    id: "beatRoad",
    zh: "节拍造路",
    en: "Beat Weaver",
    color: "#d3acff",
    description: [
      "踩拍展开玻璃道路，用吸气延长短暂的落脚点。",
      "Build glass road on the beat and sustain fading platforms with suction.",
    ],
    goal: ["完成 48 个节拍中的至少 36 拍", "Hit at least 36 of 48 beats"],
    steps: [
      [
        "跟随收缩光圈；左右键驶向下一颗音符所在的车道。",
        "Follow the shrinking ring and steer into the next note's lane.",
      ],
      [
        "光圈重合时点按空格，展开下一段道路。",
        "Tap Space when the rings align to weave the next platform.",
      ],
      [
        "漏拍时按住 E 短暂悬停补救；连续漏拍会失去道路。",
        "Hold E briefly to bridge a missed beat; repeated misses break the road.",
      ],
    ],
  },
  {
    id: "timeEcho",
    zh: "时间回声",
    en: "Time Echo",
    color: "#86d8ff",
    description: [
      "先录下自己的路线，再和回声车同时触发双重机关。",
      "Record your route, then coordinate with your replay to open paired gates.",
    ],
    goal: ["完成 3 轮录制与回声协作", "Complete 3 record-and-replay circuits"],
    steps: [
      [
        "录制圈跟随蓝灯压过机关，系统会保存你的实际动作。",
        "On the recording lap, follow blue lights onto the switches.",
      ],
      [
        "回声圈跟随金灯，和蓝色回声车同时抵达两侧机关。",
        "On the replay lap, follow gold lights and align with your blue ghost.",
      ],
      [
        "按 E 减速等待回声，按 Shift 追赶；R 可回到最近检查点。",
        "Hold E to wait for the ghost, Shift to catch up, or R to retry a checkpoint.",
      ],
    ],
  },
  {
    id: "twinResonance",
    zh: "双车共振",
    en: "Twin Resonance",
    color: "#ffb8cf",
    description: [
      "两辆车被磁力相连，压缩、撑开并旋转穿过机关。",
      "Control a magnetic car pair: compress, expand and rotate through apertures.",
    ],
    goal: ["双车同时穿过 12 道共振门", "Pass 12 gates with both cars"],
    steps: [
      [
        "左右键旋转双车连线，交换上下或左右位置。",
        "Rotate the pair with left/right to exchange their positions.",
      ],
      [
        "按住 E 收拢，按住空格撑开；留出弹簧稳定的时间。",
        "Hold E to compress or Space to expand; let the springs settle.",
      ],
      [
        "看前方门框形状，让两辆车都穿过亮色安全区。",
        "Read each aperture and fit both cars through the illuminated safe zones.",
      ],
    ],
  },
  {
    id: "leviathanEscape",
    zh: "巨物逃生",
    en: "Leviathan Escape",
    color: "#ffc48a",
    description: [
      "巨型采矿船正在拆解道路，沿预警灯逃向救援门。",
      "A mining leviathan is dismantling the road. Escape along the warning lights.",
    ],
    goal: ["逃到 2,200 米处的救援星门", "Reach the rescue gate at 2,200 m"],
    steps: [
      [
        "红色扫描区即将被切断，提前驶向绿色安全轨道。",
        "Red scan zones will be cut away; move to the green safe lane.",
      ],
      [
        "空格跳过断口或持续喷气，E 帮助吸附漂移的残轨。",
        "Use Space to jump or jet across gaps; E grips drifting fragments.",
      ],
      [
        "收集补气核心，用 Shift 拉开与采矿船的距离。",
        "Recover air cores and use Shift to stay ahead of the ship.",
      ],
    ],
  },
];
export const EXPEDITION_IDS = EXPEDITIONS.map((x) => x.id);
export const CATALOG = new Map(EXPEDITIONS.map((x) => [x.id, x]));
export const REASONS = {
  timeout: ["挑战时间已到。", "The challenge time expired."],
  planet: ["飞得过近，撞上了天体。", "The flight path intersected the planetoid."],
  lostOrbit: ["未接入下一条引力环。", "The next orbit was not captured."],
  air: ["喷气气量耗尽。", "The air supply was exhausted."],
  cargo: ["连续撞击导致回收舱失效。", "Repeated impacts disabled the recovery pod."],
  rhythm: ["连续漏拍，前方道路未能展开。", "Repeated missed beats left no road ahead."],
  echo: ["两辆车未能同时压住对应机关。", "The two cars did not activate their switches together."],
  record: ["录制圈遗漏了蓝色机关，请重新录制。", "A blue switch was missed on the recording lap."],
  pair: ["双车未能同时穿过安全开口。", "Both cars must fit through the aperture."],
  cut: ["驶入了已被切断的轨道。", "The car entered a severed track."],
  caught: ["采矿船追上了汽车。", "The mining ship caught the car."],
  impact: ["下降速度过大，接轨失败。", "The landing speed was too high."],
};
