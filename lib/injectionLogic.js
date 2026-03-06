import { mutateCode } from "./mutationEngine";

const sanitise = s => (s||"").replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").trim();

function buildSnippet(name, id) {
  const n=sanitise(name)||"Student", i=sanitise(id)||"000000";
  return [
    `    // ── GReg IDE: Student Metadata (auto-injected) ──`,
    `    cout << "Name: " << "${n}" << "\\n" << "ID: " << "${i}" << endl;`,
    `    cout << string(44, '-') << endl;`,
    ``,
  ].join("\n");
}

function stripPrior(src) {
  return src.replace(/    \/\/ ── GReg IDE: Student Metadata.*\n    cout.*\n    cout.*string\(44.*\n\n/m,"");
}

function inject(src, name, id) {
  const snip=buildSnippet(name, id);
  if(!/int\s+main\s*\(\s*\)\s*\{/.test(src)) return src+"\n"+snip;
  return src.replace(/(int\s+main\s*\(\s*\)\s*\{)/,`$1\n${snip}`);
}

export function buildCode({ baseCode, studentName, studentId, mutationEnabled }) {
  let code=stripPrior(baseCode), mutations=[], buildId="STATIC";
  if(mutationEnabled){
    const r=mutateCode(code, studentName, studentId);
    code=inject(r.code, studentName, studentId);
    mutations=r.mutations; buildId=r.token;
  } else {
    code=inject(code, studentName, studentId);
    buildId="STATIC-"+Date.now().toString(36).toUpperCase();
    mutations=["Static build"];
  }
  return {code, mutations, buildId};
}
