/**
 * Dev-Cloud Pro — Injection Logic
 *
 * Performs Source-to-Source Transformation:
 * Locates `int main()` and injects student branding as the FIRST execution
 * statements, before any other user code runs.
 */

import { mutateCode } from "./mutationEngine";

// ─── Sanitise student input for safe C++ string embedding ─────────────────────
function sanitise(raw) {
  return (raw || "")
    .replace(/\\/g, "\\\\")  // escape backslashes
    .replace(/"/g, '\\"')     // escape double-quotes
    .replace(/\n/g, "\\n")   // escape newlines
    .replace(/\r/g, "")       // strip carriage returns
    .trim();
}

// ─── Build the injection snippet ──────────────────────────────────────────────
function buildInjectionSnippet(name, id) {
  const n = sanitise(name) || "Student";
  const i = sanitise(id) || "000000";

  // Must be the FIRST lines inside main() before any other logic
  return [
    `    // ── Dev-Cloud Pro: Student Metadata (auto-injected) ──`,
    `    cout << "Student: " << "${n}" << "\\nID: " << "${i}" << endl;`,
    `    cout << string(44, '-') << endl;`,
    "",
  ].join("\n");
}

// ─── Locate `int main()` opening brace and inject ────────────────────────────
function injectIntoMain(sourceCode, name, id) {
  const snippet = buildInjectionSnippet(name, id);

  // Pattern: int main() { (with optional whitespace / newlines)
  const mainPattern = /(int\s+main\s*\(\s*\)\s*\{)/;

  if (!mainPattern.test(sourceCode)) {
    console.warn("[InjectionLogic] Could not locate int main() — injecting at end");
    return sourceCode + "\n// [Injection fallback]\n" + snippet;
  }

  return sourceCode.replace(mainPattern, (match) => `${match}\n${snippet}`);
}

// ─── Remove any previously injected metadata ─────────────────────────────────
function stripPreviousInjection(sourceCode) {
  return sourceCode.replace(
    /    \/\/ ── Dev-Cloud Pro: Student Metadata[\s\S]*?cout << string\(44, '-'\) << endl;\n\n/m,
    ""
  );
}

// ─── Master build function ────────────────────────────────────────────────────
/**
 * @param {{ baseCode: string, studentName: string, studentId: string, mutationEnabled: boolean }}
 * @returns {{ code: string, mutations: string[], buildId: string }}
 */
export function buildCode({ baseCode, studentName, studentId, mutationEnabled }) {
  // Always start from the clean base template, stripping any prior injection
  let code = stripPreviousInjection(baseCode);

  let mutations = [];
  let buildId = "STATIC";

  if (mutationEnabled) {
    // Run full mutation engine first, then inject
    const result = mutateCode(code, studentName, studentId);
    code = result.code;
    mutations = result.mutations;
    buildId = result.token;
    // Inject into the (possibly renamed) main — mutation preserves 'int main()'
    code = injectIntoMain(code, studentName, studentId);
  } else {
    // Static build: inject only
    code = injectIntoMain(code, studentName, studentId);
    buildId = "STATIC-" + Date.now().toString(36).toUpperCase();
    mutations = ["Static build (mutation engine locked)"];
  }

  return { code, mutations, buildId };
}

export default buildCode;
