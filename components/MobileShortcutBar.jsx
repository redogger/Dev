"use client";
import { useTheme } from "./ThemeProvider";

const SHORTCUTS = [
  { key: "{",   label: "{" },
  { key: "}",   label: "}" },
  { key: "(",   label: "(" },
  { key: ")",   label: ")" },
  { key: ";",   label: ";" },
  { key: "<<",  label: "<<" },
  { key: ">>",  label: ">>" },
  { key: "->",  label: "->" },
  { key: "::",  label: "::" },
  { key: "[]",  label: "[]" },
  { key: "#include ", label: "#inc" },
  { key: "cout << ", label: "cout" },
  { key: "cin >> ",  label: "cin" },
  { key: "endl",     label: "endl" },
  { key: "\t",       label: "⇥ Tab" },
  { key: "\n",       label: "↵" },
];

export default function MobileShortcutBar({ editorRef }) {
  const { theme: t } = useTheme();

  function insert(text) {
    if (!editorRef?.current) return;
    const editor = editorRef.current;
    const selection = editor.getSelection();
    const id = { major: 1, minor: 1 };
    const op = { identifier: id, range: selection, text, forceMoveMarkers: true };
    editor.executeEdits("shortcut-bar", [op]);
    editor.focus();
  }

  return (
    <div className="shortcut-bar">
      {SHORTCUTS.map((s, i) => (
        <button
          key={i}
          className="shortcut-key"
          onClick={() => insert(s.key)}
          onPointerDown={(e) => { e.preventDefault(); insert(s.key); }}
          style={{
            color: s.key.startsWith("#") || s.key.startsWith("cout") || s.key.startsWith("cin") || s.key === "endl"
              ? t.colors.accent
              : "#c9d1d9",
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
