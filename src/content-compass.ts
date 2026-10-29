/** Original Iron Lung COMPASS-003: question meaning lives in the two-word
 * assertions themselves, not in FACT/IDEA/RELATION role-label headings.
 * The supplied CANNON contract is real; DIRECT_ONLY is a clearly declared
 * hypothetical disabled-adapter test, NOT a claim about installed software.
 */
import {createHash} from "node:crypto";
import {validateTask,type ContractTask} from "./contract-compass.js";
import type {TransferProvider,TripleRequest,Phase} from "./triple-transfer.js";
const h=(s:string)=>createHash("sha256").update(s).digest("hex");
const j=(v:unknown)=>JSON.stringify(v);
function hold(x:unknown,label:string):asserts x{if(!x)throw Error("HOLD_CONTENT_COMPASS_"+label);}
export const SCENARIOS=["ADAPTED","DIRECT_ONLY"] as const;
export type Scenario=typeof SCENARIOS[number];
export const ARMS=["DYAD_NEUTRAL","DYAD_YOU","FOCUSED_NEUTRAL","FOCUSED_YOU"] as const;
export type Arm=typeof ARMS[number];
const phases=["SUBSTANCE","LINEAGE","AUTHORITY_REQUIREMENTS"] as const;
export type Question={key:string;expected:string;prompt:string};
export function groundedQuestion(t:ContractTask,b:number,phase:Phase,scenario:Scenario):Question{
 validateTask(t);hold(SCENARIOS.includes(scenario)&&b>=1&&b<=3&&Number.isInteger(b),"QUESTION");
 const questions=[
  [{key:"producer-output",expected:t.producer.outputPort,prompt:"producer output"},
   {key:"consumer-input",expected:t.consumer.inputPort,prompt:"consumer input"},
   {key:"direct-match",expected:"NO",prompt:"direct compatibility"}],
  [{key:"adapter-needed",expected:"YES",prompt:"translation requirement"},
   {key:"adapter-available",expected:scenario==="ADAPTED"?"YES":"NO",prompt:"adapter availability"},
   {key:"crossing",expected:scenario==="ADAPTED"?"READY_FOR_SYNTHETIC_TEST":"HOLD_TYPE_MISMATCH",prompt:"crossing disposition"}],
  [{key:"receipt-field",expected:scenario==="ADAPTED"?t.edge.field:"NONE",prompt:"available receipt-field"},
   {key:"direct-match",expected:"NO",prompt:"direct compatibility"},
   {key:"crossing",expected:scenario==="ADAPTED"?"READY_FOR_SYNTHETIC_TEST":"HOLD_TYPE_MISMATCH",prompt:"crossing disposition"}]
 ];
 const n=phases.indexOf(phase);
 hold(n>=0,"PHASE");
 return questions[b-1]![n]!;
}
const twoOrThree=(line:string)=>{const n=line.trim().split(/\s+/).length;return n>=2&&n<=3;};
const forbidden=/^(?:FACT|IDEA|RELATION|SOURCE|ADAPTER|ASK)\s/;
export function contentCard(t:ContractTask,b:number,phase:Phase,scenario:Scenario,arm:Arm,prior:string):string{
 const q=groundedQuestion(t,b,phase,scenario);
 hold(ARMS.includes(arm),"ARM");
 // Fact: original, exact producer and consumer schema from CANNON source code.
 // Idea: a possible translation, expressed as content, not as a "IDEA:" heading.
 // Relation: known original edge or a declared counterfactual disabled-edge test.
 const statements=[
  t.producer.stage+" produces",
  t.producer.outputPort+" memory",
  t.consumer.stage+" expects",
  t.consumer.inputPort+" input",
  "A bridge",
  "could translate",
  "receipt identity",
  scenario==="ADAPTED"?"The bridge":"That bridge",
  scenario==="ADAPTED"?"already exists":"is disabled",
  scenario==="ADAPTED"?t.edge.adapter+" connects":"Different ports",
  scenario==="ADAPTED"?t.edge.field+" identity":"cannot connect",
  "Direct types",
  "remain different"
 ];
 if(arm.startsWith("FOCUSED")){
  // This clue only names real source fields; it does not disclose a prediction
  // of the tested result or grant model permission to act.
  statements.push(t.producer.capability+" generated",t.consumer.capability+" receives");
  statements.push(scenario==="ADAPTED"?"Existing receipt":"Unavailable bridge");
 }
 if(prior.trim()) statements.push("Earlier response",prior.trim().split(/\s+/).slice(0,2).join(" "));
 const directed=arm.endsWith("YOU");
 statements.push(directed?"You identify":"Identify the",q.prompt);
 statements.push("Answer briefly","No execution");
 hold(statements.length>=7&&statements.every(twoOrThree),"LINE_LENGTH");
 hold(statements.every(x=>!forbidden.test(x)),"NO_LABEL_HEADERS");
 hold(statements.join("\n").length<=1350,"CARD_BOUNDS");
 return statements.join("\n");
}
export interface GroundedStep{
 schema:"iron-lung/content-step/v1";id:string;parentStepId:string|null;
 scenario:Scenario;arm:Arm;breath:number;phase:Phase;question:string;
 expected:string;card:string;cardSha256:string;response:string;responseSha256:string;
 provider:TransferProvider["identity"];status:"MODEL_UNVERIFIED";authority:"NONE";executed:false;
}
export interface GroundedPacket{
 schema:"iron-lung/content-triangulation/v1";task:ContractTask;taskSha256:string;
 provider:TransferProvider["identity"];steps:GroundedStep[];
 results:Array<{scenario:Scenario;arm:Arm;calls:9;exactCorrect:number;echoes:number;unanswered:number;responses:string[]}>;
 callCount:72;equalCallsPerArm:9;noAutoDecision:true;humanAuthorization:false;sourceChanged:false;
 receiptSha256:string;
}
function metrics(rows:GroundedStep[],scenario:Scenario,arm:Arm){
 return {scenario,arm,calls:9 as const,
  exactCorrect:rows.filter(s=>s.response.toLowerCase().replace(/[.\s]+$/,"")===s.expected.toLowerCase()).length,
  echoes:rows.filter(s=>s.response.includes(s.card.split("\n")[0]!)).length,
  unanswered:rows.filter(s=>/^(unknown|none|no proposal)$/i.test(s.response)).length,
  responses:rows.map(s=>s.response)};
}
export async function runContentCompass(task:ContractTask,provider:TransferProvider):Promise<GroundedPacket>{
 validateTask(task);hold(provider?.identity?.revision&&provider.identity.model,"PROVIDER");
 const steps:GroundedStep[]=[],results:GroundedPacket["results"]=[];
 for(const scenario of SCENARIOS)for(const arm of ARMS){
  let parent:string|null=null,prior="";
  const rows:GroundedStep[]=[];
  for(let breath=1;breath<=3;breath++)for(const phase of phases){
   const q=groundedQuestion(task,breath,phase,scenario);
   const card=contentCard(task,breath,phase,scenario,arm,prior);
   const request:TripleRequest={schema:"iron-lung/triple-transfer-request/v1",
    breath,phase,parentStepId:parent,sourceSha256:h(j(task)),inputSha256:h(card),
    address:phase==="SUBSTANCE"?{aperture:"GAP",triad:"IDEA",braid:"substance"}:
     phase==="LINEAGE"?{aperture:"CONTEXT",triad:"RELATION",braid:"lineage"}:
     {aperture:"GAP",triad:"IDEA",braid:"authority"},text:card};
   const response=(await provider.transform(request));
   hold(typeof response==="string"&&response.trim().length>0&&response.length<=1200,"RESPONSE");
   const answer=response.trim();
   const core={schema:"iron-lung/content-step/v1" as const,parentStepId:parent,
    scenario,arm,breath,phase,question:q.key,expected:q.expected,card,cardSha256:h(card),
    response:answer,responseSha256:h(answer),provider:structuredClone(provider.identity),
    status:"MODEL_UNVERIFIED" as const,authority:"NONE" as const,executed:false as const};
   const s:GroundedStep={...core,id:"content-"+h(j(core)).slice(0,24)};
   rows.push(s);steps.push(s);parent=s.id;prior=answer;
  }
  results.push(metrics(rows,scenario,arm));
 }
 const core={schema:"iron-lung/content-triangulation/v1" as const,task,taskSha256:h(j(task)),
  provider:structuredClone(provider.identity),steps,results,
  callCount:72 as const,equalCallsPerArm:9 as const,
  noAutoDecision:true as const,humanAuthorization:false as const,sourceChanged:false as const};
 return {...core,receiptSha256:h(j(core))};
}
export function inspectContentCompass(packet:GroundedPacket):true{
 hold(packet?.schema==="iron-lung/content-triangulation/v1"&&packet.noAutoDecision
  &&!packet.humanAuthorization&&!packet.sourceChanged&&packet.callCount===72
  &&packet.equalCallsPerArm===9,"NO_PROMOTION");
 const {receiptSha256,...core}=packet;
 hold(receiptSha256===h(j(core)),"RECEIPT");
 validateTask(packet.task);
 hold(packet.taskSha256===h(j(packet.task))&&packet.steps.length===72
  &&packet.results.length===8,"SIZE");
 let offset=0;
 for(const scenario of SCENARIOS)for(const arm of ARMS){
  let prior="",parent:string|null=null;
  const rows=packet.steps.slice(offset,offset+9);
  for(let i=0;i<9;i++){
   const s=rows[i]!,breath=Math.floor(i/3)+1,phase=phases[i%3]!;
   const q=groundedQuestion(packet.task,breath,phase,scenario);
   const expectedCard=contentCard(packet.task,breath,phase,scenario,arm,prior);
   const {id,...body}=s;
   hold(s.scenario===scenario&&s.arm===arm&&s.breath===breath&&s.phase===phase
    &&s.card===expectedCard&&s.cardSha256===h(expectedCard)&&s.question===q.key
    &&s.expected===q.expected&&s.parentStepId===parent,"CARD_LINEAGE");
   hold(id==="content-"+h(j(body)).slice(0,24)
    &&s.responseSha256===h(s.response)&&j(s.provider)===j(packet.provider)
    &&s.authority==="NONE"&&s.status==="MODEL_UNVERIFIED"&&!s.executed,"SOURCE_INTEGRITY");
   parent=s.id;prior=s.response;
  }
  hold(j(packet.results[offset/9])===j(metrics(rows,scenario,arm)),"METRICS");
  offset+=9;
 }
 return true;
}
