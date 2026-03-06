"use client";

import { useRef, useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";
import dynamic from "next/dynamic";

// Monaco must be dynamically imported (no SSR)
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

// ─── C++ Monaco Language Config ───────────────────────────────────────────────
const CPP_COMPLETIONS = [
  { label: "cout", kind: 14, detail: "Standard output stream", insertText: "cout << " },
  { label: "cin", kind: 14, detail: "Standard input stream", insertText: "cin >> " },
  { label: "endl", kind: 14, detail: "End line + flush", insertText: "endl" },
  { label: "string", kind: 7, detail: "std::string type", insertText: "string " },
  { label: "vector", kind: 7, detail: "std::vector<T>", insertText: "vector<${1:int}> ${2:v};", insertTextRules: 4 },
  { label: "main", kind: 2, detail: "int main() function", insertText: "int main() {\n\t$0\n\treturn 0;\n}" },
  { label: "for loop", kind: 14, detail: "Classic for loop", insertText: "for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t$0\n}", insertTextRules: 4 },
  { label: "while loop", kind: 14, detail: "While loop", insertText: "while (${1:condition}) {\n\t$0\n}", insertTextRules: 4 },
  { label: "if-else", kind: 14, detail: "If-else block", insertText: "if (${1:condition}) {\n\t$0\n} else {\n\t\n}", insertTextRules: 4 },
];

function registerCppExtensions(monaco) {
  // Custom completion provider
  monaco.languages.registerCompletionItemProvider("cpp", {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
      return {
        suggestions: CPP_COMPLETIONS.map((c) => ({ ...c, range })),
      };
    },
  });

  // Hover provider
  monaco.languages.registerHoverProvider("cpp", {
    provideHover: (model, position) => {
      const word = model.getWordAtPosition(position);
      if (!word) return null;
      const docs = {
        cout: "`std::cout` — Standard character output stream. Use with `<<` operator.",
        cin: "`std::cin` — Standard character input stream. Use with `>>` operator.",
        endl: "`std::endl` — Inserts newline and flushes stream buffer.",
        string: "`std::string` — Sequence of characters (dynamic length).",
        vector: "`std::vector<T>` — Dynamic array container from `<vector>`.",
        factorial: "User-defined recursive factorial function.",
      };
      if (docs[word.word]) {
        return {
          range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
          contents: [{ value: docs[word.word] }],
        };
      }
      return null;
    },
  });
}

// ─── Midnight Monaco theme ─────────────────────────────────────────────────────
const MIDNIGHT_THEME = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "comment", foreground: "8b949e", fontStyle: "italic" },
    { token: "keyword", foreground: "ff7b72" },
    { token: "string", foreground: "a5d6ff" },
    { token: "number", foreground: "79c0ff" },
    { token: "type", foreground: "ffa657" },
    { token: "delimiter", foreground: "c9d1d9" },
    { token: "operator", foreground: "ff7b72" },
    { token: "identifier", foreground: "c9d1d9" },
    { token: "function", foreground: "d2a8ff" },
  ],
  colors: {
    "editor.background": "#0d1117",
    "editor.foreground": "#c9d1d9",
    "editor.lineHighlightBackground": "#161b2266",
    "editor.selectionBackground": "#264f78",
    "editorCursor.foreground": "#58a6ff",
    "editorLineNumber.foreground": "#484f58",
    "editorLineNumber.activeForeground": "#8b949e",
    "editorIndentGuide.background": "#21262d",
    "editorIndentGuide.activeBackground": "#30363d",
    "editorGutter.background": "#161b22",
    "scrollbarSlider.background": "#30363d88",
    "scrollbarSlider.hoverBackground": "#30363d",
    "editorWidget.background": "#161b22",
    "editorWidget.border": "#30363d",
    "input.background": "#0d1117",
    "input.border": "#30363d",
  },
};

// ─── Neon Monaco theme ────────────────────────────────────────────────────────
const NEON_THEME = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "comment", foreground: "334466", fontStyle: "italic" },
    { token: "keyword", foreground: "ff00cc" },
    { token: "string", foreground: "00ffcc" },
    { token: "number", foreground: "ffcc00" },
    { token: "type", foreground: "ff6600" },
    { token: "operator", foreground: "ff00cc" },
    { token: "identifier", foreground: "d0d0ff" },
    { token: "function", foreground: "00ff88" },
    { token: "delimiter", foreground: "6688aa" },
  ],
  colors: {
    "editor.background": "#080810",
    "editor.foreground": "#d0d0ff",
    "editor.lineHighlightBackground": "#0d0d1a",
    "editor.selectionBackground": "#00ff8825",
    "editorCursor.foreground": "#00ff88",
    "editorLineNumber.foreground": "#334466",
    "editorLineNumber.activeForeground": "#667799",
    "editorIndentGuide.background": "#0d0d1a",
    "editorIndentGuide.activeBackground": "#00ff8820",
    "editorGutter.background": "#0d0d1a",
    "scrollbarSlider.background": "#00ff8820",
    "scrollbarSlider.hoverBackground": "#00ff8840",
    "editorWidget.background": "#0d0d1a",
    "editorWidget.border": "#00ff8833",
  },
};

// ─── Classic Monaco theme ──────────────────────────────────────────────────────
const CLASSIC_THEME = {
  base: "vs",
  inherit: true,
  rules: [
    { token: "comment", foreground: "006400", fontStyle: "italic" },
    { token: "keyword", foreground: "00008b", fontStyle: "bold" },
    { token: "string", foreground: "a31515" },
    { token: "number", foreground: "098658" },
    { token: "type", foreground: "800080" },
    { token: "operator", foreground: "000000" },
    { token: "function", foreground: "0000aa" },
  ],
  colors: {
    "editor.background": "#ffffff",
    "editor.foreground": "#000000",
    "editor.lineHighlightBackground": "#f5f5f0",
    "editorCursor.foreground": "#000000",
    "editorLineNumber.foreground": "#777777",
    "editorGutter.background": "#e8e6de",
    "editorWidget.background": "#d4d0c8",
    "editorWidget.border": "#999999",
  },
};

// ─── Main Editor Panel ─────────────────────────────────────────────────────────
export default function EditorPanel({ code, onChange }) {
  const { theme } = useTheme();
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [editorReady, setEditorReady] = useState(false);

  function handleEditorWillMount(monaco) {
    monacoRef.current = monaco;

    // Register custom themes
    monaco.editor.defineTheme("midnight-engineering", MIDNIGHT_THEME);
    monaco.editor.defineTheme("neon-hacker", NEON_THEME);
    monaco.editor.defineTheme("classic-dev", CLASSIC_THEME);

    // Register C++ extensions
    registerCppExtensions(monaco);
  }

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    setEditorReady(true);

    // Editor options
    editor.updateOptions({
      fontSize: 13,
      lineHeight: 22,
      letterSpacing: 0.3,
      fontFamily: theme.font,
      fontLigatures: true,
      minimap: { enabled: true, scale: 1 },
      scrollbar: {
        vertical: "visible",
        horizontal: "visible",
        verticalScrollbarSize: 6,
        horizontalScrollbarSize: 6,
      },
      padding: { top: 16, bottom: 16 },
      cursorBlinking: "smooth",
      cursorSmoothCaretAnimation: "on",
      smoothScrolling: true,
      formatOnPaste: true,
      wordWrap: "off",
      tabSize: 4,
      insertSpaces: true,
      renderLineHighlight: "line",
      bracketPairColorization: { enabled: true },
      guides: {
        indentation: true,
        bracketPairs: true,
      },
    });
  }

  // Apply theme when it changes
  useEffect(() => {
    if (!monacoRef.current || !editorReady) return;
    const themeMap = {
      midnight: "midnight-engineering",
      neon: "neon-hacker",
      classic: "classic-dev",
    };
    monacoRef.current.editor.setTheme(themeMap[theme.id] || "midnight-engineering");

    if (editorRef.current) {
      editorRef.current.updateOptions({ fontFamily: theme.font });
    }
  }, [theme.id, editorReady]);

  // Re-format on demand (Ctrl+Shift+F)
  useEffect(() => {
    if (!editorRef.current) return;
    const disposable = editorRef.current.addCommand(
      // Ctrl+Shift+F
      2048 | 1024 | 36,
      () => editorRef.current.getAction("editor.action.formatDocument")?.run()
    );
    return () => disposable?.dispose?.();
  }, [editorReady]);

  const themeMap = {
    midnight: "midnight-engineering",
    neon: "neon-hacker",
    classic: "classic-dev",
  };

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden theme-transition"
      style={{ background: theme.colors.editor }}
    >
      {/* File tab bar */}
      <div
        className="flex items-stretch flex-shrink-0 select-none"
        style={{
          background: theme.colors.sidebar,
          borderBottom: `1px solid ${theme.colors.border}`,
          height: 34,
        }}
      >
        {/* Active file tab */}
        <div
          className="flex items-center gap-2 px-4 text-[11px] font-medium border-r"
          style={{
            background: theme.colors.editor,
            borderBottom: `2px solid ${theme.colors.accent}`,
            borderRight: `1px solid ${theme.colors.border}`,
            color: theme.colors.accent,
            fontFamily: theme.font,
          }}
        >
          <span>📄</span>
          <span>main.cpp</span>
        </div>

        <div className="flex-1" />

        {/* Editor info */}
        <div
          className="flex items-center px-4 gap-4 text-[9px] tracking-widest uppercase"
          style={{ color: theme.colors.label, fontFamily: theme.font }}
        >
          <span>C++17</span>
          <span>UTF-8</span>
          <span>LF</span>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          height="100%"
          language="cpp"
          value={code}
          theme={themeMap[theme.id] || "midnight-engineering"}
          onChange={onChange}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 13,
            lineHeight: 22,
            fontFamily: theme.font,
            fontLigatures: true,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16 },
            tabSize: 4,
            insertSpaces: true,
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>
    </div>
  );
}
