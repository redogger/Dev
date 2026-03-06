/**
 * Dev-Cloud Pro v3 — MacBook Pro 14" Export Engine
 *
 * Renders a pixel-perfect MacBook Pro 14" frame with the IDE contents
 * at 3024 × 1964 logical pixels (scaled to 1512 × 982 for performance).
 *
 * Architecture:
 *  1. Draw MacBook Pro silver aluminium bezel
 *  2. Draw black screen panel with rounded corners
 *  3. Draw notch (camera bump)
 *  4. Draw traffic-light window controls
 *  5. Draw IDE title bar (theme-aware)
 *  6. Draw editor panel (syntax-highlighted code)
 *  7. Draw floating console panel (glassmorphism)
 *  8. Trigger PNG download
 */

// ── Constants (MacBook Pro 14" at 0.5× scale for canvas perf) ─────────────────
const MB_W    = 1512;  // 3024 / 2
const MB_H    = 982;   // 1964 / 2
const BEZEL_X = 32;
const BEZEL_Y = 18;
const SCREEN_W = MB_W - BEZEL_X * 2;
const SCREEN_H = MB_H - BEZEL_Y - 60;
const SCREEN_R = 12;   // corner radius
const NOTCH_W = 120;
const NOTCH_H = 18;

// ── Helpers ───────────────────────────────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxW, lineH) {
  const words = text.split(" ");
  let line = "";
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line.trim(), x, y);
      line = word + " ";
      y += lineH;
    } else { line = test; }
  }
  ctx.fillText(line.trim(), x, y);
  return y;
}

function syntaxColor(token, theme) {
  if (theme === "classic") {
    const kwds = ["#include","int","double","float","string","bool","void","return","if","else","for","while","const","using","namespace","endl","cout","cin"];
    if (kwds.some(k => token.startsWith(k))) return "#00008b";
    if (token.startsWith('"') || token.startsWith("'")) return "#a31515";
    if (token.startsWith("//")) return "#006400";
    if (token.startsWith("#")) return "#800080";
    if (/^\d/.test(token)) return "#098658";
    return "#000000";
  }
  if (theme === "neon") {
    if (token.startsWith("//")) return "#334466";
    if (token.startsWith('"')) return "#00ffcc";
    if (token.startsWith("#")) return "#ff6600";
    if (/^\d/.test(token)) return "#ffcc00";
    const kwds = ["int","double","float","string","bool","void","return","if","else","for","while","const","cout","cin","endl","using","namespace"];
    if (kwds.includes(token.trim())) return "#ff00cc";
    return "#d0d0ff";
  }
  // midnight default
  if (token.startsWith("//")) return "#8b949e";
  if (token.startsWith('"')) return "#a5d6ff";
  if (token.startsWith("#")) return "#d2a8ff";
  if (/^\d/.test(token)) return "#79c0ff";
  const kwds = ["int","double","float","string","bool","void","return","if","else","for","while","const","cout","cin","endl","using","namespace"];
  if (kwds.includes(token.trim())) return "#ff7b72";
  return "#c9d1d9";
}

// ── Draw syntax-highlighted code lines ───────────────────────────────────────
function drawCodeLines(ctx, code, x, y, lineH, maxLines, theme) {
  const lines = code.split("\n").slice(0, maxLines);
  const editorBg = theme === "classic" ? "#ffffff" : theme === "neon" ? "#080810" : "#0d1117";
  const lineNumColor = theme === "classic" ? "#888" : theme === "neon" ? "#334" : "#484f58";

  ctx.font = `12px 'Courier New', monospace`;

  lines.forEach((line, i) => {
    const ly = y + i * lineH;
    // Line number
    ctx.fillStyle = lineNumColor;
    ctx.fillText(String(i + 1).padStart(3), x, ly);

    // Tokenise line naively
    const col = x + 36;
    // Comment line
    if (line.trim().startsWith("//")) {
      ctx.fillStyle = syntaxColor("//comment", theme);
      ctx.fillText(line, col, ly);
      return;
    }
    // Preprocessor
    if (line.trim().startsWith("#")) {
      ctx.fillStyle = syntaxColor("#pp", theme);
      ctx.fillText(line, col, ly);
      return;
    }
    // Render as default (simplified — full tokeniser overkill for canvas)
    const keywords = /\b(int|double|float|string|bool|void|return|if|else|for|while|const|using|namespace|cout|cin|endl|struct|auto|inline)\b/g;
    let lastIdx = 0;
    let match;
    let cx = col;
    const textColor = theme === "classic" ? "#000" : theme === "neon" ? "#d0d0ff" : "#c9d1d9";
    const kwColor   = theme === "classic" ? "#00008b" : theme === "neon" ? "#ff00cc" : "#ff7b72";
    const strColor  = theme === "classic" ? "#a31515" : theme === "neon" ? "#00ffcc" : "#a5d6ff";
    const numColor  = theme === "classic" ? "#098658" : theme === "neon" ? "#ffcc00" : "#79c0ff";

    // String literals
    const strMatch = line.match(/"[^"]*"/g);
    let rendered = line;
    if (strMatch) {
      strMatch.forEach(s => {
        rendered = rendered.replace(s, "〔STR〕");
      });
    }

    // Simple render with keyword highlighting
    ctx.fillStyle = textColor;
    const parts = rendered.split(keywords);
    let px = col;
    rendered.replace(keywords, (kw, ...args) => {
      const idx = args[args.length - 2];
      const before = rendered.slice(lastIdx, idx);
      if (before) {
        ctx.fillStyle = textColor;
        ctx.fillText(before, px, ly);
        px += ctx.measureText(before).width;
      }
      ctx.fillStyle = kwColor;
      ctx.fillText(kw, px, ly);
      px += ctx.measureText(kw).width;
      lastIdx = idx + kw.length;
    });
    const remaining = rendered.slice(lastIdx);
    if (remaining) {
      ctx.fillStyle = textColor;
      ctx.fillText(remaining, px, ly);
    }
  });
}

// ── Draw console output ───────────────────────────────────────────────────────
function drawConsole(ctx, output, x, y, w, h, theme) {
  const consoleBg  = theme === "classic" ? "#000080" : theme === "neon" ? "#080810" : "#010409";
  const consoleText = theme === "classic" ? "#ffffff" : theme === "neon" ? "#00ff88" : "#3fb950";
  const accent     = theme === "classic" ? "#6688ff" : theme === "neon" ? "#00ff88" : "#58a6ff";

  // Console background (glassmorphism blur approximation)
  ctx.save();
  ctx.globalAlpha = 0.92;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fillStyle = consoleBg;
  ctx.fill();
  ctx.restore();

  // Console border
  ctx.save();
  roundRect(ctx, x, y, w, h, 10);
  ctx.strokeStyle = accent + "44";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // Traffic lights
  const lights = [
    { color: "#ff5f57", hov: "#ff3b30" },
    { color: "#ffbd2e", hov: "#ffa500" },
    { color: "#28c840", hov: "#34c759" },
  ];
  lights.forEach((l, i) => {
    ctx.beginPath();
    ctx.arc(x + 16 + i * 20, y + 14, 6, 0, Math.PI * 2);
    ctx.fillStyle = l.color;
    ctx.fill();
  });

  // Console title
  ctx.font = `bold 11px 'JetBrains Mono', 'Courier New', monospace`;
  ctx.fillStyle = accent;
  ctx.fillText("Dev-Cloud Terminal", x + 70, y + 18);

  // Path line
  ctx.font = `10px 'Courier New', monospace`;
  ctx.fillStyle = "#3fb950";
  ctx.fillText("student@dev-cloud", x + 12, y + 36);
  ctx.fillStyle = "#8b949e";
  ctx.fillText(":~/assignment$ ", x + 12 + ctx.measureText("student@dev-cloud").width, y + 36);

  // Output lines
  ctx.font = `11px 'Courier New', monospace`;
  const lines = output.split("\n").slice(0, 18);
  lines.forEach((line, i) => {
    let color = consoleText;
    if (line.startsWith("✓") || line.includes("successful")) color = "#3fb950";
    if (line.startsWith("✗") || line.includes("error")) color = "#f85149";
    if (line.startsWith(">")) color = "#8b949e";
    if (line.startsWith("Name:") || line.startsWith("ID:")) color = accent;
    ctx.fillStyle = color;
    ctx.fillText(line.slice(0, 85), x + 12, y + 52 + i * 15);
  });
}

// ── Main Export Function ──────────────────────────────────────────────────────
export async function exportMacBook({ code, output, studentName, studentId, themeId }) {
  const canvas = document.createElement("canvas");
  canvas.width  = MB_W;
  canvas.height = MB_H;
  const ctx = canvas.getContext("2d");

  const theme = themeId || "midnight";
  const editorBg = theme === "classic" ? "#ffffff" : theme === "neon" ? "#080810" : "#0d1117";
  const sidebarBg = theme === "classic" ? "#d4d0c8" : theme === "neon" ? "#0d0d1a" : "#161b22";
  const accent   = theme === "classic" ? "#0a246a" : theme === "neon" ? "#00ff88" : "#58a6ff";
  const headerBg = theme === "classic"
    ? "linear-gradient(180deg, #3169c4, #0a246a)"
    : theme === "neon" ? "#0d0d1a" : "#161b22";

  // ── 1. Outer background ───────────────────────────────────────────────────
  const bgGrad = ctx.createRadialGradient(MB_W/2, MB_H/2, 100, MB_W/2, MB_H/2, MB_W);
  bgGrad.addColorStop(0, "#2a2a2a");
  bgGrad.addColorStop(1, "#0a0a0a");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, MB_W, MB_H);

  // ── 2. MacBook aluminium bezel ─────────────────────────────────────────────
  const bezelGrad = ctx.createLinearGradient(0, 0, 0, MB_H);
  bezelGrad.addColorStop(0.0, "#d8d8d8");
  bezelGrad.addColorStop(0.3, "#c8c8c8");
  bezelGrad.addColorStop(0.7, "#b8b8b8");
  bezelGrad.addColorStop(1.0, "#a0a0a0");
  roundRect(ctx, 0, 0, MB_W, MB_H - 48, 18);
  ctx.fillStyle = bezelGrad;
  ctx.fill();
  // Bezel rim
  roundRect(ctx, 0, 0, MB_W, MB_H - 48, 18);
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 1;
  ctx.stroke();

  // ── 3. Screen black panel ─────────────────────────────────────────────────
  roundRect(ctx, BEZEL_X, BEZEL_Y, SCREEN_W, SCREEN_H, SCREEN_R);
  ctx.fillStyle = "#050505";
  ctx.fill();

  // Screen inner shadow
  ctx.save();
  roundRect(ctx, BEZEL_X, BEZEL_Y, SCREEN_W, SCREEN_H, SCREEN_R);
  ctx.clip();
  const innerShadow = ctx.createRadialGradient(MB_W/2, BEZEL_Y + SCREEN_H/2, 200, MB_W/2, BEZEL_Y + SCREEN_H/2, 700);
  innerShadow.addColorStop(0, "rgba(255,255,255,0.04)");
  innerShadow.addColorStop(1, "rgba(0,0,0,0.0)");
  ctx.fillStyle = innerShadow;
  ctx.fillRect(BEZEL_X, BEZEL_Y, SCREEN_W, SCREEN_H);
  ctx.restore();

  // ── 4. Screen content area ────────────────────────────────────────────────
  const SX = BEZEL_X + 2;
  const SY = BEZEL_Y + 2;
  const SW = SCREEN_W - 4;
  const SH = SCREEN_H - 4;

  ctx.save();
  roundRect(ctx, SX, SY, SW, SH, SCREEN_R - 2);
  ctx.clip();

  // IDE background
  ctx.fillStyle = editorBg;
  ctx.fillRect(SX, SY, SW, SH);

  // Sidebar
  const sideW = 180;
  ctx.fillStyle = sidebarBg;
  ctx.fillRect(SX, SY, sideW, SH);
  ctx.fillStyle = accent + "33";
  ctx.fillRect(SX + sideW, SY, 1, SH);

  // Sidebar content
  ctx.font = `bold 9px Tahoma, Arial, sans-serif`;
  ctx.fillStyle = accent;
  ctx.fillText("⬡ STUDENT IDENTITY", SX + 10, SY + 28);
  ctx.font = `9px Tahoma, Arial, sans-serif`;
  ctx.fillStyle = theme === "classic" ? "#333" : "#8b949e";
  ctx.fillText("Name: " + (studentName || "Student"), SX + 10, SY + 50);
  ctx.fillText("ID: " + (studentId || "000000"), SX + 10, SY + 65);

  // Divider
  ctx.fillStyle = accent + "33";
  ctx.fillRect(SX + 10, SY + 72, sideW - 20, 1);

  ctx.font = `bold 9px Tahoma, Arial, sans-serif`;
  ctx.fillStyle = accent;
  ctx.fillText("⬡ ACTION CENTER", SX + 10, SY + 88);

  // Build button
  const btnY = SY + 96;
  ctx.fillStyle = accent;
  roundRect(ctx, SX + 10, btnY, sideW - 20, 20, 3);
  ctx.fill();
  ctx.font = `bold 9px Tahoma, Arial, sans-serif`;
  ctx.fillStyle = theme === "classic" ? "#fff" : "#000";
  ctx.fillText("▶ Build & Execute", SX + 16, btnY + 13);

  // Theme indicator
  ctx.font = `bold 9px Tahoma, Arial, sans-serif`;
  ctx.fillStyle = accent;
  ctx.fillText("⬡ THEME", SX + 10, SY + 140);
  ctx.font = `9px Tahoma, Arial, sans-serif`;
  ctx.fillStyle = theme === "classic" ? "#333" : "#8b949e";
  ctx.fillText(
    theme === "classic" ? "Classic Dev-C++ 5.11" :
    theme === "neon" ? "Neon Hacker" : "Midnight Engineering",
    SX + 10, SY + 155
  );

  // ── 5. Top IDE header bar ──────────────────────────────────────────────────
  const headerH = 32;
  if (theme === "classic") {
    const hg = ctx.createLinearGradient(SX, SY, SX, SY + headerH);
    hg.addColorStop(0, "#3169c4");
    hg.addColorStop(0.6, "#1242b1");
    hg.addColorStop(1, "#0a246a");
    ctx.fillStyle = hg;
  } else {
    ctx.fillStyle = sidebarBg;
  }
  ctx.fillRect(SX + sideW + 1, SY, SW - sideW - 1, headerH);

  // Header text
  ctx.font = `bold 13px Tahoma, Arial, sans-serif`;
  ctx.fillStyle = theme === "classic" ? "#fff" : accent;
  ctx.fillText("⬡ DEV-CLOUD PRO v3", SX + sideW + 12, SY + 21);
  ctx.font = `9px 'Courier New', monospace`;
  ctx.fillStyle = theme === "classic" ? "#aaccff" : "#8b949e";
  ctx.fillText("JUDGE0 CE · C++17", SX + SW - 110, SY + 21);

  // Tab bar
  const tabY = SY + headerH;
  ctx.fillStyle = theme === "classic" ? "#d4d0c8" : "#161b22";
  ctx.fillRect(SX + sideW + 1, tabY, SW - sideW - 1, 24);
  // Active tab
  ctx.fillStyle = editorBg;
  ctx.fillRect(SX + sideW + 1, tabY, 80, 24);
  ctx.font = `11px Tahoma, Arial, sans-serif`;
  ctx.fillStyle = accent;
  ctx.fillText("📄 main.cpp", SX + sideW + 8, tabY + 16);
  // Tab bottom border
  ctx.fillStyle = accent;
  ctx.fillRect(SX + sideW + 1, tabY + 22, 80, 2);

  // ── 6. Editor content ──────────────────────────────────────────────────────
  const edX = SX + sideW + 1;
  const edY = tabY + 24 + 8;
  const edW = SW - sideW - 1;
  const maxLines = Math.floor((SH - headerH - 24 - 8) / 16);

  ctx.font = `12px 'Courier New', monospace`;
  drawCodeLines(ctx, code, edX + 8, edY + 12, 16, Math.min(maxLines, 35), theme);

  ctx.restore(); // end screen clip

  // ── 7. Notch (camera) ─────────────────────────────────────────────────────
  const notchX = (MB_W - NOTCH_W) / 2;
  ctx.fillStyle = "#050505";
  ctx.beginPath();
  ctx.moveTo(notchX, BEZEL_Y);
  ctx.lineTo(notchX + NOTCH_W, BEZEL_Y);
  ctx.lineTo(notchX + NOTCH_W, BEZEL_Y + NOTCH_H);
  ctx.quadraticCurveTo(notchX + NOTCH_W - 8, BEZEL_Y + NOTCH_H, notchX + NOTCH_W - 12, BEZEL_Y + NOTCH_H);
  ctx.lineTo(notchX + 12, BEZEL_Y + NOTCH_H);
  ctx.quadraticCurveTo(notchX + 8, BEZEL_Y + NOTCH_H, notchX, BEZEL_Y + NOTCH_H);
  ctx.closePath();
  ctx.fill();
  // Camera dot
  ctx.beginPath();
  ctx.arc(MB_W / 2, BEZEL_Y + 10, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = "#1a1a1a";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(MB_W / 2, BEZEL_Y + 10, 1.5, 0, Math.PI * 2);
  ctx.fillStyle = "#333";
  ctx.fill();

  // ── 8. Floating console overlay ───────────────────────────────────────────
  const cX = SX + sideW + 40;
  const cY = SY + SH * 0.42;
  const cW = Math.min(SW - sideW - 80, 520);
  const cH = 220;
  drawConsole(ctx, output, cX, cY, cW, cH, theme);

  // ── 9. Bottom stand ───────────────────────────────────────────────────────
  const standY = MB_H - 52;
  ctx.fillStyle = "#b8b8b8";
  ctx.fillRect(MB_W/2 - 120, standY, 240, 6);
  ctx.fillStyle = "#a0a0a0";
  ctx.fillRect(MB_W/2 - 180, standY + 4, 360, 4);
  // Stand shadow
  const standShadow = ctx.createLinearGradient(0, standY + 8, 0, standY + 20);
  standShadow.addColorStop(0, "rgba(0,0,0,0.3)");
  standShadow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = standShadow;
  ctx.fillRect(MB_W/2 - 180, standY + 8, 360, 12);

  // ── 10. Screen glare overlay ──────────────────────────────────────────────
  ctx.save();
  roundRect(ctx, BEZEL_X, BEZEL_Y, SCREEN_W, SCREEN_H, SCREEN_R);
  ctx.clip();
  const glare = ctx.createLinearGradient(BEZEL_X, BEZEL_Y, BEZEL_X + SCREEN_W, BEZEL_Y + SCREEN_H);
  glare.addColorStop(0, "rgba(255,255,255,0.04)");
  glare.addColorStop(0.3, "rgba(255,255,255,0.01)");
  glare.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glare;
  ctx.fillRect(BEZEL_X, BEZEL_Y, SCREEN_W, SCREEN_H);
  ctx.restore();

  // ── 11. Watermark ─────────────────────────────────────────────────────────
  ctx.font = `10px 'Courier New', monospace`;
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillText(`Dev-Cloud Pro v3 | ${new Date().toISOString().slice(0,10)}`, MB_W - 240, MB_H - 8);

  // ── Download ──────────────────────────────────────────────────────────────
  const safe = (studentName || "student").replace(/\s+/g, "_");
  const url  = canvas.toDataURL("image/png", 1.0);
  const a = document.createElement("a");
  a.href = url;
  a.download = `DevCloud_MacBook_${safe}_${Date.now()}.png`;
  a.click();

  return canvas.toDataURL("image/jpeg", 0.85); // Return preview JPEG
}
