/**
 * Dev-Cloud Pro v3 — PDF Report Generator
 */
export async function generatePDFReport({ studentName, studentId, code, output, theme }) {
  const { jsPDF } = await import("jspdf");
  await import("jspdf-autotable");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 16;
  let y = M;

  const PAL = {
    classic:  { h: [10,36,106],  acc: [10,36,106],  hText: [255,255,255] },
    midnight: { h: [22,27,34],   acc: [88,166,255],  hText: [88,166,255] },
    neon:     { h: [8,8,16],     acc: [0,200,100],   hText: [0,200,100] },
  };
  const p = PAL[theme] || PAL.midnight;

  // Header
  doc.setFillColor(...p.h);
  doc.rect(0, 0, W, 26, "F");
  doc.setTextColor(...p.hText);
  doc.setFont("courier","bold"); doc.setFontSize(16);
  doc.text("DEV-CLOUD PRO v3", M, 12);
  doc.setFont("courier","normal"); doc.setFontSize(8);
  doc.text("Unique C++ Assignment Report", M, 20);
  const ts = new Date().toLocaleString();
  doc.text(ts, W - M, 20, { align: "right" });
  y = 34;

  // Student table
  doc.autoTable({
    startY: y,
    head: [["Field","Value"]],
    body: [
      ["Student Name", studentName || "N/A"],
      ["Student ID",   studentId   || "N/A"],
      ["Date",         ts],
      ["Compiler",     "GCC 11.2 (C++17) — Judge0 CE"],
      ["Theme",        theme],
    ],
    margin: { left: M, right: M },
    theme: "grid",
    headStyles: { fillColor: p.acc, textColor: [0,0,0], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8, font: "courier" },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 42 }, 1: { cellWidth: W - M*2 - 42 } },
  });
  y = doc.lastAutoTable.finalY + 8;

  // Source code section
  doc.setFillColor(...p.acc);
  doc.rect(M, y, W - M*2, 6, "F");
  doc.setTextColor(...(theme==="classic"?[255,255,255]:[0,0,0]));
  doc.setFont("courier","bold"); doc.setFontSize(9);
  doc.text("SOURCE CODE", M + 2, y + 4.5);
  y += 9;

  const cLines = code.split("\n");
  doc.setFont("courier","normal"); doc.setFontSize(6.5);
  doc.setTextColor(30, 30, 30);
  cLines.slice(0, 100).forEach((l, i) => {
    if (y > H - 18) { doc.addPage(); y = M; }
    doc.setTextColor(150,150,150);
    doc.text(String(i+1).padStart(4," "), M, y);
    doc.setTextColor(30,30,30);
    doc.text(l.slice(0, 105), M + 11, y);
    y += 3.8;
  });
  y += 6;

  // Output section
  if (output?.trim()) {
    if (y > H - 40) { doc.addPage(); y = M; }
    doc.setFillColor(...p.acc);
    doc.rect(M, y, W - M*2, 6, "F");
    doc.setTextColor(...(theme==="classic"?[255,255,255]:[0,0,0]));
    doc.setFont("courier","bold"); doc.setFontSize(9);
    doc.text("EXECUTION OUTPUT", M + 2, y + 4.5);
    y += 9;
    doc.setFillColor(10,10,18);
    const outLines = output.split("\n");
    const bH = Math.min(outLines.length * 3.8 + 6, H - y - 16);
    doc.rect(M, y, W - M*2, bH, "F");
    doc.setFont("courier","normal"); doc.setFontSize(6.5);
    let oy = y + 4;
    outLines.forEach(l => {
      if (oy > y + bH - 3) return;
      doc.setTextColor(63,185,80);
      doc.text(l.slice(0, 105), M + 2, oy);
      oy += 3.8;
    });
    y += bH + 6;
  }

  // Footer
  const pages = doc.internal.getNumberOfPages();
  for (let pg = 1; pg <= pages; pg++) {
    doc.setPage(pg);
    doc.setFillColor(...p.h);
    doc.rect(0, H - 8, W, 8, "F");
    doc.setTextColor(180,180,180); doc.setFontSize(6.5);
    doc.text(`Dev-Cloud Pro v3 © ${new Date().getFullYear()}`, M, H - 2.5);
    doc.text(`Page ${pg}/${pages}`, W - M, H - 2.5, { align: "right" });
  }

  const safe = (studentName || "student").replace(/\s+/g, "_");
  doc.save(`DevCloud_Report_${safe}_${Date.now()}.pdf`);
}
