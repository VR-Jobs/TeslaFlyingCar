# 代码结构与恢复说明

## 发布产物与恢复方式

主发布文件 `game-Da4QmlDf.js` 为 1,360,404 字节。它把 Three.js、着色器、程序化场景、车辆、语言表、玩法、UI 与服务接口合并在一个 ES module 中。`auth-client-BoJN4b5B.js` 包含 Supabase SDK 及网络辅助代码。另有 preload polyfill、法律页面脚本，以及按域名条件加载的统计模块。

没有源码映射。因此恢复采用静态 AST 分析、作用域内绑定重命名、顶层声明拆分与格式化；没有假定压缩变量的原始名字。恢复名称是根据构造函数、字段和调用关系赋予的语义名称。局部 e、t、n 等压缩变量仍存在。

`tools/recover.mjs` 会先确认渲染前缀不反向依赖游戏绑定，再分离它，并显式导出 656 个绑定给游戏模块使用。为保留行为，不用一个新版本的 Three.js 替换原版已打包渲染代码。

## 运行数据流

```text
index.html → src/game.js
                 ├─ vendor/rendering.js：保留原版渲染代码与后处理
                 ├─ config/gameplay.js：原版常量和曲线
                 ├─ local/backend.js：独立本地服务
                 └─ local/developer-bridge.js：本地开发台桥接

InputController → 输入事件队列 → animationFrame
                                   ↓ 固定 1/60 秒步长
                              GameSession.stepSimulation
                                   ├─ PlayerController
                                   ├─ TrafficSpawner / TrafficSystem
                                   ├─ PickupSystem / AchievementTracker
                                   └─ 分数、连击、气量、碰撞、复活
                                   ↓
                              updateVisual → 场景 / HUD / 后处理
                                   ↓ 结束一局
                              LocalBackend.submit → localStorage
```

## 主要模块

| 模块或恢复名称 | 作用和修改建议 |
| --- | --- |
| `createRoadster` | 用网格生成车身、玻璃、轮胎、尾翼和推进喷口。车体主要实现可直接在代码中修改，没有缺失的外部 GLB 依赖 |
| `PlayerController` | 车道插值、跳跃、悬停、耗气、桶滚、前空翻、俯冲、加速、喷口发光和碰撞表现 |
| `GameSession` | 整局状态、固定步长模拟、速度曲线、分数、连击、道具、碰撞、开场与复活流程 |
| `WorldEnvironment` / `RoadSurface` / `Landscape` | 道路、场景、景观、昼夜和气氛；大量材质和几何由程序生成 |
| `TrafficSystem` / `TrafficSpawner` | 车辆池、碰撞候选、距离相关车流生成与车型分布 |
| `PickupSystem` / `ParticleEffects` / `SkyShow` | 气罐、能量与道具、烟雾、爆发、火箭和速度表现 |
| `CameraRig` / `DamageSystem` | 跟随相机、震动与特写；车体碰撞与损伤 |
| `ShowroomScene` | 主菜单车辆展示、旋转与检查视角，和实际跑酷场景使用不同相机 |
| `InputController` | 键盘、触控、长按、滑动输入统一变为事件队列 |
| `GameHud` | 空气、里程、分数、连击、道具、故事提示与成就通知 |
| `AchievementTracker` | 使用原版成就目录与判定函数，记录本局达成项 |
| `WalletManager` / `DailyQuestManager` | 原版 UI 状态管理。读取本地服务返回的兼容结构，负责展示与领取流程 |
| `AdaptiveQuality` | 根据设备与帧时间调整像素比、效果等级和后处理 |
| `animationFrame` | RAF 循环；收集输入，以 1/60 秒推进模拟，再更新视觉和后处理 |

以上代码的精确行号由 `evidence/code-map.json` 记录，源码修改后行号会变化。

## 参数组织

`src/config/gameplay.js` 中保留原版值，例如气量容量 600 L、重力 28、跳跃高度 2.5、最高悬停高度 6.2、悬停耗气 120 L/s、推进耗气 40 L/s、普通加速倍率 1.4。

`SPEED_CURVE` 是距离与目标速度的控制点，`TRAFFIC_INTERVAL` 是距离与车流生成间隔的控制点。`ROAD` 控制约 5 km 后的道路拓宽，`LANES` 和 `WIDE_LANES` 保留对应车道位置。`ROCKET`、`STARMAN`、`SLOW_MOTION` 控制特殊状态，`SCORE` 定义特技与擦车加分。

这些参数改变后，原版默认值一致性检查会有意报告差异。建议先复制工程或保留自己的版本，再开始玩法迭代。

## 本地服务边界

官网版本的原始 `RemoteBackend.startRun()` 先通过匿名身份请求后台生成 runId、seed 和 replayVersion；结算、余额、道具及购买都由服务器确认。仅把 HTML 和 JS 放到本地时，开局会依赖原作者的服务。

本项目在 `createBackend()` 这一边界替换成 `LocalBackend`，让原版 UI 和 GameSession 继续使用相同方法名。`LocalAccount` 代表本地档案，用于本地物品和车漆；不代表 Google 身份。原版远程服务类保留在代码中供阅读，运行工厂不实例化它们。

本地适配器提供随机种子、开局、成绩、排行榜、钱包、道具、车漆、车牌、任务、签到、历史记录和存档导出导入。结算按 runId 去重，道具使用及领取操作有幂等处理。真实付款始终禁用；好友显示为离线。

服务端原始规则不可见，尤其是收益、每日任务分配、服务端重放验证与反作弊。因此 UI/玩法恢复与后台重建分开计数，不将本地替代服务称为原版服务器。

## 验收证据

- `core-fingerprints.json`：15 个主要类/函数在语义重命名后的原版 AST 指纹。重新解析恢复源码后全部一致。
- `verification.json`：7 组静态、资源与本地服务检查通过记录。
- `browser-gameplay-checks.json`：浏览器执行原版模拟代码，8 项控制回归全部通过；运行错误列表为空。
- `source-manifest.json`：保留的原始发布文件及其 SHA-256。
- `font-assets.json`：366 个本地字体文件与来源，合计约 9.4 MB。
- `recovery-transform.json`：模块拆分、语义命名与有限的本地集成变更清单。

这些检查证明所列代码与场景，不等同于对全部随机种子、全部设备、长时间运行或全部官方网络功能的完全等价验证。
