"use client";
import { useEffect, useRef } from "react";
import { X, User, Hash } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function StudentProfileModal({ open, onClose, name, setName, id, setId }) {
  const { theme: t } = useTheme();
  const ref = useRef(null);
  useEffect(() => { if (open) setTimeout(() => ref.current?.focus(), 80); }, [open]);
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;

  const inputStyle = {
    width: "100%", background: t.colors.inputBg,
    border: t.isClassic ? "2px inset #919b9c" : `1px solid ${t.colors.inputBorder}`,
    color: t.colors.text, padding: "6px 10px", fontSize: 12,
    fontFamily: t.monoFont || "'Courier New',monospace", outline: "none",
    borderRadius: t.isClassic ? 0 : 4,
  };

  return (
    <div className="modal-backdrop modal-backdrop-blur"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: t.colors.sidebar, border: `1px solid ${t.colors.border}`,
        boxShadow: "0 24px 64px rgba(0,0,0,0.7)", width: 360, borderRadius: t.isClassic?0:10,
        fontFamily: t.font, overflow: "hidden", animation: "slideUp 0.22s ease" }}>

        {/* Title */}
        {t.isClassic ? (
          <div className="win-header-bar flex items-center justify-between px-2 py-0.5">
            <span style={{color:"#fff",fontSize:12,fontWeight:"bold"}}>👤 Student Profile</span>
            <button onClick={onClose} className="win-btn" style={{width:18,height:18,fontSize:11}}>×</button>
          </div>
        ) : (
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
            padding:"12px 16px",borderBottom:`1px solid ${t.colors.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <User size={14} style={{color:t.colors.accent}}/>
              <span style={{color:t.colors.accent,fontSize:12,fontWeight:700,letterSpacing:"0.08em"}}>STUDENT PROFILE</span>
            </div>
            <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:t.colors.label}}>
              <X size={16}/>
            </button>
          </div>
        )}

        <div style={{padding:20,display:"flex",flexDirection:"column",gap:16}}>
          <p style={{fontSize:11,color:t.colors.textMuted,lineHeight:"16px"}}>
            Credentials auto-inject into every build as the first lines of{" "}
            <code style={{color:t.colors.accent,fontSize:10}}>int main()</code>.
          </p>

          <div>
            <label style={{display:"block",fontSize:10,fontWeight:700,color:t.colors.label,marginBottom:5,
              letterSpacing:"0.08em",textTransform:"uppercase"}}>Full Name</label>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <User size={12} style={{color:t.colors.accent,flexShrink:0}}/>
              <input ref={ref} type="text" value={name} onChange={e=>setName(e.target.value)}
                placeholder="e.g. Alice Johnson" style={inputStyle}/>
            </div>
          </div>

          <div>
            <label style={{display:"block",fontSize:10,fontWeight:700,color:t.colors.label,marginBottom:5,
              letterSpacing:"0.08em",textTransform:"uppercase"}}>Student ID</label>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <Hash size={12} style={{color:t.colors.accent,flexShrink:0}}/>
              <input type="text" value={id} onChange={e=>setId(e.target.value)}
                placeholder="e.g. CS-2024-0042" style={inputStyle}/>
            </div>
          </div>

          {(name||id) && (
            <div style={{background:t.colors.editor,border:`1px solid ${t.colors.border}`,borderRadius:4,padding:"8px 10px"}}>
              <p style={{fontSize:9,color:t.colors.label,marginBottom:4,letterSpacing:"0.06em",textTransform:"uppercase"}}>
                Preview Injection:
              </p>
              <pre style={{fontSize:10,color:t.colors.accent,fontFamily:"'Courier New',monospace",lineHeight:"16px",margin:0}}>
{`cout << "Name: " << "${name||"Student"}" << "\\n"\n     << "ID: "   << "${id||"000000"}" << endl;`}
              </pre>
            </div>
          )}

          <div style={{display:"flex",gap:8,paddingTop:4}}>
            <button onClick={onClose}
              style={{flex:1,padding:"8px 0",background:t.colors.accent,color:t.colors.bg,
                border:"none",borderRadius:5,fontSize:11,fontWeight:700,cursor:"pointer",
                letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:t.font}}>
              Save & Close
            </button>
            <button onClick={onClose}
              style={{padding:"8px 14px",background:t.colors.btnBg,color:t.colors.btnText,
                border:`1px solid ${t.colors.border}`,borderRadius:5,fontSize:11,cursor:"pointer",fontFamily:t.font}}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
