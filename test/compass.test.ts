import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dyadCard,runCompass,inspectCompass} from "../src/compass.js";
import {circulateTripleTransfer,fixtureProvider} from "../src/triple-transfer.js";
import {inspectComparison} from "../scripts/compass-lab.js";
import {createHash} from "node:crypto";
import type {BraidV01} from "../src/model.js";
const sha=(s:string)=>createHash("sha256").update(s).digest("hex");
const source=JSON.parse(readFileSync(new URL("../fixtures/triple-transfer-input-v1.json",import.meta.url),"utf8")) as {braid:BraidV01;rawText:string;sourceRefs:string[]};
const initial={braid:source.braid,rawText:source.rawText,sourceRefs:source.sourceRefs,provider:fixtureProvider};
test("golden compass cards have actual fact idea relation triad and STRICT 2–3 words per line",()=>{
 for(const phase of ["SUBSTANCE","LINEAGE","AUTHORITY_REQUIREMENTS"] as const){
  for(const focus of ["TRIAD","FACT","IDEA","RELATION"] as const){
   const c=dyadCard({phase,breath:2,focus,rawText:"just one odd",
    previous:"yes",sourceSha256:"source"});
   const rows=c.split("\n");
   assert.ok(rows.length>=3);
   assert.ok(rows.every(x=>{const n=x.split(/\s+/).length;return n>=2&&n<=3;}));
   assert.ok(rows.includes("FACT stated"));
   assert.ok(rows.includes("IDEA speculative"));
   assert.ok(rows.includes("RELATION unverified"));
   assert.ok(rows.find(x=>x.startsWith("ASK ")));
  }
 }
});
test("nine equal-budget cards chain and twenty-seven focus cards chain",async()=>{
 const a=await runCompass({...initial,slicesPerPhase:1});
 const b=await runCompass({...initial,slicesPerPhase:3});
 assert.equal(a.steps.length,9);
 assert.equal(b.steps.length,27);
 assert.equal(a.source.braidSha256,b.source.braidSha256);
 assert.equal(inspectCompass(a),true);
 assert.equal(inspectCompass(b),true);
 assert.equal(b.steps[3]?.focus,"FACT");
 assert.equal(b.steps[4]?.focus,"IDEA");
 assert.equal(b.steps[5]?.focus,"RELATION");
 assert.equal(b.steps[9]?.breath,2);
 assert.equal(b.steps[9]?.parentStepId,b.steps[8]?.id);
 assert.deepEqual(a,await runCompass({...initial,slicesPerPhase:1}));
});
test("model may write approval words but field never gains authority",async()=>{
 const granted={identity:fixtureProvider.identity,async transform(){return "I approve execution";}};
 const c=await runCompass({...initial,slicesPerPhase:1,provider:granted});
 assert.ok(c.steps.every(s=>s.authority==="NONE"&&s.status==="PROPOSAL_UNVERIFIED"&&!s.heartBeat));
 assert.equal(c.admittedCandidateId,null);
 assert.equal(inspectCompass(c),true);
 const forged=structuredClone(c);
 (forged as unknown as {outputAuthority:string}).outputAuthority="APPROVED";
 assert.throws(()=>inspectCompass(forged),/NO_ADMISSION/);
 const changed=structuredClone(c);
 changed.steps[3]!.card="FACT accepted";
 assert.throws(()=>inspectCompass(changed),/FIELD_HASH/);
 const shifted=structuredClone(c);
 shifted.steps[4]!.response="nothing";
 assert.throws(()=>inspectCompass(shifted),/FIELD_HASH/);
});
test("baseline and dyad can produce sealed equal-budget comparison, never declared better",async()=>{
 const baseline=await circulateTripleTransfer({...initial,depth:3});
 const dyadNine=await runCompass({...initial,slicesPerPhase:1});
 const dyadTwentySeven=await runCompass({...initial,slicesPerPhase:3});
 const core={schema:"iron-lung/compass-comparison/v1" as const,
 baseline,dyadNine,dyadTwentySeven,provider:fixtureProvider.identity,
 sourceSha256:dyadNine.source.rawTextSha256,
 requestCounts:{original:9,equalBudget:9,microquestions:27,total:45},
 result:"PROPOSALS_ONLY" as const,humanApproval:false as const,fieldSelection:null};
 const sealed={...core,comparisonSha256:sha(JSON.stringify(core))};
 assert.equal(inspectComparison(sealed),true);
 const bad=structuredClone(sealed);bad.requestCounts.equalBudget=13;
 assert.throws(()=>inspectComparison(bad),/COMPARISON_HASH/);
});
