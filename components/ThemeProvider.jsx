"use client";

import { createContext, useContext, useState } from "react";

// ─── Theme Definitions ────────────────────────────────────────────────────────
export const THEMES = {
  classic: {
    id: "classic",
    label: "Classic Dev-C++ 5.11",
    icon: "🖥",
    font: "'Courier New', Courier, monospace",
    monacoTheme: "vs",
    colors: {
      bg: "#ece9d8",
      sidebar: "#d4d0c8",
      header: "#0a246a",
      headerText: "#ffffff",
      editor: "#ffffff",
      console: "#000080",
      consoleText: "#ffffff",
      accent: "#0a246a",
      accentHover: "#1a3a9a",
      border: "#999999",
      borderLight: "#cccccc",
      text: "#000000",
      textMuted: "#333333",
      label: "#444444",
      btnBg: "#d4d0c8",
      btnBorder: "#808080",
      btnText: "#000000",
      inputBg: "#ffffff",
      inputBorder: "#808080",
      statusOk: "#006400",
      statusErr: "#cc0000",
      sectionTitle: "#0a246a",
      toggleOn: "#0a246a",
      lineNumBg: "#e8e6de",
      lineNum: "#777777",
    },
    glassClass: "glass-classic",
  },

  midnight: {
    id: "midnight",
    label: "Midnight Engineering",
    icon: "🌑",
    font: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    monacoTheme: "vs-dark",
    colors: {
      bg: "#0d1117",
      sidebar: "#161b22",
      header: "#161b22",
      headerText: "#58a6ff",
      editor: "#0d1117",
      console: "#010409",
      consoleText: "#3fb950",
      accent: "#58a6ff",
      accentHover: "#79b8ff",
      border: "#30363d",
      borderLight: "#21262d",
      text: "#c9d1d9",
      textMuted: "#8b949e",
      label: "#8b949e",
      btnBg: "#21262d",
      btnBorder: "#30363d",
      btnText: "#c9d1d9",
      inputBg: "#0d1117",
      inputBorder: "#30363d",
      statusOk: "#3fb950",
      statusErr: "#f85149",
      sectionTitle: "#58a6ff",
      toggleOn: "#58a6ff",
      lineNumBg: "#161b22",
      lineNum: "#484f58",
    },
    glassClass: "glass-dark",
  },

  neon: {
    id: "neon",
    label: "Neon Hacker",
    icon: "⚡",
    font: "'JetBrains Mono', 'Courier New', monospace",
    monacoTheme: "vs-dark",
    colors: {
      bg: "#080810",
      sidebar: "#0d0d1a",
      header: "#0d0d1a",
      headerText: "#00ff88",
      editor: "#080810",
      console: "#080810",
      consoleText: "#00ff88",
      accent: "#00ff88",
      accentHover: "#33ffaa",
      border: "#00ff8833",
      borderLight: "#00ff8815",
      text: "#d0d0ff",
      textMuted: "#667799",
      label: "#667799",
      btnBg: "#0d0d1a",
      btnBorder: "#00ff8866",
      btnText: "#00ff88",
      inputBg: "#080810",
      inputBorder: "#00ff8855",
      statusOk: "#00ff88",
      statusErr: "#ff4466",
      sectionTitle: "#00ff88",
      toggleOn: "#00ff88",
      lineNumBg: "#0d0d1a",
      lineNum: "#334466",
    },
    glassClass: "glass-neon",
  },
};

// ─── Context ──────────────────────────────────────────────────────────────────
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState("midnight");
  const theme = THEMES[themeKey];

  return (
    <ThemeContext.Provider value={{ theme, themeKey, setThemeKey, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
