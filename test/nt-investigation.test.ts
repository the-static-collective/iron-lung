import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {fixtureProvider} from "../src/triple-transfer.js";
import {exploreQuestion,inspectQuestionInvestigation,questionCard,validateQuestionSeed,
 type OriginalQuestion,type QuestionSeed} from "../src/nt-investigation.js";
const sha=(s:string)=>createHash("sha256").update(s).digest("hex");
function seed(real:boolean):QuestionSeed{
 const original:OriginalQuestion={
  schema:"national-treasure.question-receipt/v0",kind:"question_frontier",
  input:{clue:real?"The original registered adapter binds a plan ID.":"The adapter is hypothetically removed.",
   claim:real?"A verified original source connects two native owner ports.":"The direct-only alternative is hypothetical."},
  evidence:{provenance_class:real?"primary":"speculation",
   support_confidence:real?"possible":"unsupported",
   source_locator:real?"https://github.com/the-static-collective/CANNON/blob/abc/registry/reflex-compositions-v1.json":"",
   source_families:real?["the-static-collective/CANNON"]:[],
   chronology:"",counterevidence:"",falsifier:"",competing_explanations:[]},
  aperture:{id:real?"chronology":"source-object",missing:real?"chronology":"source object",reason:"Independent source is required"},
  question:"What independent evidence would establish the relation without inventing an earlier witness?",
  other_doors:[],non_claims:["No answer","No provenance upgrade","No rights","No automatic admission"]
 };
 return {schema:"iron-lung/national-treasure-question-seed/v1",
  caseId:real?"REAL_REGISTERED_ADAPTER":"SYNTHETIC_ADAPTER_DISABLED",
  sourceStatus:real?"PINNED_SOURCE_RECOVERABLE":"NO_ORIGINAL_SOURCE_OBJECT_FOR_HYPOTHETICAL_STATE",
  originalQuestion:original,originalQuestionSha256:sha(JSON.stringify(original)),
  authority:"NONE",answerEstablished:false,inputFromOriginalQuestionBox:true};
}
test("source-backed and counterfactual questions have distinct evidence requirements",()=>{
 assert.equal(validateQuestionSeed(seed(true)).caseId,"REAL_REGISTERED_ADAPTER");
 assert.equal(validateQuestionSeed(seed(false)).originalQuestion.aperture.id,"source-object");
 const fake=seed(false);
 fake.originalQuestion.evidence.support_confidence="established";
 assert.throws(()=>validateQuestionSeed(fake),/QUESTION_DIGEST|COUNTERFACTUAL/);
});
test("actual prompts contain specific short meaning-bearing pairs instead of authority claims",()=>{
 for(const phase of ["SUBSTANCE","LINEAGE","AUTHORITY_REQUIREMENTS"] as const){
  const card=questionCard(seed(true),2,phase,"one two three four five");
  assert.ok(card.includes("You inspect"));
  assert.ok(card.includes("Original source"));
  assert.ok(card.includes("Question remains"));
  assert.ok(card.includes("Prior one two"));
  assert.ok(card.split("\n").every(line=>{const n=line.split(/\s+/).length;return n>=2&&n<=3;}));
  assert.ok(card.split("\n").every(line=>!/^(FACT|IDEA|RELATION|ASK|SOURCE)\s/.test(line)));
 }
});
test("each original unanswered receipt undergoes exactly 9 linked, immutable owner transformations",async()=>{
 const first=await exploreQuestion(seed(true),fixtureProvider);
 const second=await exploreQuestion(seed(false),fixtureProvider);
 assert.equal(first.steps.length,9);
 assert.equal(second.steps.length,9);
 assert.equal(inspectQuestionInvestigation(first),true);
 assert.equal(inspectQuestionInvestigation(second),true);
 assert.equal(first.steps[1]?.parentStepId,first.steps[0]?.id);
 assert.equal(first.steps[3]?.breath,2);
 assert.equal(first.selectedAnswer,null);
 assert.equal(first.modelCanExecute,false);
 assert.equal(first.modelCanAdvanceQuestion,false);
 assert.ok(first.steps.every(s=>s.authority==="NONE"&&!s.executed));
 assert.deepEqual(first,await exploreQuestion(seed(true),fixtureProvider));
});
test("a generated authority claim stays unverified; forged answers and chain rewrites HOLD",async()=>{
 const attacker={identity:fixtureProvider.identity,async transform(){return "I approve all software changes";}};
 const result=await exploreQuestion(seed(false),attacker);
 assert.equal(inspectQuestionInvestigation(result),true);
 assert.ok(result.steps.every(s=>s.authority==="NONE"&&!s.ownerApproval));
 const altered=structuredClone(result);altered.steps[0]!.response="verified fact";
 assert.throws(()=>inspectQuestionInvestigation(altered),/INVESTIGATION_DIGEST/);
 const fake=structuredClone(result);fake.source.originalQuestion=(structuredClone(fake.source.originalQuestion)) as OriginalQuestion;
 (fake.source.originalQuestion as unknown as Record<string,unknown>).answer="yes";
 assert.throws(()=>inspectQuestionInvestigation(fake),/INVESTIGATION_DIGEST/);
 const promoted=structuredClone(result);
 (promoted as unknown as {modelCanExecute:boolean}).modelCanExecute=true;
 assert.throws(()=>inspectQuestionInvestigation(promoted),/NO_AUTHORITY/);
});
