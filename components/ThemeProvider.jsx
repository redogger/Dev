"use client";
import { createContext, useContext, useState } from "react";

export const THEMES = {
  classic: {
    id: "classic",
    label: "Classic Dev-C++ 5.11",
    icon: "🖥",
    isClassic: true,
    font: "Tahoma, 'Segoe UI', Arial, sans-serif",
    monoFont: "'Courier New', Courier, monospace",
    monacoTheme: "classic-devcpp",
    colors: {
      bg: "#ece9d8", sidebar: "#d4d0c8", header: "#0a246a",
      headerText: "#fff", editor: "#fff", editorText: "#000",
      console: "#000080", consoleText: "#fff",
      accent: "#0a246a", border: "#919b9c",
      text: "#000", textMuted: "#555", label: "#333",
      btnBg: "#d4d0c8", btnText: "#000",
      inputBg: "#fff", inputBorder: "#808080",
      statusOk: "#006400", statusErr: "#cc0000",
      lineNumBg: "#e8e6de", lineNum: "#777",
      tabActiveBg: "#ece9d8", tabInactiveBg: "#d4d0c8",
      bottomPanel: "#d4d0c8",
    },
  },
  midnight: {
    id: "midnight",
    label: "Midnight Engineering",
    icon: "🌑",
    isClassic: false,
    font: "'JetBrains Mono', 'Fira Code', monospace",
    monoFont: "'JetBrains Mono', monospace",
    monacoTheme: "midnight-eng",
    colors: {
      bg: "#0d1117", sidebar: "#161b22", header: "#161b22",
      headerText: "#58a6ff", editor: "#0d1117", editorText: "#c9d1d9",
      console: "#010409", consoleText: "#3fb950",
      accent: "#58a6ff", border: "#30363d",
      text: "#c9d1d9", textMuted: "#8b949e", label: "#8b949e",
      btnBg: "#21262d", btnText: "#c9d1d9",
      inputBg: "#0d1117", inputBorder: "#30363d",
      statusOk: "#3fb950", statusErr: "#f85149",
      lineNumBg: "#161b22", lineNum: "#484f58",
      tabActiveBg: "#0d1117", tabInactiveBg: "#161b22",
      bottomPanel: "#010409",
    },
  },
  neon: {
    id: "neon",
    label: "Neon Hacker",
    icon: "⚡",
    isClassic: false,
    font: "'JetBrains Mono', monospace",
    monoFont: "'JetBrains Mono', monospace",
    monacoTheme: "neon-hacker",
    colors: {
      bg: "#080810", sidebar: "#0d0d1a", header: "#0d0d1a",
      headerText: "#00ff88", editor: "#080810", editorText: "#d0d0ff",
      console: "#080810", consoleText: "#00ff88",
      accent: "#00ff88", border: "#00ff8830",
      text: "#d0d0ff", textMuted: "#667799", label: "#667799",
      btnBg: "#0d0d1a", btnText: "#00ff88",
      inputBg: "#080810", inputBorder: "#00ff8855",
      statusOk: "#00ff88", statusErr: "#ff4466",
      lineNumBg: "#0d0d1a", lineNum: "#334466",
      tabActiveBg: "#080810", tabInactiveBg: "#0d0d1a",
      bottomPanel: "#080810",
    },
  },
};

const Ctx = createContext(null);

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState("classic");
  return (
    <Ctx.Provider value={{ theme: THEMES[themeKey], themeKey, setThemeKey, themes: THEMES }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTheme() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTheme outside ThemeProvider");
  return c;
}
