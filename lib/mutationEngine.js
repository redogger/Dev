/**
 * Dev-Cloud Pro — Mutation Engine v3
 * Anti-MOSS similarity defeat system.
 *
 * Strategies:
 *   1. Variable name pool substitution
 *   2. Mathematical constant jitter
 *   3. for-loop → while-loop transformation
 *   4. if-else → switch-case transformation (where safe)
 *   5. Struct noise injection
 *   6. Helper function noise injection
 *   7. Dead-code block insertion
 *   8. Comment mutation
 *   9. Build-token embedding
 */

// ─── Utility ──────────────────────────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const uid = () => Math.floor(Math.random() * 0xfffff).toString(16).toUpperCase().padStart(5, "0");

// ─── 1. Variable Name Pools ───────────────────────────────────────────────────
const VAR_POOLS = {
  // Core assignment variables
  radius:        ["r", "rad", "rVal", "circR", "inputRadius", "rInput", "circleRad"],
  area:          ["areaOut", "surfA", "circArea", "aResult", "computedArea", "aVal"],
  circumference: ["perim", "cLen", "circ", "cResult", "circLen", "perimVal"],
  score:         ["mark", "pts", "examPts", "gradeScore", "rawScore", "s_val"],
  number:        ["n", "k", "intN", "myNum", "vN", "inputN"],
  result:        ["res", "out", "retVal", "answer", "computed"],
  grade:         ["gradeOut", "gradeStr", "g", "letterGrade", "evalResult"],
  num:           ["n", "k", "m", "inputNum", "val"],
  primeCandidate:["testNum", "candidate", "pNum", "checkVal", "primeSub"],
  i:             ["idx", "iter", "j", "cnt", "x", "loopVar"],
  PI:            ["PI", "piVal", "kPi", "M_PI_CONST", "_PI_"],
};

// ─── 2. PI Jitter (within float precision limits) ─────────────────────────────
const PI_VARIANTS = [
  "3.14159265358979",
  "3.141592653589793",
  "3.14159265358979323",
  "acos(-1.0)",
  "2.0 * asin(1.0)",
];

// ─── 3. Comment Banks ─────────────────────────────────────────────────────────
const COMMENT_POOLS = {
  function: [
    "// Compute and return value",
    "// Process input and generate output",
    "// Core computation routine",
    "// Evaluate and return result",
    "// Algorithm implementation",
  ],
  main: [
    "// Program entry point",
    "// Main execution routine",
    "// Primary driver function",
    "// Application entry",
    "// Execution start",
  ],
  section: [
    "// Section output",
    "// Display results",
    "// Print computed values",
    "// Output section",
    "// Results display",
  ],
};

// ─── 4. Dead-Code / Noise Blocks ──────────────────────────────────────────────
const DEAD_CODE_BLOCKS = [
  // Volatile no-op
  `\n    // Runtime context verification\n    volatile int _ctx${uid()} = 0;\n    _ctx${uid()} ^= ${Math.floor(Math.random() * 255)};\n`,

  // Unused struct instance
  `\n    // Alignment padding struct\n    struct _Pad${uid()} { char data[${pick([2, 4, 8])}]; };\n    _Pad${uid()} _p;\n    (void)_p;\n`,

  // Bit-manipulation no-op
  `\n    // Session seed\n    unsigned long _seed${uid()} = 0x${uid()}UL ^ 0x${uid()}UL;\n    _seed${uid()} = (_seed${uid()} >> 1) | (_seed${uid()} << 31);\n    (void)_seed${uid()};\n`,

  // Lambda no-op (C++11+)
  `\n    // Inline verification lambda\n    auto _verify${uid()} = []() -> bool { return true; };\n    (void)_verify${uid()}();\n`,

  // Ternary no-op
  `\n    // Conditional default init\n    int _def${uid()} = (${pick([1, 2, 3, 7])} > 0) ? ${pick([0, 1, 2])} : -1;\n    (void)_def${uid()};\n`,
];

// ─── 5. Noise Structs ─────────────────────────────────────────────────────────
function generateNoiseStruct() {
  const names = ["MetaBlock", "RuntimeCtx", "SessionTag", "BuildRecord", "ExecTrace"];
  const name = pick(names) + uid();
  const fields = [
    `    int version = ${Math.floor(Math.random() * 10)};`,
    `    char tag[8] = {'D', 'C', 'P', 0};`,
    `    bool valid = true;`,
    `    double weight = ${(Math.random() * 100).toFixed(4)};`,
  ];
  const selectedFields = fields.slice(0, pick([2, 3, 4])).join("\n");
  return `\n// Execution metadata\nstruct ${name} {\n${selectedFields}\n};\n`;
}

// ─── 6. Noise Helper Functions ────────────────────────────────────────────────
function generateNoiseHelper() {
  const helpers = [
    () => {
      const n = "clampVal" + uid();
      return `\n// Utility: value clamping\ninline double ${n}(double v, double lo, double hi) {\n    return v < lo ? lo : (v > hi ? hi : v);\n}\n`;
    },
    () => {
      const n = "roundTo" + uid();
      return `\n// Utility: precision rounding\ninline double ${n}(double v, int places) {\n    double f = pow(10.0, places);\n    return round(v * f) / f;\n}\n`;
    },
    () => {
      const n = "inRange" + uid();
      return `\n// Utility: range check\ninline bool ${n}(double v, double lo, double hi) {\n    return v >= lo && v <= hi;\n}\n`;
    },
    () => {
      const n = "absVal" + uid();
      return `\n// Utility: absolute value wrapper\ninline double ${n}(double v) {\n    return v < 0.0 ? -v : v;\n}\n`;
    },
  ];
  return pick(helpers)();
}

// ─── 7. for → while Transformation ───────────────────────────────────────────
function transformForToWhile(code) {
  // Match: for (int i = INIT; i < COND; i++) { BODY }
  // Simplified regex — handles standard index loops
  return code.replace(
    /for\s*\(\s*(int\s+(\w+)\s*=\s*([^;]+))\s*;\s*(\w+\s*[<>=!]+\s*[^;]+)\s*;\s*(\w+(?:\+\+|--|\s*[+\-]=\s*\d+))\s*\)\s*\{/g,
    (_, decl, varName, init, cond, incr) => {
      return `${decl};\n    while (${cond}) {\n        ${incr};`;
    }
  );
}

// ─── 8. Simple if-else grade → switch Transformation ─────────────────────────
function transformGradeToSwitch(code) {
  // Only transform the evaluateGrade function's if-else chain
  const switchBody = `    int bucket = (int)(score / 10);\n    switch (bucket) {\n        case 10:\n        case 9:  return "A";\n        case 8:  return "B";\n        case 7:  return "C";\n        case 6:  return "D";\n        default: return "F";\n    }`;

  return code.replace(
    /string evaluateGrade\(double score\) \{[\s\S]*?^\}/m,
    `string evaluateGrade(double score) {\n${switchBody}\n}`
  );
}

// ─── 9. Variable Name Substitution ───────────────────────────────────────────
function substituteVariables(code) {
  let c = code;
  Object.entries(VAR_POOLS).forEach(([orig, pool]) => {
    const replacement = pick(pool);
    if (replacement === orig) return; // no-op
    c = c.replace(new RegExp(`\\b${orig}\\b`, "g"), replacement);
  });
  return c;
}

// ─── 10. PI Variant Substitution ─────────────────────────────────────────────
function substitutePiVariant(code) {
  const variant = pick(PI_VARIANTS);
  if (variant === "3.14159265358979") return code;
  // Replace first occurrence in computeArea and computeCircumference
  return code.replace(/const double PI = 3\.14159265358979;/g, `const double PI = ${variant};`);
}

// ─── 11. Build Token Embedding ────────────────────────────────────────────────
function embedBuildToken(code, studentName, studentId) {
  const token = uid();
  const ts = new Date().toISOString().slice(0, 19);
  const safe = (s) => (s || "").replace(/[^a-zA-Z0-9_-]/g, "_");
  const header = [
    `// ╔══════════════════════════════════════════════════════════╗`,
    `// ║  Dev-Cloud Pro — Unique Build Certificate               ║`,
    `// ║  Student : ${(safe(studentName) || "N/A").padEnd(46)}║`,
    `// ║  ID      : ${(safe(studentId) || "N/A").padEnd(46)}║`,
    `// ║  Token   : ${token.padEnd(46)}║`,
    `// ║  Built   : ${ts.padEnd(46)}║`,
    `// ╚══════════════════════════════════════════════════════════╝`,
    "",
  ].join("\n");
  return header + code;
}

// ─── Master Mutation Function ─────────────────────────────────────────────────
/**
 * @param {string} sourceCode   Raw C++ source
 * @param {string} studentName  From sidebar
 * @param {string} studentId    From sidebar
 * @returns {{ code: string, token: string, mutations: string[] }}
 */
export function mutateCode(sourceCode, studentName = "", studentId = "") {
  let code = sourceCode;
  const mutations = [];

  // Step 1 – Variable substitution
  code = substituteVariables(code);
  mutations.push("Variable name substitution");

  // Step 2 – PI variant
  code = substitutePiVariant(code);
  mutations.push("Mathematical constant jitter");

  // Step 3 – for → while
  const beforeLoops = code;
  code = transformForToWhile(code);
  if (code !== beforeLoops) mutations.push("for-loop → while-loop transformation");

  // Step 4 – if-else grade → switch
  const beforeSwitch = code;
  code = transformGradeToSwitch(code);
  if (code !== beforeSwitch) mutations.push("if-else → switch-case transformation");

  // Step 5 – Inject noise struct before first function
  const struct = generateNoiseStruct();
  code = code.replace(/^(#include.*\n)+/m, (match) => match + struct);
  mutations.push("Noise struct injection");

  // Step 6 – Inject helper function before main
  const helper = generateNoiseHelper();
  code = code.replace(/^int main\(\)/m, helper + "\nint main()");
  mutations.push("Dead helper function injection");

  // Step 7 – Inject dead-code block into main
  const deadBlock = pick(DEAD_CODE_BLOCKS);
  code = code.replace(/int main\(\) \{/, `int main() {${deadBlock}`);
  mutations.push("Dead-code block insertion");

  // Step 8 – Mutate a random comment
  code = code.replace(/\/\/ ===.*===/g, pick(COMMENT_POOLS.function));
  mutations.push("Comment mutation");

  // Step 9 – Embed build token header
  const token = uid();
  code = embedBuildToken(code, studentName, studentId);
  mutations.push("Build token embedding");

  return { code, token, mutations };
}

export default mutateCode;
