"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Key, BarChart2, Users, X, Eye, EyeOff,
  Plus, Trash2, RefreshCw, Check, AlertTriangle, Wifi,
  Copy, CheckCheck, Lock, Unlock, Download, Activity,
  Monitor, Clock, Zap, Terminal, ChevronDown, ChevronUp,
  Settings, LogOut, Globe, Server, Database,
} from "lucide-react";
import { SEED_LICENSES, TIERS, generateKey, getAnalyticsSummary } from "@/lib/licenseManager";
import { getLiveStudents } from "@/lib/analytics";

// ══════════════════════════════════════════════════════════
//  MFA Login Panel
// ══════════════════════════════════════════════════════════
function MFALogin({ onSuccess }) {
  const [step,    setStep]    = useState(1); // 1=pw, 2=mfa
  const [pw,      setPw]      = useState("");
  const [mfa,     setMfa]     = useState("");
  const [showPw,  setShowPw]  = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const ADMIN_PW  = process.env.NEXT_PUBLIC_ADMIN_SECRET || "greg-admin-2024";
  const MFA_CODE  = "123456"; // sim

  const handlePw = async () => {
    if (!pw) return;
    setLoading(true); setError("");
    await new Promise(r=>setTimeout(r,700));
    if (pw === ADMIN_PW) { setStep(2); }
    else setError("Invalid credentials");
    setLoading(false);
  };
  const handleMfa = async () => {
    if (!mfa) return;
    setLoading(true); setError("");
    await new Promise(r=>setTimeout(r,500));
    if (mfa === MFA_CODE) onSuccess();
    else setError("Invalid MFA code. (Demo: 123456)");
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0a0c14", display:"flex", alignItems:"center",
      justifyContent:"center", fontFamily:"'JetBrains Mono',monospace" }}
      className="admin-grid-bg">
      <div className="admin-scanline"/>

      <motion.div initial={{opacity:0,scale:0.92}} animate={{opacity:1,scale:1}}
        style={{width:380,padding:32,borderRadius:12}} className="glass-admin">

        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:32,marginBottom:4}}>⬡</div>
          <span className="greg-logo" data-text="GReg">GReg</span>
          <p style={{fontSize:10,color:"#667",marginTop:4,letterSpacing:"0.12em"}}>ENTERPRISE ADMIN PORTAL</p>
        </div>

        {/* Step indicator */}
        <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:24}}>
          {[1,2].map((s,i)=>(
            <>
              <div key={s} style={{width:28,height:28,borderRadius:"50%",
                background:step>=s?"rgba(201,162,39,0.9)":"rgba(201,162,39,0.15)",
                border:`1px solid rgba(201,162,39,${step>=s?0.9:0.2})`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:11,fontWeight:700,color:step>=s?"#0a0c14":"rgba(201,162,39,0.4)"}}>
                {step>s?<Check size={12}/>:s}
              </div>
              {i===0&&<div style={{flex:1,height:1,background:`rgba(201,162,39,${step>=2?0.6:0.15})`}}/>}
            </>
          ))}
        </div>

        {error && (
          <div style={{background:"rgba(248,81,73,0.12)",border:"1px solid rgba(248,81,73,0.4)",
            borderRadius:6,padding:"8px 12px",marginBottom:14,fontSize:11,color:"#f85149"}}>
            ⚠ {error}
          </div>
        )}

        {step===1 && (
          <>
            <p style={{fontSize:11,color:"#667",marginBottom:8}}>Administrator Password</p>
            <div style={{position:"relative",marginBottom:16}}>
              <input type={showPw?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handlePw()}
                placeholder="Enter admin password"
                style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(201,162,39,0.25)",
                  color:"#d0d8e8",padding:"10px 40px 10px 12px",fontSize:12,borderRadius:6,outline:"none",
                  fontFamily:"'JetBrains Mono',monospace"}}/>
              <button onClick={()=>setShowPw(v=>!v)}
                style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
                  background:"none",border:"none",cursor:"pointer",color:"#667"}}>
                {showPw?<EyeOff size={14}/>:<Eye size={14}/>}
              </button>
            </div>
            <button onClick={handlePw} disabled={loading}
              style={{width:"100%",padding:"10px",background:"rgba(201,162,39,0.85)",
                color:"#0a0c14",border:"none",borderRadius:6,fontSize:12,fontWeight:700,
                cursor:"pointer",letterSpacing:"0.08em",opacity:loading?0.7:1}}>
              {loading?"Authenticating…":"Continue →"}
            </button>
            <p style={{fontSize:9,color:"#444",textAlign:"center",marginTop:10}}>
              Demo: use password from .env.local
            </p>
          </>
        )}

        {step===2 && (
          <>
            <p style={{fontSize:11,color:"#667",marginBottom:4}}>Multi-Factor Authentication</p>
            <p style={{fontSize:10,color:"rgba(201,162,39,0.7)",marginBottom:12}}>
              Enter the 6-digit code from your authenticator app.
            </p>
            <input type="text" value={mfa} onChange={e=>setMfa(e.target.value.slice(0,6))}
              onKeyDown={e=>e.key==="Enter"&&handleMfa()}
              placeholder="000000"
              maxLength={6}
              style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(201,162,39,0.25)",
                color:"#d0d8e8",padding:"10px 12px",fontSize:22,borderRadius:6,outline:"none",
                letterSpacing:"0.5em",textAlign:"center",marginBottom:16,
                fontFamily:"'JetBrains Mono',monospace"}}/>
            <button onClick={handleMfa} disabled={loading}
              style={{width:"100%",padding:"10px",background:"rgba(201,162,39,0.85)",
                color:"#0a0c14",border:"none",borderRadius:6,fontSize:12,fontWeight:700,cursor:"pointer",opacity:loading?0.7:1}}>
              {loading?"Verifying…":"Verify & Enter"}
            </button>
            <p style={{fontSize:9,color:"#444",textAlign:"center",marginTop:10}}>Demo code: 123456</p>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  Stat Card
// ══════════════════════════════════════════════════════════
function StatCard({ icon: Icon, label, value, sub, color="#c9a227" }) {
  return (
    <div className="stat-card">
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
        <Icon size={18} style={{color}} />
        <span style={{fontSize:9,color:"#446",letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"'JetBrains Mono',monospace"}}>{label}</span>
      </div>
      <div style={{fontSize:28,fontWeight:900,color,fontFamily:"'Orbitron',monospace",letterSpacing:"0.05em"}}>{value}</div>
      {sub && <div style={{fontSize:9,color:"#557",marginTop:4}}>{sub}</div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  License Manager Tab
// ══════════════════════════════════════════════════════════
function LicenseManager({ licenses, setLicenses }) {
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ tier:"PRO", issuedTo:"", email:"", expiresAt:"", maxDevices:3 });
  const [copied, setCopied] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const copy = (key, id) => {
    navigator.clipboard.writeText(key);
    setCopied(id); setTimeout(()=>setCopied(null),2000);
  };

  const revoke = (id) => {
    setLicenses(prev => prev.map(l => l.id===id ? {...l, status:"revoked"} : l));
  };

  const addLicense = () => {
    if (!newForm.issuedTo || !newForm.expiresAt) return;
    const key = generateKey(newForm.tier);
    setLicenses(prev => [...prev, {
      id: "lic-"+Date.now(), key, ...newForm,
      issuedAt: new Date().toISOString().slice(0,10),
      activeDevices: 0, status: "active", executions: 0, hoursLogged: 0,
    }]);
    setShowNew(false);
    setNewForm({ tier:"PRO", issuedTo:"", email:"", expiresAt:"", maxDevices:3 });
  };

  const filtered = filterStatus==="all" ? licenses : licenses.filter(l=>l.status===filterStatus);
  const TIER_COLOR = { STANDARD:"#8b949e", PRO:"#58a6ff", ENTERPRISE:"#c9a227" };
  const STATUS_COLOR = { active:"#3fb950", expired:"#f85149", trial:"#e3b341", revoked:"#666" };

  return (
    <div>
      {/* Controls */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <div style={{display:"flex",gap:6}}>
          {["all","active","expired","trial"].map(s=>(
            <button key={s} onClick={()=>setFilterStatus(s)}
              style={{padding:"4px 10px",fontSize:10,borderRadius:4,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",
                background:filterStatus===s?"rgba(201,162,39,0.15)":"transparent",
                border:`1px solid ${filterStatus===s?"rgba(201,162,39,0.5)":"rgba(255,255,255,0.1)"}`,
                color:filterStatus===s?"#c9a227":"#667"}}>
              {s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={()=>setShowNew(v=>!v)}
          style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6,padding:"6px 14px",
            background:"rgba(201,162,39,0.85)",color:"#0a0c14",border:"none",borderRadius:5,
            fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>
          <Plus size={13}/> New License
        </button>
      </div>

      {/* New license form */}
      <AnimatePresence>
        {showNew && (
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}}
            exit={{opacity:0,height:0}} style={{overflow:"hidden",marginBottom:14}}>
            <div style={{background:"rgba(201,162,39,0.06)",border:"1px solid rgba(201,162,39,0.2)",borderRadius:8,padding:16}}>
              <p style={{fontSize:11,fontWeight:700,color:"#c9a227",marginBottom:12,fontFamily:"'JetBrains Mono',monospace"}}>
                ⬡ Generate New License
              </p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[
                  {label:"Tier", key:"tier", type:"select", opts:Object.keys(TIERS)},
                  {label:"Issued To", key:"issuedTo", type:"text", ph:"Organisation / Name"},
                  {label:"Email", key:"email", type:"email", ph:"contact@institution.edu"},
                  {label:"Expires", key:"expiresAt", type:"date"},
                  {label:"Max Devices", key:"maxDevices", type:"number", ph:"3"},
                ].map(f=>(
                  <div key={f.key}>
                    <label style={{display:"block",fontSize:9,color:"#667",marginBottom:3,letterSpacing:"0.08em",textTransform:"uppercase"}}>{f.label}</label>
                    {f.type==="select" ? (
                      <select value={newForm[f.key]} onChange={e=>setNewForm(v=>({...v,[f.key]:e.target.value}))}
                        style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(201,162,39,0.2)",color:"#d0d8e8",padding:"6px 8px",fontSize:11,borderRadius:4,outline:"none"}}>
                        {f.opts.map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type={f.type} placeholder={f.ph} value={newForm[f.key]}
                        onChange={e=>setNewForm(v=>({...v,[f.key]:f.type==="number"?+e.target.value:e.target.value}))}
                        style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(201,162,39,0.2)",color:"#d0d8e8",padding:"6px 8px",fontSize:11,borderRadius:4,outline:"none",fontFamily:"'JetBrains Mono',monospace"}}/>
                    )}
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:8,marginTop:12}}>
                <button onClick={addLicense}
                  style={{padding:"7px 20px",background:"rgba(201,162,39,0.85)",color:"#0a0c14",border:"none",borderRadius:5,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                  Generate
                </button>
                <button onClick={()=>setShowNew(false)}
                  style={{padding:"7px 14px",background:"transparent",color:"#667",border:"1px solid rgba(255,255,255,0.1)",borderRadius:5,fontSize:11,cursor:"pointer"}}>
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div style={{borderRadius:8,overflow:"hidden",border:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1.2fr 1fr 1fr 0.8fr 0.8fr 80px",
          background:"rgba(255,255,255,0.04)",padding:"8px 12px",
          fontSize:9,color:"#557",letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"'JetBrains Mono',monospace"}}>
          {["License Key","Issued To","Tier","Status","Devices","Execs","Actions"].map(h=>(
            <span key={h}>{h}</span>
          ))}
        </div>
        {filtered.map((l,i)=>(
          <div key={l.id} className="license-row" style={{display:"grid",gridTemplateColumns:"2fr 1.2fr 1fr 1fr 0.8fr 0.8fr 80px",
            padding:"9px 12px",borderTop:"1px solid rgba(255,255,255,0.04)",alignItems:"center",
            background:i%2===0?"transparent":"rgba(255,255,255,0.015)"}}>
            {/* Key */}
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <code style={{fontSize:10,color:"#a0b",fontFamily:"'JetBrains Mono',monospace"}}>{l.key}</code>
              <button onClick={()=>copy(l.key,l.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#447",flexShrink:0}}>
                {copied===l.id?<CheckCheck size={10} style={{color:"#3fb950"}}/>:<Copy size={10}/>}
              </button>
            </div>
            <div>
              <div style={{fontSize:10,color:"#d0d8e8",fontFamily:"'JetBrains Mono',monospace"}}>{l.issuedTo}</div>
              <div style={{fontSize:9,color:"#557"}}>{l.email}</div>
            </div>
            <span style={{fontSize:10,color:TIER_COLOR[l.tier]||"#667",fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>{l.tier}</span>
            <span style={{fontSize:10,color:STATUS_COLOR[l.status]||"#667",fontFamily:"'JetBrains Mono',monospace",
              display:"flex",alignItems:"center",gap:4}}>
              {l.status==="active"&&<span className="sync-dot" style={{width:5,height:5}}/>}
              {l.status}
            </span>
            <span style={{fontSize:11,color:"#d0d8e8",fontFamily:"'JetBrains Mono',monospace"}}>
              {l.activeDevices}/{l.maxDevices>=999?"∞":l.maxDevices}
            </span>
            <span style={{fontSize:11,color:"#d0d8e8",fontFamily:"'JetBrains Mono',monospace"}}>{l.executions?.toLocaleString()}</span>
            <div style={{display:"flex",gap:5}}>
              {l.status==="active" && (
                <button onClick={()=>revoke(l.id)} title="Revoke"
                  style={{background:"none",border:"none",cursor:"pointer",color:"#f85149",padding:3}}>
                  <Lock size={12}/>
                </button>
              )}
              <button title="Delete"
                style={{background:"none",border:"none",cursor:"pointer",color:"#444",padding:3}}>
                <Trash2 size={12}/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  Analytics Tab
// ══════════════════════════════════════════════════════════
function AnalyticsDashboard({ licenses }) {
  const s = getAnalyticsSummary(licenses);
  const weekly = [
    {day:"Mon",execs:142,hours:8},{day:"Tue",execs:289,hours:14},{day:"Wed",execs:215,hours:11},
    {day:"Thu",execs:380,hours:18},{day:"Fri",execs:324,hours:16},{day:"Sat",execs:88,hours:4},
    {day:"Sun",execs:52,hours:2},
  ];
  const maxExecs = Math.max(...weekly.map(d=>d.execs));
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
        <StatCard icon={Key}      label="Total Licenses"  value={s.totalLicenses}  sub="All tiers"          color="#c9a227"/>
        <StatCard icon={Activity} label="Executions"      value={s.totalExecutions.toLocaleString()} sub="All time" color="#58a6ff"/>
        <StatCard icon={Clock}    label="Hours Logged"    value={s.totalHours}     sub="Active sessions"    color="#3fb950"/>
        <StatCard icon={Monitor}  label="Active Devices"  value={s.totalDevices}   sub="Connected now"      color="#a371f7"/>
      </div>

      {/* Bar chart */}
      <div style={{background:"rgba(255,255,255,0.025)",borderRadius:8,padding:16,marginBottom:16,border:"1px solid rgba(255,255,255,0.07)"}}>
        <p style={{fontSize:11,color:"#c9a227",fontWeight:700,marginBottom:14,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.08em"}}>
          WEEKLY EXECUTION ACTIVITY
        </p>
        <div style={{display:"flex",alignItems:"flex-end",gap:8,height:80}}>
          {weekly.map(d=>(
            <div key={d.day} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div style={{width:"100%",background:`linear-gradient(180deg,rgba(201,162,39,0.8),rgba(201,162,39,0.3))`,
                height:`${(d.execs/maxExecs)*64}px`,borderRadius:"3px 3px 0 0",minHeight:4,
                transition:"height 0.5s ease"}}/>
              <span style={{fontSize:8,color:"#557",fontFamily:"'JetBrains Mono',monospace"}}>{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* License breakdown */}
      <div style={{background:"rgba(255,255,255,0.025)",borderRadius:8,padding:16,border:"1px solid rgba(255,255,255,0.07)"}}>
        <p style={{fontSize:11,color:"#c9a227",fontWeight:700,marginBottom:12,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.08em"}}>
          LICENSE BREAKDOWN
        </p>
        {licenses.map(l=>(
          <div key={l.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                <span style={{fontSize:10,color:"#d0d8e8",fontFamily:"'JetBrains Mono',monospace"}}>{l.issuedTo}</span>
                <span style={{fontSize:10,color:"#557"}}>{l.executions} execs</span>
              </div>
              <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden"}}>
                <div style={{width:`${Math.min(100,(l.executions/s.totalExecutions)*100)}%`,height:"100%",
                  background:"linear-gradient(90deg,rgba(201,162,39,0.8),rgba(88,166,255,0.6))",borderRadius:2}}/>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  Remote Sync Tab
// ══════════════════════════════════════════════════════════
function RemoteSync() {
  const [students, setStudents] = useState(getLiveStudents());
  const [selected, setSelected] = useState(null);
  const [syncing,  setSyncing]  = useState(false);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStudents(prev => prev.map(s => ({
        ...s,
        lines: s.status==="coding" ? s.lines + Math.floor(Math.random()*3) : s.lines,
        executions: s.status==="executing" ? s.executions + 1 : s.executions,
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const STATUS_COLOR = { coding:"#58a6ff", executing:"#3fb950", idle:"#e3b341", offline:"#484f58" };
  const STATUS_ICON  = { coding:"✏", executing:"▶", idle:"◌", offline:"○" };

  const startSync = (s) => { setSyncing(true); setSelected(s); };

  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      {/* Student list */}
      <div>
        <p style={{fontSize:11,color:"#c9a227",fontWeight:700,marginBottom:12,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.08em"}}>
          LIVE STUDENT SESSIONS
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {students.map(s=>(
            <div key={s.id}
              onClick={()=>startSync(s)}
              style={{padding:"10px 12px",background:selected?.id===s.id?"rgba(201,162,39,0.1)":"rgba(255,255,255,0.025)",
                border:`1px solid ${selected?.id===s.id?"rgba(201,162,39,0.4)":"rgba(255,255,255,0.06)"}`,
                borderRadius:7,cursor:"pointer",transition:"all .15s"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:14}}>{STATUS_ICON[s.status]}</span>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:11,color:"#d0d8e8",fontFamily:"'JetBrains Mono',monospace"}}>{s.name}</span>
                    <span style={{fontSize:10,color:STATUS_COLOR[s.status]||"#557",fontFamily:"'JetBrains Mono',monospace"}}>{s.status}</span>
                  </div>
                  <div style={{fontSize:9,color:"#557",fontFamily:"'JetBrains Mono',monospace",marginTop:2}}>
                    ID: {s.id} · {s.lines} lines · {s.executions} runs · {s.buildOk} ok
                  </div>
                </div>
                {s.status!=="offline"&&<div className="sync-dot"/>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Remote view */}
      <div>
        <p style={{fontSize:11,color:"#c9a227",fontWeight:700,marginBottom:12,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.08em"}}>
          REMOTE SCREEN SYNC
        </p>
        {selected ? (
          <div style={{background:"rgba(255,255,255,0.025)",borderRadius:8,padding:14,
            border:"1px solid rgba(201,162,39,0.25)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <Wifi size={14} style={{color:"#3fb950"}} className="sync-active"/>
              <span style={{fontSize:11,fontWeight:700,color:"#c9a227",fontFamily:"'JetBrains Mono',monospace"}}>
                Synced: {selected.name}
              </span>
            </div>
            {/* Simulated code preview */}
            <div style={{background:"#0d1117",borderRadius:6,padding:10,marginBottom:10,fontFamily:"'Courier New',monospace",fontSize:10,color:"#c9d1d9",lineHeight:"16px",maxHeight:180,overflow:"auto"}}>
              <div style={{color:"#d2a8ff"}}>#include &lt;iostream&gt;</div>
              <div style={{color:"#ff7b72"}}>using namespace std;</div>
              <div/>
              <div style={{color:"#ff7b72"}}>int</div><div style={{display:"inline",color:"#d2a8ff"}}> main()</div><div style={{display:"inline"}}> {"{"}</div>
              <div style={{paddingLeft:16,color:"#8b949e"}}>// ── GReg IDE: Student Metadata ──</div>
              <div style={{paddingLeft:16}}>
                <span style={{color:"#d2a8ff"}}>cout</span>
                <span> &lt;&lt; </span>
                <span style={{color:"#a5d6ff"}}>"Name: {selected.name}"</span>
                <span> &lt;&lt; endl;</span>
              </div>
              <div style={{paddingLeft:16,color:"#79c0ff"}}>return 0;</div>
              <div>{"}"}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[["Lines",selected.lines],["Executions",selected.executions],["Build OK",selected.buildOk],
                ["Last Seen","Now"]].map(([k,v])=>(
                <div key={k} style={{background:"rgba(0,0,0,0.3)",borderRadius:4,padding:"6px 10px"}}>
                  <div style={{fontSize:8,color:"#557",marginBottom:1}}>{k}</div>
                  <div style={{fontSize:13,fontWeight:700,color:"#d0d8e8",fontFamily:"'JetBrains Mono',monospace"}}>{v}</div>
                </div>
              ))}
            </div>
            <button onClick={()=>{setSelected(null);setSyncing(false);}}
              style={{marginTop:10,padding:"6px 14px",background:"transparent",color:"#557",
                border:"1px solid rgba(255,255,255,0.1)",borderRadius:5,fontSize:10,cursor:"pointer",width:"100%"}}>
              Disconnect
            </button>
          </div>
        ) : (
          <div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",
            color:"#334",fontSize:11,border:"1px dashed rgba(255,255,255,0.07)",borderRadius:8,padding:20,textAlign:"center",fontFamily:"'JetBrains Mono',monospace"}}>
            Click a student to begin<br/>remote screen sync
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  Enterprise Settings Tab
// ══════════════════════════════════════════════════════════
function EnterpriseSettings({ allowedThemes, setAllowedThemes }) {
  const themes = [
    { id:"classic",  label:"Classic Dev-C++ 5.11", tier:"STANDARD" },
    { id:"midnight", label:"Midnight Engineering",  tier:"PRO"      },
    { id:"neon",     label:"Neon Hacker",           tier:"PRO"      },
  ];
  return (
    <div style={{maxWidth:560}}>
      <p style={{fontSize:11,color:"#c9a227",fontWeight:700,marginBottom:16,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.08em"}}>
        ENTERPRISE THEME CONTROL
      </p>
      <p style={{fontSize:10,color:"#557",marginBottom:14,lineHeight:"16px",fontFamily:"'JetBrains Mono',monospace"}}>
        Enable or disable specific themes per license tier. Changes take effect instantly for all connected sessions.
      </p>
      {themes.map(th=>(
        <div key={th.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",
          background:"rgba(255,255,255,0.025)",borderRadius:7,border:"1px solid rgba(255,255,255,0.06)",marginBottom:8}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:"#d0d8e8",fontFamily:"'JetBrains Mono',monospace"}}>{th.label}</div>
            <div style={{fontSize:9,color:"#557",marginTop:2}}>Required tier: <span style={{color:"#c9a227"}}>{th.tier}</span></div>
          </div>
          <button onClick={()=>{
            if(allowedThemes.includes(th.id)) setAllowedThemes(prev=>prev.filter(t=>t!==th.id));
            else setAllowedThemes(prev=>[...prev,th.id]);
          }} style={{width:40,height:22,borderRadius:11,
            background:allowedThemes.includes(th.id)?"rgba(63,185,80,0.8)":"rgba(255,255,255,0.08)",
            border:`1px solid ${allowedThemes.includes(th.id)?"rgba(63,185,80,0.5)":"rgba(255,255,255,0.15)"}`,
            cursor:"pointer",position:"relative",transition:"background .2s"}}>
            <span style={{position:"absolute",top:3,left:allowedThemes.includes(th.id)?22:3,
              width:14,height:14,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
          </button>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  Main Admin Dashboard
// ══════════════════════════════════════════════════════════
export default function AdminDashboard({ onClose, allowedThemes, setAllowedThemes }) {
  const [authed,   setAuthed]   = useState(false);
  const [tab,      setTab]      = useState("analytics");
  const [licenses, setLicenses] = useState(SEED_LICENSES);

  if (!authed) return <MFALogin onSuccess={()=>setAuthed(true)} />;

  const TABS = [
    { id:"analytics", icon:BarChart2, label:"Analytics"  },
    { id:"licenses",  icon:Key,       label:"Licenses"   },
    { id:"sync",      icon:Wifi,      label:"Remote Sync"},
    { id:"settings",  icon:Settings,  label:"Settings"   },
  ];
  const s = getAnalyticsSummary(licenses);

  return (
    <div style={{position:"fixed",inset:0,zIndex:9990,background:"#0a0c14",overflowY:"auto",fontFamily:"'JetBrains Mono',monospace"}}
      className="admin-grid-bg">
      <div className="admin-scanline"/>

      {/* Header */}
      <div style={{position:"sticky",top:0,zIndex:1,background:"rgba(10,12,20,0.95)",backdropFilter:"blur(12px)",
        borderBottom:"1px solid rgba(201,162,39,0.15)",padding:"0 24px",height:56,display:"flex",alignItems:"center",gap:16}}>
        <span className="greg-logo" data-text="GReg" style={{fontSize:13}}>GReg</span>
        <span style={{fontSize:9,color:"#446",letterSpacing:"0.15em",textTransform:"uppercase"}}>ADMIN PORTAL</span>
        <div style={{flex:1}}/>
        {/* Quick stats */}
        {[["Active",s.activeLicenses,"#3fb950"],[`Executions`,s.totalExecutions.toLocaleString(),"#c9a227"],["Devices",s.totalDevices,"#58a6ff"]].map(([k,v,c])=>(
          <div key={k} style={{display:"flex",flexDirection:"column",alignItems:"flex-end"}}>
            <span style={{fontSize:14,fontWeight:900,color:c}}>{v}</span>
            <span style={{fontSize:8,color:"#446",letterSpacing:"0.1em"}}>{k}</span>
          </div>
        ))}
        <button onClick={onClose}
          style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,
            padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:"#667",fontSize:11}}>
          <X size={13}/> Exit
        </button>
      </div>

      <div style={{display:"flex",minHeight:"calc(100vh - 56px)"}}>
        {/* Nav */}
        <nav style={{width:180,borderRight:"1px solid rgba(255,255,255,0.06)",padding:"20px 0",flexShrink:0}}>
          {TABS.map(({id,icon:Icon,label})=>(
            <button key={id} onClick={()=>setTab(id)}
              style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 20px",
                background:tab===id?"rgba(201,162,39,0.1)":"transparent",
                borderLeft:`2px solid ${tab===id?"#c9a227":"transparent"}`,
                border:"none",cursor:"pointer",color:tab===id?"#c9a227":"#557",fontSize:11,textAlign:"left"}}>
              <Icon size={14}/>{label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <main style={{flex:1,padding:24,overflowY:"auto"}}>
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
              {tab==="analytics" && <AnalyticsDashboard licenses={licenses}/>}
              {tab==="licenses"  && <LicenseManager licenses={licenses} setLicenses={setLicenses}/>}
              {tab==="sync"      && <RemoteSync/>}
              {tab==="settings"  && <EnterpriseSettings allowedThemes={allowedThemes} setAllowedThemes={setAllowedThemes}/>}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
