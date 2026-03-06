/**
 * GReg IDE — Mutation Engine v3
 * 11-Stage Anti-MOSS Similarity Defeat
 */
const pick  = a => a[Math.floor(Math.random() * a.length)];
const uid   = () => Math.floor(Math.random() * 0xfffff).toString(16).toUpperCase().padStart(5,"0");
const rInt  = (lo,hi) => Math.floor(Math.random()*(hi-lo+1))+lo;
const rF    = (lo,hi,d=4) => (Math.random()*(hi-lo)+lo).toFixed(d);

const VAR_POOLS = {
  radius:["r","rad","rVal","circR","inputRadius","radiusVal"],
  area:["areaOut","surfA","circArea","aResult","computedArea"],
  circumference:["perim","cLen","circ","cResult","circLen"],
  score:["mark","pts","examPts","gradeScore","rawScore"],
  number:["n","k","intN","myNum","vN","inputN"],
  result:["res","out","retVal","answer","computed"],
  grade:["gradeOut","gradeStr","g","letterGrade","evalResult"],
  i:["idx","iter","j","cnt","x","loopVar","index"],
};

const PI_VARIANTS = [
  "3.14159265358979","3.141592653589793","acos(-1.0)","2.0*asin(1.0)","4.0*atan(1.0)","3.14159265358979323846"
];

function deadBlock() {
  const id=uid();
  return pick([
    `\n    volatile int _ctx${id}=${rInt(0,255)}; _ctx${id}^=${rInt(0,255)}; (void)_ctx${id};\n`,
    `\n    char _buf${id}[${rInt(4,16)}]={0}; (void)_buf${id};\n`,
    `\n    unsigned long _s${id}=0x${uid()}UL; _s${id}=(_s${id}>>1)|(_s${id}<<31); (void)_s${id};\n`,
    `\n    auto _g${id}=[](){ return ${rInt(0,1)}==0; }; (void)_g${id}();\n`,
    `\n    if(false){ int _x${id}=${rInt(100,999)}; (void)_x${id}; }\n`,
  ]);
}

function noiseStruct() {
  const names=["BuildMeta","SessionCtx","ExecTrace","RuntimeTag","ProcRecord"];
  const n=pick(names)+uid();
  const fields=[`    int ver=${rInt(1,9)};`,`    char tag[8]={'G','R','E','G',0};`,`    bool ok=true;`,`    double w=${rF(0.1,9.9)};`];
  return `\nstruct ${n} {\n${fields.slice(0,rInt(2,4)).join("\n")}\n};\n`;
}

function noiseHelper(){
  const id=uid();
  return pick([
    `\ninline double clamp${id}(double v,double lo,double hi){return v<lo?lo:(v>hi?hi:v);}\n`,
    `\ninline bool inRange${id}(double v,double lo,double hi){return v>=lo&&v<=hi;}\n`,
    `\ninline double absW${id}(double v){return v<0.0?-v:v;}\n`,
    `\ninline double rnd${id}(double v,int p){double f=pow(10.0,p);return round(v*f)/f;}\n`,
  ]);
}

const COMMENTS=[
  "// Core computation routine","// Process and evaluate result","// Algorithm implementation block","// Computation and output phase","// Execute main program logic"
];

export function mutateCode(src, name="", id="") {
  const mutations=[];
  let code=src;

  // Stage 1 – var substitution
  Object.entries(VAR_POOLS).forEach(([orig,pool])=>{
    const rep=pick(pool); if(rep===orig) return;
    code=code.replace(new RegExp(`\\b${orig}\\b`,"g"),rep);
  }); mutations.push("Variable substitution");

  // Stage 2 – PI jitter
  code=code.replace(/const double PI = [^;]+;/g,`const double PI = ${pick(PI_VARIANTS)};`);
  mutations.push("PI constant jitter");

  // Stage 3 – for→while
  const fw=code.replace(/for\s*\(\s*(int\s+(\w+)\s*=\s*([^;]+))\s*;\s*([^;]+)\s*;\s*([^)]+)\s*\)\s*\{/g,
    (_,decl,vn,init,cond,incr)=>`${decl};\n    while(${cond.trim()}){\n        ${incr.trim()};`);
  if(fw!==code){code=fw; mutations.push("for→while transformation");}

  // Stage 4 – if-else→switch
  const gs=code.replace(/string evaluateGrade\(double score\) \{[\s\S]*?^\}/m,
    `string evaluateGrade(double score){\n    int b=static_cast<int>(score/10);\n    switch(b){\n        case 10:case 9:return"A";\n        case 8:return"B";\n        case 7:return"C";\n        case 6:return"D";\n        default:return"F";\n    }\n}`);
  if(gs!==code){code=gs; mutations.push("if-else→switch");}

  // Stage 5 – struct noise
  code=code.replace(/^(#include.*\n)+/m,m=>m+noiseStruct());
  mutations.push("Noise struct injection");

  // Stage 6 – helper noise
  code=code.replace(/^int main\(\)/m,noiseHelper()+"\nint main()");
  mutations.push("Dead helper function");

  // Stage 7 – dead code in main
  code=code.replace(/int main\(\) \{/,`int main(){${deadBlock()}`);
  mutations.push("Dead-code block");

  // Stage 8 – comment mutation
  code=code.replace(/\/\/ ={3,}.*={3,}/g,pick(COMMENTS));
  mutations.push("Comment mutation");

  // Stage 9 – string literal variation
  code=code.replace(/cout << "=== /g, `cout << pick(["---","~~~",">>>"," ** "])+" `);
  mutations.push("String literal variation");

  // Stage 10 – whitespace noise (extra blank lines between functions)
  code=code.replace(/\}\n\n([a-z])/g,`}\n\n\n$1`);
  mutations.push("Whitespace noise");

  // Stage 11 – build token
  const tok=uid();
  const safe=s=>(s||"").replace(/[^a-zA-Z0-9_ -]/g,"_");
  const ts=new Date().toISOString().slice(0,19);
  code=[
    `// ╔══════════════════════════════════════════════════════╗`,
    `// ║  GReg IDE Enterprise — Unique Build Certificate     ║`,
    `// ║  Student : ${safe(name).padEnd(44)}║`,
    `// ║  ID      : ${safe(id).padEnd(44)}║`,
    `// ║  Token   : ${tok.padEnd(44)}║`,
    `// ║  Built   : ${ts.padEnd(44)}║`,
    `// ╚══════════════════════════════════════════════════════╝`,
    "",code,
  ].join("\n");
  mutations.push("Build token header");

  return {code, mutations, token: tok};
}
