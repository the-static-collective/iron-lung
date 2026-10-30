#!/usr/bin/env node
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {fixtureProvider} from "../src/triple-transfer.js";
import {flanProvider} from "./triple-transfer.js";
import {exploreQuestion,inspectQuestionInvestigation,
 type Investigation,type QuestionSeed} from "../src/nt-investigation.js";

function parse(argv:string[]){
 const [mode,...rest]=argv;
 if(!["explore","verify"].includes(mode??"")||rest.length%2)throw Error("HOLD_NT_LUNG_CLI");
 const opts:Record<string,string>={};
 for(let i=0;i<rest.length;i+=2){
  const key=rest[i]!,value=rest[i+1]!;
  if(!["--seed","--provider","--file"].includes(key)||!value||Object.hasOwn(opts,key))
   throw Error("HOLD_NT_LUNG_FLAG");
  opts[key]=value;
 }
 if(mode==="verify"){
  if(!opts["--file"]||Object.keys(opts).length!==1)throw Error("HOLD_NT_LUNG_VERIFY");
 }else if(!opts["--seed"]||!["fixture","flan"].includes(opts["--provider"]!)
  ||Object.keys(opts).length!==2)throw Error("HOLD_NT_LUNG_RUN");
 return {mode,opts};
}
export async function main(args:string[]){
 const {mode,opts}=parse(args);
 if(mode==="verify"){
  const investigation=JSON.parse(readFileSync(resolve(opts["--file"]!),"utf8")) as Investigation;
  inspectQuestionInvestigation(investigation);
  return {status:"ORIGINAL_IRON_LUNG_HELD_QUESTION_VERIFIED",
   questionSha256:investigation.originalQuestionSha256,
   resultSha256:investigation.investigationSha256,
   steps:9,authority:"NONE"};
 }
 const seed=JSON.parse(readFileSync(resolve(opts["--seed"]!),"utf8")) as QuestionSeed;
 const live=opts["--provider"]==="flan"?flanProvider():null;
 try{
  const output=await exploreQuestion(seed,live?.provider??fixtureProvider);
  inspectQuestionInvestigation(output);
  return output;
 }finally{live?.close();}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 main(process.argv.slice(2)).then(v=>process.stdout.write(JSON.stringify(v,null,2)+"\n"))
  .catch(e=>{console.error(String(e.message||e));process.exitCode=2;});
}
