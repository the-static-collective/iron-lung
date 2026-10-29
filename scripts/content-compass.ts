#!/usr/bin/env node
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {fixtureProvider} from "../src/triple-transfer.js";
import {flanProvider} from "./triple-transfer.js";
import {runContentCompass,inspectContentCompass,type GroundedPacket} from "../src/content-compass.js";
import type {ContractTask} from "../src/contract-compass.js";
const parse=(args:string[])=>{
 const [mode,...tail]=args;
 if(!["run","verify"].includes(mode??"")||tail.length%2)throw Error("HOLD_CONTENT_CLI_USAGE");
 const o:Record<string,string>={};
 for(let i=0;i<tail.length;i+=2){const k=tail[i]!,v=tail[i+1]!;
  if(!["--provider","--task","--file"].includes(k)||!v||Object.hasOwn(o,k))throw Error("HOLD_CONTENT_CLI_ARGS");
  o[k]=v;
 }
 if(mode==="verify"){
  if(!o["--file"]||Object.keys(o).length!==1)throw Error("HOLD_CONTENT_CLI_VERIFY");
 }else if(!["flan","fixture"].includes(o["--provider"]!)||!o["--task"]||Object.keys(o).length!==2)
  throw Error("HOLD_CONTENT_CLI_RUN");
 return {mode,o};
};
export async function main(args:string[]){
 const {mode,o}=parse(args);
 if(mode==="verify"){
  const p=JSON.parse(readFileSync(resolve(o["--file"]!),"utf8")) as GroundedPacket;
  inspectContentCompass(p);
  return {status:"CONTENT_SOURCE_VALIDATED",calls:72,receiptSha256:p.receiptSha256};
 }
 const task=JSON.parse(readFileSync(resolve(o["--task"]!),"utf8")) as ContractTask;
 const live=o["--provider"]==="flan"?flanProvider():null;
 try{
  const report=await runContentCompass(task,live?.provider??fixtureProvider);
  inspectContentCompass(report);
  return report;
 }finally{live?.close();}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 main(process.argv.slice(2)).then(x=>process.stdout.write(JSON.stringify(x,null,2)+"\n"))
  .catch(e=>{console.error(String(e.message||e));process.exitCode=2;});
}
