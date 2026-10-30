/** Iron Lung Q-CYCLE-001: consume actual unanswered National Treasure receipts.
 * Generated text is always a HELD hypothesis, never evidence or an executable.
 */
import {createHash} from "node:crypto";
import type {TransferProvider,TripleRequest,Phase} from "./triple-transfer.js";

const hash=(s:string)=>createHash("sha256").update(s).digest("hex");
const j=(x:unknown)=>JSON.stringify(x);
function hold(x:unknown,m:string):asserts x{if(!x)throw Error("HOLD_LUNG_QUESTION_"+m);}
const phases:Phase[]=["SUBSTANCE","LINEAGE","AUTHORITY_REQUIREMENTS"];
const address:TripleRequest["address"][]=[
 {aperture:"GAP",triad:"IDEA",braid:"substance"},
 {aperture:"CONTEXT",triad:"RELATION",braid:"lineage"},
 {aperture:"GAP",triad:"IDEA",braid:"authority"}];
export interface OriginalQuestion{
 schema:"national-treasure.question-receipt/v0";kind:"question_frontier";
 input:{clue:string;claim:string};
 evidence:{provenance_class:string;support_confidence:string;source_locator:string;
  source_families:string[];chronology:string;counterevidence:string;falsifier:string;
  competing_explanations:string[]};
 aperture:{id:string;missing:string;reason:string};
 question:string;other_doors:Array<{aperture:string;question:string}>;non_claims:string[];
}
export interface QuestionSeed{
 schema:"iron-lung/national-treasure-question-seed/v1";
 caseId:"REAL_REGISTERED_ADAPTER"|"SYNTHETIC_ADAPTER_DISABLED";
 sourceStatus:"PINNED_SOURCE_RECOVERABLE"|"NO_ORIGINAL_SOURCE_OBJECT_FOR_HYPOTHETICAL_STATE";
 originalQuestion:OriginalQuestion;originalQuestionSha256:string;
 authority:"NONE";answerEstablished:false;inputFromOriginalQuestionBox:true;
}
export interface InvestigationStep{
 schema:"iron-lung/question-investigation-step/v1";id:string;parentStepId:string|null;
 caseId:QuestionSeed["caseId"];breath:number;phase:Phase;
 card:string;cardSha256:string;response:string;responseSha256:string;
 provider:TransferProvider["identity"];status:"POSSIBILITY_UNVERIFIED";authority:"NONE";
 factAdmitted:false;ownerApproval:false;executed:false;
}
export interface Investigation{
 schema:"iron-lung/question-investigation/v1";source:QuestionSeed;
 originalQuestionSha256:string;provider:TransferProvider["identity"];
 steps:InvestigationStep[];depth:3;requests:9;
 outputKind:"REVIEW_ONLY_SPECULATION";selectedAnswer:null;
 modelCanExecute:false;modelCanAdvanceQuestion:false;authority:"NONE";
 investigationSha256:string;
}
export function validateQuestionSeed(q:QuestionSeed){
 hold(q?.schema==="iron-lung/national-treasure-question-seed/v1"
  &&q.authority==="NONE"&&!q.answerEstablished&&q.inputFromOriginalQuestionBox,"QUESTION_BOUNDARY");
 hold(q.caseId==="REAL_REGISTERED_ADAPTER"||q.caseId==="SYNTHETIC_ADAPTER_DISABLED","CASE");
 const o=q.originalQuestion;
 hold(o?.schema==="national-treasure.question-receipt/v0"&&o.kind==="question_frontier"
  &&typeof o.question==="string"&&o.question.endsWith("?")&&o.question.length<900
  &&Array.isArray(o.non_claims)&&o.non_claims.length>=4
  &&!Object.hasOwn(o,"answer")&&!Object.hasOwn(o,"conclusion")
  &&!Object.hasOwn(o,"decision"),"ORIGINAL_MUST_QUESTION");
 hold(typeof o.input?.clue==="string"&&o.input.clue.length>0
  &&o.input.clue.length<1000&&typeof o.input.claim==="string"
  &&o.input.claim.length<1000&&typeof o.evidence?.source_locator==="string","INPUT");
 hold(q.originalQuestionSha256===hash(j(o)),"QUESTION_DIGEST");
 if(q.caseId==="REAL_REGISTERED_ADAPTER"){
  hold(q.sourceStatus==="PINNED_SOURCE_RECOVERABLE"
   &&o.aperture.id==="chronology"&&o.evidence.provenance_class==="primary"
   &&o.evidence.source_locator.includes("github.com/the-static-collective/CANNON"),"SOURCE_STATUS");
 }else{
  hold(q.sourceStatus==="NO_ORIGINAL_SOURCE_OBJECT_FOR_HYPOTHETICAL_STATE"
   &&o.aperture.id==="source-object"&&!o.evidence.source_locator
   &&o.evidence.provenance_class==="speculation"
   &&o.evidence.support_confidence==="unsupported","COUNTERFACTUAL_IS_NOT_REAL");
 }
 return q;
}
const words=(x:string)=>x.replace(/[\r\n\t]/g," ").trim().split(/\s+/).filter(Boolean);
function dyads(x:string,max:number){
 const w=words(x).slice(0,max),lines:string[]=[];
 for(let i=0;i<w.length;i+=2){
  const pair=w.slice(i,i+2);lines.push(pair.length===1?"Word "+pair[0]:pair.join(" "));
 }
 return lines;
}
function countWords(line:string){return words(line).length;}
export function questionCard(q:QuestionSeed,breath:number,phase:Phase,prior:string){
 validateQuestionSeed(q);
 hold(Number.isInteger(breath)&&breath>=1&&breath<=3&&phases.includes(phase),"STAGE");
 const lines=[
  "Question remains",
  "without answer",
  q.caseId==="REAL_REGISTERED_ADAPTER"?"Original source":"Hypothetical source",
  q.caseId==="REAL_REGISTERED_ADAPTER"?"is recoverable":"is missing",
  "You inspect",
  "one possibility",
  ...dyads(q.originalQuestion.input.clue,14),
  ...dyads(q.originalQuestion.question,22),
  ...dyads(prior,4).map(s=>"Prior "+s),
  phase==="SUBSTANCE"?"Suggest alternative":
   phase==="LINEAGE"?"Question continuity":"Require witness",
  "Never approve"
 ];
 hold(lines.length>=7&&lines.every(x=>countWords(x)>=2&&countWords(x)<=3)
  &&lines.join("\n").length<=1250,"TWO_WORD_LINES");
 return lines.join("\n");
}
export async function exploreQuestion(q:QuestionSeed,provider:TransferProvider):Promise<Investigation>{
 validateQuestionSeed(q);
 hold(provider?.identity?.model&&provider.identity.revision
  &&["flan-t5","deterministic-fixture"].includes(provider.identity.kind),"PROVIDER");
 const steps:InvestigationStep[]=[];
 let parent:string|null=null,prior="";
 for(let breath=1;breath<=3;breath++)for(let i=0;i<3;i++){
  const phase=phases[i]!,card=questionCard(q,breath,phase,prior);
  const req:TripleRequest={schema:"iron-lung/triple-transfer-request/v1",
   breath,phase,parentStepId:parent,address:address[i]!,
   sourceSha256:q.originalQuestionSha256,inputSha256:hash(card),text:card};
  const generated=await provider.transform(req);
  hold(typeof generated==="string"&&generated.trim().length>0&&generated.length<=1200,"MODEL_OUTPUT");
  const response=generated.trim();
  const core={schema:"iron-lung/question-investigation-step/v1" as const,
   parentStepId:parent,caseId:q.caseId,breath,phase,card,
   cardSha256:hash(card),response,responseSha256:hash(response),
   provider:structuredClone(provider.identity),
   status:"POSSIBILITY_UNVERIFIED" as const,authority:"NONE" as const,
   factAdmitted:false as const,ownerApproval:false as const,executed:false as const};
  const step:InvestigationStep={...core,id:"possibility-"+hash(j(core)).slice(0,24)};
  steps.push(step);parent=step.id;prior=response;
 }
 const core={schema:"iron-lung/question-investigation/v1" as const,
  source:q,originalQuestionSha256:q.originalQuestionSha256,
  provider:structuredClone(provider.identity),steps,depth:3 as const,
  requests:9 as const,outputKind:"REVIEW_ONLY_SPECULATION" as const,
  selectedAnswer:null,modelCanExecute:false as const,
  modelCanAdvanceQuestion:false as const,authority:"NONE" as const};
 return {...core,investigationSha256:hash(j(core))};
}
export function inspectQuestionInvestigation(q:Investigation):true{
 hold(q?.schema==="iron-lung/question-investigation/v1"
  &&q.outputKind==="REVIEW_ONLY_SPECULATION"&&q.selectedAnswer===null
  &&q.modelCanExecute===false&&q.modelCanAdvanceQuestion===false
  &&q.authority==="NONE"&&q.depth===3&&q.requests===9,"NO_AUTHORITY");
 const {investigationSha256,...core}=q;
 hold(investigationSha256===hash(j(core)),"INVESTIGATION_DIGEST");
 validateQuestionSeed(q.source);
 hold(q.originalQuestionSha256===q.source.originalQuestionSha256
  &&q.steps.length===9,"INPUT_CHAIN");
 let prior="",parent:string|null=null;
 for(let i=0;i<9;i++){
  const s=q.steps[i]!,phase=phases[i%3]!,breath=Math.floor(i/3)+1;
  const expected=questionCard(q.source,breath,phase,prior);
  const {id,...body}=s;
  hold(s.caseId===q.source.caseId&&s.phase===phase&&s.breath===breath
   &&s.parentStepId===parent&&s.card===expected&&s.cardSha256===hash(expected)
   &&s.responseSha256===hash(s.response)&&id==="possibility-"+hash(j(body)).slice(0,24),
   "STEP_LINEAGE");
  hold(s.authority==="NONE"&&s.status==="POSSIBILITY_UNVERIFIED"
   &&!s.factAdmitted&&!s.ownerApproval&&!s.executed
   &&j(s.provider)===j(q.provider),"NO_MODEL_PROMOTION");
  prior=s.response;parent=s.id;
 }
 return true;
}
