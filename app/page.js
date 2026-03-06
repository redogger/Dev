"use client";

import { useState, useCallback } from "react";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import Sidebar from "@/components/Sidebar";
import EditorPanel from "@/components/Editor";
import FloatingConsole from "@/components/FloatingConsole";
import { buildCode } from "@/lib/injectionLogic";
import { useCodeRunner } from "@/hooks/useCodeRunner";
import { generatePDFReport } from "@/lib/pdfExport";

// ─── Base C++ assignment template ─────────────────────────────────────────────
const BASE_CODE = `#include <iostream>
#include <string>
#include <cmath>
using namespace std;

// ============================================================
//  DEV-CLOUD PRO :: Assignment — Core Algorithm Suite
// ============================================================

double computeArea(double radius) {
    const double PI = 3.14159265358979;
    double area = PI * radius * radius;
    return area;
}

double computeCircumference(double radius) {
    const double PI = 3.14159265358979;
    double circumference = 2.0 * PI * radius;
    return circumference;
}

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

string evaluateGrade(double score) {
    if (score >= 90) return "A";
    else if (score >= 80) return "B";
    else if (score >= 70) return "C";
    else if (score >= 60) return "D";
    else return "F";
}

bool isPrime(int num) {
    if (num < 2) return false;
    for (int i = 2; i <= sqrt(num); i++) {
        if (num % i == 0) return false;
    }
    return true;
}

int main() {
    double radius = 7.5;
    int number = 6;
    double score = 87.4;
    int primeCandidate = 17;

    cout << "=== Circle Metrics ===" << endl;
    cout << "Radius        : " << radius << endl;
    cout << "Area          : " << computeArea(radius) << endl;
    cout << "Circumference : " << computeCircumference(radius) << endl;

    cout << "\\n=== Factorial Calculation ===" << endl;
    cout << number << "! = " << factorial(number) << endl;

    cout << "\\n=== Grade Evaluation ===" << endl;
    cout << "Score : " << score << endl;
    cout << "Grade : " << evaluateGrade(score) << endl;

    cout << "\\n=== Prime Check ===" << endl;
    cout << primeCandidate << " is prime: " << (isPrime(primeCandidate) ? "Yes" : "No") << endl;

    return 0;
}`;

// ─── Inner app (consumes theme context) ───────────────────────────────────────
function DevCloudApp() {
  const { theme } = useTheme();

  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [mutationEnabled, setMutationEnabled] = useState(false);
  const [code, setCode] = useState(BASE_CODE);
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [buildStatus, setBuildStatus] = useState(null); // null | 'ok' | 'error'
  const [lineCount, setLineCount] = useState(BASE_CODE.split("\n").length);

  const { output, isRunning, executeCode, clearOutput } = useCodeRunner();

  // ── Build Handler ──────────────────────────────────────────────────────────
  const handleBuild = useCallback(() => {
    setBuildStatus(null);
    const result = buildCode({
      baseCode: BASE_CODE,
      studentName,
      studentId,
      mutationEnabled,
    });
    setCode(result.code);
    setLineCount(result.code.split("\n").length);
    setBuildStatus("ok");
    setConsoleOpen(true);
    clearOutput();
    return result;
  }, [studentName, studentId, mutationEnabled, clearOutput]);

  // ── Execute Handler ────────────────────────────────────────────────────────
  const handleExecute = useCallback(async () => {
    setConsoleOpen(true);
    await executeCode(code, studentName, studentId);
  }, [code, studentName, studentId, executeCode]);

  // ── Build + Execute ────────────────────────────────────────────────────────
  const handleBuildAndRun = useCallback(async () => {
    const result = buildCode({
      baseCode: BASE_CODE,
      studentName,
      studentId,
      mutationEnabled,
    });
    setCode(result.code);
    setLineCount(result.code.split("\n").length);
    setBuildStatus("ok");
    setConsoleOpen(true);
    clearOutput();
    await executeCode(result.code, studentName, studentId);
  }, [studentName, studentId, mutationEnabled, clearOutput, executeCode]);

  // ── Randomize ──────────────────────────────────────────────────────────────
  const handleRandomize = useCallback(() => {
    const result = buildCode({
      baseCode: BASE_CODE,
      studentName,
      studentId,
      mutationEnabled: true, // always mutate on randomize
    });
    setCode(result.code);
    setLineCount(result.code.split("\n").length);
    setBuildStatus("ok");
  }, [studentName, studentId]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setCode(BASE_CODE);
    setLineCount(BASE_CODE.split("\n").length);
    setBuildStatus(null);
    clearOutput();
  }, [clearOutput]);

  // ── Export .cpp ────────────────────────────────────────────────────────────
  const handleExportCpp = useCallback(() => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = (studentName.trim() || "student").replace(/\s+/g, "_");
    a.href = url;
    a.download = `DevCloudPro_${safeName}_${Date.now()}.cpp`;
    a.click();
    URL.revokeObjectURL(url);
  }, [code, studentName]);

  // ── Export PDF ─────────────────────────────────────────────────────────────
  const handleExportPDF = useCallback(() => {
    generatePDFReport({
      studentName: studentName || "Student",
      studentId: studentId || "N/A",
      code,
      output,
      theme: theme.id,
    });
  }, [code, output, studentName, studentId, theme.id]);

  // ── Code change from editor ────────────────────────────────────────────────
  const handleCodeChange = useCallback((val) => {
    setCode(val || "");
    setLineCount((val || "").split("\n").length);
  }, []);

  return (
    <div
      className="flex flex-col h-screen w-full overflow-hidden theme-transition"
      style={{ background: theme.colors.bg, color: theme.colors.text, fontFamily: theme.font }}
    >
      {/* ── Top Header Bar ───────────────────────────────────────────────── */}
      <header
        className="flex items-center gap-3 px-4 h-10 flex-shrink-0 select-none theme-transition"
        style={{
          background: theme.colors.header,
          borderBottom: `1px solid ${theme.colors.border}`,
          color: theme.colors.headerText,
        }}
      >
        <span className="font-bold tracking-widest text-sm">⬡ DEV-CLOUD PRO</span>
        <span className="text-xs opacity-40 font-mono">v3.0</span>
        <div className="flex-1" />
        {isRunning && (
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: theme.colors.accent }}
            />
            <span className="text-xs opacity-60 font-mono">Executing…</span>
          </div>
        )}
        <span
          className="text-xs opacity-30 font-mono tracking-widest"
          style={{ color: theme.colors.accent }}
        >
          JUDGE0 CE · C++17
        </span>
      </header>

      {/* ── Main Layout ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* External Sidebar */}
        <Sidebar
          studentName={studentName}
          setStudentName={setStudentName}
          studentId={studentId}
          setStudentId={setStudentId}
          mutationEnabled={mutationEnabled}
          setMutationEnabled={setMutationEnabled}
          buildStatus={buildStatus}
          lineCount={lineCount}
          isRunning={isRunning}
          onBuild={handleBuild}
          onExecute={handleExecute}
          onBuildAndRun={handleBuildAndRun}
          onRandomize={handleRandomize}
          onReset={handleReset}
          onExportCpp={handleExportCpp}
          onExportPDF={handleExportPDF}
          consoleOpen={consoleOpen}
          setConsoleOpen={setConsoleOpen}
        />

        {/* Editor Area */}
        <EditorPanel code={code} onChange={handleCodeChange} />
      </div>

      {/* Floating Console */}
      <FloatingConsole
        open={consoleOpen}
        onClose={() => setConsoleOpen(false)}
        output={output}
        isRunning={isRunning}
        onClear={clearOutput}
        onExecute={handleExecute}
      />
    </div>
  );
}

// ─── Root export (wraps with ThemeProvider) ───────────────────────────────────
export default function HomePage() {
  return (
    <ThemeProvider>
      <DevCloudApp />
    </ThemeProvider>
  );
}
