/** Bounded three-nested text transfers across the original Iron Lung
 * Substance → Lineage → Authority requirements, for one to three breaths.
 * None of these transformations can constitute a Heart/consequence.
 */
import {createHash} from "node:crypto";
import {validateBraid} from "./braid.js";
import {discoverAddressableGaps} from "./combinatrix.js";
import type {BraidV01} from "./model.js";

export type Phase = "SUBSTANCE" | "LINEAGE" | "AUTHORITY_REQUIREMENTS";
type Aperture = "SIGNAL"|"CONTEXT"|"GAP";
type Triad = "IDEA"|"RELATION";
export interface TripleRequest {
 schema:"iron-lung/triple-transfer-request/v1";breath:number;phase:Phase;
 parentStepId:string|null;address:{aperture:Aperture;triad:Triad;braid:"substance"|"lineage"|"authority"};
 sourceSha256:string;inputSha256:string;text:string;
}
export interface TransferProvider{
 identity:{kind:"deterministic-fixture"|"flan-t5";model:string;revision:string};
 transform(request:TripleRequest):Promise<string>;
}
export interface TransferStep {
 schema:"iron-lung/triple-transfer-step/v1";id:string;parentStepId:string|null;
 breath:number;phase:Phase;address:TripleRequest["address"];inputSha256:string;sourceSha256:string;
 candidateText:string;candidateSha256:string;provider:TransferProvider["identity"];
 status:"PROPOSAL_UNVERIFIED";actualAuthority:"NONE";humanKeep:false;
 evidenceMinted:false;lineageRewritten:false;heartBeat:false;
}
export interface TripleTransferField{
 schema:"iron-lung/triple-transfer-field/v1";
 source:{braidId:string;braidSha256:string;rawTextSha256:string;sourceRefs:string[];
 authorityStrandSha256:string;gapIds:string[]};
 provider:TransferProvider["identity"];depth:number;steps:TransferStep[];
 parentLinks:{from:string;to:string}[];sparseAddresses:TripleRequest["address"][];
 fieldSha256:string;status:"LUNG_POSSIBILITY_ONLY";admittedCandidateId:null;
 descendantBraidId:null;authority:"NONE";humanTimeSavedSeconds:null;
}
const phases:Phase[]=["SUBSTANCE","LINEAGE","AUTHORITY_REQUIREMENTS"];
const addresses:TripleRequest["address"][]=[
 {aperture:"GAP",triad:"IDEA",braid:"substance"},
 {aperture:"CONTEXT",triad:"RELATION",braid:"lineage"},
 {aperture:"GAP",triad:"IDEA",braid:"authority"}
];
const hash=(x:string)=>createHash("sha256").update(x).digest("hex");
const j=(x:unknown)=>JSON.stringify(x);
function need(x:unknown,why:string):asserts x{if(!x)throw Error("HOLD_TRIPLE_TRANSFER_"+why)}
export async function circulateTripleTransfer(input:{
 braid:BraidV01;rawText:string;sourceRefs:string[];depth:number;provider:TransferProvider
}):Promise<TripleTransferField>{
 const checked=validateBraid(input.braid);need(checked.ok,"BRAID");
 const braid=checked.value;
 need(Number.isInteger(input.depth)&&input.depth>=1&&input.depth<=3,"DEPTH");
 need(typeof input.rawText==="string"&&input.rawText.trim().length>0&&input.rawText.length<=2500,"SOURCE");
 need(Array.isArray(input.sourceRefs)&&input.sourceRefs.length>0&&input.sourceRefs.length<=12
  &&input.sourceRefs.every(x=>typeof x==="string"&&x.length>0&&x.length<=200),"REFS");
 const provider=input.provider.identity;
 need(provider&&["flan-t5","deterministic-fixture"].includes(provider.kind)
  &&typeof provider.model==="string"&&provider.model.length>0
  &&typeof provider.revision==="string"&&provider.revision.length>0,"PROVIDER");
 const gaps=discoverAddressableGaps(braid);
 need(gaps.some(x=>x.strand==="substance")&&gaps.some(x=>x.strand==="lineage"),"GAPS_REQUIRED");
 const raw=input.rawText.trim();
 const source={braidId:braid.id,braidSha256:hash(j(braid)),rawTextSha256:hash(raw),
  sourceRefs:[...new Set(input.sourceRefs)].sort(),authorityStrandSha256:hash(j(braid.strands.authority)),
  gapIds:gaps.map(x=>x.gapId)};
 const steps:TransferStep[]=[];
 let parent:string|null=null;
 let previous="";
 for(let breath=1;breath<=input.depth;breath++){
  for(let i=0;i<3;i++){
   const phase=phases[i]!;
   const task=phase==="SUBSTANCE"?
    "Suggest one possible substance interpretation for its addressed gap. No assertion of truth or repaired state.":
    phase==="LINEAGE"?
    "Using the speculative substance output, identify one continuity or provenance question. No invented ancestry.":
    "Using previous speculative material, identify an external human authorization or witness REQUIREMENT. Never grant authority.";
   const prompt="Original raw text (a claim, NOT verified): "+raw+
    "\nOriginal braid: "+source.braidId+"; original gap IDs: "+source.gapIds.join(", ")+
    "\nBreath: "+breath+"; phase: "+phase+
    "\nPrevious nested candidate: "+(previous.slice(0,700)||"(none)")+
    "\nTask: "+task+"\nAnswer briefly as a proposal; no approvals.";
   need(prompt.length<=4200,"PROMPT_SIZE");
   const req:TripleRequest={schema:"iron-lung/triple-transfer-request/v1",
    breath,phase,parentStepId:parent,address:addresses[i]!,
    sourceSha256:source.rawTextSha256,inputSha256:hash(prompt),text:prompt};
   // This is the sole generative crossing. The returned string never becomes
   // authority, evidence, lineage repair or an executable instruction.
   const output=await input.provider.transform(req);
   need(typeof output==="string"&&output.trim().length>0&&output.length<=1200,"OUTPUT_BOUNDS");
   const candidateText=output.trim();
   const core={schema:"iron-lung/triple-transfer-step/v1" as const,
    parentStepId:parent,breath,phase,address:addresses[i]!,inputSha256:req.inputSha256,
    sourceSha256:req.sourceSha256,candidateText,candidateSha256:hash(candidateText),
    provider:structuredClone(provider),status:"PROPOSAL_UNVERIFIED" as const,
    actualAuthority:"NONE" as const,humanKeep:false as const,evidenceMinted:false as const,
    lineageRewritten:false as const,heartBeat:false as const};
   const step:TransferStep={...core,id:"breath-"+hash(j(core)).slice(0,24)};
   steps.push(step);parent=step.id;previous=candidateText;
  }
 }
 const core={schema:"iron-lung/triple-transfer-field/v1" as const,source,
  provider:structuredClone(provider),depth:input.depth,steps,
  parentLinks:steps.slice(1).map(x=>({from:x.parentStepId!,to:x.id})),
  sparseAddresses:addresses,status:"LUNG_POSSIBILITY_ONLY" as const,
  admittedCandidateId:null,descendantBraidId:null,authority:"NONE" as const,
  humanTimeSavedSeconds:null};
 return {...core,fieldSha256:hash(j(core))};
}
export function inspectTripleField(field:TripleTransferField):boolean{
 need(field?.schema==="iron-lung/triple-transfer-field/v1"&&field.status==="LUNG_POSSIBILITY_ONLY"
  &&field.authority==="NONE"&&field.admittedCandidateId===null&&field.descendantBraidId===null,"LUNG_ONLY");
 const {fieldSha256,...core}=field;
 need(fieldSha256===hash(j(core)),"FIELD_HASH");
 need(Number.isInteger(field.depth)&&field.depth>=1&&field.depth<=3
  &&field.steps.length===field.depth*3,"COUNT");
 for(let i=0;i<field.steps.length;i++){
  const step=field.steps[i]!,{id,...body}=step;
  need(id==="breath-"+hash(j(body)).slice(0,24),"STEP_HASH");
  need(step.parentStepId===(i?field.steps[i-1]!.id:null),"CHAIN");
  need(step.breath===Math.floor(i/3)+1&&step.phase===phases[i%3]
   &&j(step.address)===j(addresses[i%3]),"NESTING");
  need(step.actualAuthority==="NONE"&&!step.humanKeep&&!step.heartBeat
   &&step.status==="PROPOSAL_UNVERIFIED"&&!step.evidenceMinted
   &&!step.lineageRewritten&&step.candidateSha256===hash(step.candidateText),"NO_PROMOTION");
 }
 need(field.parentLinks.length===field.steps.length-1
  &&field.parentLinks.every((x,i)=>x.from===field.steps[i]!.id&&x.to===field.steps[i+1]!.id),"LINKS");
 return true;
}
export const fixtureProvider:TransferProvider={
 identity:{kind:"deterministic-fixture",model:"iron-lung-typed-fixture",revision:"v1"},
 async transform(r){return "Possible "+r.phase.toLowerCase()+" / breath "+r.breath+
  " from "+r.inputSha256.slice(0,18)+"; unresolved and not admitted.";}
};
