"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Minus,
  Maximize2,
  Minimize2,
  Terminal,
  Trash2,
  Play,
  Copy,
  CheckCheck,
  GripVertical,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

// ─── ANSI-like colour mapping for console output ───────────────────────────────
function colourLine(line, theme) {
  if (line.startsWith("[Dev-Cloud")) return { color: theme.colors.accent, fontWeight: 600 };
  if (line.startsWith("✓") || line.includes("successful")) return { color: theme.colors.statusOk };
  if (line.startsWith("✗") || line.toLowerCase().includes("error")) return { color: theme.colors.statusErr };
  if (line.startsWith(">")) return { color: theme.id === "neon" ? "#9999ff" : "#8b949e" };
  if (line.startsWith("─")) return { color: theme.colors.label, opacity: 0.5 };
  if (line.startsWith("Name:") || line.startsWith("ID:") || line.startsWith("Student:")) {
    return { color: theme.colors.accent, fontWeight: 600 };
  }
  return { color: theme.colors.consoleText };
}

// ─── Floating Console Component ───────────────────────────────────────────────
export default function FloatingConsole({ open, onClose, output, isRunning, onClear, onExecute }) {
  const { theme } = useTheme();
  const t = theme;

  // Position & size state
  const [pos, setPos] = useState({ x: 80, y: 80 });
  const [size, setSize] = useState({ w: 680, h: 340 });
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [prevState, setPrevState] = useState(null);
  const [copied, setCopied] = useState(false);

  // Drag state
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Resize state
  const resizing = useRef(false);
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const consoleRef = useRef(null);
  const outputRef = useRef(null);

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // ── Drag handlers ────────────────────────────────────────────────────────
  const onDragStart = useCallback((e) => {
    if (maximized) return;
    dragging.current = true;
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    e.preventDefault();
  }, [pos, maximized]);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      setPos({
        x: Math.max(0, e.clientX - dragOffset.current.x),
        y: Math.max(0, e.clientY - dragOffset.current.y),
      });
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // ── Resize handlers ──────────────────────────────────────────────────────
  const onResizeStart = useCallback((e) => {
    resizing.current = true;
    resizeStart.current = { x: e.clientX, y: e.clientY, w: size.w, h: size.h };
    e.stopPropagation();
    e.preventDefault();
  }, [size]);

  useEffect(() => {
    const onMove = (e) => {
      if (!resizing.current) return;
      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;
      setSize({
        w: Math.max(400, resizeStart.current.w + dx),
        h: Math.max(200, resizeStart.current.h + dy),
      });
    };
    const onUp = () => { resizing.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // ── Maximize / Restore ───────────────────────────────────────────────────
  const toggleMaximize = () => {
    if (!maximized) {
      setPrevState({ pos: { ...pos }, size: { ...size } });
      setPos({ x: 0, y: 0 });
      setSize({ w: window.innerWidth - 260, h: window.innerHeight - 40 });
      setMaximized(true);
    } else {
      if (prevState) {
        setPos(prevState.pos);
        setSize(prevState.size);
      }
      setMaximized(false);
    }
  };

  // ── Copy output ──────────────────────────────────────────────────────────
  const handleCopy = () => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Glass styles by theme ────────────────────────────────────────────────
  const glassStyle = (() => {
    switch (t.id) {
      case "classic":
        return {
          background: "rgba(236, 233, 216, 0.93)",
          border: "2px solid #0a246a55",
          boxShadow: "4px 4px 0 rgba(0,0,0,0.2), inset 1px 1px 0 rgba(255,255,255,0.7)",
        };
      case "midnight":
        return {
          background: "rgba(13, 17, 23, 0.88)",
          border: "1px solid rgba(88, 166, 255, 0.2)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(88,166,255,0.08)",
        };
      case "neon":
        return {
          background: "rgba(8, 8, 16, 0.92)",
          border: "1px solid rgba(0, 255, 136, 0.25)",
          boxShadow: "0 0 40px rgba(0,255,136,0.12), 0 24px 48px rgba(0,0,0,0.7), inset 0 0 40px rgba(0,255,136,0.03)",
        };
      default:
        return {};
    }
  })();

  const titleBarStyle = (() => {
    switch (t.id) {
      case "classic":
        return {
          background: "linear-gradient(180deg, #1a3da0 0%, #0a246a 100%)",
          borderBottom: "1px solid #0a246a",
        };
      case "midnight":
        return {
          background: "#161b22",
          borderBottom: `1px solid ${t.colors.border}`,
        };
      case "neon":
        return {
          background: "linear-gradient(90deg, #0d0d1a 0%, #0a0a16 100%)",
          borderBottom: "1px solid rgba(0,255,136,0.2)",
        };
      default:
        return {};
    }
  })();

  const outputLines = output.split("\n");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={consoleRef}
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 20 }}
          transition={{ type: "spring", damping: 28, stiffness: 380 }}
          style={{
            position: "fixed",
            left: pos.x,
            top: pos.y,
            width: minimized ? 280 : size.w,
            height: minimized ? "auto" : size.h,
            zIndex: 1000,
            fontFamily: t.font,
            borderRadius: t.id === "classic" ? 0 : 8,
            overflow: "hidden",
            ...glassStyle,
          }}
          className={`${t.glassClass}`}
        >
          {/* ── Title Bar (Drag Handle) ──────────────────────────────── */}
          <div
            className="drag-handle flex items-center gap-2 px-3 select-none flex-shrink-0"
            style={{ height: 36, ...titleBarStyle }}
            onMouseDown={onDragStart}
          >
            {/* Traffic light / window controls */}
            <div className="flex items-center gap-1.5">
              {/* Close */}
              <button
                onClick={onClose}
                className="w-3 h-3 rounded-full flex items-center justify-center group transition-all"
                style={{ background: "#ff5f57" }}
                title="Close"
              >
                <X size={6} className="opacity-0 group-hover:opacity-100 text-[#6e0000]" />
              </button>
              {/* Minimise */}
              <button
                onClick={() => setMinimized((v) => !v)}
                className="w-3 h-3 rounded-full flex items-center justify-center group transition-all"
                style={{ background: "#ffbd2e" }}
                title={minimized ? "Restore" : "Minimise"}
              >
                <Minus size={6} className="opacity-0 group-hover:opacity-100 text-[#6e4000]" />
              </button>
              {/* Maximise */}
              <button
                onClick={toggleMaximize}
                className="w-3 h-3 rounded-full flex items-center justify-center group transition-all"
                style={{ background: "#28c840" }}
                title={maximized ? "Restore" : "Maximise"}
              >
                <Maximize2 size={5} className="opacity-0 group-hover:opacity-100 text-[#004400]" />
              </button>
            </div>

            {/* Title */}
            <div className="flex items-center gap-1.5 ml-1">
              <Terminal size={11} style={{ color: t.colors.accent }} />
              <span
                className="text-[11px] font-semibold tracking-[0.06em]"
                style={{ color: t.id === "classic" ? "#fff" : t.colors.accent }}
              >
                Dev-Cloud Terminal
              </span>
              {isRunning && (
                <div className="flex items-center gap-1 ml-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: t.colors.statusOk }}
                  />
                  <span className="text-[9px]" style={{ color: t.colors.statusOk }}>
                    RUNNING
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1" />

            {/* Action buttons */}
            {!minimized && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  title="Copy output"
                  className="p-1 rounded transition-all hover:opacity-70"
                  style={{ color: t.id === "classic" ? "#cce" : t.colors.label }}
                >
                  {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
                </button>
                <button
                  onClick={onClear}
                  title="Clear console"
                  className="p-1 rounded transition-all hover:opacity-70"
                  style={{ color: t.id === "classic" ? "#cce" : t.colors.label }}
                >
                  <Trash2 size={12} />
                </button>
                <button
                  onClick={onExecute}
                  disabled={isRunning}
                  title="Execute"
                  className="p-1 rounded transition-all hover:opacity-70 disabled:opacity-40"
                  style={{ color: t.id === "classic" ? "#cce" : t.colors.accent }}
                >
                  <Play size={12} />
                </button>
              </div>
            )}

            {/* Grip indicator */}
            <GripVertical size={12} style={{ color: t.id === "classic" ? "#889" : t.colors.label, opacity: 0.4 }} />
          </div>

          {/* ── Console Output ───────────────────────────────────────── */}
          {!minimized && (
            <>
              {/* Path bar */}
              <div
                className="flex items-center gap-2 px-3 py-1 text-[10px]"
                style={{
                  background: t.id === "classic" ? "#000080" : t.colors.console,
                  borderBottom: `1px solid ${t.colors.border}`,
                  color: t.id === "classic" ? "#aaaaff" : t.colors.label,
                  fontFamily: t.font,
                }}
              >
                <span style={{ color: t.colors.statusOk }}>student@dev-cloud</span>
                <span style={{ color: t.colors.label }}>:</span>
                <span style={{ color: t.id === "neon" ? "#9999ff" : "#79c0ff" }}>~/assignment</span>
                <span style={{ color: t.colors.label }}>$</span>
              </div>

              {/* Output area */}
              <div
                ref={outputRef}
                className="overflow-auto p-3"
                style={{
                  background: t.id === "classic" ? "#000080" : t.colors.console,
                  height: `calc(100% - 36px - 28px - 24px)`,
                  fontFamily: t.font,
                  fontSize: 12,
                  lineHeight: "18px",
                }}
              >
                {outputLines.map((line, i) => (
                  <div
                    key={i}
                    className="whitespace-pre-wrap"
                    style={colourLine(line, t)}
                  >
                    {line || " "}
                  </div>
                ))}
                {isRunning && (
                  <span
                    className="console-cursor"
                    style={{ color: t.colors.accent }}
                  />
                )}
              </div>

              {/* Bottom status bar */}
              <div
                className="flex items-center gap-3 px-3 text-[9px] select-none"
                style={{
                  height: 24,
                  background: t.id === "classic" ? "#000080" : t.colors.console,
                  borderTop: `1px solid ${t.colors.border}`,
                  color: t.colors.label,
                  fontFamily: t.font,
                }}
              >
                <span style={{ color: t.colors.accent }}>Judge0 CE</span>
                <span>·</span>
                <span>C++17</span>
                <span>·</span>
                <span>GCC 11.2</span>
                <div className="flex-1" />
                <span>{outputLines.length} lines</span>
              </div>

              {/* Resize handle */}
              <div
                className="resize-handle"
                onMouseDown={onResizeStart}
                style={{
                  borderRight: `3px solid ${t.colors.accent}`,
                  borderBottom: `3px solid ${t.colors.accent}`,
                  opacity: 0.35,
                }}
              />
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
