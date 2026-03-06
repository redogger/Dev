/**
 * Dev-Cloud Pro — PDF Report Generator
 * Generates a professional execution report with source code and output proof.
 * Uses jsPDF + jsPDF-AutoTable.
 */

export async function generatePDFReport({ studentName, studentId, code, output, theme }) {
  // Dynamic import to avoid SSR issues
  const { jsPDF } = await import("jspdf");
  await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = W - margin * 2;
  let y = margin;

  // ── Colour palette ──────────────────────────────────────────────────────────
  const PALETTE = {
    classic:  { header: [10, 36, 106], accent: [10, 36, 106], bg: [236, 233, 216], text: [0, 0, 0] },
    midnight: { header: [22, 27, 34],  accent: [88, 166, 255], bg: [13, 17, 23],   text: [201, 209, 217] },
    neon:     { header: [8, 8, 16],    accent: [0, 255, 136],  bg: [13, 13, 26],   text: [208, 208, 255] },
  };
  const pal = PALETTE[theme] || PALETTE.midnight;

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const setFont = (size, style = "normal") => { doc.setFontSize(size); doc.setFont("courier", style); };
  const rgb = (arr) => { doc.setFillColor(...arr); doc.setTextColor(...arr); };
  const line = (h = 1) => { y += h; };

  // ── Header ──────────────────────────────────────────────────────────────────
  doc.setFillColor(...pal.header);
  doc.rect(0, 0, W, 28, "F");

  doc.setTextColor(255, 255, 255);
  setFont(18, "bold");
  doc.text("DEV-CLOUD PRO", margin, 14);
  setFont(9, "normal");
  doc.text("Professional C++ Assignment Report", margin, 21);

  // Timestamp top right
  const ts = new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "medium" });
  doc.text(ts, W - margin, 14, { align: "right" });

  y = 36;

  // ── Student Info Table ──────────────────────────────────────────────────────
  doc.autoTable({
    startY: y,
    head: [["Field", "Value"]],
    body: [
      ["Student Name", studentName || "N/A"],
      ["Student ID",   studentId   || "N/A"],
      ["Report Date",  ts],
      ["Compiler",     "GCC 11.2 (C++17) via Judge0 CE"],
      ["Theme",        theme.charAt(0).toUpperCase() + theme.slice(1)],
    ],
    margin: { left: margin, right: margin },
    theme: "grid",
    headStyles: {
      fillColor: pal.accent,
      textColor: theme === "classic" ? [255, 255, 255] : [0, 0, 0],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9, font: "courier" },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 45 },
      1: { cellWidth: contentW - 45 },
    },
  });

  y = doc.lastAutoTable.finalY + 10;

  // ── Section: Source Code ────────────────────────────────────────────────────
  doc.setFillColor(...pal.accent);
  doc.rect(margin, y, contentW, 7, "F");
  doc.setTextColor(theme === "classic" ? 255 : 0, theme === "classic" ? 255 : 0, theme === "classic" ? 255 : 0);
  setFont(10, "bold");
  doc.text("SOURCE CODE", margin + 3, y + 5);
  y += 10;

  // Code lines
  const codeLines = code.split("\n").slice(0, 120); // cap at 120 lines for PDF
  setFont(7, "normal");
  doc.setTextColor(30, 30, 30);

  const lineH = 4;
  codeLines.forEach((codeLine, i) => {
    if (y > H - 20) {
      doc.addPage();
      y = margin;
    }
    // Line number
    doc.setTextColor(150, 150, 150);
    doc.text(String(i + 1).padStart(4, " "), margin, y);
    // Code content
    doc.setTextColor(30, 30, 30);
    const truncated = codeLine.length > 95 ? codeLine.slice(0, 92) + "…" : codeLine;
    doc.text(truncated, margin + 12, y);
    y += lineH;
  });

  if (code.split("\n").length > 120) {
    doc.setTextColor(150, 150, 150);
    doc.text(`  … ${code.split("\n").length - 120} more lines (truncated in report)`, margin, y);
    y += lineH;
  }

  y += 8;

  // ── Section: Execution Output ───────────────────────────────────────────────
  if (output && output.trim()) {
    if (y > H - 40) { doc.addPage(); y = margin; }

    doc.setFillColor(...pal.accent);
    doc.rect(margin, y, contentW, 7, "F");
    doc.setTextColor(theme === "classic" ? 255 : 0, theme === "classic" ? 255 : 0, theme === "classic" ? 255 : 0);
    setFont(10, "bold");
    doc.text("EXECUTION OUTPUT", margin + 3, y + 5);
    y += 10;

    // Output background
    doc.setFillColor(10, 10, 20);
    const outputLines = output.split("\n");
    const boxH = Math.min(outputLines.length * 4 + 6, H - y - 20);
    doc.rect(margin, y, contentW, boxH, "F");

    setFont(7, "normal");
    let oy = y + 4;
    outputLines.forEach((l) => {
      if (oy > y + boxH - 4) return;
      doc.setTextColor(63, 185, 80); // terminal green
      const tl = l.length > 95 ? l.slice(0, 92) + "…" : l;
      doc.text(tl, margin + 3, oy);
      oy += 4;
    });
    y += boxH + 8;
  }

  // ── Footer ──────────────────────────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFillColor(...pal.header);
    doc.rect(0, H - 10, W, 10, "F");
    doc.setTextColor(200, 200, 200);
    setFont(7, "normal");
    doc.text(`Dev-Cloud Pro © ${new Date().getFullYear()} | Confidential Assignment Report`, margin, H - 4);
    doc.text(`Page ${p} / ${pageCount}`, W - margin, H - 4, { align: "right" });
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  const safe = (studentName || "student").replace(/\s+/g, "_");
  doc.save(`DevCloudPro_Report_${safe}_${Date.now()}.pdf`);
}
