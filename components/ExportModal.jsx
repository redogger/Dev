"use client";
import { useState, useEffect } from "react";
import { X, Download, Loader, AlertTriangle, ChevronRight } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { EXPORT_FRAMES, checkOverflow, exportFrame } from "@/lib/macExport";

export default function ExportModal({ open, onClose, code, output, studentName, studentId }) {
  const { theme: t } = useTheme();
  const [frameId,   setFrameId]   = useState("macbook");
  const [preview,   setPreview]   = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [exporting, setExporting] = useState(false);
  const [paginate,  setPaginate]  = useState(false);
  const overflow = checkOverflow(code, output, frameId);
  const frame = EXPORT_FRAMES[frameId];

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const t2 = setTimeout(async () => {
      try {
        const c = document.createElement("canvas");
        c.width = frame.width; c.height = frame.height;
        // quick preview render via same engine
        const jp = await exportFrame({ code, output, studentName, studentId, themeId: t.id, frameId, paginate, previewOnly: true });
        setPreview(jp);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }, 100);
    return () => clearTimeout(t2);
  }, [open, frameId, paginate]);

  const handleExport = async () => {
    setExporting(true);
    try { await exportFrame({ code, output, studentName, studentId, themeId: t.id, frameId, paginate }); }
    finally { setExporting(false); }
  };

  if (!open) return null;
  const isClassic = t.isClassic;

  const modalStyle = {
    background: isClassic ? "#d4d0c8" : t.colors.sidebar,
    border: isClassic ? "2px solid #919b9c" : `1px solid ${t.colors.border}`,
    boxShadow: isClassic ? "4px 4px 8px rgba(0,0,0,0.4)" : "0 32px 80px rgba(0,0,0,0.85)",
    borderRadius: isClassic ? 0 : 12,
    width: "min(94vw, 820px)", maxHeight: "95vh",
    display: "flex", flexDirection: "column",
    fontFamily: t.font, overflow: "hidden",
    animation: "slideUp 0.22s ease",
  };

  return (
    <div className="modal-backdrop modal-backdrop-blur"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modalStyle}>

        {/* Title */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"10px 16px", borderBottom:`1px solid ${t.colors.border}`,
          background: isClassic ? "" : t.colors.header, flexShrink:0 }}>
          {isClassic ? (
            <div className="win-header-bar flex items-center justify-between w-full px-2 py-0.5">
              <span style={{color:"#fff",fontSize:12,fontWeight:"bold"}}>💻 Assignment Export</span>
              <button onClick={onClose} className="win-btn" style={{width:18,height:18,fontSize:11}}>×</button>
            </div>
          ) : (
            <>
              <span style={{color:t.colors.accent,fontSize:13,fontWeight:700,letterSpacing:"0.06em"}}>
                ⬡ ASSIGNMENT EXPORT
              </span>
              <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:t.colors.label}}>
                <X size={18} />
              </button>
            </>
          )}
        </div>

        {/* Frame selector */}
        <div style={{display:"flex",gap:8,padding:"10px 16px",borderBottom:`1px solid ${t.colors.border}`,flexShrink:0}}>
          {Object.values(EXPORT_FRAMES).map(f => (
            <button key={f.id} onClick={() => setFrameId(f.id)}
              style={{flex:1,padding:"8px 6px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,
                background:frameId===f.id?`${t.colors.accent}18`:"transparent",
                border:`1px solid ${frameId===f.id?t.colors.accent:t.colors.border}`,
                borderRadius:6,cursor:"pointer",transition:"all .15s"}}>
              <span style={{fontSize:20}}>{f.icon}</span>
              <span style={{fontSize:10,fontWeight:700,color:frameId===f.id?t.colors.accent:t.colors.text,fontFamily:t.font}}>{f.label}</span>
              <span style={{fontSize:8,color:t.colors.label,fontFamily:t.font}}>{f.description}</span>
            </button>
          ))}
        </div>

        {/* Overflow warning */}
        {overflow.hasOverflow && (
          <div style={{padding:"8px 16px",background:"rgba(227,179,65,0.1)",borderBottom:`1px solid rgba(227,179,65,0.3)`,
            display:"flex",alignItems:"flex-start",gap:10,flexShrink:0}}>
            <AlertTriangle size={16} style={{color:"#e3b341",flexShrink:0,marginTop:1}}/>
            <div style={{flex:1}}>
              <p style={{fontSize:11,fontWeight:700,color:"#e3b341",fontFamily:t.font}}>Content Overflow Warning</p>
              <p style={{fontSize:10,color:t.colors.label,marginTop:2,fontFamily:t.font}}>
                {overflow.codeOverflow && `Code: ${overflow.codeLines} lines (max ${overflow.maxLines}, +${overflow.excess.code} overflow). `}
                {overflow.outputOverflow && `Output: ${overflow.outputLines} lines (max ${overflow.maxOutputLines}).`}
              </p>
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6}}>
                <label style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:t.colors.label,cursor:"pointer",fontFamily:t.font}}>
                  <input type="checkbox" checked={paginate} onChange={e=>setPaginate(e.target.checked)}
                    style={{accentColor:t.colors.accent}}/>
                  Paginate export (crop to fit)
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        <div style={{flex:1,overflow:"auto",display:"flex",alignItems:"center",justifyContent:"center",
          padding:16,background:isClassic?"#808080":"#050505",minHeight:240}}>
          {loading ? (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
              <Loader size={28} className="animate-spin" style={{color:t.colors.accent}}/>
              <span style={{fontSize:11,color:t.colors.label,fontFamily:t.font}}>Rendering {frame.label} frame…</span>
            </div>
          ) : preview ? (
            <div style={{position:"relative"}}>
              <img src={preview} alt="Export Preview"
                style={{maxWidth:"100%",maxHeight:"50vh",borderRadius:8,boxShadow:"0 20px 60px rgba(0,0,0,0.9)"}}/>
              <div style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.65)",color:"#fff",
                fontSize:8,padding:"2px 6px",borderRadius:3,fontFamily:"monospace"}}>
                PREVIEW (scaled)
              </div>
              {overflow.hasOverflow && !paginate && (
                <div className="overflow-warn" style={{position:"absolute",inset:0,borderRadius:8,pointerEvents:"none"}}/>
              )}
            </div>
          ) : (
            <span style={{fontSize:11,color:t.colors.label,fontFamily:t.font}}>Click Export to generate</span>
          )}
        </div>

        {/* Student strip */}
        <div style={{padding:"6px 16px",borderTop:`1px solid ${t.colors.border}`,
          display:"flex",gap:16,fontSize:10,color:t.colors.label,fontFamily:"'Courier New',monospace",flexShrink:0}}>
          <span>Student: <span style={{color:t.colors.text}}>{studentName||"—"}</span></span>
          <span>ID: <span style={{color:t.colors.text}}>{studentId||"—"}</span></span>
          <span>Frame: <span style={{color:t.colors.accent}}>{frame.label}</span></span>
          <span style={{marginLeft:"auto"}}>{frame.width}×{frame.height}</span>
        </div>

        {/* Actions */}
        <div style={{display:"flex",gap:10,padding:"10px 16px",borderTop:`1px solid ${t.colors.border}`,flexShrink:0}}>
          {isClassic ? (
            <>
              <button className="win-btn flex items-center gap-2 px-5 py-1.5 text-xs font-bold"
                onClick={handleExport} disabled={exporting}>
                {exporting?<Loader size={11} className="animate-spin"/>:<Download size={11}/>}
                {exporting?"Exporting…":"Export PNG"}
              </button>
              <button className="win-btn px-4 py-1.5 text-xs" onClick={onClose}>Close</button>
            </>
          ) : (
            <>
              <button onClick={handleExport} disabled={exporting}
                style={{display:"flex",alignItems:"center",gap:8,padding:"9px 24px",
                  background:t.colors.accent,color:t.colors.bg,border:"none",borderRadius:6,
                  fontSize:12,fontWeight:700,cursor:"pointer",letterSpacing:"0.06em",textTransform:"uppercase",
                  opacity:exporting?0.6:1,fontFamily:t.font}}>
                {exporting?<Loader size={13} className="animate-spin"/>:<Download size={13}/>}
                {exporting?"Exporting…":"Download PNG"}
              </button>
              <button onClick={onClose}
                style={{padding:"9px 16px",background:t.colors.btnBg,color:t.colors.btnText,
                  border:`1px solid ${t.colors.border}`,borderRadius:6,fontSize:12,cursor:"pointer",fontFamily:t.font}}>
                Close
              </button>
              <span style={{marginLeft:"auto",fontSize:10,color:t.colors.label,alignSelf:"center",fontFamily:t.font}}>
                Full resolution PNG for assignment grading
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
