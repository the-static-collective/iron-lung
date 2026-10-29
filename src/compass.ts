/** IRON LUNG / COMPASS-001.
 * Twenty-seven or nine tightly bounded micro-questions:
 * FACT / IDEA / RELATION, never a model-established truth, ancestry, or grant.
 */
import {createHash} from "node:crypto";
import {validateBraid} from "./braid.js";
import {discoverAddressableGaps} from "./combinatrix.js";
import type {BraidV01} from "./model.js";
import type {TransferProvider,Phase} from "./triple-transfer.js";

const phases:Phase[]=["SUBSTANCE","LINEAGE","AUTHORITY_REQUIREMENTS"];
const foci=["FACT","IDEA","RELATION"] as const;
export type CompassFocus=(typeof foci)[number]|"TRIAD";
const sha=(s:string)=>createHash("sha256").update(s).digest("hex");
const enc=(x:unknown)=>JSON.stringify(x);
function need(x:unknown,label:string):asserts x{if(!x)throw Error("HOLD_COMPASS_"+label);}
const tokens=(text:string)=>text.replace(/[\r\n\t]+/g," ").trim().split(/\s+/u).filter(Boolean);
const pairs=(words:string[],max=40)=>{const clipped=words.slice(0,max);const out:string[]=[];
 for(let i=0;i<clipped.length;i+=2)out.push((clipped.slice(i,i+2).length===1?"WORD ":"")+clipped.slice(i,i+2).join(" "));
 return out;};
const labels=["FACT stated","IDEA speculative","RELATION unverified"];
const aims:Record<Phase,Record<CompassFocus,string>>={
 SUBSTANCE:{FACT:"ASK observable input",IDEA:"ASK smallest mechanism",RELATION:"ASK interface mismatch",TRIAD:"ASK concrete change"},
 LINEAGE:{FACT:"ASK source identifier",IDEA:"ASK provenance alternative",RELATION:"ASK exact connection",TRIAD:"ASK trace inheritance"},
 AUTHORITY_REQUIREMENTS:{FACT:"ASK missing witness",IDEA:"ASK permission requirement",RELATION:"ASK independent test",TRIAD:"ASK external check"}
};
export function dyadCard(input:{phase:Phase;breath:number;focus:CompassFocus;
 rawText:string;previous:string;sourceSha256:string}):string{
 need(phases.includes(input.phase)&&[...foci,"TRIAD"].includes(input.focus),"PHASE");
 need(Number.isInteger(input.breath)&&input.breath>0&&input.breath<=3,"BREATH");
 need(typeof input.rawText==="string"&&input.rawText.length>0&&input.rawText.length<=2500,"SOURCE_SIZE");
 const intro=[
 ...labels,
 "TRUTH not_verified",
 "AUTHORITY not_granted",
 "EVIDENCE no_new",
 "PHASE "+input.phase.replaceAll("_"," "),
 "FOCUS "+input.focus,
 "BREATH "+input.breath,
 aims[input.phase][input.focus],
 "SOURCE quoted",
 ...pairs(tokens(input.rawText),32),
 "CONTEXT candidate",
 ...(input.previous?pairs(tokens(input.previous),18):["NONE previous"]),
 "REPLY short",
 "REPLY tentative"
 ];
 need(intro.length>=3&&intro.every(line=>{const n=tokens(line).length;return n>=2&&n<=3}),"DYAD_LINES");
 need(intro.join("\n").length<=1100,"CARD_BOUNDS");
 return intro.join("\n");
}
export interface CompassStep{
 schema:"iron-lung/compass-step/v1";
 id:string;parentStepId:string|null;breath:number;phase:Phase;focus:CompassFocus;
 card:string;cardSha256:string;sourceSha256:string;
 response:string;responseSha256:string;provider:TransferProvider["identity"];
 authority:"NONE";status:"PROPOSAL_UNVERIFIED";heartBeat:false;humanKeep:false;
}
export interface CompassField{
 schema:"iron-lung/compass-field/v1";
 source:{braidId:string;braidSha256:string;originalAuthoritySha256:string;
  rawText:string;rawTextSha256:string;sourceRefs:string[];gapIds:string[]};
 provider:TransferProvider["identity"];slicesPerPhase:1|3;depth:3;
 steps:CompassStep[];outputSha256:string;
 outputAuthority:"NONE";admittedCandidateId:null;descendantBraidId:null;
 classification:"LUNG_REVIEW_ONLY";fieldSha256:string;
}
export async function runCompass(input:{
 braid:BraidV01;rawText:string;sourceRefs:string[];provider:TransferProvider;
 slicesPerPhase:1|3;
}):Promise<CompassField>{
 const checked=validateBraid(input.braid);need(checked.ok,"BRAID");
 const braid=checked.value;
 need(input.slicesPerPhase===1||input.slicesPerPhase===3,"SLICES");
 need(typeof input.rawText==="string"&&input.rawText.length>0&&input.rawText.length<=2500,"SOURCE");
 need(Array.isArray(input.sourceRefs)&&input.sourceRefs.length>0&&input.sourceRefs.length<=12
  &&input.sourceRefs.every(x=>typeof x==="string"&&x.length>0),"REFS");
 const gaps=discoverAddressableGaps(braid);
 need(gaps.some(x=>x.strand==="substance")&&gaps.some(x=>x.strand==="lineage"),"GAPS");
 const provider=structuredClone(input.provider.identity);
 need(provider?.model&&provider.revision
  &&["flan-t5","deterministic-fixture"].includes(provider.kind),"MODEL");
 const source={braidId:braid.id,braidSha256:sha(enc(braid)),
  originalAuthoritySha256:sha(enc(braid.strands.authority)),
  rawText:input.rawText,rawTextSha256:sha(input.rawText),
  sourceRefs:[...new Set(input.sourceRefs)].sort(),gapIds:gaps.map(g=>g.gapId)};
 const steps:CompassStep[]=[];
 let previous="",parent:string|null=null;
 for(let breath=1;breath<=3;breath++){
  for(const phase of phases){
   for(const focus of input.slicesPerPhase===1?["TRIAD" as const]:foci){
    const card=dyadCard({phase,breath,focus,rawText:source.rawText,
      previous,sourceSha256:source.rawTextSha256});
    const result=await input.provider.transform({
      schema:"iron-lung/triple-transfer-request/v1",breath,phase,
      parentStepId:parent,
      address:phase==="SUBSTANCE"?{aperture:"GAP",triad:"IDEA",braid:"substance"}:
       phase==="LINEAGE"?{aperture:"CONTEXT",triad:"RELATION",braid:"lineage"}:
       {aperture:"GAP",triad:"IDEA",braid:"authority"},
      sourceSha256:source.rawTextSha256,inputSha256:sha(card),text:card});
    need(typeof result==="string"&&result.trim().length>0&&result.length<=1200,"RESPONSE");
    const response=result.trim();
    const core={schema:"iron-lung/compass-step/v1" as const,parentStepId:parent,
      breath,phase,focus,card,cardSha256:sha(card),
      sourceSha256:source.rawTextSha256,response,responseSha256:sha(response),
      provider,status:"PROPOSAL_UNVERIFIED" as const,
      authority:"NONE" as const,heartBeat:false as const,humanKeep:false as const};
    const step:CompassStep={...core,id:"compass-"+sha(enc(core)).slice(0,24)};
    steps.push(step);parent=step.id;previous=response;
   }
  }
 }
 const core={schema:"iron-lung/compass-field/v1" as const,source,
  provider,slicesPerPhase:input.slicesPerPhase,depth:3 as const,steps,
  outputSha256:sha(steps.map(s=>s.responseSha256).join("\n")),
  outputAuthority:"NONE" as const,admittedCandidateId:null,descendantBraidId:null,
  classification:"LUNG_REVIEW_ONLY" as const};
 return {...core,fieldSha256:sha(enc(core))};
}
export function inspectCompass(field:CompassField):true{
 need(field?.schema==="iron-lung/compass-field/v1"
  &&field.outputAuthority==="NONE"&&field.admittedCandidateId===null
  &&field.descendantBraidId===null&&field.classification==="LUNG_REVIEW_ONLY","NO_ADMISSION");
 const {fieldSha256,...core}=field;
 need(fieldSha256===sha(enc(core)),"FIELD_HASH");
 need(field.depth===3&&(field.slicesPerPhase===1||field.slicesPerPhase===3)
  &&field.steps.length===9*field.slicesPerPhase,"COUNT");
 let parent:string|null=null,previous="";
 for(let i=0;i<field.steps.length;i++){
  const s=field.steps[i]!;
  const phase=phases[Math.floor(i/field.slicesPerPhase)%3]!;
  const focus=field.slicesPerPhase===1?"TRIAD":foci[i%3]!;
  const expected=dyadCard({phase,focus,breath:Math.floor(i/(3*field.slicesPerPhase))+1,
   rawText:field.source.rawText,previous,sourceSha256:field.source.rawTextSha256});
  need(s.phase===phase&&s.focus===focus&&s.breath===Math.floor(i/(3*field.slicesPerPhase))+1,
   "ADDRESS");
  need(s.card===expected&&s.cardSha256===sha(expected)&&s.parentStepId===parent
   &&s.sourceSha256===field.source.rawTextSha256,"PROMPT_LINEAGE");
  const {id,...payload}=s;
  need(id==="compass-"+sha(enc(payload)).slice(0,24),"STEP_HASH");
  need(s.responseSha256===sha(s.response)&&s.status==="PROPOSAL_UNVERIFIED"
   &&s.authority==="NONE"&&!s.heartBeat&&!s.humanKeep
   &&enc(s.provider)===enc(field.provider),"NO_GRANT");
  parent=s.id;previous=s.response;
 }
 need(field.source.rawTextSha256===sha(field.source.rawText),"SOURCE_HASH");
 need(field.outputSha256===sha(field.steps.map(s=>s.responseSha256).join("\n")),"OUTPUT_HASH");
 return true;
}
