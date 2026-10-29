#!/usr/bin/env node
import {spawn} from "node:child_process";
import {readFileSync} from "node:fs";
import {resolve,join,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {createInterface} from "node:readline";
import {circulateTripleTransfer,fixtureProvider,inspectTripleField,
 type TransferProvider, type TripleRequest, type TripleTransferField} from "../src/triple-transfer.js";
import type {BraidV01} from "../src/model.js";
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const MODEL="google/flan-t5-small",REV="14fd6edcfdd71f2ef5b67d4e735fee8bc6d9fd31";
function args(argv:string[]){
 const a:{provider:"fixture"|"flan";depth:number;verify?:string;source?:string}={provider:"fixture",depth:3};
 if(argv.length%2)throw Error("HOLD_TRIPLE_CLI_FLAGS");
 const seen=new Set<string>();
 for(let i=0;i<argv.length;i+=2){
  const k=argv[i],v=argv[i+1];
  if(!k||!v||seen.has(k))throw Error("HOLD_TRIPLE_CLI_DUPLICATE");
  seen.add(k);
  if(k==="--provider"){if(v!=="fixture"&&v!=="flan")throw Error("HOLD_TRIPLE_CLI_PROVIDER");a.provider=v;}
  else if(k==="--depth"){if(!["1","2","3"].includes(v))throw Error("HOLD_TRIPLE_CLI_DEPTH");a.depth=Number(v);}
  else if(k==="--verify")a.verify=v;
  else if(k==="--source")a.source=v;
  else throw Error("HOLD_TRIPLE_CLI_UNKNOWN");
 }
 if(a.verify&&seen.size!==1)throw Error("HOLD_TRIPLE_CLI_VERIFY_ONLY");
 return a;
}
function flanProvider():{provider:TransferProvider;close:()=>void}{
 const proc=spawn("python3",[join(ROOT,"model/flan-t5-bridge.py")],
  {cwd:ROOT,stdio:["pipe","pipe","pipe"],env:{...process.env,PYTHONUNBUFFERED:"1"}});
 let error="";
 proc.stderr.setEncoding("utf8");
 proc.stderr.on("data",x=>{error+=(x as string).slice(0,800);});
 const lines=createInterface({input:proc.stdout,crlfDelay:Infinity})[Symbol.asyncIterator]();
 let first=true;
 const provider:TransferProvider={
  identity:{kind:"flan-t5",model:MODEL,revision:REV},
  async transform(req:TripleRequest):Promise<string>{
   if(first){
    const ready=await lines.next();
    if(ready.done)throw Error("HOLD_FLAN_READY:"+error);
    const obj=JSON.parse(ready.value);
    if(obj.ready!==true||obj.model!==MODEL||obj.revision!==REV||obj.kind!=="flan-t5")
     throw Error("HOLD_FLAN_IDENTITY");
    first=false;
   }
   if(!proc.stdin.writable)throw Error("HOLD_FLAN_CLOSED:"+error);
   proc.stdin.write(JSON.stringify(req)+"\n");
   const response=await lines.next();
   if(response.done)throw Error("HOLD_FLAN_RESPONSE:"+error);
   const obj=JSON.parse(response.value);
   if(obj.inputSha256!==req.inputSha256||typeof obj.candidate!=="string")
    throw Error("HOLD_FLAN_REQUEST_ID");
   return obj.candidate;
  }
 };
 return {provider,close:()=>{proc.stdin.end();proc.kill();}};
}
export async function main(argv:string[]){
 const parsed=args(argv);
 if(parsed.verify){
  const data=JSON.parse(readFileSync(resolve(parsed.verify),"utf8")) as TripleTransferField;
  inspectTripleField(data);
  return {status:"TRIPLE_COLD_PACKET_VERIFIED",fieldSha256:data.fieldSha256,
   breaths:data.depth,steps:data.steps.length,authority:"NONE"};
 }
 const original=JSON.parse(readFileSync(join(ROOT,"fixtures/combinatrix-heart-001.json"),"utf8")) as {braid:BraidV01};
 const spec=parsed.source?JSON.parse(readFileSync(resolve(parsed.source),"utf8")) as {
  schema:string;braid:BraidV01;rawText:string;sourceRefs:string[]
 }:null;
 if(spec&&spec.schema!=="iron-lung/triple-transfer-input/v1")throw Error("HOLD_TRIPLE_INPUT_SCHEMA");
 const live=parsed.provider==="flan"?flanProvider():null;
 try{
  const field=await circulateTripleTransfer({
   braid:spec?.braid??original.braid,depth:parsed.depth,provider:live?.provider??fixtureProvider,
   rawText:spec?.rawText??"Iron Lung's origin is represented by a damaged substance and lineage braid; propose possible readings without constituting a repair.",
   sourceRefs:spec?.sourceRefs??["iron-lung/HEART-001-original-fixture","iron-lung/PR-3-recursive-T5-design"]
  });
  inspectTripleField(field);
  return field;
 }finally{live?.close();}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 main(process.argv.slice(2)).then(x=>process.stdout.write(JSON.stringify(x,null,2)+"\n"))
 .catch(e=>{console.error(String(e.message||e));process.exitCode=2;});
}
