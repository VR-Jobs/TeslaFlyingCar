import fs from "node:fs/promises";
import * as prettier from "./vendor/prettier/standalone.mjs";
import * as babel from "./vendor/prettier/plugins/babel.mjs";
import * as estree from "./vendor/prettier/plugins/estree.mjs";
const files = [
 "src/star-ring/placement.js","tools/check-placement.mjs",
 "src/star-ring/director.js","src/star-ring/rhythm.js","src/star-ring/ghost.js","src/star-ring/adaptive-quality.js","src/star-ring/experience-view.js","tools/check-experience.mjs",
 "src/star-ring/exhaust-wake.js","src/star-ring/rainbow-screen.js","tools/check-exhaust-wake.mjs",
 "tools/check-star-ring-rainbow.mjs",
 "src/star-ring/rainbow-rules.js","src/star-ring/rainbow-view.js","src/star-ring/rainbow-geometry.js",
 "tools/check-online.mjs","tools/check-loading-performance.mjs","tools/online.mjs",
 "src/star-ring/loading-warm.js",
 "tools/check-star-ring-voyage.mjs",
 "src/star-ring/voyage-plan.js","src/star-ring/voyage-rules.js","src/star-ring/voyage-view.js","src/star-ring/voyage-fx.js","src/star-ring/escort-rules.js","src/star-ring/escort-view.js","src/star-ring/traffic-motion.js",
 "tools/check-star-ring-adventures.mjs",
 "src/star-ring/adventure-course.js","src/star-ring/adventure-rules.js","src/star-ring/adventure-view.js",
 "src/star-ring/traffic.js","src/star-ring/traffic-rules.js","tools/check-star-ring-traffic.mjs",
  "src/star-ring/grip.js","src/star-ring/failure.js","src/star-ring/flight-effects.js","tools/check-star-ring-flight.mjs","tools/check-star-ring-flight-effects.mjs",
  "src/star-ring/build-scheduler.js","tools/check-star-ring-random-streaming.mjs",
  "src/star-ring/random-course.js", "src/star-ring/route-window.js", "src/star-ring/random-pilot.js", "tools/check-star-ring-random.mjs",
  "src/star-ring/endless.js", "tools/check-star-ring-endless.mjs",
  "src/star-ring/pickups.js", "tools/check-star-ring-pickups.mjs",
  "src/star-ring/postprocessing.js", "tools/check-star-ring-bloom.mjs",
  "src/star-ring/track-detail.js",
  "src/star-ring/glass-track.js", "src/star-ring/saturn-scene.js", "tools/check-star-ring-glass.mjs",
  "src/star-ring/track-surface.js", "tools/check-star-ring-surfaces.mjs",
  "src/star-ring/gap-guide.js", "src/star-ring/gap-lights.js", "tools/check-star-ring-gaps.mjs",
  "src/star-ring/course.js", "src/star-ring/simulation.js", "src/star-ring/view.js", "src/star-ring/ui.js", "src/star-ring/index.js", "src/star-ring/tutorial.js", "tools/check-star-ring.mjs", "tools/check-star-ring-tutorial.mjs",
  "src/features/handling-rules.js", "src/features/handling.js", "src/features/fair-traffic.js",
  "src/features/journey-progress.js", "src/features/ui.js", "src/local/comfort-settings.js",
  "src/local/iteration-checks.js", "src/local/developer-bridge.js", "src/scenery/driving-exterior.js",
  "src/local/scene-picker.js", "src/local/scene-picker-styles.js", "src/local/home.js",
  "src/scenery/roadster-exterior.js", "src/scenery/space-journey.js", "src/scenery/lazy-coast.js",
  "src/scenery/road-beat.js", "src/scenery/space-game.js", "src/scenery/showroom-parallax.js",
  "tools/check-handling.mjs", "tools/check-roadster-lods.mjs", "tools/pack-roadster-lods.mjs",
];
for (const name of files) {
  const url = new URL("../" + name, import.meta.url);
  await fs.writeFile(url, await prettier.format(await fs.readFile(url, "utf8"), {
    parser: "babel", plugins: [babel, estree], printWidth: 100,
  }));
}
console.log(`Formatted ${files.length} changed source files.`);
