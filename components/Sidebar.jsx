"use client";
import { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { ASSIGNMENTS, CATEGORIES } from "@/lib/assignmentLibrary";
import {
  FolderOpen, FileCode, ChevronRight, ChevronDown, BookOpen,
  Layers, Filter, CheckCircle, Lock, User, Zap, Shuffle,
  RotateCcw, Download, FileText, Monitor, Terminal, Unlock,
  Shield, Settings
} from "lucide-react";

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ on, onChange, t }) {
  return (
    <button role="switch" aria-checked={on} onClick={()=>onChange(!on)}
      style={{width:34,height:18,borderRadius:9,background:on?t.colors.accent:t.colors.border,
        border:"none",cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}>
      <span style={{position:"absolute",top:2,left:on?18:2,width:14,height:14,borderRadius:"50%",
        background:"#fff",transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,0.3)"}} />
    </button>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
function Sec({ title, t, children, defaultOpen=true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{borderBottom:`1px solid ${t.colors.border}`}}>
      <button onClick={()=>setOpen(v=>!v)}
        className="flex items-center gap-1.5 w-full px-3 py-2 select-none"
        style={{background:"none",border:"none",cursor:"pointer",color:t.colors.accent,
          fontSize:9,fontWeight:700,letterSpacing:"0.13em",textTransform:"uppercase",fontFamily:t.font}}>
        {open?<ChevronDown size={9}/>:<ChevronRight size={9}/>}
        {title}
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

// ── Project Explorer ──────────────────────────────────────────────────────────
function ProjectExplorer({ t, activeFile, onFileSelect }) {
  const [expanded, setExpanded] = useState({ root:true, headers:false });
  const files = [
    { id:"main", name:"main.cpp", icon:"📄", type:"source" },
    { id:"utils", name:"utils.cpp", icon:"📄", type:"source" },
    { id:"math_utils", name:"math_utils.h", icon:"📑", type:"header", parent:"headers" },
    { id:"types", name:"types.h", icon:"📑", type:"header", parent:"headers" },
  ];
  const toggle = key => setExpanded(v=>({...v,[key]:!v[key]}));
  return (
    <div style={{fontFamily:"'Courier New',Tahoma,monospace",fontSize:11}}>
      {/* Root */}
      <div className="tree-item" onClick={()=>toggle("root")}>
        {expanded.root?<ChevronDown size={10}/>:<ChevronRight size={10}/>}
        <FolderOpen size={12} style={{color:"#e3b341"}} />
        <span style={{color:t.colors.text}}>Project</span>
      </div>
      {expanded.root && (
        <div className="tree-indent">
          {files.filter(f=>!f.parent).map(f=>(
            <div key={f.id} className={`tree-item ${activeFile===f.id?"tree-item-active":""}`}
              onClick={()=>onFileSelect(f.id)}
              style={{color:activeFile===f.id?t.colors.accent:t.colors.text,paddingLeft:16}}>
              <span>{f.icon}</span>
              <span style={{fontSize:10}}>{f.name}</span>
            </div>
          ))}
          {/* Headers folder */}
          <div className="tree-item" style={{paddingLeft:16}} onClick={()=>toggle("headers")}>
            {expanded.headers?<ChevronDown size={10}/>:<ChevronRight size={10}/>}
            <FolderOpen size={12} style={{color:"#e3b341"}} />
            <span style={{color:t.colors.text,fontSize:10}}>headers</span>
          </div>
          {expanded.headers && files.filter(f=>f.parent==="headers").map(f=>(
            <div key={f.id} className={`tree-item ${activeFile===f.id?"tree-item-active":""}`}
              onClick={()=>onFileSelect(f.id)}
              style={{paddingLeft:32,color:activeFile===f.id?t.colors.accent:t.colors.textMuted,fontSize:10}}>
              <span>{f.icon}</span><span>{f.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Assignment Library ────────────────────────────────────────────────────────
function AssignmentLibrary({ t, onLoad }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const cats = ["All", ...CATEGORIES];
  const DIFF_COLOR = { Easy:"#3fb950", Medium:"#e3b341", Hard:"#f85149" };

  const filtered = ASSIGNMENTS.filter(a =>
    (filter==="All" || a.category===filter) &&
    a.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Search */}
      <input value={search} onChange={e=>setSearch(e.target.value)}
        placeholder="Search templates…"
        style={{width:"100%",background:t.colors.inputBg,border:`1px solid ${t.colors.inputBorder}`,
          color:t.colors.text,padding:"4px 8px",fontSize:10,borderRadius:3,fontFamily:"'Courier New',monospace",
          outline:"none",marginBottom:5}}/>
      {/* Category pills */}
      <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:6}}>
        {cats.map(c=>(
          <button key={c} onClick={()=>setFilter(c)}
            style={{padding:"2px 7px",fontSize:9,borderRadius:10,border:`1px solid ${filter===c?t.colors.accent:t.colors.border}`,
              background:filter===c?`${t.colors.accent}18`:"transparent",
              color:filter===c?t.colors.accent:t.colors.label,cursor:"pointer",fontFamily:t.font}}>
            {c}
          </button>
        ))}
      </div>
      {/* List */}
      <div style={{display:"flex",flexDirection:"column",gap:3}}>
        {filtered.map(a=>(
          <button key={a.id} onClick={()=>onLoad(a)}
            style={{display:"flex",alignItems:"center",gap:7,padding:"6px 8px",
              background:t.colors.inputBg,border:`1px solid ${t.colors.border}`,
              borderRadius:4,cursor:"pointer",textAlign:"left",width:"100%",
              transition:"border-color 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=t.colors.accent}
            onMouseLeave={e=>e.currentTarget.style.borderColor=t.colors.border}>
            <span style={{fontSize:16,flexShrink:0}}>{a.icon}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:10,fontWeight:700,color:t.colors.text,fontFamily:t.font}}>{a.label}</div>
              <div style={{fontSize:9,color:t.colors.label,fontFamily:t.font}}>{a.description}</div>
            </div>
            <span style={{fontSize:8,color:DIFF_COLOR[a.difficulty],flexShrink:0,fontFamily:t.font}}>{a.difficulty}</span>
          </button>
        ))}
        {filtered.length===0 && (
          <p style={{fontSize:10,color:t.colors.label,textAlign:"center",padding:"12px 0",fontFamily:t.font}}>No templates found</p>
        )}
      </div>
    </div>
  );
}

// ── Main Sidebar ──────────────────────────────────────────────────────────────
export default function Sidebar({
  onBuildAndRun, onBuild, onExecute, onRandomize, onReset,
  onExportCpp, onExportPDF, onMacExport, onOpenProfile, onOpenAdmin,
  mutationEnabled, setMutationEnabled, consoleOpen, setConsoleOpen,
  onLoadAssignment, onFileSelect, activeFile, buildStatus, isRunning, codeLines,
}) {
  const { theme: t, themeKey, setThemeKey, themes, allowedThemes, hasFeature } = useTheme();
  const [sideTab, setSideTab] = useState("actions"); // "actions" | "explorer" | "library"

  const tabStyle = (id) => ({
    flex:1, padding:"6px 0", fontSize:9, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase",
    background:sideTab===id?`${t.colors.accent}15`:"transparent",
    borderBottom:sideTab===id?`2px solid ${t.colors.accent}`:"2px solid transparent",
    border:"none", cursor:"pointer", color:sideTab===id?t.colors.accent:t.colors.label,
    fontFamily:t.font, transition:"color 0.15s",
  });

  return (
    <aside style={{width:256,minWidth:256,background:t.colors.sidebar,borderRight:`1px solid ${t.colors.border}`,
      display:"flex",flexDirection:"column",overflow:"hidden",flexShrink:0}}>

      {/* ── GReg Brand ────────────────────────────────────────────────── */}
      <div style={{padding:"10px 14px",borderBottom:`1px solid ${t.colors.border}`,
        background:t.isClassic?"#0a246a":t.colors.header,display:"flex",alignItems:"center",gap:10}}>
        <span className={t.isClassic?"greg-logo-classic":"greg-logo"} data-text="GReg">GReg</span>
        <span style={{fontSize:8,color:t.isClassic?"rgba(255,255,255,0.5)":t.colors.textMuted,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"'JetBrains Mono',monospace"}}>
          IDE ENTERPRISE
        </span>
        {/* Admin badge */}
        <button onClick={onOpenAdmin}
          title="Admin Dashboard"
          style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:t.isClassic?"#c9a227":t.colors.accent,opacity:0.7}}
          onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity="0.7"}>
          <Shield size={13} />
        </button>
      </div>

      {/* ── Tab selector ──────────────────────────────────────────────── */}
      <div style={{display:"flex",borderBottom:`1px solid ${t.colors.border}`,background:t.colors.sidebar}}>
        {[["actions","⚡ Actions"],["explorer","📁 Explorer"],["library","📚 Library"]].map(([id,label])=>(
          <button key={id} onClick={()=>setSideTab(id)} style={tabStyle(id)}>{label}</button>
        ))}
      </div>

      {/* ── Tab content ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">

        {/* ═══ ACTIONS TAB ═══ */}
        {sideTab==="actions" && (
          <>
            {/* Student shortcut */}
            <Sec title="Student" t={t}>
              <button onClick={onOpenProfile}
                style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"7px 10px",
                  background:t.colors.inputBg,border:`1px solid ${t.colors.inputBorder}`,
                  borderRadius:4,cursor:"pointer",color:t.colors.textMuted,fontSize:11,fontFamily:t.font}}>
                <User size={12} style={{color:t.colors.accent}} />
                Open Student Profile…
              </button>
            </Sec>

            {/* Action buttons */}
            <Sec title="Action Center" t={t}>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {/* Build & Run */}
                <button onClick={onBuildAndRun} disabled={isRunning}
                  style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:7,
                    padding:"8px 0",fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",
                    background:t.colors.accent,color:t.colors.bg,border:"none",borderRadius:4,cursor:"pointer",
                    opacity:isRunning?0.6:1,fontFamily:t.font}}>
                  <Zap size={12} />{isRunning?"Running…":"Build & Execute"}
                </button>
                <div style={{display:"flex",gap:5}}>
                  {[["Build",onBuild],[`Run`,onExecute]].map(([label,fn])=>(
                    <button key={label} onClick={fn}
                      style={{flex:1,padding:"6px 0",fontSize:10,fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase",
                        background:t.colors.btnBg,border:`1px solid ${t.colors.border}`,
                        color:t.colors.btnText,borderRadius:4,cursor:"pointer",fontFamily:t.font}}>
                      {label}
                    </button>
                  ))}
                </div>
                <div style={{display:"flex",gap:5}}>
                  <button onClick={onRandomize}
                    style={{flex:1,padding:"5px 0",fontSize:10,fontWeight:600,textTransform:"uppercase",
                      background:t.colors.btnBg,border:`1px solid ${t.colors.accent}`,
                      color:t.colors.accent,borderRadius:4,cursor:"pointer",fontFamily:t.font,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                    <Shuffle size={10}/>Mutate
                  </button>
                  <button onClick={onReset}
                    style={{flex:1,padding:"5px 0",fontSize:10,fontWeight:600,textTransform:"uppercase",
                      background:t.colors.btnBg,border:`1px solid ${t.colors.border}`,
                      color:t.colors.btnText,borderRadius:4,cursor:"pointer",fontFamily:t.font,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                    <RotateCcw size={10}/>Reset
                  </button>
                </div>
              </div>
            </Sec>

            {/* Export */}
            <Sec title="Assignment Export" t={t}>
              <button onClick={onMacExport}
                style={{width:"100%",padding:"9px 0",display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                  fontSize:11,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",
                  background:`${t.colors.accent}20`,border:`1px solid ${t.colors.accent}`,
                  color:t.colors.accent,borderRadius:4,cursor:"pointer",marginBottom:5,fontFamily:t.font}}>
                <Monitor size={13}/>Export Assignment
              </button>
              <div style={{display:"flex",gap:5}}>
                {[[Download,".cpp",onExportCpp],[FileText,"PDF",onExportPDF]].map(([Icon,label,fn])=>(
                  <button key={label} onClick={fn}
                    style={{flex:1,padding:"5px 0",fontSize:9,fontWeight:600,textTransform:"uppercase",
                      background:t.colors.btnBg,border:`1px solid ${t.colors.accent}`,
                      color:t.colors.accent,borderRadius:4,cursor:"pointer",fontFamily:t.font,
                      display:"flex",alignItems:"center",justifyContent:"center",gap:3}}>
                    <Icon size={9}/>{label}
                  </button>
                ))}
              </div>
            </Sec>

            {/* Mutation */}
            <Sec title="Mutation Engine v3" t={t}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                {mutationEnabled?<Unlock size={11} style={{color:t.colors.accent}}/>:<Lock size={11} style={{color:t.colors.label}}/>}
                <span style={{fontSize:10,flex:1,color:t.colors.label}}>
                  {mutationEnabled?"Stealth: ACTIVE":"Stealth: LOCKED"}
                </span>
                <Toggle on={mutationEnabled} onChange={setMutationEnabled} t={t}/>
              </div>
              <p style={{fontSize:9,color:t.colors.label,lineHeight:"13px"}}>
                11-stage anti-MOSS: variable substitution, loop transforms, noise injection, build token.
              </p>
            </Sec>

            {/* Console */}
            <Sec title="Console" t={t}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <Terminal size={11} style={{color:t.colors.label}}/>
                <span style={{fontSize:10,flex:1,color:t.colors.label}}>Floating terminal</span>
                <Toggle on={consoleOpen} onChange={setConsoleOpen} t={t}/>
              </div>
            </Sec>

            {/* Theme */}
            <Sec title="Theme Engine" t={t}>
              {Object.values(themes).map(th=>(
                <button key={th.id} onClick={()=>setThemeKey(th.id)}
                  style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"5px 8px",
                    background:themeKey===th.id?`${th.colors.accent}15`:"transparent",
                    border:`1px solid ${themeKey===th.id?th.colors.accent:"transparent"}`,
                    color:themeKey===th.id?t.colors.accent:t.colors.label,
                    borderRadius:4,cursor:"pointer",fontSize:10,marginBottom:2,textAlign:"left",fontFamily:t.font}}>
                  <span>{th.icon}</span><span>{th.label}</span>
                  {!allowedThemes.includes(th.id)&&<Lock size={9} style={{marginLeft:"auto",color:"#f85149"}}/>}
                  {themeKey===th.id&&<CheckCircle size={9} style={{marginLeft:"auto",color:t.colors.accent}}/>}
                </button>
              ))}
            </Sec>
          </>
        )}

        {/* ═══ EXPLORER TAB ═══ */}
        {sideTab==="explorer" && (
          <div className="p-3">
            <p style={{fontSize:9,color:t.colors.label,marginBottom:8,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:t.font}}>
              ⬡ Project Explorer
            </p>
            <ProjectExplorer t={t} activeFile={activeFile} onFileSelect={onFileSelect}/>
          </div>
        )}

        {/* ═══ LIBRARY TAB ═══ */}
        {sideTab==="library" && (
          <div className="p-3">
            <p style={{fontSize:9,color:t.colors.label,marginBottom:8,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:t.font}}>
              ⬡ Assignment Library
            </p>
            <AssignmentLibrary t={t} onLoad={onLoadAssignment}/>
          </div>
        )}
      </div>

      {/* ── Status bar ────────────────────────────────────────────────── */}
      <div style={{padding:"6px 12px",borderTop:`1px solid ${t.colors.border}`,
        display:"flex",alignItems:"center",gap:6,fontSize:10,flexShrink:0}}>
        {buildStatus==="ok"&&<><div style={{width:6,height:6,borderRadius:"50%",background:t.colors.statusOk}}/><span style={{color:t.colors.statusOk}}>Build OK</span></>}
        {buildStatus==="error"&&<span style={{color:t.colors.statusErr}}>✗ Error</span>}
        {!buildStatus&&<span style={{color:t.colors.label}}>Ready</span>}
        <span style={{marginLeft:"auto",color:t.colors.label}}>{codeLines||0} ln</span>
      </div>
    </aside>
  );
}
