import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {compassCard,compileQuestion,runContractCompass,inspectContractCompass,
 questionFor,validateTask,arms,type ContractTask} from "../src/contract-compass.js";
import {fixtureProvider} from "../src/triple-transfer.js";
const sha=(x:string)=>createHash("sha256").update(x).digest("hex");
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
test("actual CANNON ports and adapter are included in every 2-3 word FACT/IDEA/RELATION prompt",()=>{
 validateTask(task);
 for(const phase of ["SUBSTANCE","LINEAGE","AUTHORITY_REQUIREMENTS"] as const){
  const c=compassCard(task,1,phase,"SECOND_PERSON","");
  const lines=c.split("\n");
  assert.ok(lines.every(line=>{const count=line.trim().split(/\s+/).length;return count>=2&&count<=3;}));
  assert.ok(lines.includes("FACT sourced"));
  assert.ok(lines.includes("IDEA speculative"));
  assert.ok(lines.includes("RELATION typed"));
  assert.ok(lines.includes("OUTPUT cannon.reflex-memory/v1"));
  assert.ok(lines.includes("INPUT planz.generated-plan/v1"));
  assert.ok(lines.includes("ADAPTER VERIFIED_RECEIPT_PLAN_ID_V1"));
  assert.ok(lines.includes("You inspect"));
  const neutral=compassCard(task,1,phase,"NEUTRAL","");
  assert.ok(neutral.includes("Inspect contracts"));
  assert.ok(!neutral.includes("You inspect"));
  const compiled=compileQuestion(task,1,phase,"SECOND_PERSON",c);
  assert.ok(compiled.includes("Which exact value do you identify"));
 }
});
test("36 real source-named calls form four equal-cost addressed experiments",async()=>{
 const p=await runContractCompass(task,fixtureProvider);
 assert.equal(p.steps.length,36);
 assert.deepEqual(p.arms.map(x=>x.id),[...arms]);
 assert.ok(p.arms.every(a=>a.requests===9&&a.questionCount===9));
 assert.equal(inspectContractCompass(p),true);
 assert.equal(p.steps[9]?.parentStepId,null);
 assert.equal(p.steps[18]?.parentStepId,null);
 assert.equal(p.steps[27]?.parentStepId,null);
 assert.equal(p.steps[1]?.parentStepId,p.steps[0]?.id);
 assert.equal(p.automaticPromotions,0);
 assert.equal(p.humanPermission,false);
 assert.equal(p.sourceAdmission,false);
 assert.equal(p.steps[0]?.expected,task.producer.outputPort);
 assert.equal(questionFor(task,2,"LINEAGE").expected,task.edge.field);
 assert.equal(questionFor(task,3,"AUTHORITY_REQUIREMENTS").expected,"SYNTHETIC_TEST_ONLY");
 assert.deepEqual(p,await runContractCompass(task,fixtureProvider));
});
test("the model may claim permission but cannot promote, forge or rewrite an original contract",async()=>{
 const attack={identity:fixtureProvider.identity,async transform(){return "I give you authorization";}};
 const original=JSON.stringify(task);
 const p=await runContractCompass(task,attack);
 assert.equal(JSON.stringify(task),original);
 assert.equal(p.steps.every(x=>x.authority==="NONE"&&x.noNativeExecution&&x.status==="MODEL_UNVERIFIED"),true);
 const changed=structuredClone(p);changed.steps[0]!.response="accepted";
 assert.throws(()=>inspectContractCompass(changed),/RECEIPT_HASH/);
 const permitted=structuredClone(p);
 (permitted as unknown as {humanPermission:boolean}).humanPermission=true;
 assert.throws(()=>inspectContractCompass(permitted),/NO_GRANT/);
 const changedInput=structuredClone(task);changedInput.edge.inputPort="imaginary.output";
 assert.throws(()=>validateTask(changedInput),/EDGE_BINDING/);
});
test("model echo and exact source answers are not conflated",async()=>{
 const p=await runContractCompass(task,fixtureProvider);
 assert.equal(p.arms.every(x=>x.correctExact===0),true);
 assert.equal(p.arms.every(x=>x.responses.length===9),true);
 assert.equal(p.arms.every(x=>x.secondPersonResponseCount>=0),true);
 assert.equal(p.steps.every(x=>x.question.length>0&&x.expected.length>0),true);
 assert.equal(sha(p.steps[0]!.card),p.steps[0]!.cardSha256);
});
