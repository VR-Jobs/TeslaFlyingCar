import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {createRandomCourse} from "../src/star-ring/random-course.js";
import {createRun,stepRun} from "../src/star-ring/simulation.js";
const rows=[];
for(const seed of [1,2,3,9,11,27,42,73,101,301,902,2026]){
 const c=createRandomCourse(seed),g=c.gaps.find(v=>v.auto),r=createRun(c);
 r.s=g.start-13;r.pos=c.pose(r.s).p;r.speed=28;r.input.suction=false;r.input.jump=false;
 for(let i=0;i<180;i++)stepRun(r,c,1/60);
 const pass=r.falls===0&&r.lands>=1&&r.s>g.end+10;
 rows.push({seed,width:g.end-g.start,pass,lands:r.lands,falls:r.falls,s:r.s,lip:g.end});assert(pass,JSON.stringify(rows.at(-1)));
}
await fs.writeFile(new URL("../evidence/star-ring-random-auto-checks.json",import.meta.url),JSON.stringify({checks:[{name:"twelve-seeded-auto-gaps-clear-at-normal-speed-without-held-jet-or-suction",pass:true,rows}]},null,2));
console.log(JSON.stringify({passed:1,seeds:rows.length,maximumGap:Math.max(...rows.map(r=>r.width))}));
