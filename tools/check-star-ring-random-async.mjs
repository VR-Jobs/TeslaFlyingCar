import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRandomCourse } from "../src/star-ring/random-course.js";
import { createRouteWindowAsync } from "../src/star-ring/route-window.js";
import { getTrackSurface } from "../src/star-ring/track-surface.js";
const checks=[],course=createRandomCourse(73).snapshot();let yields=0,heartbeats=0;
const timer=setInterval(()=>heartbeats++,5),started=performance.now();
const view=await createRouteWindowAsync(course,async()=>{yields++;await new Promise(r=>setTimeout(r,0));});
clearInterval(timer);
assert(yields>10&&heartbeats>5);
assert(!course.geometryMemoActive);
checks.push({name:"cooperative-preload-yields-and-clears-temporary-sampling-cache",pass:true,yields,heartbeats,elapsed:performance.now()-started,triangles:view.solid.triangles.length});
view.dispose();
const cancelled=createRandomCourse(74).snapshot();let slices=0,rejected=false;
try {await createRouteWindowAsync(cancelled,async()=>{if(++slices===3){const e=new Error("cancel test");e.name="AbortError";throw e;}await new Promise(r=>setTimeout(r,0));});}
catch(e){assert.equal(e.name,"AbortError");rejected=true;}
assert(rejected&&!cancelled.geometryMemoActive);
const solid=getTrackSurface(cancelled);
assert(solid.triangles.length>10000&&solid.triangles.every(t=>t.a.every(Number.isFinite)));
checks.push({name:"cancelled-preload-can-be-rebuilt-with-valid-solid-collision",pass:true,slices,triangles:solid.triangles.length});
await fs.writeFile(new URL("../evidence/star-ring-random-async-checks.json",import.meta.url),JSON.stringify({checks},null,2));
console.log(JSON.stringify({passed:checks.length,yields,heartbeats}));
