/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./hooks/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Cascadia Code'", "'Fira Code'", "Consolas", "monospace"],
        classic: ["'Tahoma'", "'Segoe UI'", "Arial", "sans-serif"],
        system: ["'Segoe UI'", "Tahoma", "Geneva", "Verdana", "sans-serif"],
      },
      colors: {
        win: {
          bg: "#ece9d8",
          sidebar: "#d4d0c8",
          border: "#919b9c",
          text: "#000",
          blue: "#0a246a",
          bluegrad: "#3169c4",
          inset: "#808080",
          raised: "#fff",
        },
        mid: {
          bg: "#0d1117",
          sidebar: "#161b22",
          accent: "#58a6ff",
          text: "#c9d1d9",
          border: "#30363d",
          console: "#010409",
          ok: "#3fb950",
          err: "#f85149",
        },
        neon: {
          bg: "#080810",
          sidebar: "#0d0d1a",
          accent: "#00ff88",
          text: "#d0d0ff",
          border: "#00ff8833",
          console: "#080810",
          ok: "#00ff88",
          err: "#ff4466",
        },
      },
      boxShadow: {
        "win-raised": "inset -1px -1px 0 #808080, inset 1px 1px 0 #dfdfdf, inset -2px -2px 0 #404040, inset 2px 2px 0 #fff",
        "win-inset": "inset 1px 1px 0 #808080, inset -1px -1px 0 #dfdfdf, inset 2px 2px 0 #404040, inset -2px -2px 0 #fff",
        "win-btn": "inset -1px -1px 0 #808080, inset 1px 1px 0 #fff",
        "win-btn-active": "inset 1px 1px 0 #808080, inset -1px -1px 0 #fff",
        "mac-frame": "0 40px 120px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.08)",
      },
      animation: {
        "cursor-blink": "blink 1s step-end infinite",
        "fade-in": "fadeIn 0.2s ease",
        "slide-up": "slideUp 0.25s ease",
      },
      keyframes: {
        blink: { "0%,100%": { opacity: 1 }, "50%": { opacity: 0 } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
