/**
 * Dev-Cloud Pro v3 — Mutation Engine v3
 * 11-Stage Anti-MOSS Similarity Defeat System
 */

// ── Utilities ─────────────────────────────────────────────────────────────────
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const uid  = () => Math.floor(Math.random() * 0xfffff).toString(16).toUpperCase().padStart(5,"0");
const rInt = (lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo;
const rFloat = (lo, hi, d=4) => (Math.random() * (hi - lo) + lo).toFixed(d);

// ── Stage 1: Variable Name Pools ──────────────────────────────────────────────
const VAR_POOLS = {
  radius:         ["r","rad","rVal","circR","inputRadius","rInput","circleRad","radiusVal"],
  area:           ["areaOut","surfA","circArea","aResult","computedArea","aVal","totalArea"],
  circumference:  ["perim","cLen","circ","cResult","circLen","perimVal","circumVal"],
  score:          ["mark","pts","examPts","gradeScore","rawScore","sVal","studentMark"],
  number:         ["n","k","intN","myNum","vN","inputN","numVal"],
  result:         ["res","out","retVal","answer","computed","outputVal"],
  grade:          ["gradeOut","gradeStr","g","letterGrade","evalResult","gradeVal"],
  primeCandidate: ["testNum","candidate","pNum","checkVal","primeSub","numCheck"],
  i:              ["idx","iter","j","cnt","x","loopVar","index"],
  PI:             ["PI","piVal","kPi","M_PI_CONST","_PI_","piConst"],
};

// ── Stage 2: PI Variants ──────────────────────────────────────────────────────
const PI_VARIANTS = [
  "3.14159265358979",
  "3.141592653589793",
  "3.14159265358979323846",
  "acos(-1.0)",
  "2.0 * asin(1.0)",
  "4.0 * atan(1.0)",
];

// ── Stage 3: Dead-Code Block Pool ─────────────────────────────────────────────
function deadBlock() {
  const id = uid();
  return pick([
    `\n    // Runtime verification\n    volatile int _ctx${id} = ${rInt(0,255)};\n    _ctx${id} ^= ${rInt(0,255)};\n    (void)_ctx${id};\n`,
    `\n    // Stack probe\n    char _buf${id}[${rInt(4,16)}] = {0};\n    (void)_buf${id};\n`,
    `\n    // Session seed\n    unsigned long _s${id} = 0x${uid()}UL;\n    _s${id} = (_s${id} >> 1) | (_s${id} << 31);\n    (void)_s${id};\n`,
    `\n    // Inline gate\n    auto _g${id} = [](){ return ${rInt(0,1)} == 0; };\n    (void)_g${id}();\n`,
    `\n    // Null branch\n    if (false) { int _x${id} = ${rInt(100,999)}; (void)_x${id}; }\n`,
  ]);
}

// ── Stage 4: Noise Struct Generator ──────────────────────────────────────────
function noiseStruct() {
  const names = ["BuildMeta","SessionCtx","ExecTrace","RuntimeTag","ProcRecord"];
  const n = pick(names) + uid();
  const fields = [
    `    int version = ${rInt(1,9)};`,
    `    char tag[8] = {'D','C','P',0};`,
    `    bool active = true;`,
    `    double weight = ${rFloat(0.1, 9.9)};`,
    `    unsigned id = 0x${uid()};`,
  ];
  const selected = fields.slice(0, rInt(2, 4)).join("\n");
  return `\n// Build metadata\nstruct ${n} {\n${selected}\n};\n`;
}

// ── Stage 5: Noise Helper Function Generator ──────────────────────────────────
function noiseHelper() {
  const id = uid();
  return pick([
    `\n// Utility: clamping\ninline double clamp${id}(double v,double lo,double hi){\n    return v<lo?lo:(v>hi?hi:v);\n}\n`,
    `\n// Utility: range check\ninline bool inRange${id}(double v,double lo,double hi){\n    return v>=lo&&v<=hi;\n}\n`,
    `\n// Utility: abs wrapper\ninline double absW${id}(double v){\n    return v<0.0?-v:v;\n}\n`,
    `\n// Utility: precision round\ninline double rnd${id}(double v,int p){\n    double f=pow(10.0,p);\n    return round(v*f)/f;\n}\n`,
  ]);
}

// ── Stage 6: Comment Bank ─────────────────────────────────────────────────────
const COMMENT_VARIANTS = [
  "// Core computation routine",
  "// Process and evaluate result",
  "// Algorithm implementation block",
  "// Computation and output phase",
  "// Execute main program logic",
];

// ── Stage 7: for → while Transformation ──────────────────────────────────────
function forToWhile(code) {
  return code.replace(
    /for\s*\(\s*(int\s+(\w+)\s*=\s*([^;]+))\s*;\s*([^;]+)\s*;\s*([^)]+)\s*\)\s*\{/g,
    (_, decl, varName, init, cond, incr) => `${decl};\n    while (${cond.trim()}) {\n        ${incr.trim()};`
  );
}

// ── Stage 8: if-else grade chain → switch ────────────────────────────────────
function gradeToSwitch(code) {
  return code.replace(
    /string evaluateGrade\(double score\) \{[\s\S]*?^\}/m,
    `string evaluateGrade(double score) {\n    int bucket = static_cast<int>(score / 10);\n    switch (bucket) {\n        case 10: case 9: return "A";\n        case 8: return "B";\n        case 7: return "C";\n        case 6: return "D";\n        default: return "F";\n    }\n}`
  );
}

// ── Stage 9: Variable Substitution ───────────────────────────────────────────
function substituteVars(code) {
  let c = code;
  Object.entries(VAR_POOLS).forEach(([orig, pool]) => {
    const rep = pick(pool);
    if (rep === orig) return;
    c = c.replace(new RegExp(`\\b${orig}\\b`, "g"), rep);
  });
  return c;
}

// ── Stage 10: PI Jitter ───────────────────────────────────────────────────────
function jitterPi(code) {
  const v = pick(PI_VARIANTS);
  return code.replace(/const double PI = [^;]+;/g, `const double PI = ${v};`);
}

// ── Stage 11: Build Token Header ─────────────────────────────────────────────
function embedToken(code, name, id) {
  const tok = uid();
  const safe = (s) => (s||"").replace(/[^a-zA-Z0-9_-]/g,"_");
  const ts = new Date().toISOString().slice(0,19);
  return [
    `// ╔══════════════════════════════════════════════════════════╗`,
    `// ║  Dev-Cloud Pro v3 — Unique Build Certificate             ║`,
    `// ║  Student : ${safe(name).padEnd(46)}║`,
    `// ║  ID      : ${safe(id).padEnd(46)}║`,
    `// ║  Token   : ${tok.padEnd(46)}║`,
    `// ║  Built   : ${ts.padEnd(46)}║`,
    `// ╚══════════════════════════════════════════════════════════╝`,
    "",
    code,
  ].join("\n");
}

// ── Master Export ─────────────────────────────────────────────────────────────
export function mutateCode(src, name = "", id = "") {
  const mutations = [];
  let code = src;

  code = substituteVars(code);              mutations.push("Variable substitution");
  code = jitterPi(code);                    mutations.push("PI constant jitter");
  const fw = forToWhile(code);
  if (fw !== code) { code = fw;             mutations.push("for→while transformation"); }
  const gs = gradeToSwitch(code);
  if (gs !== code) { code = gs;             mutations.push("if-else→switch transformation"); }
  // Struct noise
  const struct = noiseStruct();
  code = code.replace(/^(#include.*\n)+/m, m => m + struct);
  mutations.push("Noise struct injection");
  // Helper noise
  const helper = noiseHelper();
  code = code.replace(/^int main\(\)/m, helper + "\nint main()");
  mutations.push("Dead helper function");
  // Dead block inside main
  const db = deadBlock();
  code = code.replace(/int main\(\) \{/, `int main() {${db}`);
  mutations.push("Dead-code block");
  // Comment mutation
  code = code.replace(/\/\/ ={3,}.*={3,}/g, pick(COMMENT_VARIANTS));
  mutations.push("Comment mutation");
  // Token
  code = embedToken(code, name, id);        mutations.push("Build token header");

  return { code, mutations, token: uid() };
}
