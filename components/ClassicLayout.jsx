"use client";
import { useState, useRef } from "react";
import { useTheme, THEMES } from "./ThemeProvider";
import EditorPanel from "./Editor";
import ClassicBottomPanel from "./ClassicBottomPanel";

// ── Classic icon toolbar buttons ──────────────────────────────────────────────
const TOOLBAR_GROUPS = [
  [
    { icon: "📄", label: "New",       key: "new"   },
    { icon: "📂", label: "Open",      key: "open"  },
    { icon: "💾", label: "Save",      key: "save"  },
    { icon: "🖨",  label: "Print",     key: "print" },
  ],
  [
    { icon: "✂️", label: "Cut",       key: "cut"   },
    { icon: "📋", label: "Copy",      key: "copy"  },
    { icon: "📌", label: "Paste",     key: "paste" },
  ],
  [
    { icon: "↩", label: "Undo",      key: "undo"  },
    { icon: "↪", label: "Redo",      key: "redo"  },
  ],
  [
    { icon: "🔍", label: "Find",      key: "find"  },
    { icon: "📖", label: "Replace",   key: "repl"  },
  ],
  [
    { icon: "⚙️", label: "Compile",   key: "compile",  accent: true  },
    { icon: "▶",  label: "Run",       key: "run",      accent: true  },
    { icon: "🔄", label: "Rebuild",   key: "rebuild",  accent: true  },
    { icon: "⏹",  label: "Stop",      key: "stop"  },
    { icon: "🔎", label: "Syntax Check", key: "syntax" },
  ],
  [
    { icon: "🐛", label: "Debug",     key: "debug"     },
    { icon: "⏯",  label: "Next Step", key: "step"      },
  ],
];

const MENU_ITEMS = [
  { label: "File",    items: ["New", "Open…", "Save", "Save As…", "---", "Print…", "---", "Exit"] },
  { label: "Edit",    items: ["Undo", "Redo", "---", "Cut", "Copy", "Paste", "Select All", "---", "Find…", "Replace…", "Go to Line…"] },
  { label: "Search",  items: ["Find…", "Replace…", "Find in Files…"] },
  { label: "View",    items: ["Editor Only", "Full Screen", "---", "Classic Dev-C++ 5.11", "Midnight Engineering", "Neon Hacker"] },
  { label: "Project", items: ["New Project…", "Open Project…", "---", "Project Properties…"] },
  { label: "Execute", items: ["Compile (F9)", "Run (F10)", "Build & Run (F11)", "---", "Rebuild All"] },
  { label: "Tools",   items: ["Editor Options…", "Compiler Options…", "---", "Student Profile…"] },
  { label: "Window",  items: ["Next", "Previous", "---", "Close All"] },
  { label: "Help",    items: ["Help Topics", "Check for Updates…", "---", "About Dev-Cloud Pro v3"] },
];

export default function ClassicLayout({
  code, setCode, buildStatus, isRunning, output,
  onBuild, onExecute, onBuildAndRun, onRandomize, onReset,
  onExportCpp, onExportPDF, onMacExport, onOpenProfile,
  mutationEnabled, setMutationEnabled,
}) {
  const { themeKey, setThemeKey } = useTheme();
  const [openMenu, setOpenMenu] = useState(null);
  const [activeBtn, setActiveBtn] = useState(null);
  const menuRef = useRef(null);

  const handleMenuClick = (label, item) => {
    setOpenMenu(null);
    if (item === "---") return;
    if (item === "Student Profile…") { onOpenProfile(); return; }
    if (item === "Classic Dev-C++ 5.11") { setThemeKey("classic"); return; }
    if (item === "Midnight Engineering") { setThemeKey("midnight"); return; }
    if (item === "Neon Hacker")          { setThemeKey("neon");     return; }
    if (item === "Compile (F9)")         { onBuild(); return; }
    if (item === "Run (F10)")            { onExecute(); return; }
    if (item === "Build & Run (F11)")    { onBuildAndRun(); return; }
    if (item === "Rebuild All")          { onRandomize(); return; }
  };

  const handleToolbarBtn = (key) => {
    setActiveBtn(key);
    setTimeout(() => setActiveBtn(null), 180);
    if (key === "compile") { onBuild(); return; }
    if (key === "run")     { onExecute(); return; }
    if (key === "rebuild") { onBuildAndRun(); return; }
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#ece9d8", fontFamily: "Tahoma, 'Segoe UI', Arial, sans-serif", userSelect: "none" }}
      onClick={() => setOpenMenu(null)}
    >
      {/* ── Title bar ────────────────────────────────────────────────── */}
      <div className="win-header flex items-center justify-between px-2 select-none" style={{ height: 28, flexShrink: 0 }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 14 }}>⬡</span>
          <span style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
            Dev-Cloud Pro v3 — main.cpp
          </span>
        </div>
        <div className="flex items-center gap-1">
          {["─", "□", "✕"].map((c, i) => (
            <button
              key={i}
              onClick={i === 2 ? () => {} : undefined}
              className="win-btn flex items-center justify-center"
              style={{ width: 18, height: 18, fontSize: 12, fontWeight: "bold" }}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* ── Menu bar ─────────────────────────────────────────────────── */}
      <div
        style={{ background: "#d4d0c8", borderBottom: "1px solid #919b9c", height: 22, display: "flex", alignItems: "center", paddingLeft: 4, flexShrink: 0, position: "relative", zIndex: 200 }}
        onClick={(e) => e.stopPropagation()}
      >
        {MENU_ITEMS.map(({ label, items }) => (
          <div key={label} style={{ position: "relative" }}>
            <button
              className="win-menu-item"
              onClick={() => setOpenMenu(openMenu === label ? null : label)}
              style={{ background: openMenu === label ? "#0a246a" : "transparent", color: openMenu === label ? "#fff" : "#000" }}
            >
              {label}
            </button>
            {openMenu === label && (
              <div
                className="win-raised"
                style={{
                  position: "absolute", top: "100%", left: 0,
                  background: "#d4d0c8", border: "1px solid #919b9c",
                  minWidth: 180, zIndex: 9999, boxShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                {items.map((item, i) =>
                  item === "---" ? (
                    <div key={i} style={{ height: 1, background: "#919b9c", margin: "2px 4px" }} />
                  ) : (
                    <button
                      key={i}
                      className="win-menu-item"
                      style={{ display: "block", width: "100%", textAlign: "left", background: "transparent" }}
                      onClick={() => handleMenuClick(label, item)}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Icon Toolbar (Row 2) ──────────────────────────────────────── */}
      <div
        className="win-raised"
        style={{ background: "#d4d0c8", borderBottom: "1px solid #919b9c", height: 32, display: "flex", alignItems: "center", paddingLeft: 4, gap: 2, flexShrink: 0, flexWrap: "wrap" }}
      >
        {TOOLBAR_GROUPS.map((group, gi) => (
          <div key={gi} className="flex items-center">
            {gi > 0 && <div className="win-separator" />}
            {group.map(({ icon, label, key, accent }) => (
              <button
                key={key}
                className="win-toolbar-btn"
                title={label}
                onClick={() => handleToolbarBtn(key)}
                style={{
                  background: activeBtn === key ? "#bbb8b0" : (accent && (key === "compile" || key === "run") ? "#dce8ff" : "transparent"),
                  borderColor: activeBtn === key ? "#919b9c" : "transparent",
                }}
              >
                <span style={{ fontSize: 14, lineHeight: 1 }}>{icon}</span>
              </button>
            ))}
          </div>
        ))}

        <div style={{ flex: 1 }} />

        {/* MacBook Export button — prominent */}
        <button
          className="win-btn flex items-center gap-1.5 px-3"
          style={{ height: 22, fontSize: 11, fontWeight: "bold", background: "#dce8ff", borderColor: "#0a246a", color: "#0a246a", marginRight: 4 }}
          onClick={onMacExport}
        >
          💻 MacBook Export
        </button>

        {/* Mutation toggle */}
        <div className="flex items-center gap-1 mr-2">
          <span style={{ fontSize: 10, color: "#333" }}>Stealth:</span>
          <button
            className="win-btn px-2"
            style={{ height: 20, fontSize: 10, background: mutationEnabled ? "#dce8ff" : "#d4d0c8", color: mutationEnabled ? "#0a246a" : "#555" }}
            onClick={() => setMutationEnabled(v => !v)}
          >
            {mutationEnabled ? "ON" : "OFF"}
          </button>
        </div>

        {/* Student Profile button */}
        <button
          className="win-btn flex items-center gap-1 px-2 mr-2"
          style={{ height: 20, fontSize: 10 }}
          onClick={onOpenProfile}
        >
          👤 Profile
        </button>
      </div>

      {/* ── Main editor area ──────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <EditorPanel code={code} onChange={setCode} />
      </div>

      {/* ── Bottom tabbed panel ───────────────────────────────────────── */}
      <ClassicBottomPanel output={output} buildStatus={buildStatus} />

      {/* ── Status bar ───────────────────────────────────────────────── */}
      <div
        className="win-inset"
        style={{ height: 20, background: "#d4d0c8", borderTop: "1px solid #919b9c", display: "flex", alignItems: "center", padding: "0 6px", gap: 6, flexShrink: 0 }}
      >
        {[
          isRunning ? "Executing…" : buildStatus === "ok" ? "Build successful" : buildStatus === "error" ? "Build error" : "Ready",
          "C++ 17",
          "GCC 11.2",
          `${code.split("\n").length} lines`,
        ].map((item, i, arr) => (
          <div key={i} className="flex items-center gap-6">
            <span style={{ fontSize: 10, color: buildStatus === "error" ? "#cc0000" : "#000", fontFamily: "Tahoma, sans-serif" }}>
              {item}
            </span>
            {i < arr.length - 1 && <div className="win-separator" />}
          </div>
        ))}
      </div>
    </div>
  );
}
