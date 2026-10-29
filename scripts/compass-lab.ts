#!/usr/bin/env node
// Source-owning Iron Lung paired A/B: 9 legacy calls vs 9 dyad cards and
// exploratory 27 microquestion cards. One pinned original model process.
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {resolve,join,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {circulateTripleTransfer,fixtureProvider,inspectTripleField,
 type TransferProvider,type TripleTransferField} from "../src/triple-transfer.js";
import {flanProvider} from "./triple-transfer.js";
import {runCompass,inspectCompass,type CompassField} from "../src/compass.js";
import type {BraidV01} from "../src/model.js";
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const sha=(x:string)=>createHash("sha256").update(x).digest("hex");
const j=(x:unknown)=>JSON.stringify(x);
function need(x:unknown,reason:string):asserts x{if(!x)throw Error("HOLD_COMPASS_CLI_"+reason);}
type Input={schema:"iron-lung/triple-transfer-input/v1";braid:BraidV01;rawText:string;sourceRefs:string[]};
export interface Comparison {
 schema:"iron-lung/compass-comparison/v1";
 baseline:TripleTransferField;dyadNine:CompassField;dyadTwentySeven:CompassField;
 provider:TransferProvider["identity"];sourceSha256:string;
 requestCounts:{original:number;equalBudget:number;microquestions:number;total:number};
 result:"PROPOSALS_ONLY";humanApproval:false;fieldSelection:null;
 comparisonSha256:string;
}
function parse(args:string[]){
 const [mode,...rest]=args;
 need((mode==="compare"||mode==="verify")&&rest.length%2===0,"USAGE");
 const o:Record<string,string>={};
 for(let i=0;i<rest.length;i+=2){
  const k=rest[i],v=rest[i+1];
  need(["--provider","--source","--file"].includes(k)&&v&&!Object.hasOwn(o,k),"FLAG");
  o[k]=v;
 }
 if(mode==="verify")need(Object.keys(o).length===1&&o["--file"],"VERIFY_ARGS");
 else need(["fixture","flan"].includes(o["--provider"]!)&&o["--source"]
   &&Object.keys(o).length===2,"COMPARE_ARGS");
 return {mode,o};
}
export function inspectComparison(value:Comparison){
 need(value?.schema==="iron-lung/compass-comparison/v1"
  &&value.result==="PROPOSALS_ONLY"&&!value.humanApproval&&value.fieldSelection===null,"NO_GRANT");
 const {comparisonSha256,...core}=value;
 need(comparisonSha256===sha(j(core)),"COMPARISON_HASH");
 inspectTripleField(value.baseline);
 inspectCompass(value.dyadNine);inspectCompass(value.dyadTwentySeven);
 need(value.dyadNine.slicesPerPhase===1&&value.dyadTwentySeven.slicesPerPhase===3
  &&value.dyadNine.steps.length===9&&value.dyadTwentySeven.steps.length===27,"MICRO_DEPTH");
 need(value.requestCounts.original===9&&value.requestCounts.equalBudget===9
  &&value.requestCounts.microquestions===27&&value.requestCounts.total===45,"BUDGET");
 need(j(value.provider)===j(value.baseline.provider)
  &&j(value.provider)===j(value.dyadNine.provider)
  &&j(value.provider)===j(value.dyadTwentySeven.provider),"SAME_MODEL");
 need(value.sourceSha256===value.baseline.source.rawTextSha256
  &&value.sourceSha256===value.dyadNine.source.rawTextSha256
  &&value.sourceSha256===value.dyadTwentySeven.source.rawTextSha256,"SAME_SOURCE");
 need(value.baseline.source.braidSha256===value.dyadNine.source.braidSha256
  &&value.baseline.source.braidSha256===value.dyadTwentySeven.source.braidSha256,
  "SAME_BRAID");
 return true;
}
export async function main(argv:string[]){
 const {mode,o}=parse(argv);
 if(mode==="verify"){
  const data=JSON.parse(readFileSync(resolve(o["--file"]!),"utf8")) as Comparison;
  inspectComparison(data);
  return {status:"COMPASS_PACKET_VERIFIED",comparisonSha256:data.comparisonSha256,
   requests:45,admission:false};
 }
 const input=JSON.parse(readFileSync(resolve(o["--source"]!),"utf8")) as Input;
 need(input.schema==="iron-lung/triple-transfer-input/v1","SOURCE_SCHEMA");
 const live=o["--provider"]==="flan"?flanProvider():null;
 const provider=live?.provider??fixtureProvider;
 try{
  const base=await circulateTripleTransfer({
   braid:input.braid,rawText:input.rawText,sourceRefs:input.sourceRefs,depth:3,provider
  });
  const nine=await runCompass({
   braid:input.braid,rawText:input.rawText,sourceRefs:input.sourceRefs,
   slicesPerPhase:1,provider
  });
  const twentySeven=await runCompass({
   braid:input.braid,rawText:input.rawText,sourceRefs:input.sourceRefs,
   slicesPerPhase:3,provider
  });
  const core={schema:"iron-lung/compass-comparison/v1" as const,
   baseline:base,dyadNine:nine,dyadTwentySeven:twentySeven,
   provider:structuredClone(provider.identity),sourceSha256:nine.source.rawTextSha256,
   requestCounts:{original:9,equalBudget:9,microquestions:27,total:45},
   result:"PROPOSALS_ONLY" as const,humanApproval:false as const,fieldSelection:null};
  const comparison={...core,comparisonSha256:sha(j(core))};
  inspectComparison(comparison);
  return comparison;
 }finally{live?.close();}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 main(process.argv.slice(2))
  .then(x=>process.stdout.write(JSON.stringify(x,null,2)+"\n"))
  .catch(e=>{console.error(String(e.message||e));process.exitCode=2;});
}
