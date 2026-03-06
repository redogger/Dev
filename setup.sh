#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════
#  GReg IDE Enterprise — Automated VPS Setup
#  Compatible: Ubuntu 20.04+, Debian 11+, AlmaLinux 8+
# ══════════════════════════════════════════════════════════════
set -euo pipefail
GREEN='\033[0;32m'; CYAN='\033[0;36m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${CYAN}[GReg]${NC} $1"; }
ok()   { echo -e "${GREEN}[✓]${NC} $1"; }
fail() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

log "GReg IDE Enterprise — Setup v4.0"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 1. Node.js 18 ─────────────────────────────────────────────
if ! command -v node &>/dev/null || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 18 ]]; then
  log "Installing Node.js 18 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - 2>/dev/null || \
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs 2>/dev/null || sudo yum install -y nodejs
fi
ok "Node $(node -v)"

# ── 2. Project dependencies ───────────────────────────────────
log "Installing npm dependencies..."
npm install 2>&1 | tail -3
ok "Core packages installed"

# Key packages verification
for pkg in jspdf jspdf-autotable @monaco-editor/react framer-motion lucide-react jszip; do
  if [ -d "node_modules/$pkg" ]; then
    ok "$pkg ✓"
  else
    log "Force-installing $pkg..."
    npm install "$pkg" --save
  fi
done

# ── 3. Environment config ─────────────────────────────────────
if [ ! -f ".env.local" ]; then
  log "Creating .env.local..."
  cat > .env.local <<EOF
# GReg IDE — Environment Configuration
NEXT_PUBLIC_JUDGE0_URL=https://ce.judge0.com
NEXT_PUBLIC_ADMIN_SECRET=greg-admin-$(openssl rand -hex 8 2>/dev/null || echo "changeme2024")
NEXT_PUBLIC_APP_NAME=GReg IDE Enterprise
NEXT_PUBLIC_VERSION=4.0.0
EOF
  ok ".env.local created"
else
  ok ".env.local already exists"
fi

# ── 4. Build ──────────────────────────────────────────────────
log "Building production bundle..."
npm run build 2>&1 | tail -8
ok "Production build complete"

# ── 5. PM2 (optional) ────────────────────────────────────────
if command -v pm2 &>/dev/null; then
  log "Starting with PM2..."
  pm2 delete greg-ide 2>/dev/null || true
  pm2 start npm --name "greg-ide" -- start
  pm2 save
  ok "PM2 process: greg-ide"
else
  log "PM2 not found. Install with: npm install -g pm2"
  log "Or start manually with: npm run start"
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}  GReg IDE Enterprise is ready!         ${NC}"
echo -e "${GREEN}  App:    http://localhost:3000           ${NC}"
echo -e "${GREEN}  Admin:  http://localhost:3000/admin     ${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
