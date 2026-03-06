"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Maximize2, Terminal, Trash2, Play, Copy, CheckCheck, GripHorizontal } from "lucide-react";
import { useTheme } from "./ThemeProvider";

function lineColor(line, t) {
  if (line.startsWith("[GReg")) return { color: t.colors.accent, fontWeight: 600 };
  if (line.startsWith("✓") || line.includes("successful")) return { color: t.colors.statusOk };
  if (line.startsWith("✗") || line.toLowerCase().includes("error")) return { color: t.colors.statusErr };
  if (line.startsWith(">")) return { color: t.colors.textMuted };
  if (line.startsWith("─")) return { color: t.colors.textMuted, opacity: 0.4 };
  if (/^(Name|ID):/.test(line)) return { color: t.colors.accent, fontWeight: 700 };
  return { color: t.colors.consoleText };
}

export default function FloatingConsole({ open, onClose, output, isRunning, onClear, onExecute }) {
  const { theme: t } = useTheme();
  const [pos,  setPos]  = useState({ x: 50, y: 60 });
  const [size, setSize] = useState({ w: 640, h: 340 });
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [prevSnap, setPrevSnap] = useState(null);
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const outputRef = useRef(null);
  const dragRef   = useRef({ active: false, startX:0, startY:0, origX:0, origY:0 });
  const resizeRef = useRef({ active: false, startX:0, startY:0, origW:0, origH:0 });

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [output]);

  const onDragPD = useCallback((e) => {
    if (maximized) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { active:true, startX:e.clientX, startY:e.clientY, origX:pos.x, origY:pos.y };
    setHovered(true); e.preventDefault();
  }, [pos, maximized]);
  const onDragPM = useCallback((e) => {
    if (!dragRef.current.active) return;
    setPos({ x: Math.max(0, dragRef.current.origX + e.clientX - dragRef.current.startX),
             y: Math.max(0, dragRef.current.origY + e.clientY - dragRef.current.startY) });
  }, []);
  const onDragPU = useCallback((e) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragRef.current.active = false;
  }, []);

  const onResizePD = useCallback((e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    resizeRef.current = { active:true, startX:e.clientX, startY:e.clientY, origW:size.w, origH:size.h };
    e.stopPropagation(); e.preventDefault();
  }, [size]);
  const onResizePM = useCallback((e) => {
    if (!resizeRef.current.active) return;
    setSize({ w: Math.max(340, resizeRef.current.origW + e.clientX - resizeRef.current.startX),
              h: Math.max(180, resizeRef.current.origH + e.clientY - resizeRef.current.startY) });
  }, []);
  const onResizePU = useCallback((e) => {
    e.currentTarget.releasePointerCapture(e.pointerId); resizeRef.current.active = false;
  }, []);

  const toggleMax = () => {
    if (!maximized) {
      setPrevSnap({ pos:{...pos}, size:{...size} });
      setPos({ x:0, y:0 }); setSize({ w: Math.max(600, window.innerWidth-260), h: window.innerHeight-48 });
      setMaximized(true);
    } else {
      if (prevSnap) { setPos(prevSnap.pos); setSize(prevSnap.size); }
      setMaximized(false);
    }
  };

  const handleCopy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),2000); };

  const container = t.isClassic ? {
    background:"rgba(236,233,216,0.97)", border:"2px solid #0a246a44",
    boxShadow:"4px 4px 12px rgba(0,0,0,0.35),inset 1px 1px 0 rgba(255,255,255,0.8)",
  } : t.id==="neon" ? {
    background:"rgba(8,8,16,0.94)", border:"1px solid rgba(0,255,136,0.28)",
    boxShadow:"0 0 50px rgba(0,255,136,0.1),0 24px 56px rgba(0,0,0,0.9)",
  } : {
    background:"rgba(13,17,23,0.9)", border:"1px solid rgba(88,166,255,0.18)",
    boxShadow:"0 24px 56px rgba(0,0,0,0.7)",
  };

  const titleBar = t.isClassic
    ? { background:"linear-gradient(180deg,#3169c4,#0a246a)", borderBottom:"1px solid #0a246a" }
    : t.id==="neon"
    ? { background:"#0d0d1a", borderBottom:"1px solid rgba(0,255,136,0.2)" }
    : { background:"#161b22", borderBottom:"1px solid #30363d" };

  const BR = t.isClassic ? 0 : 10;
  const lines = (output||"").split("\n");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{opacity:0,scale:0.9,y:16}} animate={{opacity:1,scale:1,y:0}}
          exit={{opacity:0,scale:0.88,y:12}}
          transition={{type:"spring",damping:30,stiffness:400}}
          style={{ position:"fixed", left:pos.x, top:pos.y,
            width: minimized?260:size.w, height:minimized?"auto":size.h,
            zIndex:900, borderRadius:BR, overflow:"hidden",
            fontFamily:t.monoFont||"'Courier New',monospace",
            ...container, pointerEvents:"auto" }}
          onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
        >
          {/* Title / Drag */}
          <div className="drag-handle flex items-center gap-2 px-3 select-none"
            style={{height:34,...titleBar,flexShrink:0}}
            onPointerDown={onDragPD} onPointerMove={onDragPM} onPointerUp={onDragPU}>
            <div className="flex items-center gap-1.5">
              {[["#ff5f57",onClose],["#ffbd2e",()=>setMinimized(v=>!v)],["#28c840",toggleMax]].map(([c,fn],i)=>(
                <button key={i} onClick={e=>{e.stopPropagation();fn();}}
                  style={{width:12,height:12,borderRadius:"50%",background:c,border:"none",cursor:"pointer",flexShrink:0}} />
              ))}
            </div>
            <Terminal size={11} style={{color:t.isClassic?"#aaccff":t.colors.accent}} />
            <span style={{fontSize:11,fontWeight:700,color:t.isClassic?"#fff":t.colors.accent,letterSpacing:"0.05em"}}>
              GReg Terminal
            </span>
            {isRunning && <span style={{fontSize:9,color:t.colors.statusOk,marginLeft:4}} className="animate-pulse2">● RUNNING</span>}
            <div style={{flex:1}} />
            {!minimized && (
              <div className="flex items-center gap-1">
                {[[copied?CheckCheck:Copy,handleCopy,"Copy"],[Trash2,onClear,"Clear"],[Play,onExecute,"Run"]].map(([Icon,fn,label],i)=>(
                  <button key={i} onClick={e=>{e.stopPropagation();fn();}} title={label}
                    style={{background:"none",border:"none",cursor:"pointer",color:t.isClassic?"#aaccff":t.colors.label,padding:3}}>
                    <Icon size={12} />
                  </button>
                ))}
              </div>
            )}
            <GripHorizontal size={12} style={{color:t.colors.label,opacity:0.35}} />
          </div>

          {!minimized && (
            <>
              {/* Path bar */}
              <div style={{background:t.isClassic?"#000080":t.colors.console,padding:"3px 12px",fontSize:10,
                fontFamily:"'Courier New',monospace",display:"flex",gap:6,flexShrink:0,
                borderBottom:`1px solid ${t.colors.border}`}}>
                <span style={{color:t.colors.statusOk}}>student@greg</span>
                <span style={{color:t.colors.textMuted}}>:</span>
                <span style={{color:t.id==="neon"?"#9999ff":t.colors.accent}}>~/assignment</span>
                <span style={{color:t.colors.textMuted}}>$</span>
              </div>
              {/* Output */}
              <div ref={outputRef}
                style={{background:t.isClassic?"#000080":t.colors.console,flex:1,overflowY:"auto",
                  padding:"8px 12px",fontSize:11.5,lineHeight:"17px",
                  height:`calc(100% - 34px - 25px - 22px)`,fontFamily:"'Courier New',monospace"}}>
                {lines.map((line,i)=>(
                  <div key={i} className="whitespace-pre-wrap" style={lineColor(line,t)}>{line||" "}</div>
                ))}
                {isRunning && <span className="cursor-blink" style={{color:t.colors.accent}} />}
              </div>
              {/* Status bar */}
              <div style={{background:t.isClassic?"#000080":t.colors.console,
                borderTop:`1px solid ${t.colors.border}`,height:22,display:"flex",
                alignItems:"center",padding:"0 12px",gap:8,fontSize:9,fontFamily:"'Courier New',monospace",flexShrink:0}}>
                <span style={{color:t.colors.accent}}>Judge0 CE</span>
                <span style={{color:t.colors.textMuted}}>·</span><span style={{color:t.colors.textMuted}}>C++17</span>
                <span style={{color:t.colors.textMuted}}>·</span><span style={{color:t.colors.textMuted}}>GCC 11.2</span>
                <div style={{flex:1}} />
                <span style={{color:t.colors.textMuted}}>{lines.length} lines</span>
              </div>
              {/* Resize handle — Pointer Events */}
              <div style={{position:"absolute",bottom:0,right:0,width:18,height:18,cursor:"se-resize",
                borderRight:`3px solid ${t.colors.accent}44`,borderBottom:`3px solid ${t.colors.accent}44`,touchAction:"none"}}
                onPointerDown={onResizePD} onPointerMove={onResizePM} onPointerUp={onResizePU} />
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
