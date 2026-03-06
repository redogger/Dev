"use client";

import { useState, useCallback } from "react";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import ClassicLayout from "@/components/ClassicLayout";
import ModernLayout from "@/components/ModernLayout";
import FloatingConsole from "@/components/FloatingConsole";
import StudentProfileModal from "@/components/StudentProfileModal";
import MacExportModal from "@/components/MacExportModal";
import { buildCode } from "@/lib/injectionLogic";
import { useCodeRunner } from "@/hooks/useCodeRunner";
import { generatePDFReport } from "@/lib/pdfExport";

// ── Clean default C++ template (no examples) ─────────────────────────────────
const DEFAULT_CODE = `#include <iostream>
using namespace std;

int main() {
    
    return 0;
}`;

// ── Inner app (reads theme context) ──────────────────────────────────────────
function DevCloudApp() {
  const { theme } = useTheme();

  // ── State ──────────────────────────────────────────────────────────────────
  const [code,        setCode]        = useState(DEFAULT_CODE);
  const [studentName, setStudentName] = useState("");
  const [studentId,   setStudentId]   = useState("");
  const [mutationEnabled, setMutationEnabled] = useState(false);
  const [buildStatus, setBuildStatus] = useState(null);    // null | 'ok' | 'error'
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [macOpen,     setMacOpen]     = useState(false);

  const { output, isRunning, executeCode, clearOutput } = useCodeRunner();

  // ── Build ──────────────────────────────────────────────────────────────────
  const handleBuild = useCallback(() => {
    try {
      const { code: built } = buildCode({
        baseCode: code,
        studentName,
        studentId,
        mutationEnabled,
      });
      setCode(built);
      setBuildStatus("ok");
      setConsoleOpen(true);
      clearOutput();
    } catch (e) {
      console.error(e);
      setBuildStatus("error");
    }
  }, [code, studentName, studentId, mutationEnabled, clearOutput]);

  // ── Execute ────────────────────────────────────────────────────────────────
  const handleExecute = useCallback(async () => {
    setConsoleOpen(true);
    await executeCode(code, studentName, studentId);
  }, [code, studentName, studentId, executeCode]);

  // ── Build & Execute ────────────────────────────────────────────────────────
  const handleBuildAndRun = useCallback(async () => {
    try {
      const { code: built } = buildCode({
        baseCode: code,
        studentName,
        studentId,
        mutationEnabled,
      });
      setCode(built);
      setBuildStatus("ok");
      setConsoleOpen(true);
      clearOutput();
      await executeCode(built, studentName, studentId);
    } catch (e) {
      console.error(e);
      setBuildStatus("error");
    }
  }, [code, studentName, studentId, mutationEnabled, clearOutput, executeCode]);

  // ── Randomize (always mutated) ─────────────────────────────────────────────
  const handleRandomize = useCallback(() => {
    try {
      const { code: built } = buildCode({
        baseCode: DEFAULT_CODE,
        studentName,
        studentId,
        mutationEnabled: true,
      });
      setCode(built);
      setBuildStatus("ok");
    } catch (e) { console.error(e); }
  }, [studentName, studentId]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setCode(DEFAULT_CODE);
    setBuildStatus(null);
    clearOutput();
  }, [clearOutput]);

  // ── Export .cpp ────────────────────────────────────────────────────────────
  const handleExportCpp = useCallback(() => {
    const blob = new Blob([code], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `DevCloud_${(studentName||"student").replace(/\s+/g,"_")}_${Date.now()}.cpp`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [code, studentName]);

  // ── Export PDF ─────────────────────────────────────────────────────────────
  const handleExportPDF = useCallback(() => {
    generatePDFReport({ studentName, studentId, code, output, theme: theme.id });
  }, [code, output, studentName, studentId, theme.id]);

  // ── Shared props passed to both layouts ───────────────────────────────────
  const layoutProps = {
    code, setCode,
    buildStatus, isRunning, output,
    onBuild: handleBuild,
    onExecute: handleExecute,
    onBuildAndRun: handleBuildAndRun,
    onRandomize: handleRandomize,
    onReset: handleReset,
    onExportCpp: handleExportCpp,
    onExportPDF: handleExportPDF,
    onMacExport: () => setMacOpen(true),
    onOpenProfile: () => setProfileOpen(true),
    mutationEnabled, setMutationEnabled,
    consoleOpen, setConsoleOpen,
  };

  return (
    <>
      {/* ── Dual-UI Engine: Classic or Modern ─────────────────────────── */}
      {theme.isClassic ? (
        <ClassicLayout {...layoutProps} />
      ) : (
        <ModernLayout {...layoutProps} />
      )}

      {/* ── Floating Console (both layouts) ───────────────────────────── */}
      <FloatingConsole
        open={consoleOpen}
        onClose={() => setConsoleOpen(false)}
        output={output}
        isRunning={isRunning}
        onClear={clearOutput}
        onExecute={handleExecute}
      />

      {/* ── Student Profile Modal ──────────────────────────────────────── */}
      <StudentProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        name={studentName}
        setName={setStudentName}
        id={studentId}
        setId={setStudentId}
      />

      {/* ── MacBook Export Modal ───────────────────────────────────────── */}
      <MacExportModal
        open={macOpen}
        onClose={() => setMacOpen(false)}
        code={code}
        output={output}
        studentName={studentName}
        studentId={studentId}
      />
    </>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <ThemeProvider>
      <DevCloudApp />
    </ThemeProvider>
  );
}
