import test from "node:test";
import assert from "node:assert/strict";
import {contentCard,groundedQuestion,runContentCompass,inspectContentCompass,
 ARMS,SCENARIOS} from "../src/content-compass.js";
import {fixtureProvider} from "../src/triple-transfer.js";
import type {ContractTask} from "../src/contract-compass.js";
const task:ContractTask={
 schema:"iron-lung/compass-real-contract/v1",sourceOwner:"the-static-collective/CANNON",
 sourceRegistrySha256:"a".repeat(64),sourceRecipeSha256:"b".repeat(64),
 recipeId:"plan-proof-to-pixels-and-print/v1",
 producer:{stage:"SOURCE_PROOF",capability:"film-press-synthetic-selection/v1",
 outputPort:"cannon.reflex-memory/v1"},
 consumer:{stage:"VISUAL_STUDY",capability:"film-press-plan-shaped/v1",
 inputPort:"planz.generated-plan/v1"},
 edge:{adapter:"VERIFIED_RECEIPT_PLAN_ID_V1",field:"reusableRecipe.planId",
 outputPort:"cannon.reflex-memory/v1",inputPort:"planz.generated-plan/v1"},
 requiredAuthorization:"SYNTHETIC_TEST_ONLY",publishAllowed:false,
 evidenceKind:"EXACT_SOURCE_CODE_CONTRACT_ONLY"
};
test("each actual compact line supplies content, never a fact idea relation label",()=>{
 for(const scenario of SCENARIOS)for(const arm of ARMS){
  const c=contentCard(task,2,"LINEAGE",scenario,arm,"old suggestion");
  const lines=c.split("\n");
  assert.ok(lines.every(l=>{const n=l.split(/\s+/).length;return n===2||n===3;}));
  assert.ok(lines.includes("SOURCE_PROOF produces"));
  assert.ok(lines.includes("A bridge"));
  assert.ok(lines.includes("Direct types"));
  assert.ok(lines.includes("remain different"));
  assert.ok(lines.every(l=>!/^(FACT|IDEA|RELATION|SOURCE|ADAPTER|ASK)\s/.test(l)));
  assert.ok(arm.endsWith("YOU")?lines.includes("You identify"):lines.includes("Identify the"));
  assert.ok(!lines.includes("FACT stated"));
 }
});
test("real compatible adapter and deliberately unavailable adapter produce grounded distinct expected outcomes",()=>{
 assert.equal(groundedQuestion(task,2,"AUTHORITY_REQUIREMENTS","ADAPTED").expected,"READY_FOR_SYNTHETIC_TEST");
 assert.equal(groundedQuestion(task,2,"AUTHORITY_REQUIREMENTS","DIRECT_ONLY").expected,"HOLD_TYPE_MISMATCH");
 assert.equal(groundedQuestion(task,1,"AUTHORITY_REQUIREMENTS","ADAPTED").expected,"NO");
 assert.equal(groundedQuestion(task,1,"AUTHORITY_REQUIREMENTS","DIRECT_ONLY").expected,"NO");
 assert.ok(contentCard(task,1,"SUBSTANCE","DIRECT_ONLY","DYAD_YOU","").includes("is disabled"));
 assert.ok(contentCard(task,1,"SUBSTANCE","ADAPTED","DYAD_YOU","").includes("already exists"));
});
test("72 source-owned model requests replay with strictly bounded prompts and no authority",async()=>{
 const r=await runContentCompass(task,fixtureProvider);
 assert.equal(r.steps.length,72);
 assert.equal(r.results.length,8);
 assert.equal(inspectContentCompass(r),true);
 assert.equal(r.noAutoDecision,true);
 assert.equal(r.humanAuthorization,false);
 assert.ok(r.steps.every(s=>s.authority==="NONE"&&!s.executed));
 assert.equal(r.steps[9]?.parentStepId,null);
 assert.equal(r.steps[8]?.parentStepId,r.steps[7]?.id);
 assert.deepEqual(r,await runContentCompass(task,fixtureProvider));
 const tamper=structuredClone(r);tamper.steps[0]!.response="forged";
 assert.throws(()=>inspectContentCompass(tamper),/RECEIPT/);
 const forged=structuredClone(r);
 (forged as unknown as {humanAuthorization:boolean}).humanAuthorization=true;
 assert.throws(()=>inspectContentCompass(forged),/NO_PROMOTION/);
});
test("invented adapter shape remains held at original source contract validation",async()=>{
 const t=structuredClone(task);t.edge.inputPort="random.unknown/v1";
 await assert.rejects(runContentCompass(t,fixtureProvider),/EDGE_BINDING/);
});
