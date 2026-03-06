"use client";
import { useState } from "react";
const TABS = ["Compiler","Compile Log","Debug"];
export default function ClassicBottomPanel({ output, buildStatus }) {
  const [activeTab, setActiveTab] = useState("Compile Log");
  const content = activeTab==="Compiler"
    ? (buildStatus==="ok"?"Compilation: 0 error(s), 0 warning(s)":buildStatus==="error"?"Compilation: 1 error(s), 0 warning(s)":"No compilation result yet.")
    : activeTab==="Compile Log" ? (output||"No output.") : "No debugging session active.";
  return (
    <div className="flex-shrink-0 classic-scroll"
      style={{height:140,background:"#ece9d8",borderTop:"2px solid #919b9c",display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",background:"#d4d0c8",borderBottom:"1px solid #919b9c",paddingLeft:4,paddingTop:2,alignItems:"flex-end"}}>
        {TABS.map(tab=>(
          <button key={tab} onClick={()=>setActiveTab(tab)}
            className={`win-tab ${activeTab===tab?"win-tab-active":""}`}>{tab}</button>
        ))}
        <div style={{flex:1}}/>
        <span style={{fontSize:10,padding:"0 8px",color:"#555",fontFamily:"Tahoma,sans-serif",alignSelf:"center"}}>
          {buildStatus==="ok"?"✔ Build OK":buildStatus==="error"?"✖ Error":"Ready"}
        </span>
      </div>
      <div className="classic-scroll"
        style={{flex:1,overflow:"auto",padding:"4px 6px",background:"#fff",borderTop:"1px solid #919b9c",
          fontFamily:"'Courier New',Courier,monospace",fontSize:11,color:"#000",lineHeight:"16px"}}>
        {content.split("\n").map((line,i)=>{
          let color="#000";
          if(line.startsWith("✓")||line.includes("0 error")) color="#006400";
          if(line.startsWith("✗")||line.includes("1 error")) color="#cc0000";
          if(line.startsWith(">")) color="#0000aa";
          if(/^(Name|ID):/.test(line)) color="#0a246a";
          return <div key={i} style={{color,whiteSpace:"pre-wrap"}}>{line||" "}</div>;
        })}
      </div>
    </div>
  );
}
