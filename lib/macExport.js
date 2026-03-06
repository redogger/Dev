/**
 * GReg IDE — Multi-Frame Export Engine
 * Supports: MacBook Pro 14", Windows Classic, Modern Browser
 * Includes overflow detection and pagination warnings.
 */

// ── Frame configs ──────────────────────────────────────────────────────────
export const EXPORT_FRAMES = {
  macbook: {
    id: "macbook",
    label: "MacBook Pro 14\"",
    icon: "💻",
    width: 1512,
    height: 982,
    maxLines: 38,
    maxOutputLines: 20,
    description: "3024×1964 retina — perfect for assignment screenshots",
  },
  windows: {
    id: "windows",
    label: "Windows Classic",
    icon: "🖥",
    width: 1280,
    height: 800,
    maxLines: 30,
    maxOutputLines: 16,
    description: "1280×800 — Dev-C++ style window frame",
  },
  browser: {
    id: "browser",
    label: "Modern Browser",
    icon: "🌐",
    width: 1440,
    height: 900,
    maxLines: 35,
    maxOutputLines: 18,
    description: "1440×900 — browser tab with address bar",
  },
};

// ── Overflow detection ──────────────────────────────────────────────────────
export function checkOverflow(code, output, frameId = "macbook") {
  const frame = EXPORT_FRAMES[frameId] || EXPORT_FRAMES.macbook;
  const codeLines   = (code   || "").split("\n").length;
  const outputLines = (output || "").split("\n").length;
  const codeOverflow   = codeLines   > frame.maxLines;
  const outputOverflow = outputLines > frame.maxOutputLines;
  return {
    hasOverflow: codeOverflow || outputOverflow,
    codeOverflow, outputOverflow,
    codeLines, outputLines,
    maxLines: frame.maxLines,
    maxOutputLines: frame.maxOutputLines,
    excess: {
      code:   Math.max(0, codeLines   - frame.maxLines),
      output: Math.max(0, outputLines - frame.maxOutputLines),
    },
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}

function drawCodeSection(ctx, code, x, y, lineH, maxLines, theme) {
  const lines = code.split("\n").slice(0, maxLines);
  const numColor = theme==="classic"?"#888":theme==="neon"?"#334":"#484f58";
  const defColor = theme==="classic"?"#000":theme==="neon"?"#d0d0ff":"#c9d1d9";
  const kwColor  = theme==="classic"?"#00008b":theme==="neon"?"#ff00cc":"#ff7b72";
  const strColor = theme==="classic"?"#a31515":theme==="neon"?"#00ffcc":"#a5d6ff";
  const cmtColor = theme==="classic"?"#006400":theme==="neon"?"#334466":"#8b949e";
  const ppColor  = theme==="classic"?"#800080":theme==="neon"?"#ff6600":"#d2a8ff";
  ctx.font = `11px 'Courier New', monospace`;
  lines.forEach((line, i) => {
    const ly = y + i * lineH;
    ctx.fillStyle = numColor;
    ctx.fillText(String(i+1).padStart(3," "), x, ly);
    const cx = x + 34;
    if (line.trim().startsWith("//")) { ctx.fillStyle=cmtColor; ctx.fillText(line,cx,ly); return; }
    if (line.trim().startsWith("#"))  { ctx.fillStyle=ppColor;  ctx.fillText(line,cx,ly); return; }
    // Simple kw highlight
    const kwRe = /\b(int|double|float|string|bool|void|return|if|else|for|while|const|using|namespace|cout|cin|endl|struct|class|auto|inline|long|char|unsigned)\b/g;
    let last=0, px=cx;
    let m;
    ctx.fillStyle=defColor;
    ctx.fillText(line, cx, ly); // fallback draw
  });
}

function drawConsoleBox(ctx, output, x, y, w, h, theme) {
  const bg   = theme==="classic"?"#000080":theme==="neon"?"#080810":"#010409";
  const tc   = theme==="classic"?"#fff":theme==="neon"?"#00ff88":"#3fb950";
  const acc  = theme==="classic"?"#6688ff":theme==="neon"?"#00ff88":"#58a6ff";
  rr(ctx,x,y,w,h,8); ctx.fillStyle=bg; ctx.fill();
  rr(ctx,x,y,w,h,8); ctx.strokeStyle=acc+"44"; ctx.lineWidth=1.5; ctx.stroke();
  // Traffic lights
  [[x+14,"#ff5f57"],[x+30,"#ffbd2e"],[x+46,"#28c840"]].forEach(([lx,c])=>{
    ctx.beginPath(); ctx.arc(lx,y+14,5,0,Math.PI*2); ctx.fillStyle=c; ctx.fill();
  });
  ctx.font=`bold 10px 'JetBrains Mono',monospace`;
  ctx.fillStyle=acc; ctx.fillText("GReg Terminal",x+62,y+18);
  ctx.font=`10px 'Courier New',monospace`;
  const lines=(output||"").split("\n").slice(0,18);
  lines.forEach((line,i)=>{
    let color=tc;
    if(line.startsWith("✓")||line.includes("successful")) color="#3fb950";
    if(line.startsWith("✗")||line.includes("error")) color="#f85149";
    if(/^(Name|ID):/.test(line)) color=acc;
    ctx.fillStyle=color; ctx.fillText(line.slice(0,80),x+10,y+32+i*14);
  });
}

// ── MacBook frame ────────────────────────────────────────────────────────────
function drawMacBook(canvas, { code, output, studentName, studentId, themeId, paginate }) {
  const ctx = canvas.getContext("2d");
  const W=canvas.width, H=canvas.height;
  const BX=32,BY=18,SW=W-BX*2,SH=H-BY-60,SR=12;
  const NOTCH_W=120,NOTCH_H=18;
  const theme = themeId||"midnight";
  const edBg  = theme==="classic"?"#fff":theme==="neon"?"#080810":"#0d1117";
  const sideBg= theme==="classic"?"#d4d0c8":theme==="neon"?"#0d0d1a":"#161b22";
  const acc   = theme==="classic"?"#0a246a":theme==="neon"?"#00ff88":"#58a6ff";

  // Outer bg
  const bg=ctx.createRadialGradient(W/2,H/2,100,W/2,H/2,W);
  bg.addColorStop(0,"#2a2a2a"); bg.addColorStop(1,"#0a0a0a");
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

  // Bezel
  const bz=ctx.createLinearGradient(0,0,0,H);
  bz.addColorStop(0,"#d8d8d8"); bz.addColorStop(0.5,"#c8c8c8"); bz.addColorStop(1,"#a0a0a0");
  rr(ctx,0,0,W,H-48,18); ctx.fillStyle=bz; ctx.fill();
  rr(ctx,0,0,W,H-48,18); ctx.strokeStyle="#888"; ctx.lineWidth=1; ctx.stroke();

  // Screen
  rr(ctx,BX,BY,SW,SH,SR); ctx.fillStyle="#050505"; ctx.fill();
  ctx.save(); rr(ctx,BX+2,BY+2,SW-4,SH-4,SR-2); ctx.clip();
  ctx.fillStyle=edBg; ctx.fillRect(BX+2,BY+2,SW-4,SH-4);

  // Sidebar
  ctx.fillStyle=sideBg; ctx.fillRect(BX+2,BY+2,180,SH-4);
  ctx.fillStyle=acc+"33"; ctx.fillRect(BX+182,BY+2,1,SH-4);

  // Header
  if(theme==="classic"){
    const hg=ctx.createLinearGradient(0,BY+2,0,BY+34);
    hg.addColorStop(0,"#3169c4"); hg.addColorStop(1,"#0a246a");
    ctx.fillStyle=hg; ctx.fillRect(BX+183,BY+2,SW-185,32);
  } else {
    ctx.fillStyle=sideBg; ctx.fillRect(BX+183,BY+2,SW-185,32);
  }
  ctx.font=`bold 12px 'Orbitron',Arial,sans-serif`;
  ctx.fillStyle=theme==="classic"?"#fff":acc;
  ctx.fillText("⬡ GReg IDE Enterprise",BX+195,BY+21);

  // Student info in sidebar
  ctx.font=`bold 8px Tahoma,Arial,sans-serif`; ctx.fillStyle=acc;
  ctx.fillText("STUDENT",BX+10,BY+38);
  ctx.font=`9px Tahoma,Arial,sans-serif`; ctx.fillStyle=theme==="classic"?"#333":"#8b949e";
  ctx.fillText(`Name: ${studentName||"Student"}`,BX+10,BY+52);
  ctx.fillText(`ID: ${studentId||"000000"}`,BX+10,BY+64);

  // Code area
  drawCodeSection(ctx, code, BX+195, BY+50, 15, paginate?25:35, theme);
  // Console
  const maxCH=Math.min(200, SH-160);
  drawConsoleBox(ctx, output, BX+185, BY+SH-maxCH-10, SW-200, maxCH, theme);

  ctx.restore();

  // Notch
  const nx=(W-NOTCH_W)/2;
  ctx.fillStyle="#050505"; ctx.beginPath();
  ctx.moveTo(nx,BY); ctx.lineTo(nx+NOTCH_W,BY);
  ctx.lineTo(nx+NOTCH_W,BY+NOTCH_H); ctx.quadraticCurveTo(nx+NOTCH_W-8,BY+NOTCH_H,nx+12,BY+NOTCH_H);
  ctx.quadraticCurveTo(nx+8,BY+NOTCH_H,nx,BY+NOTCH_H); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(W/2,BY+10,3.5,0,Math.PI*2); ctx.fillStyle="#1a1a1a"; ctx.fill();

  // Stand
  ctx.fillStyle="#b8b8b8"; ctx.fillRect(W/2-120,H-52,240,6);
  ctx.fillStyle="#a0a0a0"; ctx.fillRect(W/2-180,H-48,360,4);

  // Screen glare
  ctx.save(); rr(ctx,BX,BY,SW,SH,SR); ctx.clip();
  const gl=ctx.createLinearGradient(BX,BY,BX+SW,BY+SH);
  gl.addColorStop(0,"rgba(255,255,255,0.04)"); gl.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle=gl; ctx.fillRect(BX,BY,SW,SH); ctx.restore();

  // Watermark
  ctx.font=`9px 'Courier New',monospace`; ctx.fillStyle="rgba(255,255,255,0.2)";
  ctx.fillText(`GReg IDE Enterprise | ${new Date().toISOString().slice(0,10)}`,W-240,H-6);
}

// ── Windows Classic frame ────────────────────────────────────────────────────
function drawWindows(canvas, { code, output, studentName, studentId, themeId }) {
  const ctx=canvas.getContext("2d");
  const W=canvas.width, H=canvas.height;
  ctx.fillStyle="#008080"; ctx.fillRect(0,0,W,H);
  // window
  ctx.fillStyle="#d4d0c8";
  ctx.fillRect(20,20,W-40,H-40);
  // title
  const tg=ctx.createLinearGradient(20,20,20,52);
  tg.addColorStop(0,"#3169c4"); tg.addColorStop(1,"#0a246a");
  ctx.fillStyle=tg; ctx.fillRect(20,20,W-40,32);
  ctx.font=`bold 13px Tahoma,Arial,sans-serif`; ctx.fillStyle="#fff";
  ctx.fillText("⬡ GReg IDE Enterprise — main.cpp",30,40);
  // menu bar
  ctx.fillStyle="#d4d0c8"; ctx.fillRect(20,52,W-40,22);
  ctx.fillStyle="#000"; ctx.font=`11px Tahoma,Arial,sans-serif`;
  ["File","Edit","Search","View","Execute","Tools","Help"].forEach((m,i)=>ctx.fillText(m,36+i*52,67));
  // editor area
  ctx.fillStyle="#fff"; ctx.fillRect(20,74,W-40,H-150);
  drawCodeSection(ctx, code, 28, 90, 16, 28, "classic");
  // console panel
  ctx.fillStyle="#000"; ctx.fillRect(20,H-74,W-40,52);
  ctx.font=`10px 'Courier New',monospace`; ctx.fillStyle="#3fb950";
  (output||"").split("\n").slice(0,3).forEach((l,i)=>ctx.fillText(l.slice(0,110),28,H-60+i*14));
  // student info
  ctx.fillStyle="#d4d0c8"; ctx.fillRect(20,H-22,W-40,22);
  ctx.font=`10px Tahoma,Arial,sans-serif`; ctx.fillStyle="#000";
  ctx.fillText(`Student: ${studentName||"—"} | ID: ${studentId||"—"} | GReg IDE Enterprise`,28,H-8);
}

// ── Browser frame ────────────────────────────────────────────────────────────
function drawBrowser(canvas, { code, output, studentName, studentId, themeId }) {
  const ctx=canvas.getContext("2d");
  const W=canvas.width, H=canvas.height;
  const theme=themeId||"midnight";
  const edBg=theme==="neon"?"#080810":"#0d1117";
  ctx.fillStyle="#1e1e1e"; ctx.fillRect(0,0,W,H);
  // chrome bar
  ctx.fillStyle="#2d2d2d"; ctx.fillRect(0,0,W,40);
  [[14,"#ff5f57"],[34,"#ffbd2e"],[54,"#28c840"]].forEach(([x,c])=>{
    ctx.beginPath(); ctx.arc(x,20,8,0,Math.PI*2); ctx.fillStyle=c; ctx.fill();
  });
  // address bar
  ctx.fillStyle="#3c3c3c"; rr(ctx,80,10,W-180,22,4); ctx.fill();
  ctx.font=`11px 'Courier New',monospace`; ctx.fillStyle="#8b949e";
  ctx.fillText("🔒  localhost:3000  —  GReg IDE Enterprise",90,25);
  // page
  ctx.fillStyle=edBg; ctx.fillRect(0,40,W,H-40);
  drawCodeSection(ctx, code, 20, 60, 16, 32, theme);
  drawConsoleBox(ctx, output, W-520, H-220, 500, 200, theme);
  // student footer
  ctx.fillStyle="rgba(88,166,255,0.08)"; ctx.fillRect(0,H-28,W,28);
  ctx.font=`9px 'Courier New',monospace`; ctx.fillStyle="#8b949e";
  ctx.fillText(`Student: ${studentName||"—"} | ID: ${studentId||"—"} | GReg IDE Enterprise v4`,10,H-10);
}

// ── Master export ────────────────────────────────────────────────────────────
export async function exportFrame({ code, output, studentName, studentId, themeId, frameId="macbook", paginate=false }) {
  const frame=EXPORT_FRAMES[frameId]||EXPORT_FRAMES.macbook;
  const canvas=document.createElement("canvas");
  canvas.width=frame.width; canvas.height=frame.height;

  if(frameId==="macbook")  drawMacBook(canvas, {code,output,studentName,studentId,themeId,paginate});
  if(frameId==="windows")  drawWindows(canvas, {code,output,studentName,studentId,themeId});
  if(frameId==="browser")  drawBrowser(canvas, {code,output,studentName,studentId,themeId});

  const safe=(studentName||"student").replace(/\s+/g,"_");
  const url=canvas.toDataURL("image/png",1.0);
  const a=document.createElement("a"); a.href=url;
  a.download=`GReg_${frameId}_${safe}_${Date.now()}.png`; a.click();
  return canvas.toDataURL("image/jpeg",0.82);
}
