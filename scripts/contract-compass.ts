#!/usr/bin/env node
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {fixtureProvider} from "../src/triple-transfer.js";
import {flanProvider} from "./triple-transfer.js";
import {runContractCompass,inspectContractCompass,type ContractTask,type ContractResult}
 from "../src/contract-compass.js";
const args=(v:string[])=>{
 const [mode,...rest]=v;
 if(!["compare","verify"].includes(mode??"")||rest.length%2)throw Error("HOLD_ACTUAL_CLI_USAGE");
 const o:Record<string,string>={};
 for(let i=0;i<rest.length;i+=2){
  const k=rest[i]!,value=rest[i+1]!;
  if(!["--provider","--task","--file"].includes(k)||!value||Object.hasOwn(o,k))
   throw Error("HOLD_ACTUAL_CLI_FLAG");
  o[k]=value;
 }
 if(mode==="verify"){
  if(Object.keys(o).length!==1||!o["--file"])throw Error("HOLD_ACTUAL_CLI_VERIFY");
 }else if(!["flan","fixture"].includes(o["--provider"]!)||!o["--task"]
  ||Object.keys(o).length!==2)throw Error("HOLD_ACTUAL_CLI_COMPARE");
 return {mode,o};
};
export async function main(argv:string[]){
 const {mode,o}=args(argv);
 if(mode==="verify"){
  const p=JSON.parse(readFileSync(resolve(o["--file"]!),"utf8")) as ContractResult;
  inspectContractCompass(p);
  return {status:"REAL_CONTRACT_PACKET_INSPECTED",sha256:p.receiptSha256,
   cases:36,sourceAuthority:"NONE"};
 }
 const task=JSON.parse(readFileSync(resolve(o["--task"]!),"utf8")) as ContractTask;
 const live=o["--provider"]==="flan"?flanProvider():null;
 try{
  const report=await runContractCompass(task,live?.provider??fixtureProvider);
  inspectContractCompass(report);
  return report;
 }finally{live?.close();}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 main(process.argv.slice(2))
 .then(x=>process.stdout.write(JSON.stringify(x,null,2)+"\n"))
 .catch(e=>{console.error(String(e.message||e));process.exitCode=2;});
}
