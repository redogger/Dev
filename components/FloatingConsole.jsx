"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Maximize2, Terminal, Trash2, Play, Copy, CheckCheck, GripHorizontal } from "lucide-react";
import { useTheme } from "./ThemeProvider";

// ── Colour-code output lines ──────────────────────────────────────────────────
function lineStyle(line, t) {
  if (line.startsWith("[Dev-Cloud")) return { color: t.colors.accent, fontWeight: 600 };
  if (line.startsWith("✓") || line.includes("successful")) return { color: t.colors.statusOk };
  if (line.startsWith("✗") || line.toLowerCase().includes("error")) return { color: t.colors.statusErr };
  if (line.startsWith(">")) return { color: t.colors.textMuted };
  if (line.startsWith("─")) return { color: t.colors.textMuted, opacity: 0.4 };
  if (/^(Name|ID|Student):/.test(line)) return { color: t.colors.accent, fontWeight: 700 };
  return { color: t.colors.consoleText };
}

export default function FloatingConsole({ open, onClose, output, isRunning, onClear, onExecute }) {
  const { theme: t } = useTheme();

  const [pos,  setPos]  = useState({ x: 60, y: 70 });
  const [size, setSize] = useState({ w: 620, h: 320 });
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [prevSnap,  setPrevSnap]  = useState(null);
  const [copied, setCopied] = useState(false);
  const [active, setActive] = useState(false); // pointer-events toggle

  const outputRef   = useRef(null);
  // Drag refs (pointer-events based — works on touch too)
  const dragRef  = useRef({ active: false, startX: 0, startY: 0, origX: 0, origY: 0 });
  const resizeRef = useRef({ active: false, startX: 0, startY: 0, origW: 0, origH: 0 });

  // Auto-scroll
  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [output]);

  // ── Pointer-Event Drag ────────────────────────────────────────────────────
  const onDragPointerDown = useCallback((e) => {
    if (maximized) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { active: true, startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    setActive(true);
    e.preventDefault();
  }, [pos, maximized]);

  const onDragPointerMove = useCallback((e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPos({ x: Math.max(0, dragRef.current.origX + dx), y: Math.max(0, dragRef.current.origY + dy) });
  }, []);

  const onDragPointerUp = useCallback((e) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragRef.current.active = false;
    setActive(false);
  }, []);

  // ── Pointer-Event Resize ──────────────────────────────────────────────────
  const onResizePointerDown = useCallback((e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    resizeRef.current = { active: true, startX: e.clientX, startY: e.clientY, origW: size.w, origH: size.h };
    e.stopPropagation(); e.preventDefault();
  }, [size]);

  const onResizePointerMove = useCallback((e) => {
    if (!resizeRef.current.active) return;
    const dx = e.clientX - resizeRef.current.startX;
    const dy = e.clientY - resizeRef.current.startY;
    setSize({ w: Math.max(340, resizeRef.current.origW + dx), h: Math.max(180, resizeRef.current.origH + dy) });
  }, []);

  const onResizePointerUp = useCallback((e) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    resizeRef.current.active = false;
  }, []);

  // ── Maximise ──────────────────────────────────────────────────────────────
  const toggleMax = () => {
    if (!maximized) {
      setPrevSnap({ pos: { ...pos }, size: { ...size } });
      setPos({ x: 0, y: 0 });
      setSize({ w: Math.max(600, window.innerWidth - 260), h: window.innerHeight - 48 });
      setMaximized(true);
    } else {
      if (prevSnap) { setPos(prevSnap.pos); setSize(prevSnap.size); }
      setMaximized(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Glass styles per theme ────────────────────────────────────────────────
  const containerStyle = (() => {
    if (t.isClassic) return {
      background: "rgba(236,233,216,0.96)",
      border: "2px solid #0a246a44",
      boxShadow: "4px 4px 12px rgba(0,0,0,0.35), inset 1px 1px 0 rgba(255,255,255,0.8)",
    };
    if (t.id === "neon") return {
      background: "rgba(8,8,16,0.94)",
      border: "1px solid rgba(0,255,136,0.28)",
      boxShadow: "0 0 50px rgba(0,255,136,0.1), 0 24px 56px rgba(0,0,0,0.9)",
    };
    return {
      background: "rgba(13,17,23,0.9)",
      border: "1px solid rgba(88,166,255,0.18)",
      boxShadow: "0 24px 56px rgba(0,0,0,0.7)",
    };
  })();

  const titleBarStyle = (() => {
    if (t.isClassic) return { background: "linear-gradient(180deg,#3169c4,#0a246a)", borderBottom: "1px solid #0a246a" };
    if (t.id === "neon") return { background: "linear-gradient(90deg,#0d0d1a,#090912)", borderBottom: "1px solid rgba(0,255,136,0.2)" };
    return { background: "#161b22", borderBottom: "1px solid #30363d" };
  })();

  const BR = t.isClassic ? 0 : 10;
  const outputLines = (output || "").split("\n");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 12 }}
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          // pointer-events: none when idle — doesn't block editor underneath
          className={active || minimized === false ? "console-active" : "console-idle"}
          style={{
            position: "fixed",
            left: pos.x,
            top: pos.y,
            width: minimized ? 260 : size.w,
            height: minimized ? "auto" : size.h,
            zIndex: 900,
            borderRadius: BR,
            overflow: "hidden",
            fontFamily: t.monoFont || "'Courier New', monospace",
            ...containerStyle,
            // Always active when hovered
            pointerEvents: "auto",
          }}
          onMouseEnter={() => setActive(true)}
          onMouseLeave={() => setActive(false)}
        >
          {/* ── Title / Drag bar ────────────────────────────────────────── */}
          <div
            className="drag-handle flex items-center gap-2 px-3 select-none"
            style={{ height: 34, ...titleBarStyle, flexShrink: 0 }}
            onPointerDown={onDragPointerDown}
            onPointerMove={onDragPointerMove}
            onPointerUp={onDragPointerUp}
          >
            {/* Traffic lights */}
            <div className="flex items-center gap-1.5">
              {[["#ff5f57", onClose], ["#ffbd2e", () => setMinimized(v => !v)], ["#28c840", toggleMax]].map(([c, fn], i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); fn(); }}
                  style={{ width: 12, height: 12, borderRadius: "50%", background: c, border: "none", cursor: "pointer", flexShrink: 0 }}
                />
              ))}
            </div>

            <Terminal size={11} style={{ color: t.isClassic ? "#aaccff" : t.colors.accent }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: t.isClassic ? "#fff" : t.colors.accent, letterSpacing: "0.05em" }}>
              Dev-Cloud Terminal
            </span>
            {isRunning && (
              <span style={{ fontSize: 9, color: t.colors.statusOk, marginLeft: 4 }} className="animate-pulse-slow">● RUNNING</span>
            )}

            <div style={{ flex: 1 }} />
            {!minimized && (
              <div className="flex items-center gap-1">
                {[
                  [copied ? CheckCheck : Copy, handleCopy, "Copy"],
                  [Trash2, onClear, "Clear"],
                  [Play, onExecute, "Run"],
                ].map(([Icon, fn, label], i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); fn(); }}
                    title={label}
                    style={{ background:"none", border:"none", cursor:"pointer", color: t.isClassic?"#aaccff":t.colors.label, padding: 3 }}
                  >
                    <Icon size={12} />
                  </button>
                ))}
              </div>
            )}
            <GripHorizontal size={12} style={{ color: t.colors.label, opacity: 0.35 }} />
          </div>

          {/* ── Body (hidden when minimised) ────────────────────────────── */}
          {!minimized && (
            <>
              {/* Path bar */}
              <div
                style={{ background: t.isClassic ? "#000080" : t.colors.console, padding: "3px 12px", fontSize: 10, fontFamily: "'Courier New', monospace", display: "flex", gap: 6, flexShrink: 0, borderBottom: `1px solid ${t.colors.border}` }}
              >
                <span style={{ color: t.colors.statusOk }}>student@dev-cloud</span>
                <span style={{ color: t.colors.textMuted }}>:</span>
                <span style={{ color: t.id === "neon" ? "#9999ff" : t.colors.accent }}>~/assignment</span>
                <span style={{ color: t.colors.textMuted }}>$</span>
              </div>

              {/* Output scroll area */}
              <div
                ref={outputRef}
                style={{
                  background: t.isClassic ? "#000080" : t.colors.console,
                  flex: 1,
                  overflowY: "auto",
                  padding: "8px 12px",
                  fontSize: 11.5,
                  lineHeight: "17px",
                  height: `calc(100% - 34px - 25px - 22px)`,
                  fontFamily: "'Courier New', monospace",
                }}
              >
                {outputLines.map((line, i) => (
                  <div key={i} className="whitespace-pre-wrap" style={lineStyle(line, t)}>
                    {line || " "}
                  </div>
                ))}
                {isRunning && <span className="cursor-blink" style={{ color: t.colors.accent }} />}
              </div>

              {/* Status bar */}
              <div
                style={{ background: t.isClassic ? "#000080" : t.colors.console, borderTop: `1px solid ${t.colors.border}`, height: 22, display: "flex", alignItems: "center", padding: "0 12px", gap: 8, fontSize: 9, fontFamily: "'Courier New', monospace", flexShrink: 0 }}
              >
                <span style={{ color: t.colors.accent }}>Judge0 CE</span>
                <span style={{ color: t.colors.textMuted }}>·</span>
                <span style={{ color: t.colors.textMuted }}>C++17</span>
                <span style={{ color: t.colors.textMuted }}>·</span>
                <span style={{ color: t.colors.textMuted }}>GCC 11.2</span>
                <div style={{ flex: 1 }} />
                <span style={{ color: t.colors.textMuted }}>{outputLines.length} lines</span>
              </div>

              {/* Resize handle — Pointer Events */}
              <div
                style={{
                  position: "absolute", bottom: 0, right: 0,
                  width: 18, height: 18, cursor: "se-resize",
                  borderRight: `3px solid ${t.colors.accent}44`,
                  borderBottom: `3px solid ${t.colors.accent}44`,
                  touchAction: "none",
                }}
                onPointerDown={onResizePointerDown}
                onPointerMove={onResizePointerMove}
                onPointerUp={onResizePointerUp}
              />
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
