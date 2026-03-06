"use client";

import { useTheme, THEMES } from "./ThemeProvider";
import {
  Play,
  Zap,
  Shuffle,
  RotateCcw,
  Download,
  FileText,
  Terminal,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Loader,
  ChevronDown,
} from "lucide-react";
import { clsx } from "clsx";

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, children, theme }) {
  return (
    <div
      className="px-3 py-3"
      style={{ borderBottom: `1px solid ${theme.colors.border}` }}
    >
      <p
        className="text-[9px] font-bold tracking-[0.14em] uppercase mb-2.5"
        style={{ color: theme.colors.sectionTitle }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

// ─── Labelled input ───────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, theme }) {
  return (
    <div className="mb-2">
      <label
        className="block text-[9px] tracking-[0.08em] uppercase mb-1"
        style={{ color: theme.colors.label }}
      >
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="sidebar-input w-full px-2 py-1.5 text-[11px] rounded-sm transition-all"
        style={{
          background: theme.colors.inputBg,
          border: `1px solid ${theme.colors.inputBorder}`,
          color: theme.colors.text,
          fontFamily: theme.font,
          outline: "none",
        }}
        onFocus={(e) => (e.target.style.borderColor = theme.colors.accent)}
        onBlur={(e) => (e.target.style.borderColor = theme.colors.inputBorder)}
      />
    </div>
  );
}

// ─── Primary action button ────────────────────────────────────────────────────
function PrimaryBtn({ onClick, disabled, loading, icon: Icon, label, theme }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        "w-full flex items-center justify-center gap-2 py-2 text-[11px] font-bold tracking-[0.08em] uppercase rounded-sm transition-all duration-150",
        (disabled || loading) ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:brightness-110 active:brightness-90"
      )}
      style={{
        background: theme.colors.accent,
        color: theme.id === "classic" ? "#fff" : theme.colors.bg,
        border: `1px solid ${theme.colors.accent}`,
      }}
    >
      {loading ? (
        <Loader size={12} className="animate-spin" />
      ) : (
        <Icon size={12} />
      )}
      {label}
    </button>
  );
}

// ─── Secondary action button ──────────────────────────────────────────────────
function SecBtn({ onClick, disabled, icon: Icon, label, color, theme }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-semibold tracking-[0.06em] uppercase rounded-sm transition-all duration-150",
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:brightness-110 active:brightness-90"
      )}
      style={{
        background: theme.colors.btnBg,
        border: `1px solid ${color || theme.colors.btnBorder}`,
        color: color || theme.colors.btnText,
        fontFamily: theme.font,
      }}
    >
      <Icon size={10} />
      {label}
    </button>
  );
}

// ─── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({ on, onChange, theme }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="relative flex-shrink-0 transition-all"
      style={{
        width: 36,
        height: 18,
        borderRadius: 9,
        background: on ? theme.colors.toggleOn : theme.colors.btnBorder,
        border: "none",
        cursor: "pointer",
        transition: "background 0.2s",
        outline: "none",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: on ? 18 : 2,
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export default function Sidebar({
  studentName, setStudentName,
  studentId, setStudentId,
  mutationEnabled, setMutationEnabled,
  buildStatus, lineCount, isRunning,
  onBuild, onExecute, onBuildAndRun, onRandomize, onReset,
  onExportCpp, onExportPDF,
  consoleOpen, setConsoleOpen,
}) {
  const { theme, themeKey, setThemeKey, themes } = useTheme();
  const t = theme;

  return (
    <aside
      className="flex flex-col flex-shrink-0 overflow-y-auto overflow-x-hidden theme-transition"
      style={{
        width: 258,
        minWidth: 258,
        background: t.colors.sidebar,
        borderRight: `1px solid ${t.colors.border}`,
      }}
    >
      {/* ── Student Identity ──────────────────────────────────────────── */}
      <Section title="⬡ Student Identity" theme={t}>
        <Field
          label="Full Name"
          value={studentName}
          onChange={setStudentName}
          placeholder="e.g. Alice Johnson"
          theme={t}
        />
        <Field
          label="Student ID"
          value={studentId}
          onChange={setStudentId}
          placeholder="e.g. CS-2024-0042"
          theme={t}
        />
      </Section>

      {/* ── Action Center ─────────────────────────────────────────────── */}
      <Section title="⬡ Action Center" theme={t}>
        <div className="space-y-1.5">
          <PrimaryBtn
            onClick={onBuildAndRun}
            loading={isRunning}
            icon={Zap}
            label="Build & Execute"
            theme={t}
          />
          <div className="flex gap-1.5">
            <SecBtn onClick={onBuild} disabled={isRunning} icon={Play} label="Build" theme={t} />
            <SecBtn onClick={onExecute} disabled={isRunning} icon={Terminal} label="Run" theme={t} />
          </div>
          <div className="flex gap-1.5">
            <SecBtn
              onClick={onRandomize}
              icon={Shuffle}
              label="Mutate"
              color={t.colors.accent}
              theme={t}
            />
            <SecBtn onClick={onReset} icon={RotateCcw} label="Reset" theme={t} />
          </div>
        </div>
      </Section>

      {/* ── Mutation Engine ───────────────────────────────────────────── */}
      <Section title="⬡ Mutation Engine v3" theme={t}>
        <div className="flex items-center gap-2 mb-1.5">
          {mutationEnabled ? (
            <Unlock size={11} style={{ color: t.colors.accent }} />
          ) : (
            <Lock size={11} style={{ color: t.colors.label }} />
          )}
          <span className="text-[10px] flex-1" style={{ color: t.colors.label }}>
            {mutationEnabled ? "Uniqueness: ACTIVE" : "Uniqueness: LOCKED"}
          </span>
          <Toggle on={mutationEnabled} onChange={setMutationEnabled} theme={t} />
        </div>
        <p
          className="text-[9px] leading-[13px] mt-1"
          style={{ color: t.colors.label }}
        >
          Randomizes variable names, swaps control flow, and injects dead-code blocks
          on every build to defeat MOSS similarity detection.
        </p>

        {/* Mutation capabilities */}
        <div className="mt-2 space-y-1">
          {[
            "Variable name substitution",
            "for → while loop swap",
            "if-else → switch transform",
            "Struct & helper noise injection",
            "Dead-code block insertion",
          ].map((cap) => (
            <div key={cap} className="flex items-center gap-1.5">
              <div
                className="w-1 h-1 rounded-full flex-shrink-0"
                style={{ background: mutationEnabled ? t.colors.accent : t.colors.label }}
              />
              <span
                className="text-[9px]"
                style={{ color: mutationEnabled ? t.colors.text : t.colors.label }}
              >
                {cap}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Export & Share ────────────────────────────────────────────── */}
      <Section title="⬡ Export & Report" theme={t}>
        <div className="space-y-1.5">
          <SecBtn
            onClick={onExportCpp}
            icon={Download}
            label="Export .cpp"
            color={t.colors.accent}
            theme={t}
          />
          <SecBtn
            onClick={onExportPDF}
            icon={FileText}
            label="PDF Report"
            color={t.colors.accent}
            theme={t}
          />
        </div>
      </Section>

      {/* ── Console Toggle ────────────────────────────────────────────── */}
      <Section title="⬡ Console Window" theme={t}>
        <div className="flex items-center gap-2">
          <Terminal size={11} style={{ color: t.colors.label }} />
          <span className="text-[10px] flex-1" style={{ color: t.colors.label }}>
            {consoleOpen ? "Console: Visible" : "Console: Hidden"}
          </span>
          <Toggle on={consoleOpen} onChange={setConsoleOpen} theme={t} />
        </div>
      </Section>

      {/* ── Theme Engine ──────────────────────────────────────────────── */}
      <Section title="⬡ Theme Engine" theme={t}>
        {Object.values(themes).map((th) => {
          const active = themeKey === th.id;
          return (
            <button
              key={th.id}
              onClick={() => setThemeKey(th.id)}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-left rounded-sm mb-1 transition-all duration-150 cursor-pointer"
              style={{
                background: active ? `${th.colors.accent}18` : "transparent",
                border: `1px solid ${active ? th.colors.accent : "transparent"}`,
                color: active ? t.colors.accent : t.colors.label,
                fontSize: 10,
                fontFamily: t.font,
              }}
            >
              <span>{th.icon}</span>
              <span className="tracking-[0.04em]">{th.label}</span>
              {active && (
                <CheckCircle size={9} className="ml-auto" style={{ color: t.colors.accent }} />
              )}
            </button>
          );
        })}
      </Section>

      {/* ── Status Bar (bottom) ───────────────────────────────────────── */}
      <div className="mt-auto">
        <div
          className="px-3 py-2 flex items-center gap-2 text-[10px]"
          style={{ borderTop: `1px solid ${t.colors.border}` }}
        >
          {buildStatus === "ok" && (
            <>
              <div className="w-1.5 h-1.5 rounded-full status-ok" style={{ background: t.colors.statusOk }} />
              <span style={{ color: t.colors.statusOk }}>Build OK</span>
            </>
          )}
          {buildStatus === "error" && (
            <>
              <XCircle size={10} style={{ color: t.colors.statusErr }} />
              <span style={{ color: t.colors.statusErr }}>Build Error</span>
            </>
          )}
          {!buildStatus && (
            <span style={{ color: t.colors.label }}>Ready</span>
          )}
          <span className="ml-auto" style={{ color: t.colors.label }}>
            {lineCount} ln
          </span>
        </div>
      </div>
    </aside>
  );
}
