"use client";
import { useEffect, useRef } from "react";
import { X, User, Hash, Save } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function StudentProfileModal({ open, onClose, name, setName, id, setId }) {
  const { theme } = useTheme();
  const t = theme;
  const nameRef = useRef(null);

  useEffect(() => { if (open) setTimeout(() => nameRef.current?.focus(), 80); }, [open]);
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const isClassic = t.isClassic;

  // Classic Win-style modal
  const modalStyle = isClassic ? {
    background: "#d4d0c8",
    border: "2px solid #919b9c",
    boxShadow: "4px 4px 8px rgba(0,0,0,0.4), inset 1px 1px 0 #fff",
    width: 340,
    fontFamily: "Tahoma, 'Segoe UI', Arial, sans-serif",
  } : {
    background: t.colors.sidebar,
    border: `1px solid ${t.colors.border}`,
    boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
    width: 360,
    borderRadius: 10,
    fontFamily: t.font,
  };

  const inputStyle = {
    width: "100%",
    background: t.colors.inputBg,
    border: isClassic ? "2px inset #919b9c" : `1px solid ${t.colors.inputBorder}`,
    color: t.colors.text,
    padding: "6px 10px",
    fontSize: 12,
    fontFamily: t.monoFont || "'Courier New', monospace",
    outline: "none",
    borderRadius: isClassic ? 0 : 4,
  };

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modalStyle} className="animate-slide-up overflow-hidden">
        {/* Title bar */}
        {isClassic ? (
          <div className="win-header flex items-center justify-between px-2 py-0.5 select-none">
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: 12 }}>👤</span>
              <span style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>Student Profile</span>
            </div>
            <button
              onClick={onClose}
              className="win-btn flex items-center justify-center"
              style={{ width: 18, height: 18, fontSize: 11, fontWeight: "bold" }}
            >×</button>
          </div>
        ) : (
          <div
            className="flex items-center justify-between px-4 py-3 select-none"
            style={{ borderBottom: `1px solid ${t.colors.border}` }}
          >
            <div className="flex items-center gap-2">
              <User size={14} style={{ color: t.colors.accent }} />
              <span style={{ color: t.colors.accent, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em" }}>
                STUDENT PROFILE
              </span>
            </div>
            <button onClick={onClose} style={{ color: t.colors.label, cursor: "pointer", background: "none", border: "none" }}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-5 space-y-4">
          <p style={{ fontSize: 11, color: t.colors.textMuted, lineHeight: "16px", marginBottom: 8 }}>
            Your credentials will be automatically injected into every build as the first lines of{" "}
            <code style={{ color: t.colors.accent, fontSize: 10 }}>int main()</code>.
          </p>

          {/* Name */}
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: t.colors.label, marginBottom: 5, textTransform: "uppercase" }}>
              Full Name
            </label>
            <div className="flex items-center gap-2">
              <User size={13} style={{ color: t.colors.accent, flexShrink: 0 }} />
              <input
                ref={nameRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alice Johnson"
                style={inputStyle}
                className={isClassic ? "classic-input" : ""}
              />
            </div>
          </div>

          {/* ID */}
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: t.colors.label, marginBottom: 5, textTransform: "uppercase" }}>
              Student ID
            </label>
            <div className="flex items-center gap-2">
              <Hash size={13} style={{ color: t.colors.accent, flexShrink: 0 }} />
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="e.g. CS-2024-0042"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Preview snippet */}
          {(name || id) && (
            <div style={{ background: t.colors.editor, border: `1px solid ${t.colors.border}`, borderRadius: 4, padding: "8px 10px" }}>
              <p style={{ fontSize: 9, color: t.colors.label, marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>Preview Injection:</p>
              <pre style={{ fontSize: 10, color: t.colors.accent, fontFamily: "'Courier New', monospace", lineHeight: "16px", margin: 0 }}>
{`cout << "Name: " << "${name || "Student"}" << "\\n"`}
{`     << "ID: "   << "${id   || "000000"}" << endl;`}
              </pre>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            {isClassic ? (
              <>
                <button className="win-btn flex items-center gap-1.5 px-4 py-1 text-xs" onClick={onClose}>
                  <Save size={11} /> Save &amp; Close
                </button>
                <button className="win-btn flex items-center gap-1.5 px-4 py-1 text-xs" onClick={onClose}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  style={{ flex: 1, padding: "8px 0", background: t.colors.accent, color: t.colors.bg, border: "none", borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase" }}
                >
                  Save &amp; Close
                </button>
                <button
                  onClick={onClose}
                  style={{ padding: "8px 14px", background: t.colors.btnBg, color: t.colors.btnText, border: `1px solid ${t.colors.border}`, borderRadius: 5, fontSize: 11, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
