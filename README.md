# ⬡ Dev-Cloud Pro v3

> **Pixel-perfect Dev-C++ 5.11 replica + Modern Dark IDE, mobile-optimised, with MacBook Pro 14" assignment export.**

---

## 🎯 What's New in v3

| Feature | Details |
|---|---|
| **Dual-UI Engine** | Seamlessly switch between Classic Dev-C++ 5.11 (WinXP style) and Midnight/Neon modern themes |
| **MacBook Pro Export** | Canvas-rendered 3024×1964 PNG with realistic aluminium bezel, notch, traffic lights |
| **Student Profile Modal** | Hidden modal — no visible name/ID in sidebar. Auto-injects into every build |
| **Touch-First Console** | `onPointerDown/Move/Up` with `setPointerCapture` for flawless mobile drag + resize |
| **Monaco Mobile Fixes** | `contextmenu: false`, `quickSuggestions: false` for Android compatibility |
| **11-Stage Mutation Engine** | Full anti-MOSS pipeline including `for→while`, `if-else→switch`, struct noise, dead-code |
| **Clean Default Template** | Empty `int main()` — no pre-filled examples |
| **jsconfig.json** | Full `@/*` path aliasing — eliminates `Module not found` errors |
| **Docker Ready** | Multi-stage Dockerfile + `docker-compose.yml` for VPS/cloud deployment |

---

## 📁 Directory Structure

```
dev-cloud-pro-v3/
│
├── app/
│   ├── globals.css              # Win3D effects, glassmorphism, mobile touch CSS
│   ├── layout.js                # Root layout, mobile viewport, no-scale meta
│   └── page.js                  # Root orchestrator — dual-UI engine, all state
│
├── components/
│   ├── ThemeProvider.jsx        # Context with 3 complete theme objects
│   ├── ClassicLayout.jsx        # Dev-C++ 5.11 replica: menu bar, icon toolbar, status bar
│   ├── ModernLayout.jsx         # Midnight/Neon: external sidebar + header
│   ├── Editor.jsx               # Monaco with 3 custom C++ themes + mobile fixes
│   ├── FloatingConsole.jsx      # Pointer Events drag/resize, glassmorphism terminal
│   ├── ClassicBottomPanel.jsx   # Tabbed Compiler/Compile Log/Debug panel
│   ├── StudentProfileModal.jsx  # Hidden student credentials modal
│   └── MacExportModal.jsx       # MacBook export preview + download UI
│
├── lib/
│   ├── mutationEngine.js        # 11-stage anti-MOSS mutation pipeline
│   ├── injectionLogic.js        # Source-to-source student metadata injection
│   ├── macExport.js             # Canvas-based MacBook Pro 14" frame renderer
│   └── pdfExport.js             # jsPDF professional report generator
│
├── hooks/
│   └── useCodeRunner.js         # Judge0 CE polling hook + simulation fallback
│
├── jsconfig.json                # @/* path aliases — fixes module resolution
├── Dockerfile                   # Multi-stage production build
├── docker-compose.yml           # Orchestration with optional Traefik/SSL
├── next.config.js               # standalone output, Monaco webpack config
├── tailwind.config.js           # Win3D shadows, custom theme colors
└── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18.17.0
- npm ≥ 9.x

### 1. Install & Run

```bash
npm install
npm run dev
# → http://localhost:3000
```

### 2. Production Build

```bash
npm run build
npm run start
```

---

## 🐳 Docker Deployment (VPS / DigitalOcean / Hetzner)

### Option A — Docker Compose (Recommended)

```bash
# 1. Clone your repo
git clone https://github.com/your-org/dev-cloud-pro-v3.git
cd dev-cloud-pro-v3

# 2. Set environment (optional — defaults to public Judge0 CE)
export JUDGE0_URL=https://ce.judge0.com
export HOST_PORT=3000

# 3. Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f dev-cloud

# Stop
docker-compose down
```

### Option B — Raw Docker

```bash
# Build
docker build \
  --build-arg NEXT_PUBLIC_JUDGE0_URL=https://ce.judge0.com \
  -t dev-cloud-pro-v3 .

# Run
docker run -d \
  --name dev-cloud \
  -p 3000:3000 \
  -e NODE_ENV=production \
  dev-cloud-pro-v3

# Health check
curl http://localhost:3000
```

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_JUDGE0_URL` | `https://ce.judge0.com` | Judge0 API endpoint |
| `HOST_PORT` | `3000` | External port mapping |
| `JUDGE0_URL` | `https://ce.judge0.com` | Build-time Judge0 URL |

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL with Certbot

```bash
certbot --nginx -d your-domain.com
```

---

## 🔑 Key Features Explained

### Dual-UI Engine

Switching between `Classic Dev-C++ 5.11` and `Midnight/Neon` themes in the Theme Engine instantly swaps the **entire layout component** — not just colours. The Classic layout renders:
- A Windows XP blue-gradient title bar
- A text menu bar (File, Edit, Search…)  
- A graphical icon toolbar with 3D bevel effects
- A tabbed bottom panel (Compiler / Compile Log / Debug)

Code state is preserved across layout switches.

### Student Profile (Hidden Injection)

Click **👤 Profile** (classic) or **Open Student Profile…** (modern) to open the modal. Enter your name and ID — these are **never visible in the main UI**. On every `Build`, the injection engine inserts:

```cpp
cout << "Name: " << "Alice Johnson" << "\n" << "ID: " << "CS-2024-0042" << endl;
cout << string(44, '-') << endl;
```
...as the **very first executable statements** inside `int main()`.

### MacBook Pro 14" Export

Click **💻 MacBook Export** (classic toolbar) or **Export MacBook PNG** (modern sidebar) to open the export modal. The Canvas renderer draws:
1. Aluminium bezel with realistic gradient
2. Screen with rounded corners and inner shadow
3. Camera notch
4. Traffic light window controls
5. IDE interface (sidebar, editor, headers)
6. Floating terminal overlay with your output
7. Screen glare and stand

Downloads as a full-resolution PNG suitable for assignment submission.

### Floating Console — Touch Support

The console uses the **Pointer Events API** exclusively:
```jsx
onPointerDown  → setPointerCapture  // locks pointer to element
onPointerMove  → updates position   // works on touch AND mouse
onPointerUp    → releaseCapture     // ends drag/resize
```

When idle, `pointer-events: none` ensures the console **never blocks the editor** underneath. It becomes interactive on hover or touch.

### Monaco Mobile Fixes

```js
contextmenu:              false,   // Prevents native Android context menu
quickSuggestions:         false,   // Prevents IntelliSense blocking touch keyboard
parameterHints:           { enabled: false },
acceptSuggestionOnEnter:  "off",
```

### 11-Stage Mutation Engine

| Stage | Transformation |
|---|---|
| 1 | Variable name pool substitution |
| 2 | PI constant jitter (`acos(-1.0)`, `4.0*atan(1.0)`, etc.) |
| 3 | `for` → `while` loop transformation |
| 4 | `if-else` grade chain → `switch-case` |
| 5 | Noise struct injection (before first function) |
| 6 | Dead helper function injection (before `main`) |
| 7 | Dead-code block inside `main` |
| 8 | Comment mutation |
| 9 | Build token header embedding |
| 10 | Session seed / stack probe dead-code variants |
| 11 | Random junk lambda/branch insertion |

---

## 🔧 Customisation

### Default Code Template

Edit `DEFAULT_CODE` in `app/page.js`:

```js
const DEFAULT_CODE = `#include <iostream>
using namespace std;

int main() {
    // your template here
    return 0;
}`;
```

### Adding a 4th Theme

1. Add entry to `THEMES` in `components/ThemeProvider.jsx`
2. Add Monaco theme definition in `components/Editor.jsx`
3. If it should use the Classic layout, set `isClassic: true`

### Self-Hosted Judge0

```bash
# docker-compose.yml — uncomment the judge0 service section, then:
export JUDGE0_URL=http://your-vps-ip:2358
docker-compose up -d
```

---

## 🐛 Troubleshooting

| Issue | Fix |
|---|---|
| `Module not found: @/components/…` | Ensure `jsconfig.json` is at project root; restart dev server |
| Monaco not loading | Confirm `reactStrictMode: false` in `next.config.js` |
| Console blocks editor on mobile | Confirm `pointer-events: none` on `.console-idle` in `globals.css` |
| PDF fails to generate | `jspdf` must be dynamically imported inside async function (already done in `pdfExport.js`) |
| Docker build fails | Ensure Node 18+ base image; check `output: "standalone"` in `next.config.js` |
| Judge0 CORS error | App auto-falls back to simulation; for production use self-hosted Judge0 |

---

## 📦 Dependencies

| Package | Version | Purpose |
|---|---|---|
| `next` | 14.2.5 | Framework + App Router |
| `@monaco-editor/react` | ^4.6.0 | VS Code editor component |
| `framer-motion` | ^11.3.21 | Floating console animations |
| `lucide-react` | ^0.408.0 | Icon system |
| `jspdf` + `jspdf-autotable` | ^2.5 | PDF report generation |
| `clsx` + `tailwind-merge` | latest | Class utilities |

---

## ⚖️ License

MIT © Dev-Cloud Pro v3
