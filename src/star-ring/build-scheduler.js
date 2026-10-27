export function finishBuild(generator) {
  let result;
  do {
    result = generator.next();
  } while (!result.done);
  return result.value;
}
export async function finishBuildAsync(generator, yieldTask, budget = 3) {
  let result,
    started = performance.now();
  try {
    do {
      result = generator.next();
      if (!result.done && performance.now() - started >= budget) {
        await yieldTask();
        started = performance.now();
      }
    } while (!result.done);
    return result.value;
  } finally {
    if (!result?.done) generator.return();
  }
}

let channel = null;
const pending = [];
export function yieldBuild() {
  if (globalThis.scheduler?.yield) return globalThis.scheduler.yield();
  if (typeof window !== "undefined" && typeof MessageChannel !== "undefined") {
    if (!channel) {
      channel = new MessageChannel();
      channel.port1.onmessage = () => pending.shift()?.();
    }
    return new Promise((resolve) => {
      pending.push(resolve);
      channel.port2.postMessage(0);
    });
  }
  return new Promise((resolve) => setTimeout(resolve, 0));
}
