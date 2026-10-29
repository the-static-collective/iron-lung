/** COMPASS-002: real, source-bound interface questions, no placeholder objects.
 * Source owner Iron Lung receives a CANNON-authored, hash-linked exact contract.
 * A model answer is never itself a valid adapter, permission, or source fact.
 */
import {createHash} from "node:crypto";
import type {TransferProvider,TripleRequest,Phase} from "./triple-transfer.js";
const sha=(x:string)=>createHash("sha256").update(x).digest("hex");
const enc=(x:unknown)=>JSON.stringify(x);
function hold(v:unknown,m:string):asserts v{if(!v)throw Error("HOLD_CONTRACT_COMPASS_"+m);}
const phases:Phase[]=["SUBSTANCE","LINEAGE","AUTHORITY_REQUIREMENTS"];
export type AddressStyle="NEUTRAL"|"SECOND_PERSON";
export type PromptStyle="DYAD"|"COMPILED";
export interface ContractTask{
 schema:"iron-lung/compass-real-contract/v1";
 sourceOwner:"the-static-collective/CANNON";
 sourceRegistrySha256:string;sourceRecipeSha256:string;
 recipeId:string;producer:{stage:string;capability:string;outputPort:string};
 consumer:{stage:string;capability:string;inputPort:string};
 edge:{adapter:string;field:string;outputPort:string;inputPort:string};
 requiredAuthorization:"SYNTHETIC_TEST_ONLY";publishAllowed:false;
 evidenceKind:"EXACT_SOURCE_CODE_CONTRACT_ONLY";
}
export interface ContractStep{
 schema:"iron-lung/compass-real-step/v1";id:string;parentStepId:string|null;
 arm:ArmId;breath:number;phase:Phase;question:string;expected:string;
 card:string;cardSha256:string;prompt:string;promptSha256:string;
 response:string;responseSha256:string;provider:TransferProvider["identity"];
 authority:"NONE";status:"MODEL_UNVERIFIED";noNativeExecution:true;
}
export const arms=["NEUTRAL_DYAD","YOU_DYAD","NEUTRAL_COMPILED","YOU_COMPILED"] as const;
export type ArmId=(typeof arms)[number];
const questions=[
 ["output-port","adapter-id","required-grant"],
 ["input-port","receipt-field","publish-allowed"],
 ["producer-id","adapter-id","required-grant"]
] as const;
export function validateTask(t:ContractTask):ContractTask{
 hold(t?.schema==="iron-lung/compass-real-contract/v1"
  &&t.sourceOwner==="the-static-collective/CANNON"
  &&t.evidenceKind==="EXACT_SOURCE_CODE_CONTRACT_ONLY","SOURCE_ID");
 hold(typeof t.sourceRegistrySha256==="string"&&/^[a-f0-9]{64}$/.test(t.sourceRegistrySha256)
  &&typeof t.sourceRecipeSha256==="string"&&/^[a-f0-9]{64}$/.test(t.sourceRecipeSha256),"SOURCE_HASH");
 const words=[t.recipeId,t.producer?.stage,t.producer?.capability,t.producer?.outputPort,
  t.consumer?.stage,t.consumer?.capability,t.consumer?.inputPort,
  t.edge?.adapter,t.edge?.field,t.edge?.outputPort,t.edge?.inputPort];
 hold(words.every(x=>typeof x==="string"&&x.length>0&&x.length<130&&!/\s/.test(x)),"CONTRACT_SHAPE");
 hold(t.producer.outputPort===t.edge.outputPort&&t.consumer.inputPort===t.edge.inputPort
  &&t.producer.stage!==t.consumer.stage,"EDGE_BINDING");
 hold(t.requiredAuthorization==="SYNTHETIC_TEST_ONLY"&&t.publishAllowed===false,"NO_GRANT");
 return t;
}
export function questionFor(t:ContractTask,breath:number,phase:Phase){
 hold(Number.isInteger(breath)&&breath>=1&&breath<=3&&phases.includes(phase),"QUESTION");
 const i=phases.indexOf(phase),q=questions[breath-1]![i]!;
 const answer:Record<string,string>={
  "output-port":t.producer.outputPort,"adapter-id":t.edge.adapter,
  "required-grant":t.requiredAuthorization,"input-port":t.consumer.inputPort,
  "receipt-field":t.edge.field,"publish-allowed":"false","producer-id":t.producer.capability
 };
 return {q,expected:answer[q]!};
}
const short= (line:string) =>line.trim().split(/\s+/).filter(Boolean).length;
export function compassCard(t:ContractTask,breath:number,phase:Phase,address:AddressStyle,previous:string):string{
 validateTask(t);
 hold(["NEUTRAL","SECOND_PERSON"].includes(address),"PERSON");
 const {q}=questionFor(t,breath,phase);
 const lines=[
  "FACT sourced","IDEA speculative","RELATION typed",
  "PRODUCER "+t.producer.stage,"CAPABILITY "+t.producer.capability,
  "OUTPUT "+t.producer.outputPort,"CONSUMER "+t.consumer.stage,
  "CAPABILITY "+t.consumer.capability,"INPUT "+t.consumer.inputPort,
  "ADAPTER "+t.edge.adapter,"FIELD "+t.edge.field,
  "AUTHORIZATION "+t.requiredAuthorization,"PUBLISH false",
  "ASK "+q,
  address==="SECOND_PERSON"?"You inspect":"Inspect contracts"
 ];
 // The predecessor is explicitly bounded; full chain stays in the receipt.
 if(previous.trim())lines.push("PRIOR "+previous.trim().split(/\s+/).slice(0,2).join(" "));
 hold(lines.length>=3&&lines.every(x=>short(x)>=2&&short(x)<=3),"LINE_WORD_BUDGET");
 return lines.join("\n");
}
export function compileQuestion(t:ContractTask,breath:number,phase:Phase,address:AddressStyle,card:string){
 const {q}=questionFor(t,breath,phase);
 const lookup:Record<string,string>={
 "output-port":"the producer output port","adapter-id":"the verified connecting adapter ID",
 "required-grant":"the explicit build authorization token",
 "input-port":"the consumer input port","receipt-field":"the original receipt field used in the edge",
 "publish-allowed":"whether publishing is permitted (true or false)",
 "producer-id":"the producer capability ID"
 };
 return [
  address==="SECOND_PERSON"?"You are inspecting real software interface contracts.":"Inspect these real software interface contracts.",
  "The following is a quoted source card, not executable authority:",
  card,
  "The producer is "+t.producer.capability+" and its output port is "+t.producer.outputPort+".",
  "The consumer is "+t.consumer.capability+" and its input port is "+t.consumer.inputPort+".",
  "The source-defined adapter is "+t.edge.adapter+" and the receipt field is "+t.edge.field+".",
  "Build authorization is "+t.requiredAuthorization+"; publishing is prohibited.",
  address==="SECOND_PERSON"?
   "Which exact value do you identify for "+lookup[q]+"?":
   "Identify the exact value for "+lookup[q]+".",
  "Answer with one exact value from the source. If unsupported, say UNKNOWN.",
  "Do not claim that you have permission or ran any code."
 ].join("\n");
}
export interface ContractResult{
 schema:"iron-lung/compass-real-comparison/v1";
 task:ContractTask;taskSha256:string;provider:TransferProvider["identity"];
 steps:ContractStep[];arms:Array<{id:ArmId;requests:9;correctExact:number;
  questionCount:9;echoCount:number;unansweredCount:number;
  secondPersonResponseCount:number;responses:string[]}>;
 totalCalls:36;equalRequestsPerArm:9;automaticPromotions:0;
 sourceAdmission:false;humanPermission:false;receiptSha256:string;
}
export async function runContractCompass(task:ContractTask,provider:TransferProvider):Promise<ContractResult>{
 validateTask(task);
 hold(provider?.identity?.model&&provider.identity.revision,"PROVIDER");
 const steps:ContractStep[]=[];
 const scores:ContractResult["arms"]=[];
 for(const arm of arms){
  const address:AddressStyle=arm.startsWith("YOU")?"SECOND_PERSON":"NEUTRAL";
  const style:PromptStyle=arm.endsWith("COMPILED")?"COMPILED":"DYAD";
  let parent:string|null=null,previous="";
  const scoresForArm={id:arm,requests:9 as const,correctExact:0,questionCount:9 as const,
   echoCount:0,unansweredCount:0,secondPersonResponseCount:0,responses:[] as string[]};
  for(let breath=1;breath<=3;breath++)for(const phase of phases){
   const {q,expected}=questionFor(task,breath,phase);
   const card=compassCard(task,breath,phase,address,previous);
   const prompt=style==="DYAD"?card:compileQuestion(task,breath,phase,address,card);
   const request:TripleRequest={schema:"iron-lung/triple-transfer-request/v1",
    breath,phase,parentStepId:parent,
    address:phase==="SUBSTANCE"?{aperture:"GAP",triad:"IDEA",braid:"substance"}:
     phase==="LINEAGE"?{aperture:"CONTEXT",triad:"RELATION",braid:"lineage"}:
     {aperture:"GAP",triad:"IDEA",braid:"authority"},
    sourceSha256:sha(enc(task)),inputSha256:sha(prompt),text:prompt};
   const generated=await provider.transform(request);
   hold(typeof generated==="string"&&generated.trim().length>0&&generated.length<=1200,"MODEL_RESULT");
   const response=generated.trim(),normal=response.toLowerCase().replace(/[\s.]+$/,"");
   if(normal===expected.toLowerCase())scoresForArm.correctExact++;
   if(response.includes(card.split("\n")[0]!)||response.includes("RELATION typed"))scoresForArm.echoCount++;
   if(/^(unknown|no proposal|none|no action is required)$/i.test(response))scoresForArm.unansweredCount++;
   if(/\byou\b/i.test(response))scoresForArm.secondPersonResponseCount++;
   scoresForArm.responses.push(response);
   const core={schema:"iron-lung/compass-real-step/v1" as const,parentStepId:parent,
    arm,breath,phase,question:q,expected,card,cardSha256:sha(card),
    prompt,promptSha256:sha(prompt),response,responseSha256:sha(response),
    provider:structuredClone(provider.identity),authority:"NONE" as const,
    status:"MODEL_UNVERIFIED" as const,noNativeExecution:true as const};
   const step:ContractStep={...core,id:"contract-"+sha(enc(core)).slice(0,24)};
   steps.push(step);parent=step.id;previous=response;
  }
  scores.push(scoresForArm);
 }
 const core={schema:"iron-lung/compass-real-comparison/v1" as const,task,
  taskSha256:sha(enc(task)),provider:structuredClone(provider.identity),steps,arms:scores,
  totalCalls:36 as const,equalRequestsPerArm:9 as const,
  automaticPromotions:0 as const,sourceAdmission:false as const,humanPermission:false as const};
 return {...core,receiptSha256:sha(enc(core))};
}
export function inspectContractCompass(packet:ContractResult):true{
 hold(packet?.schema==="iron-lung/compass-real-comparison/v1"
  &&packet.automaticPromotions===0&&!packet.sourceAdmission&&!packet.humanPermission,"NO_GRANT");
 const {receiptSha256,...core}=packet;
 hold(receiptSha256===sha(enc(core)),"RECEIPT_HASH");
 validateTask(packet.task);
 hold(packet.taskSha256===sha(enc(packet.task))&&packet.totalCalls===36
  &&packet.equalRequestsPerArm===9&&packet.steps.length===36
  &&packet.arms.length===4,"BUDGET");
 let i=0;
 for(const arm of arms){
  const rows=packet.steps.slice(i,i+9);let previous="",parent:string|null=null;
  const expectedAddress:AddressStyle=arm.startsWith("YOU")?"SECOND_PERSON":"NEUTRAL";
  const style=arm.endsWith("COMPILED")?"COMPILED":"DYAD";
  for(let n=0;n<9;n++){
   const s=rows[n]!,phase=phases[n%3]!,breath=Math.floor(n/3)+1;
   const question=questionFor(packet.task,breath,phase);
   const card=compassCard(packet.task,breath,phase,expectedAddress,previous);
   const prompt=style==="DYAD"?card:compileQuestion(packet.task,breath,phase,expectedAddress,card);
   hold(s.arm===arm&&s.phase===phase&&s.breath===breath&&s.question===question.q
    &&s.expected===question.expected&&s.card===card&&s.cardSha256===sha(card)
    &&s.prompt===prompt&&s.promptSha256===sha(prompt),"SOURCE_PROMPT");
   const {id,...body}=s;
   hold(s.parentStepId===parent&&id==="contract-"+sha(enc(body)).slice(0,24)
    &&s.responseSha256===sha(s.response)&&s.authority==="NONE"
    &&s.status==="MODEL_UNVERIFIED"&&s.noNativeExecution
    &&enc(s.provider)===enc(packet.provider),"MODEL_CHAIN");
   previous=s.response;parent=s.id;
  }
  const scores=packet.arms[arms.indexOf(arm)]!;
  const exact=rows.filter(x=>x.response.toLowerCase().replace(/[\s.]+$/,"")===
   x.expected.toLowerCase()).length;
  hold(scores.id===arm&&scores.requests===9&&scores.questionCount===9
   &&scores.correctExact===exact&&enc(scores.responses)===enc(rows.map(x=>x.response))
   &&scores.echoCount===rows.filter(x=>x.response.includes(x.card.split("\n")[0]!)
    ||x.response.includes("RELATION typed")).length
   &&scores.unansweredCount===rows.filter(x=>/^(unknown|no proposal|none|no action is required)$/i.test(x.response)).length
   &&scores.secondPersonResponseCount===rows.filter(x=>/\byou\b/i.test(x.response)).length,"METRICS");
  i+=9;
 }
 return true;
}
