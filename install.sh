#!/usr/bin/env bash
# =============================================================================
# Solar Optimizer — Installation locale (Linux / macOS)
# Usage: bash install.sh
# =============================================================================
set -euo pipefail
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${GREEN}[install]${NC} $*"; }
warn() { echo -e "${YELLOW}[warn]${NC}   $*"; }
err()  { echo -e "${RED}[error]${NC}  $*"; exit 1; }

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "  ☀  Solar Optimizer — Install"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Python ────────────────────────────────────────────────────────────────────
PYTHON=$(command -v python3 || err "Python 3 requis")
PY_VER=$($PYTHON -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
log "Python $PY_VER"
$PYTHON -c "import sys; assert sys.version_info>=(3,10)" 2>/dev/null || err "Python 3.10+ requis"

log "Installation des dépendances Python (reportlab)..."
pip install --break-system-packages --quiet reportlab 2>/dev/null \
  || pip install --user --quiet reportlab 2>/dev/null \
  || { $PYTHON -m venv .venv && .venv/bin/pip install --quiet reportlab && echo "Venv créé dans .venv/"; }

# ── Node / Frontend ───────────────────────────────────────────────────────────
if command -v node &>/dev/null; then
  log "Node $(node --version) — installation du frontend..."
  cd frontend
  npm install --silent
  log "Frontend installé."
  cd ..
else
  warn "Node.js non trouvé. Frontend non installé (requis pour la prod)."
  warn "Installe Node via https://nodejs.org ou: sudo apt install nodejs npm"
fi

log ""
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "  ✓  Installation terminée !"
log ""
log "  Local :   bash run.sh"
log "  Tests :   bash test.sh"
log "  Vercel :  vercel deploy"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
