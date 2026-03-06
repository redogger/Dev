/**
 * GReg IDE — Analytics Engine
 * Client-side session tracking. In production, POST to your API.
 */

const SESSION_KEY = "greg_session_analytics";

function now() { return Date.now(); }
function isoNow() { return new Date().toISOString().slice(0, 19); }

let _session = null;

export function initSession({ studentName, studentId, licenseKey }) {
  _session = {
    id: Math.random().toString(36).slice(2),
    studentName, studentId, licenseKey,
    startedAt: isoNow(),
    executions: [],
    editorChanges: 0,
    totalCodeLines: 0,
    buildErrors: 0,
    buildOk: 0,
    activeMs: 0,
    _lastActive: now(),
  };
  return _session;
}

export function trackExecution({ code, output, durationMs }) {
  if (!_session) return;
  _session.executions.push({
    at: isoNow(),
    lines: code?.split("\n").length || 0,
    outputLines: output?.split("\n").length || 0,
    durationMs,
    ok: !output?.includes("error"),
  });
}

export function trackEdit(lines) {
  if (!_session) return;
  _session.editorChanges++;
  _session.totalCodeLines = lines;
  _session.activeMs += now() - _session._lastActive;
  _session._lastActive = now();
}

export function trackBuild(ok) {
  if (!_session) return;
  if (ok) _session.buildOk++;
  else _session.buildErrors++;
}

export function getSession() { return _session; }

export function getSessionSummary() {
  if (!_session) return null;
  const elapsed = Math.round((now() - new Date(_session.startedAt).getTime()) / 1000 / 60);
  return {
    student: _session.studentName || "Anonymous",
    id: _session.studentId || "—",
    sessionMinutes: elapsed,
    executions: _session.executions.length,
    buildOk: _session.buildOk,
    buildErrors: _session.buildErrors,
    codeLines: _session.totalCodeLines,
    edits: _session.editorChanges,
  };
}

// ── Live student log (for admin screen sync) ───────────────────────────────
const STUDENTS_KEY = "greg_live_students";

export function registerLiveStudent(info) {
  if (typeof window === "undefined") return;
  try {
    const existing = JSON.parse(sessionStorage.getItem(STUDENTS_KEY) || "[]");
    const filtered = existing.filter(s => s.id !== info.id).slice(-9);
    sessionStorage.setItem(STUDENTS_KEY, JSON.stringify([...filtered, { ...info, lastSeen: isoNow() }]));
  } catch {}
}

export function getLiveStudents() {
  if (typeof window === "undefined") return MOCK_STUDENTS;
  try {
    const s = JSON.parse(sessionStorage.getItem(STUDENTS_KEY) || "[]");
    return s.length ? s : MOCK_STUDENTS;
  } catch { return MOCK_STUDENTS; }
}

// Mock data for admin demo
const MOCK_STUDENTS = [
  { id: "CS-001", name: "Ahmed Hassan",   status: "coding",   lines: 48, lastSeen: isoNow(), executions: 6,  buildOk: 5  },
  { id: "CS-002", name: "Sara Mohamed",   status: "executing",lines: 72, lastSeen: isoNow(), executions: 12, buildOk: 11 },
  { id: "CS-003", name: "Omar Khalil",    status: "idle",     lines: 23, lastSeen: isoNow(), executions: 2,  buildOk: 1  },
  { id: "CS-004", name: "Nour Ibrahim",   status: "coding",   lines: 95, lastSeen: isoNow(), executions: 18, buildOk: 17 },
  { id: "CS-005", name: "Yasser Fathy",   status: "offline",  lines: 0,  lastSeen: "2025-01-06T10:12:00", executions: 0, buildOk: 0 },
  { id: "CS-006", name: "Mona El-Sayed",  status: "coding",   lines: 61, lastSeen: isoNow(), executions: 9,  buildOk: 8  },
];
