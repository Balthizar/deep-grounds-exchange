// My BEFORE/AFTER for Phase 1c. Same fixtures, same methodology as my 2x-AL review numbers —
// if these two ever get measured differently, the comparison is worthless, so don't.
const { execSync } = require("child_process");
const fs = require("fs"); const path = require("path");
fs.copyFileSync("src/app.tsx","src/__p.tsx");
fs.appendFileSync("src/__p.tsx",'\nexport const __p = { reducer, seed };\n');
execSync('npx --no-install esbuild src/__p.tsx --bundle --format=cjs --outfile=./p.cjs --external:react --external:react-dom --loader:.tsx=tsx --loader:.json=json --jsx=automatic',{stdio:"ignore"});
const { reducer, seed } = require(path.resolve("p.cjs")).__p;
fs.rmSync("src/__p.tsx",{force:true});
const base = seed();
const ch = Object.values(base.characters).find(c=>c.ownerId==="acc_aldric"&&!c.retired);
const t=()=>process.hrtime.bigint(); const ms=(a,b)=>Number(b-a)/1e6;
function bench(label, s, act, n=20){
  let st=s; reducer(st,act);
  let best=1e9, tot=0;
  for(let i=0;i<n;i++){const a=t(); reducer(st,act); const b=t(); const d=ms(a,b); tot+=d; if(d<best)best=d;}
  console.log(" ", label.padEnd(52), "avg", (tot/n).toFixed(2).padStart(8), "ms   best", best.toFixed(2).padStart(7));
}
for (const N of [10000, 50000]) {
  const s = structuredClone(base);
  const tmpl = Object.values(s.characters).find(c=>c.bastion);
  for (let i=0;i<N;i++){const c=structuredClone(tmpl);c.id="ch_l"+i;c.ownerId="acc_l"+(i%(N/5|0));
    if(c.bastion){c.bastion.turns=(i%200===0)?[{id:"bt"+i,resolved:false,readyAt:Date.now()-1000,orders:[]}]:[];}
    s.characters[c.id]=c;}
  for (let i=0;i<N*10;i++) s.logEntries.push({id:"lg"+i,charId:"ch_l"+(i%N),entryType:"PLAY",status:"APPROVED",date:"2026-01-01",gpEarned:5});
  const it0 = Object.values(s.items)[0];
  for (let i=0;i<N*2;i++){const it=structuredClone(it0);it.id="itl"+i;it.holder={type:"CHARACTER",id:"ch_l"+(i%N)};s.items[it.id]=it;}
  console.log(N+" chars / "+(N*10)+" logs / "+(N*2)+" items:");
  bench("region write (touch-1 + one ledger line)", s, {type:"SET_BASTION_REGION",charId:ch.id,by:ch.ownerId,region:null});
  // idle tick: dispatch resolve repeatedly on SAME state — first pays a scan, rest hit the watermark
  { let st=s, guard=0;
    while (guard++ < 400) { const nx=reducer(st,{type:"RESOLVE_BASTION_TURNS"}); if (nx===st) break; st=nx; }
    let a=t(); for(let i=0;i<1000;i++) reducer(st,{type:"RESOLVE_BASTION_TURNS"}); let b=t();
    console.log("  idle 1 Hz tick (watermark path, drained in "+guard+" batches) avg", (ms(a,b)/1000).toFixed(4).padStart(8), "ms/tick"); }
  { const a=t(); const out=reducer(s,{type:"RESOLVE_BASTION_TURNS"}); const b=t();
    console.log("  RESOLVE with "+(N/200|0)+" keeps due (batched, cap 250)        one dispatch", ms(a,b).toFixed(1).padStart(6), "ms"); }
  { reducer(s,{type:"PUSH_SWEEP"});
    const a=t(); for(let i=0;i<5;i++) reducer(s,{type:"PUSH_SWEEP"}); const b=t();
    console.log("  PUSH_SWEEP (inverted prepass)                         avg", (ms(a,b)/5).toFixed(1).padStart(8), "ms"); }
}
fs.rmSync("p.cjs",{force:true});
