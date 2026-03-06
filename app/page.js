"use client";
import { useState, useCallback, useRef } from "react";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import ClassicLayout from "@/components/ClassicLayout";
import ModernLayout from "@/components/ModernLayout";
import FloatingConsole from "@/components/FloatingConsole";
import StudentProfileModal from "@/components/StudentProfileModal";
import ExportModal from "@/components/ExportModal";
import AdminDashboard from "@/components/admin/AdminDashboard";
import MobileShortcutBar from "@/components/MobileShortcutBar";
import { buildCode } from "@/lib/injectionLogic";
import { useCodeRunner } from "@/hooks/useCodeRunner";
import { generatePDFReport } from "@/lib/pdfExport";

// Clean default template — no examples
const DEFAULT_CODE = `#include <iostream>
using namespace std;

int main() {
    
    return 0;
}`;

// ── Inner app ─────────────────────────────────────────────────────────────────
function GRegApp() {
  const { theme, allowedThemes, setAllowedThemes } = useTheme();

  // ── Core state ────────────────────────────────────────────────────────────
  const [code,            setCode]           = useState(DEFAULT_CODE);
  const [studentName,     setStudentName]    = useState("");
  const [studentId,       setStudentId]      = useState("");
  const [mutationEnabled, setMutationEnabled]= useState(false);
  const [buildStatus,     setBuildStatus]    = useState(null);
  const [consoleOpen,     setConsoleOpen]    = useState(false);
  const [profileOpen,     setProfileOpen]    = useState(false);
  const [exportOpen,      setExportOpen]     = useState(false);
  const [adminOpen,       setAdminOpen]      = useState(false);
  const [activeFile,      setActiveFile]     = useState("main");
  const editorRef = useRef(null);

  const { output, isRunning, executeCode, clearOutput } = useCodeRunner();

  // ── Build ─────────────────────────────────────────────────────────────────
  const handleBuild = useCallback(() => {
    try {
      const { code: built } = buildCode({ baseCode:code, studentName, studentId, mutationEnabled });
      setCode(built); setBuildStatus("ok"); setConsoleOpen(true); clearOutput();
    } catch(e) { console.error(e); setBuildStatus("error"); }
  }, [code, studentName, studentId, mutationEnabled, clearOutput]);

  // ── Execute ───────────────────────────────────────────────────────────────
  const handleExecute = useCallback(async () => {
    setConsoleOpen(true);
    await executeCode(code, studentName, studentId);
  }, [code, studentName, studentId, executeCode]);

  // ── Build & Execute ───────────────────────────────────────────────────────
  const handleBuildAndRun = useCallback(async () => {
    try {
      const { code: built } = buildCode({ baseCode:code, studentName, studentId, mutationEnabled });
      setCode(built); setBuildStatus("ok"); setConsoleOpen(true); clearOutput();
      await executeCode(built, studentName, studentId);
    } catch(e) { console.error(e); setBuildStatus("error"); }
  }, [code, studentName, studentId, mutationEnabled, clearOutput, executeCode]);

  // ── Randomize ─────────────────────────────────────────────────────────────
  const handleRandomize = useCallback(() => {
    try {
      const { code: built } = buildCode({ baseCode:DEFAULT_CODE, studentName, studentId, mutationEnabled:true });
      setCode(built); setBuildStatus("ok");
    } catch(e) { console.error(e); }
  }, [studentName, studentId]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setCode(DEFAULT_CODE); setBuildStatus(null); clearOutput();
  }, [clearOutput]);

  // ── Export .cpp ───────────────────────────────────────────────────────────
  const handleExportCpp = useCallback(() => {
    const blob = new Blob([code], { type:"text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `GReg_${(studentName||"student").replace(/\s+/g,"_")}_${Date.now()}.cpp`;
    a.click(); URL.revokeObjectURL(a.href);
  }, [code, studentName]);

  // ── Export PDF ────────────────────────────────────────────────────────────
  const handleExportPDF = useCallback(() => {
    generatePDFReport({ studentName, studentId, code, output, theme:theme.id });
  }, [code, output, studentName, studentId, theme.id]);

  // ── Load assignment ───────────────────────────────────────────────────────
  const handleLoadAssignment = useCallback((assignment) => {
    if (window.confirm(`Load "${assignment.label}"? This will replace the current code.`)) {
      setCode(assignment.code); setBuildStatus(null);
    }
  }, []);

  // ── Shared layout props ───────────────────────────────────────────────────
  const layoutProps = {
    code, setCode, buildStatus, isRunning, output,
    onBuild: handleBuild, onExecute: handleExecute, onBuildAndRun: handleBuildAndRun,
    onRandomize: handleRandomize, onReset: handleReset,
    onExportCpp: handleExportCpp, onExportPDF: handleExportPDF,
    onMacExport: () => setExportOpen(true),
    onOpenProfile: () => setProfileOpen(true),
    onOpenAdmin:   () => setAdminOpen(true),
    mutationEnabled, setMutationEnabled,
    consoleOpen, setConsoleOpen,
    onLoadAssignment: handleLoadAssignment,
    onFileSelect: setActiveFile, activeFile,
  };

  return (
    <>
      {/* ── Dual-UI Engine ────────────────────────────────── */}
      {theme.isClassic ? <ClassicLayout {...layoutProps}/> : <ModernLayout {...layoutProps}/>}

      {/* ── Floating Console ──────────────────────────────── */}
      <FloatingConsole
        open={consoleOpen} onClose={()=>setConsoleOpen(false)}
        output={output} isRunning={isRunning}
        onClear={clearOutput} onExecute={handleExecute}
      />

      {/* ── Student Profile Modal ─────────────────────────── */}
      <StudentProfileModal
        open={profileOpen} onClose={()=>setProfileOpen(false)}
        name={studentName} setName={setStudentName}
        id={studentId} setId={setStudentId}
      />

      {/* ── Multi-Frame Export Modal ──────────────────────── */}
      <ExportModal
        open={exportOpen} onClose={()=>setExportOpen(false)}
        code={code} output={output}
        studentName={studentName} studentId={studentId}
      />

      {/* ── Admin Dashboard (full-screen overlay) ────────── */}
      {adminOpen && (
        <AdminDashboard
          onClose={()=>setAdminOpen(false)}
          allowedThemes={allowedThemes}
          setAllowedThemes={setAllowedThemes}
        />
      )}

      {/* ── Mobile C++ Shortcut Bar ───────────────────────── */}
      <MobileShortcutBar editorRef={editorRef}/>
    </>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <ThemeProvider>
      <GRegApp />
    </ThemeProvider>
  );
}
