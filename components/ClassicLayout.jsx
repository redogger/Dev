"use client";
import { useState } from "react";
import { useTheme, THEMES } from "@/components/ThemeProvider";
import EditorPanel from "@/components/Editor";
import ClassicBottomPanel from "@/components/ui/ClassicBottomPanel";

const TOOLBAR_GROUPS = [
  [
    { icon:"📄", label:"New",           key:"new"     },
    { icon:"📂", label:"Open",          key:"open"    },
    { icon:"💾", label:"Save",          key:"save"    },
  ],
  [
    { icon:"✂️", label:"Cut",           key:"cut"     },
    { icon:"📋", label:"Copy",          key:"copy"    },
    { icon:"📌", label:"Paste",         key:"paste"   },
  ],
  [
    { icon:"↩",  label:"Undo",          key:"undo"    },
    { icon:"↪",  label:"Redo",          key:"redo"    },
  ],
  [
    { icon:"🔍", label:"Find (Ctrl+F)", key:"find"    },
    { icon:"🔄", label:"Replace",       key:"replace" },
  ],
  [
    { icon:"⚙️", label:"Compile (F9)",  key:"compile", accent:true },
    { icon:"▶",  label:"Run (F10)",     key:"run",     accent:true },
    { icon:"🔨", label:"Rebuild",       key:"rebuild", accent:true },
    { icon:"⏹",  label:"Stop",          key:"stop"    },
  ],
  [
    { icon:"🐛", label:"Debug",         key:"debug"   },
    { icon:"⏯",  label:"Next Step",     key:"step"    },
  ],
  [
    { icon:"📊", label:"Project Stats", key:"stats"   },
    { icon:"🔎", label:"Syntax Check",  key:"syntax"  },
  ],
];

const MENU_ITEMS = [
  { label:"File",    items:["New","Open…","Save","Save As…","---","Print…","---","Exit"] },
  { label:"Edit",    items:["Undo","Redo","---","Cut","Copy","Paste","Select All","---","Find…","Replace…","Go to Line…"] },
  { label:"Search",  items:["Find…","Replace…","Find in Files…"] },
  { label:"View",    items:["Editor Only","Full Screen","---","Classic Dev-C++ 5.11","Midnight Engineering","Neon Hacker"] },
  { label:"Project", items:["New Project…","Open Project…","---","Extract Project ZIP","---","Project Properties…"] },
  { label:"Execute", items:["Compile (F9)","Run (F10)","Build & Run (F11)","---","Rebuild All","---","Stop"] },
  { label:"Tools",   items:["Editor Options…","Compiler Options…","Terminal Colors…","---","Student Profile…","Admin Dashboard…"] },
  { label:"Window",  items:["Next","Previous","---","Close All"] },
  { label:"Help",    items:["Help Topics","Check for Updates…","---","About GReg IDE"] },
];

export default function ClassicLayout({
  code, setCode, buildStatus, isRunning, output,
  onBuild, onExecute, onBuildAndRun, onRandomize, onReset,
  onExportCpp, onExportPDF, onMacExport, onOpenProfile, onOpenAdmin,
  mutationEnabled, setMutationEnabled,
}) {
  const { themeKey, setThemeKey } = useTheme();
  const [openMenu, setOpenMenu] = useState(null);
  const [activeBtn, setActiveBtn] = useState(null);

  const menuAction = (item) => {
    setOpenMenu(null);
    if (item==="---") return;
    if (item==="Student Profile…")      { onOpenProfile(); return; }
    if (item==="Admin Dashboard…")       { onOpenAdmin();   return; }
    if (item==="Classic Dev-C++ 5.11")  { setThemeKey("classic");  return; }
    if (item==="Midnight Engineering")  { setThemeKey("midnight"); return; }
    if (item==="Neon Hacker")           { setThemeKey("neon");     return; }
    if (item==="Compile (F9)")          { onBuild();       return; }
    if (item==="Run (F10)")             { onExecute();     return; }
    if (item==="Build & Run (F11)")     { onBuildAndRun(); return; }
    if (item==="Rebuild All")           { onRandomize();   return; }
    if (item==="Extract Project ZIP")   { onExportCpp();   return; }
  };

  const toolbarAction = (key) => {
    setActiveBtn(key); setTimeout(()=>setActiveBtn(null),180);
    if (key==="compile") { onBuild();       return; }
    if (key==="run")     { onExecute();     return; }
    if (key==="rebuild") { onBuildAndRun(); return; }
    if (key==="find")    { /* Monaco find */ return; }
  };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:"#ece9d8",
      fontFamily:"Tahoma,'Segoe UI',Arial,sans-serif",userSelect:"none"}}
      onClick={()=>setOpenMenu(null)}>

      {/* ── Title Bar ────────────────────────────────────── */}
      <div className="win-header-bar flex items-center justify-between px-2 select-none"
        style={{height:28,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:14}}>⬡</span>
          <span className="greg-logo-classic" data-text="GReg">GReg</span>
          <span style={{color:"rgba(255,255,255,0.6)",fontSize:11}}>IDE Enterprise — main.cpp</span>
        </div>
        <div style={{display:"flex",gap:2}}>
          {["─","□","✕"].map((c,i)=>(
            <button key={i} className="win-btn flex items-center justify-center"
              style={{width:18,height:18,fontSize:12,fontWeight:"bold"}}>{c}</button>
          ))}
        </div>
      </div>

      {/* ── Menu Bar ─────────────────────────────────────── */}
      <div className="win-menu-bar flex items-center"
        style={{height:22,paddingLeft:4,flexShrink:0,position:"relative",zIndex:200}}
        onClick={e=>e.stopPropagation()}>
        {MENU_ITEMS.map(({label,items})=>(
          <div key={label} style={{position:"relative"}}>
            <button className="win-menu-item"
              onClick={()=>setOpenMenu(openMenu===label?null:label)}
              style={{background:openMenu===label?"#0a246a":"transparent",color:openMenu===label?"#fff":"#000"}}>
              {label}
            </button>
            {openMenu===label && (
              <div className="win-raised" style={{position:"absolute",top:"100%",left:0,background:"#d4d0c8",
                border:"1px solid #919b9c",minWidth:180,zIndex:9999,boxShadow:"2px 2px 4px rgba(0,0,0,0.3)"}}>
                {items.map((item,i)=>
                  item==="---"?(
                    <div key={i} style={{height:1,background:"#919b9c",margin:"2px 4px"}}/>
                  ):(
                    <button key={i} className="win-menu-item"
                      style={{display:"block",width:"100%",textAlign:"left"}}
                      onClick={()=>menuAction(item)}>{item}</button>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Icon Toolbar ─────────────────────────────────── */}
      <div className="win-toolbar-row win-raised flex items-center"
        style={{height:34,paddingLeft:4,gap:2,flexShrink:0,flexWrap:"wrap"}}>
        {TOOLBAR_GROUPS.map((group,gi)=>(
          <div key={gi} style={{display:"flex",alignItems:"center"}}>
            {gi>0&&<div className="win-separator"/>}
            {group.map(({icon,label,key,accent})=>(
              <button key={key} className="win-toolbar-btn" title={label}
                onClick={()=>toolbarAction(key)}
                style={{background:activeBtn===key?"#bbb8b0":(accent&&["compile","run","rebuild"].includes(key)?"#dce8ff":"transparent")}}>
                <span style={{fontSize:14,lineHeight:1}}>{icon}</span>
              </button>
            ))}
          </div>
        ))}
        <div style={{flex:1}}/>
        {/* GReg brand in toolbar */}
        <span className="greg-logo-classic" data-text="GReg" style={{fontSize:11,marginRight:8}}>GReg</span>
        {/* MacBook export */}
        <button className="win-btn flex items-center gap-1.5 px-3"
          style={{height:24,fontSize:11,fontWeight:"bold",background:"#dce8ff",borderColor:"#0a246a",color:"#0a246a",marginRight:4}}
          onClick={onMacExport}>
          💻 Export Assignment
        </button>
        {/* Mutation */}
        <div style={{display:"flex",alignItems:"center",gap:3,marginRight:4}}>
          <span style={{fontSize:10,color:"#333"}}>Stealth:</span>
          <button className="win-btn px-2"
            style={{height:22,fontSize:10,background:mutationEnabled?"#dce8ff":"#d4d0c8",color:mutationEnabled?"#0a246a":"#555"}}
            onClick={()=>setMutationEnabled(v=>!v)}>
            {mutationEnabled?"ON":"OFF"}
          </button>
        </div>
        <button className="win-btn flex items-center gap-1 px-2 mr-1"
          style={{height:22,fontSize:10}} onClick={onOpenProfile}>
          👤 Profile
        </button>
        <button className="win-btn flex items-center gap-1 px-2 mr-2"
          style={{height:22,fontSize:10}} onClick={onOpenAdmin}>
          🔐 Admin
        </button>
      </div>

      {/* ── Editor ───────────────────────────────────────── */}
      <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
        <EditorPanel code={code} onChange={setCode}/>
      </div>

      {/* ── Bottom Panel ─────────────────────────────────── */}
      <ClassicBottomPanel output={output} buildStatus={buildStatus}/>

      {/* ── Status Bar ───────────────────────────────────── */}
      <div className="win-inset"
        style={{height:20,background:"#d4d0c8",borderTop:"1px solid #919b9c",display:"flex",
          alignItems:"center",padding:"0 6px",gap:6,flexShrink:0}}>
        {[
          isRunning?"Executing…":buildStatus==="ok"?"Build OK":buildStatus==="error"?"Build Error":"Ready",
          "C++17","GCC 11.2",`${code.split("\n").length} lines`,"Judge0 CE",
        ].map((item,i,arr)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:10,color:buildStatus==="error"&&i===0?"#cc0000":"#000",fontFamily:"Tahoma,sans-serif"}}>
              {item}
            </span>
            {i<arr.length-1&&<div className="win-separator"/>}
          </div>
        ))}
      </div>
    </div>
  );
}
