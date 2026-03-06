/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./hooks/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "Consolas", "monospace"],
        system: ["Tahoma", "'Segoe UI'", "Arial", "sans-serif"],
      },
      colors: {
        greg: {
          gold: "#c9a227", silver: "#a8b4c0", cyan: "#00d4ff",
          dark: "#0a0c14", surface: "#111827",
        },
        win: { bg: "#ece9d8", panel: "#d4d0c8", border: "#919b9c", blue: "#0a246a" },
        mid: { bg: "#0d1117", panel: "#161b22", accent: "#58a6ff", ok: "#3fb950", err: "#f85149" },
        neon: { bg: "#080810", panel: "#0d0d1a", accent: "#00ff88", err: "#ff4466" },
      },
      keyframes: {
        shimmer:   { "0%,100%": { backgroundPosition: "200% center" }, "50%": { backgroundPosition: "-200% center" } },
        neonPulse:  { "0%,100%": { opacity: 1, filter: "blur(0px)" }, "50%": { opacity: 0.7, filter: "blur(1.5px)" } },
        liquidFlow: { "0%": { backgroundPosition: "0% 50%" }, "50%": { backgroundPosition: "100% 50%" }, "100%": { backgroundPosition: "0% 50%" } },
        scanline:  { "0%": { transform: "translateY(-100%)" }, "100%": { transform: "translateY(100vh)" } },
        blink:     { "0%,100%": { opacity: 1 }, "50%": { opacity: 0 } },
        slideUp:   { from: { opacity: 0, transform: "translateY(12px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        pulse2:    { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.5 } },
      },
      animation: {
        shimmer:    "shimmer 3s linear infinite",
        neonPulse:  "neonPulse 2s ease-in-out infinite",
        liquidFlow: "liquidFlow 4s ease infinite",
        scanline:   "scanline 6s linear infinite",
        blink:      "blink 1s step-end infinite",
        slideUp:    "slideUp 0.22s ease",
        fadeIn:     "fadeIn 0.18s ease",
        pulse2:     "pulse2 2s ease infinite",
      },
    },
  },
  plugins: [],
};
