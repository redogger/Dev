/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "'Cascadia Code'", "Consolas", "monospace"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      colors: {
        // Classic Dev-C++ 5.11 (Light)
        classic: {
          bg: "#ece9d8",
          sidebar: "#d4d0c8",
          header: "#0a246a",
          editor: "#ffffff",
          console: "#000080",
          accent: "#0a246a",
          border: "#999999",
          text: "#000000",
          label: "#333333",
          muted: "#777777",
        },
        // Midnight Engineering (Dark)
        midnight: {
          bg: "#0d1117",
          sidebar: "#161b22",
          header: "#161b22",
          editor: "#0d1117",
          console: "#010409",
          accent: "#58a6ff",
          border: "#30363d",
          text: "#c9d1d9",
          label: "#8b949e",
          muted: "#484f58",
        },
        // Neon Hacker
        neon: {
          bg: "#080810",
          sidebar: "#0d0d1a",
          header: "#0d0d1a",
          editor: "#080810",
          console: "#080810",
          accent: "#00ff88",
          border: "#00ff8833",
          text: "#d0d0ff",
          label: "#667799",
          muted: "#334466",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 2s linear infinite",
        "flicker": "flicker 0.15s infinite",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0 },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
