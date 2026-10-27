# 首次进入与区段切换优化

2026-10-27。用户反馈主要是打开游戏或切换区段时停顿，优先处理加载尖峰，不改变驾驶碰撞与奖励规则。

## 测量与结果

优化前同一浏览器区段测试：首次同步轨道创建约 820 ms，预载切换本身约 4.4 ms，切换后前五次渲染中的最大值约 252.4 ms。独立 Node 三个种子的预载仍出现 83–119 ms 的单个工作片段。

最终同一段切换测试：切换约 2.2 ms，前五次渲染最大约 13.1 ms，随后约 1.4–2 ms；预载片段最大约 9.4 ms，GPU 上传批次最大约 0.6 ms。这是本机测试中的加载/提交耗时，不代表所有设备都达到固定帧率。首次准备约 800 ms，准备期间可以更新进度画面与处理浏览器输入。

原在线 HTML 约 11.49 MB，Gzip 传输约 6.03 MB，HTML 无 ETag/Last-Modified，刷新时会整体下载。新在线 HTML 约 364 KB，Gzip 约 162 KB；游戏脚本与字体使用哈希文件名并长期缓存，HTML 继续及时检查更新。原 118 份字体都塞在启动脚本中，线上改为保留 unicode-range 的独立 WOFF/WOFF2，主界面实际只请求约 12 份字体子集。离线版仍完整内嵌，不需要服务器。

## 实现

- build-scheduler.js：约 3 ms 的构建预算，优先用 scheduler.yield，回退 MessageChannel，避免串联零延迟定时器的额外等待。
- route-window.js、adventure-view.js、traffic.js、pickups.js：同步和异步路径共用生成器，异步路径包括分岔实体、玻璃、车队缓冲解码与每个道具，取消时释放未发布对象。
- loading-warm.js：临时场景中的浅克隆共享真实几何和材质；预编译显示/光晕程序，每批最多 6 个网格上传，结束仅释放预热目标，不释放真实轨道资源。
- view.js：第一段和下一段预热、切换计时。首次准备额外覆盖吸气、所有喷口、烟雾和落点标记，避免第一次按键才编译。玻璃仅绘制附近约 650 m 的前方区段，保留行驶附近的全部实体碰撞。
- index.js、ui.js、home.js：公共进入流程等待异步准备；准备阶段中文进度，准备完再开始计时。重开先停止旧场景。同步入口保留给确定性 QA。
- tools/online.mjs：从自包含 HTML 生成 dist-online；游戏 JS、字体 CSS、字体文件按内容哈希命名。旧的本地构建资源只清除上一份 manifest 明确记录且已不再引用的文件。

## 构建、检查与发布

1. `npm run build:html`：生成可双击的 RoadsterDash.html。
2. `npm run build:online`：生成 dist-online/index.html 和 assets，浏览器并行下载缓存脚本，字体按字形请求。
3. `npm run check:loading`：同步/异步几何一致、取消与所有权检查。
4. `npm run check:online`：哈希、引用、118 份字体与入口体积检查。`npm run check:html` 继续校验离线版无外部依赖。
5. 发布必须先上传所有哈希资源，再原子替换 index.html。服务器 HTML 的 error-monitor 注入保留；仅对 /examples/tesla/assets/ 下符合哈希命名的 JS/CSS/字体开启一年 immutable 缓存，保留已有安全响应头。旧哈希资源供已打开页面使用，暂不删除。

修改前副本在 revisions/20261027-loading-performance。发布记录与 Nginx 回滚文件位置保存在 evidence/loading-performance-deployment.json。浏览器长跑仍检查 8 个区段、资源上限和无坠落/底面碰撞。

完整预热会提前保留过去尚未触发的喷口/落点材质，浏览器两窗口峰值为 53 个光晕遮罩材质；固定全局预算为 64。单纯轨道窗口的旧 48 个限制仍保留，场景几何预算仍低于 900；不会通过取消几何释放来换取切换速度。
