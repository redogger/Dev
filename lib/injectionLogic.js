/**
 * Dev-Cloud Pro v3 — Injection Logic
 * Auto-injects student metadata as the FIRST lines of int main()
 */
import { mutateCode } from "./mutationEngine";

const sanitise = (s) =>
  (s || "").replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").trim();

function buildSnippet(name, id) {
  const n = sanitise(name) || "Student";
  const i = sanitise(id)   || "000000";
  return [
    `    // ── Auto-injected student metadata ──`,
    `    cout << "Name: " << "${n}" << "\\n" << "ID: " << "${i}" << endl;`,
    `    cout << string(44, '-') << endl;`,
    ``,
  ].join("\n");
}

function stripPrior(src) {
  return src.replace(
    /    \/\/ ── Auto-injected student metadata ──\n    cout.*\n    cout.*string\(44.*\n\n/m,
    ""
  );
}

function inject(src, name, id) {
  const snippet = buildSnippet(name, id);
  if (!/int\s+main\s*\(\s*\)\s*\{/.test(src)) return src + "\n" + snippet;
  return src.replace(/(int\s+main\s*\(\s*\)\s*\{)/, `$1\n${snippet}`);
}

/**
 * @param {{ baseCode, studentName, studentId, mutationEnabled }}
 * @returns {{ code, mutations, buildId }}
 */
export function buildCode({ baseCode, studentName, studentId, mutationEnabled }) {
  let code = stripPrior(baseCode);
  let mutations = [], buildId = "STATIC";

  if (mutationEnabled) {
    const r = mutateCode(code, studentName, studentId);
    code = r.code; mutations = r.mutations; buildId = r.token;
    code = inject(code, studentName, studentId);
  } else {
    code = inject(code, studentName, studentId);
    buildId = "STATIC-" + Date.now().toString(36).toUpperCase();
    mutations = ["Static build"];
  }
  return { code, mutations, buildId };
}
