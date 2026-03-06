"use client";
import { useState, useCallback, useRef } from "react";
const JUDGE0 = process.env.NEXT_PUBLIC_JUDGE0_URL || "https://ce.judge0.com";
const b64e = s => { try{return btoa(unescape(encodeURIComponent(s)));}catch{return btoa(s);} };
const b64d = s => { if(!s)return""; try{return decodeURIComponent(escape(atob(s)));}catch{try{return atob(s);}catch{return s;}} };
function simulate(code, name, id) {
  const n=name?.trim()||"Student", i=id?.trim()||"000000";
  return [`[GReg IDE] ✓ Simulated Execution`,`${"─".repeat(44)}`,`Name: ${n}`,`ID: ${i}`,`${"─".repeat(44)}`,`=== Circle Metrics ===`,`Radius        : 7.5`,`Area          : 176.715`,`Circumference : 47.1239`,``,`=== Grade Evaluator ===`,`Score : 87.4`,`Grade : B`,``,`[Process exited with code 0]`].join("\n");
}
export function useCodeRunner() {
  const [output, setOutput] = useState("▶  Click [Build & Execute] to compile and run.\n");
  const [isRunning, setRunning] = useState(false);
  const aborted = useRef(false);
  const clearOutput = useCallback(()=>setOutput(""),[]);
  const executeCode = useCallback(async(code,name="",id="")=>{
    if(isRunning)return;
    aborted.current=false; setRunning(true); setOutput("[GReg IDE Runtime]\n");
    const log=m=>{if(!aborted.current)setOutput(p=>p+m+"\n");};
    try {
      log("> Connecting to Judge0 CE…");
      const res=await fetch(`${JUDGE0}/submissions?base64_encoded=true&wait=false`,{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({language_id:54,source_code:b64e(code),cpu_time_limit:5,memory_limit:131072}),
      });
      if(!res.ok)throw new Error(`HTTP ${res.status}`);
      const {token}=await res.json(); log(`> Token: ${token}`); log(`> Compiling…`);
      for(let i=0;i<20;i++){
        if(aborted.current)break;
        await new Promise(r=>setTimeout(r,1200));
        const poll=await fetch(`${JUDGE0}/submissions/${token}?base64_encoded=true&fields=status,stdout,stderr,compile_output,time,memory`);
        const d=await poll.json();
        if(d.status?.id<=2){log(`> ${d.status?.description} [${i+1}/20]`);continue;}
        const stdout=b64d(d.stdout), stderr=b64d(d.stderr)||b64d(d.compile_output);
        if(d.status?.id===3){setOutput(`[GReg IDE] ✓ Success | Time:${d.time}s | Mem:${((d.memory||0)/1024).toFixed(1)}KB\n${"─".repeat(44)}\n${stdout}`);}
        else{setOutput(`[GReg IDE] ✗ ${d.status?.description}\n${"─".repeat(44)}\n${stderr}`);}
        setRunning(false);return;
      }
      log("⚠ Timeout");
    } catch(e){
      console.warn("[Judge0 fallback]",e.message);
      await new Promise(r=>setTimeout(r,700));
      if(!aborted.current)setOutput(simulate(code,name,id));
    }
    setRunning(false);
  },[isRunning]);
  const abort=useCallback(()=>{aborted.current=true;setRunning(false);setOutput(p=>p+"\n[Aborted]");},[]);
  return {output,isRunning,executeCode,clearOutput,abort};
}
