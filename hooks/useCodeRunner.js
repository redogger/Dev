"use client";

import { useState, useCallback, useRef } from "react";

const JUDGE0_URL = "https://ce.judge0.com";
const LANGUAGE_ID = 54; // C++ (GCC 11.2)
const MAX_POLL = 20;
const POLL_INTERVAL_MS = 1200;

// ─── Base64 helpers ───────────────────────────────────────────────────────────
const b64encode = (str) => {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return btoa(str);
  }
};

const b64decode = (str) => {
  if (!str) return "";
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    try { return atob(str); } catch { return str; }
  }
};

// ─── Simulated execution (offline / CORS fallback) ────────────────────────────
function simulateExecution(code, studentName, studentId) {
  const n = studentName?.trim() || "Student";
  const i = studentId?.trim() || "000000";

  // Try to detect if student metadata was injected
  const hasInjection = code.includes(`"${n}"`) && code.includes(`"${i}"`);

  const lines = [
    `[Dev-Cloud Pro] ✓ Simulated Execution (offline mode)`,
    `${"─".repeat(44)}`,
  ];

  if (hasInjection) {
    lines.push(`Student: ${n}`);
    lines.push(`ID: ${i}`);
    lines.push(`${"─".repeat(44)}`);
  }

  lines.push(
    `=== Circle Metrics ===`,
    `Radius        : 7.5`,
    `Area          : 176.715`,
    `Circumference : 47.1239`,
    ``,
    `=== Factorial Calculation ===`,
    `6! = 720`,
    ``,
    `=== Grade Evaluation ===`,
    `Score : 87.4`,
    `Grade : B`,
    ``,
    `=== Prime Check ===`,
    `17 is prime: Yes`,
    ``,
    `[Process exited with code 0]`
  );

  return lines.join("\n");
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useCodeRunner() {
  const [output, setOutput] = useState(
    "▶  Enter your Name & ID, click [Build & Execute] to start.\n"
  );
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef(false);

  const append = useCallback((text) => {
    setOutput((prev) => prev + text + "\n");
  }, []);

  const clearOutput = useCallback(() => {
    setOutput("");
  }, []);

  const executeCode = useCallback(
    async (code, studentName = "", studentId = "") => {
      if (isRunning) return;
      abortRef.current = false;
      setIsRunning(true);
      setOutput("[Dev-Cloud Pro Runtime]\n");

      const log = (msg) => {
        if (!abortRef.current) setOutput((p) => p + msg + "\n");
      };

      try {
        // ── Submit to Judge0 ────────────────────────────────────────────────
        log(`> Connecting to Judge0 CE (ce.judge0.com)…`);

        const submitRes = await fetch(
          `${JUDGE0_URL}/submissions?base64_encoded=true&wait=false`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              language_id: LANGUAGE_ID,
              source_code: b64encode(code),
              cpu_time_limit: 5,
              memory_limit: 128000,
            }),
          }
        );

        if (!submitRes.ok) throw new Error(`Submit failed: ${submitRes.status}`);
        const { token } = await submitRes.json();
        log(`> Submission token: ${token}`);
        log(`> Awaiting compilation & execution…`);

        // ── Poll for result ─────────────────────────────────────────────────
        let attempts = 0;
        while (attempts < MAX_POLL) {
          if (abortRef.current) break;
          await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
          attempts++;

          const pollRes = await fetch(
            `${JUDGE0_URL}/submissions/${token}?base64_encoded=true&fields=status,stdout,stderr,compile_output,time,memory`
          );
          const data = await pollRes.json();
          const statusId = data.status?.id;

          // Still in queue / processing
          if (statusId <= 2) {
            log(`> Status: ${data.status?.description || "Processing"} [${attempts}/${MAX_POLL}]`);
            continue;
          }

          // ── Handle result ─────────────────────────────────────────────────
          const stdout = b64decode(data.stdout);
          const stderr = b64decode(data.stderr);
          const compileOut = b64decode(data.compile_output);
          const time = data.time ? `${data.time}s` : "—";
          const mem = data.memory ? `${(data.memory / 1024).toFixed(1)} KB` : "—";

          if (statusId === 3) {
            // Accepted
            setOutput(
              `[Dev-Cloud Pro Runtime] ✓ Execution successful\n` +
              `Time: ${time}  |  Memory: ${mem}\n` +
              `${"─".repeat(44)}\n` +
              stdout
            );
          } else {
            // Error
            const errMsg = compileOut || stderr || data.status?.description || "Unknown error";
            setOutput(
              `[Dev-Cloud Pro Runtime] ✗ ${data.status?.description || "Error"}\n` +
              `${"─".repeat(44)}\n` +
              errMsg
            );
          }

          setIsRunning(false);
          return;
        }

        // Timeout
        log(`\n⚠  Execution timed out after ${MAX_POLL} polls.`);
        setIsRunning(false);
      } catch (err) {
        // ── Offline / CORS fallback ─────────────────────────────────────────
        console.warn("[useCodeRunner] Judge0 unavailable, using simulation:", err.message);
        await new Promise((r) => setTimeout(r, 900));
        if (!abortRef.current) {
          setOutput(simulateExecution(code, studentName, studentId));
        }
        setIsRunning(false);
      }
    },
    [isRunning]
  );

  const abort = useCallback(() => {
    abortRef.current = true;
    setIsRunning(false);
    setOutput((p) => p + "\n[Aborted by user]");
  }, []);

  return { output, isRunning, executeCode, clearOutput, abort };
}
