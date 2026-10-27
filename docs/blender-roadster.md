# Blender 汽车外观与黑色玻璃

本轮以用户提供的 Roadster Thrust 原型车照片校正外观，并核对 Petersen 官方展车页。新增参考索引位于 `references/roadster-2026/user-20261026/index.json`；照片仅作建模参考，不作为车身贴图。

本地文件 **`models/roadster-2026/current/roadster-exterior.blend`** 是可编辑模型；同目录还有 GLB、游戏网格和固定相机检查图。首页使用完整模型，普通驾驶及星环使用同源的驾驶／远景版本；交通车辆保留原样。模型属于按照片推定比例的游戏外观，缺少原厂 CAD、全尺寸图和实测数据，不宣称工程级一比一；详细座舱与隐藏工程结构不在范围内。

玻璃按用户要求改成中性黑色，Blender 与游戏材质同时修改，去掉旧的棕金色。保留受控的灰白高光，摄影棚软箱仍可能映在挡风玻璃上。后侧窗收短，补上更宽的白色 C 柱和后肩，细化车头转角与灯组。修复了实心轮圈桶遮挡银色面片的问题，轮圈桶改为真正的空心环体，五组银色导流面可完整看到；轮胎网格、轮心、主侧壳和发动机盖保持基线几何。

## 尾翼

尾部改成贴合车身、可绕前缘铰链转动的宽主动尾板，去掉旧的 0.40 米整体垂直抬升。收起时形成连续后甲板，完全展开角度约 35.5 度。尾板有厚度、侧端板、固定铰轴和两侧斜置伸缩支撑，连接点从同一份 `roadster.wing` 配置导出到游戏，避免 Blender 与网页分别猜坐标。后下包围改成内凹碳色格栅、小型喷口及扩散器，去掉原来外露的风扇排。

`.blend` 中的 `Active_Wing_Rig` 有 `deployment` 属性，0 为收起、1 为展开；时间轴 1–81 帧演示收起→展开→收起。GLB 是收起姿态的静态外观；游戏通过 `src/scenery/roadster-exterior.js` 驱动尾板和支撑。星环普通巡航时尾板基本收起，喷气／制动时再展开，避免车尾长期像两根高支柱。

## 在 Blender 编辑后更新 HTML

保留对象的 `runtimeSlot`、`runtimeMaterial` 自定义属性和原有坐标系。保存修改后的 `.blend`，用本机 Blender 打开该文件后执行 `tools/export-roadster-from-blend.py`，指定输出目录为 `models/roadster-2026/current`。命令示例（将 Blender 路径替换为本机实际路径）：

```powershell
& 'Blender路径/blender.exe' --background models/roadster-2026/current/roadster-exterior.blend --python tools/export-roadster-from-blend.py -- --out models/roadster-2026/current
& 'Blender路径/blender.exe' --background --factory-startup --python tools/build-roadster-lods.py
node tools/pack-roadster.mjs
node tools/standalone.mjs
```

这些命令只供修改模型后重新打包使用。日常游玩仍然只需双击 `RoadsterDash.html`，模型已内嵌，不依赖 Blender、服务器或网络。

从参数重新生成外观的脚本是 `tools/blender-roadster.py`；它与手工编辑后的导出共用 `tools/roadster_export.py`。本轮旧模型、构建脚本、两个候选、固定视角图及检查报告在 `models/roadster-2026/revisions/20261026-blackglass`，原始游戏继续保留。生产阶段仍为 exterior，未开展内部制作或宣称 OEM 外观精度冻结。

## 验证范围

`node tools/check-roadster.mjs` 和 `check-roadster-lods.mjs` 读取实际网格，检查有限属性、法线、索引、零面积三角和各档面数预算，并调用生产尾板实现采样 101 个展开姿态及整车旋转。`tools/verify-roadster-revision.py` 重新打开旧／新 Blender 文件，核对被保护的车壳、轮胎和轮心、黑色玻璃、轮圈桶中心净空、后窗末端、尾板铰链及翻转时支撑连接。`tools/verify-roadster-blender.py` 另行回读保存的驾驶及远景版本。原游戏核心指纹与实际 HTML 中的主界面、驾驶和动画也继续回归。

检查不等于完整 OEM 曲面精度、机械强度或全车自交认证；固定视图用于观察本轮外观，未完成量测级照片标定。
