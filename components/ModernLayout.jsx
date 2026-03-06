"use client";
import { useTheme, THEMES } from "./ThemeProvider";
import EditorPanel from "./Editor";
import {
  Zap, Play, Shuffle, RotateCcw, Download, FileText,
  Monitor, Terminal, Lock, Unlock, User, CheckCircle, Loader
} from "lucide-react";

// ── Section wrapper ───────────────────────────────────────────────────────────
function Sec({ title, t, children }) {
  return (
    <div className="px-3 py-3" style={{ borderBottom: `1px solid ${t.colors.border}` }}>
      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: t.colors.accent, marginBottom: 8 }}>
        {title}
      </p>
      {children}
    </div>
  );
}

// ── Primary button ────────────────────────────────────────────────────────────
function PBtn({ onClick, loading, icon: Icon, label, t }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
        padding: "8px 0", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
        background: t.colors.accent, color: t.colors.bg, border: "none", borderRadius: 4, cursor: "pointer",
        opacity: loading ? 0.6 : 1, transition: "opacity .15s",
        fontFamily: t.font,
      }}
    >
      {loading ? <Loader size={12} className="animate-spin" /> : <Icon size={12} />}
      {label}
    </button>
  );
}

// ── Secondary button ──────────────────────────────────────────────────────────
function SBtn({ onClick, icon: Icon, label, color, t, small }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
        padding: small ? "5px 0" : "6px 0", fontSize: small ? 9 : 10, fontWeight: 600,
        letterSpacing: "0.05em", textTransform: "uppercase",
        background: t.colors.btnBg, border: `1px solid ${color || t.colors.border}`,
        color: color || t.colors.btnText, borderRadius: 4, cursor: "pointer",
        fontFamily: t.font,
      }}
    >
      <Icon size={small ? 9 : 10} />
      {label}
    </button>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ on, onChange, t }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        width: 36, height: 18, borderRadius: 9,
        background: on ? t.colors.accent : t.colors.border,
        border: "none", cursor: "pointer", position: "relative",
        transition: "background .2s", flexShrink: 0, outline: "none",
      }}
    >
      <span style={{
        position: "absolute", top: 2, left: on ? 18 : 2,
        width: 14, height: 14, borderRadius: "50%", background: "#fff",
        transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
      }} />
    </button>
  );
}

// ── Main Modern Layout ────────────────────────────────────────────────────────
export default function ModernLayout({
  code, setCode, buildStatus, isRunning, output,
  onBuild, onExecute, onBuildAndRun, onRandomize, onReset,
  onExportCpp, onExportPDF, onMacExport, onOpenProfile,
  mutationEnabled, setMutationEnabled,
  consoleOpen, setConsoleOpen,
}) {
  const { theme: t, themeKey, setThemeKey, themes } = useTheme();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: t.colors.bg, fontFamily: t.font }}>
      {/* ── Top header ───────────────────────────────────────────────── */}
      <header
        style={{ background: t.colors.header, borderBottom: `1px solid ${t.colors.border}`, height: 40, display: "flex", alignItems: "center", gap: 12, padding: "0 16px", flexShrink: 0 }}
      >
        <span style={{ color: t.colors.accent, fontWeight: 900, fontSize: 14, letterSpacing: "0.08em" }}>⬡ DEV-CLOUD PRO</span>
        <span style={{ color: t.colors.label, fontSize: 10, opacity: 0.5 }}>v3</span>
        <div style={{ flex: 1 }} />
        {isRunning && <><div style={{ width: 8, height: 8, borderRadius: "50%", background: t.colors.accent }} className="animate-pulse" /><span style={{ color: t.colors.label, fontSize: 10 }}>Executing…</span></>}
        <span style={{ color: t.colors.label, fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase" }}>JUDGE0 CE · C++17</span>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* ── External Sidebar ─────────────────────────────────────────── */}
        <aside
          style={{ width: 250, minWidth: 250, background: t.colors.sidebar, borderRight: `1px solid ${t.colors.border}`, display: "flex", flexDirection: "column", overflow: "auto", flexShrink: 0 }}
        >
          {/* Student Profile shortcut */}
          <Sec title="⬡ Student" t={t}>
            <button
              onClick={onOpenProfile}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: t.colors.inputBg, border: `1px solid ${t.colors.inputBorder}`, borderRadius: 4, cursor: "pointer", color: t.colors.textMuted, fontSize: 11, fontFamily: t.font }}
            >
              <User size={12} style={{ color: t.colors.accent }} />
              <span>Open Student Profile…</span>
            </button>
            <p style={{ fontSize: 9, color: t.colors.label, marginTop: 5, lineHeight: "13px" }}>
              Credentials auto-inject into every build.
            </p>
          </Sec>

          {/* Actions */}
          <Sec title="⬡ Action Center" t={t}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <PBtn onClick={onBuildAndRun} loading={isRunning} icon={Zap} label="Build & Execute" t={t} />
              <div style={{ display: "flex", gap: 5 }}>
                <SBtn onClick={onBuild} disabled={isRunning} icon={Play} label="Build" t={t} />
                <SBtn onClick={onExecute} disabled={isRunning} icon={Terminal} label="Run" t={t} />
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                <SBtn onClick={onRandomize} icon={Shuffle} label="Mutate" color={t.colors.accent} t={t} />
                <SBtn onClick={onReset} icon={RotateCcw} label="Reset" t={t} />
              </div>
            </div>
          </Sec>

          {/* MacBook Export — prominent */}
          <Sec title="⬡ Assignment Export" t={t}>
            <button
              onClick={onMacExport}
              style={{
                width: "100%", padding: "9px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                background: `${t.colors.accent}22`, border: `1px solid ${t.colors.accent}`,
                color: t.colors.accent, borderRadius: 4, cursor: "pointer",
              }}
            >
              <Monitor size={13} />
              Export MacBook PNG
            </button>
            <div style={{ display: "flex", gap: 5, marginTop: 5 }}>
              <SBtn onClick={onExportCpp} icon={Download} label=".cpp" color={t.colors.accent} t={t} small />
              <SBtn onClick={onExportPDF} icon={FileText} label="PDF" color={t.colors.accent} t={t} small />
            </div>
          </Sec>

          {/* Mutation engine */}
          <Sec title="⬡ Mutation Engine v3" t={t}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              {mutationEnabled ? <Unlock size={11} style={{ color: t.colors.accent }} /> : <Lock size={11} style={{ color: t.colors.label }} />}
              <span style={{ fontSize: 10, flex: 1, color: t.colors.label }}>{mutationEnabled ? "Stealth: ACTIVE" : "Stealth: LOCKED"}</span>
              <Toggle on={mutationEnabled} onChange={setMutationEnabled} t={t} />
            </div>
            <p style={{ fontSize: 9, color: t.colors.label, lineHeight: "13px" }}>
              11-stage anti-MOSS pipeline: variable substitution, loop transforms, noise structs, dead-code injection.
            </p>
          </Sec>

          {/* Console toggle */}
          <Sec title="⬡ Console" t={t}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Terminal size={11} style={{ color: t.colors.label }} />
              <span style={{ fontSize: 10, flex: 1, color: t.colors.label }}>{consoleOpen ? "Floating console: ON" : "Floating console: OFF"}</span>
              <Toggle on={consoleOpen} onChange={setConsoleOpen} t={t} />
            </div>
          </Sec>

          {/* Theme engine */}
          <Sec title="⬡ Theme Engine" t={t}>
            {Object.values(themes).map((th) => (
              <button
                key={th.id}
                onClick={() => setThemeKey(th.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "5px 8px",
                  background: themeKey === th.id ? `${th.colors.accent}15` : "transparent",
                  border: `1px solid ${themeKey === th.id ? th.colors.accent : "transparent"}`,
                  color: themeKey === th.id ? t.colors.accent : t.colors.label,
                  borderRadius: 4, cursor: "pointer", fontSize: 10, marginBottom: 2, textAlign: "left",
                  fontFamily: t.font,
                }}
              >
                <span>{th.icon}</span>
                <span>{th.label}</span>
                {themeKey === th.id && <CheckCircle size={9} style={{ marginLeft: "auto", color: t.colors.accent }} />}
              </button>
            ))}
          </Sec>

          {/* Status bottom */}
          <div style={{ marginTop: "auto", padding: "6px 12px", borderTop: `1px solid ${t.colors.border}`, display: "flex", alignItems: "center", gap: 6, fontSize: 10 }}>
            {buildStatus === "ok" && <><div style={{ width: 6, height: 6, borderRadius: "50%", background: t.colors.statusOk }} className="pulse-ok" /><span style={{ color: t.colors.statusOk }}>Build OK</span></>}
            {buildStatus === "error" && <span style={{ color: t.colors.statusErr }}>✗ Error</span>}
            {!buildStatus && <span style={{ color: t.colors.label }}>Ready</span>}
            <span style={{ marginLeft: "auto", color: t.colors.label }}>{code.split("\n").length} ln</span>
          </div>
        </aside>

        {/* ── Editor ───────────────────────────────────────────────────── */}
        <EditorPanel code={code} onChange={setCode} />
      </div>
    </div>
  );
}
