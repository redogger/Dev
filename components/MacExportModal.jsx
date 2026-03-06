"use client";
import { useState, useEffect, useRef } from "react";
import { X, Download, Loader, Monitor } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { exportMacBook } from "@/lib/macExport";

export default function MacExportModal({ open, onClose, code, output, studentName, studentId }) {
  const { theme } = useTheme();
  const t = theme;
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Generate preview when modal opens
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    // Defer so modal renders first
    const timer = setTimeout(async () => {
      try {
        const jpeg = await exportMacBook({
          code, output, studentName, studentId,
          themeId: theme.id,
          previewOnly: true,
        });
        setPreview(jpeg);
      } catch (e) {
        console.error("Preview failed:", e);
      } finally {
        setLoading(false);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [open]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportMacBook({
        code, output, studentName, studentId,
        themeId: theme.id,
        previewOnly: false,
      });
    } finally {
      setExporting(false);
    }
  };

  if (!open) return null;

  const isClassic = t.isClassic;

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        className="animate-fade-in"
        style={{
          background: isClassic ? "#d4d0c8" : t.colors.sidebar,
          border: isClassic ? "2px solid #919b9c" : `1px solid ${t.colors.border}`,
          boxShadow: isClassic ? "4px 4px 8px rgba(0,0,0,0.4)" : "0 32px 80px rgba(0,0,0,0.8)",
          borderRadius: isClassic ? 0 : 12,
          width: "min(90vw, 780px)",
          maxHeight: "92vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          fontFamily: t.font,
        }}
      >
        {/* ── Title Bar ─────────────────────────────────────────────────── */}
        {isClassic ? (
          <div className="win-header flex items-center justify-between px-2 py-0.5 select-none flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <Monitor size={12} color="#fff" />
              <span style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>Export to MacBook Assignment</span>
            </div>
            <button onClick={onClose} className="win-btn" style={{ width: 18, height: 18, fontSize: 11 }}>×</button>
          </div>
        ) : (
          <div
            className="flex items-center justify-between px-5 py-3 flex-shrink-0"
            style={{ borderBottom: `1px solid ${t.colors.border}` }}
          >
            <div className="flex items-center gap-2.5">
              <Monitor size={16} style={{ color: t.colors.accent }} />
              <span style={{ color: t.colors.accent, fontSize: 13, fontWeight: 700, letterSpacing: "0.06em" }}>
                EXPORT TO MACBOOK ASSIGNMENT
              </span>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: t.colors.label }}>
              <X size={18} />
            </button>
          </div>
        )}

        {/* ── Specs Banner ──────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-4 px-5 py-2 flex-shrink-0 text-xs"
          style={{ background: isClassic ? "#ece9d8" : t.colors.bg, borderBottom: `1px solid ${t.colors.border}`, color: t.colors.label, fontFamily: "'Courier New', monospace" }}
        >
          <span style={{ color: t.colors.accent }}>MacBook Pro 14"</span>
          <span>·</span>
          <span>3024 × 1964 px</span>
          <span>·</span>
          <span>PNG (Lossless)</span>
          <span>·</span>
          <span style={{ color: t.colors.statusOk }}>Retina Ready</span>
        </div>

        {/* ── Preview ───────────────────────────────────────────────────── */}
        <div
          className="flex-1 overflow-auto flex items-center justify-center p-4"
          style={{ background: isClassic ? "#c0c0c0" : "#050505", minHeight: 300 }}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader size={28} className="animate-spin" style={{ color: t.colors.accent }} />
              <span style={{ color: t.colors.label, fontSize: 12 }}>Rendering MacBook frame…</span>
            </div>
          ) : preview ? (
            <div style={{ position: "relative", display: "inline-block" }}>
              <img
                src={preview}
                alt="MacBook Export Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "55vh",
                  borderRadius: 8,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.9)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  fontSize: 9,
                  padding: "2px 6px",
                  borderRadius: 3,
                  fontFamily: "monospace",
                }}
              >
                PREVIEW (scaled)
              </div>
            </div>
          ) : (
            <div style={{ color: t.colors.label, fontSize: 12 }}>Preview unavailable — click Export to download</div>
          )}
        </div>

        {/* ── Student info strip ─────────────────────────────────────────── */}
        <div
          className="px-5 py-2 flex-shrink-0 flex items-center gap-4 text-xs"
          style={{ borderTop: `1px solid ${t.colors.border}`, color: t.colors.label, fontFamily: "'Courier New', monospace" }}
        >
          <span>Student: <span style={{ color: t.colors.text }}>{studentName || "—"}</span></span>
          <span>ID: <span style={{ color: t.colors.text }}>{studentId || "—"}</span></span>
          <span>Theme: <span style={{ color: t.colors.accent }}>{t.label}</span></span>
        </div>

        {/* ── Actions ───────────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
          style={{ borderTop: `1px solid ${t.colors.border}` }}
        >
          {isClassic ? (
            <>
              <button
                className="win-btn flex items-center gap-2 px-5 py-1.5 text-xs font-bold"
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? <Loader size={11} className="animate-spin" /> : <Download size={11} />}
                {exporting ? "Exporting…" : "Export PNG"}
              </button>
              <button className="win-btn px-4 py-1.5 text-xs" onClick={onClose}>Close</button>
            </>
          ) : (
            <>
              <button
                onClick={handleExport}
                disabled={exporting}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "9px 24px",
                  background: t.colors.accent, color: t.colors.bg, border: "none",
                  borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer",
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  opacity: exporting ? 0.6 : 1,
                }}
              >
                {exporting ? <Loader size={13} className="animate-spin" /> : <Download size={13} />}
                {exporting ? "Exporting…" : "Download MacBook PNG"}
              </button>
              <button
                onClick={onClose}
                style={{ padding: "9px 16px", background: t.colors.btnBg, color: t.colors.btnText, border: `1px solid ${t.colors.border}`, borderRadius: 6, fontSize: 12, cursor: "pointer" }}
              >
                Close
              </button>
              <span style={{ marginLeft: "auto", fontSize: 10, color: t.colors.label }}>
                Full 3024×1964 PNG ready for grading
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
