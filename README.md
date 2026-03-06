# ⬡ Dev-Cloud Pro — Professional Online C++ IDE

> A commercial-grade online C++ IDE with automated student branding, a MOSS-defeating mutation engine, glassmorphism floating terminal, and full Monaco editor integration.

---

## ✨ Features

| Category | Features |
|---|---|
| **Editor** | Monaco Editor with C++17 IntelliSense, syntax highlighting, custom themes, auto-complete |
| **Execution** | Judge0 CE sandbox (live) + smart offline simulation fallback |
| **Injection Engine** | Automatic `Student Name` + `ID` injection as first `main()` execution lines |
| **Mutation Engine v3** | Variable substitution, `for→while` loop swap, `if-else→switch` transform, noise structs, dead-code blocks, comment mutation, build token embedding |
| **Floating Terminal** | Glassmorphism-styled, draggable, resizable, minimizable floating console |
| **Theme Engine** | Classic Dev-C++ 5.11 (Light), Midnight Engineering (Dark), Neon Hacker |
| **Export** | `.cpp` file download + professional PDF execution report |

---

## 📁 Project Structure

```
dev-cloud-pro/
├── app/
│   ├── globals.css          # Global styles, glassmorphism, theme utilities
│   ├── layout.js            # Next.js root layout + metadata
│   └── page.js              # Root page, state orchestration
│
├── components/
│   ├── ThemeProvider.jsx    # Theme context + all 3 theme definitions
│   ├── Sidebar.jsx          # External toolbar: inputs, actions, theme switcher
│   ├── Editor.jsx           # Monaco Editor with custom C++ themes & IntelliSense
│   └── FloatingConsole.jsx  # Draggable/resizable glassmorphism terminal window
│
├── lib/
│   ├── mutationEngine.js    # 9-stage anti-MOSS mutation system
│   ├── injectionLogic.js    # Student metadata source-to-source transform
│   └── pdfExport.js         # jsPDF professional report generator
│
├── hooks/
│   └── useCodeRunner.js     # Judge0 CE API hook + simulation fallback
│
├── public/                  # Static assets
├── package.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js** ≥ 18.17.0
- **npm** ≥ 9.x or **pnpm** ≥ 8.x

### 1. Clone the repository

```bash
git clone https://github.com/your-org/dev-cloud-pro.git
cd dev-cloud-pro
```

### 2. Install dependencies

```bash
npm install
# or
pnpm install
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment to Vercel

### Option A — Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to your Vercel account
vercel login

# Deploy from the project root
vercel

# For production deployment
vercel --prod
```

Follow the interactive prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your personal account or team
- **Link to existing project?** → No (first time)
- **Project name** → `dev-cloud-pro`
- **Directory** → `./` (current)
- **Override settings?** → No

### Option B — GitHub Integration (Zero-config)

1. Push your project to a GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Vercel auto-detects Next.js — click **Deploy**
5. Your app is live in ~90 seconds ⚡

### Vercel Configuration

No environment variables are required for basic functionality. Judge0 CE is a free public API.

For **production** with high traffic, consider self-hosting Judge0:

```env
# .env.local (optional — for self-hosted Judge0)
NEXT_PUBLIC_JUDGE0_URL=https://your-judge0-instance.com
```

---

## 🔧 Configuration

### Customising the Base Assignment

Edit the `BASE_CODE` constant in `app/page.js` to use your own C++ assignment template.

```js
const BASE_CODE = `#include <iostream>
// ... your template here
int main() {
    // Student info is auto-injected here
    return 0;
}`;
```

### Adding Mutation Pools

Extend `VAR_POOLS` in `lib/mutationEngine.js` to add more variable substitution targets:

```js
const VAR_POOLS = {
  myVariable: ["altName1", "altName2", "altName3"],
  // ...
};
```

### Adding a New Theme

Add a new entry to `THEMES` in `components/ThemeProvider.jsx`:

```js
export const THEMES = {
  myTheme: {
    id: "myTheme",
    label: "My Custom Theme",
    icon: "🎨",
    font: "'JetBrains Mono', monospace",
    monacoTheme: "vs-dark",
    colors: {
      bg: "#...",
      // ... all required color keys
    },
    glassClass: "glass-dark",
  },
};
```

Then define the corresponding Monaco theme in `components/Editor.jsx`.

---

## 🧪 Testing the Mutation Engine

You can test the mutation engine in isolation:

```js
import { mutateCode } from "@/lib/mutationEngine";

const { code, token, mutations } = mutateCode(sourceCode, "Alice", "CS001");
console.log("Applied mutations:", mutations);
```

---

## 📦 Key Dependencies

| Package | Purpose |
|---|---|
| `next` 14 | React framework with App Router |
| `@monaco-editor/react` | VS Code-grade editor component |
| `framer-motion` | Floating console drag/animation |
| `lucide-react` | Icon system |
| `jspdf` + `jspdf-autotable` | PDF report generation |
| `clsx` + `tailwind-merge` | Conditional class utilities |

---

## ⚖️ License

MIT © Dev-Cloud Pro

---

## 🐛 Troubleshooting

**Monaco Editor not loading?**
- Ensure `reactStrictMode: false` is set in `next.config.js` (prevents double-mount issues)
- Monaco must be dynamically imported with `{ ssr: false }`

**Judge0 CORS error?**
- The app automatically falls back to simulation mode
- For production, self-host Judge0 CE and set `NEXT_PUBLIC_JUDGE0_URL`

**PDF export not working?**
- `jspdf` must be imported dynamically inside an async function (handled in `lib/pdfExport.js`)
- Ensure you've clicked Execute at least once to populate console output

**Build errors with Monaco?**
- Run `npm install` again to ensure `monaco-editor` peer dep is installed
- Clear `.next` cache: `rm -rf .next && npm run dev`
