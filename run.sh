#!/usr/bin/env bash
# =============================================================================
# Solar Optimizer — Lancement local
# Usage:
#   bash run.sh          → frontend dev + backend local
#   bash run.sh --api    → backend seul (port 8000)
# =============================================================================
set -euo pipefail
GREEN='\033[0;32m'; NC='\033[0m'
log() { echo -e "${GREEN}[solar]${NC} $*"; }

PIDS=()
cleanup() { log "Arrêt..."; for pid in "${PIDS[@]}"; do kill "$pid" 2>/dev/null||true; done; exit 0; }
trap cleanup SIGINT SIGTERM

API_ONLY=false
[[ "${1:-}" == "--api" ]] && API_ONLY=true

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "  ☀  Solar Optimizer — Local dev"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Backend local (simule les fonctions Vercel avec un serveur WSGI simple) ──
log "Démarrage du backend sur http://localhost:8000 ..."
python3 api/index.py &
PIDS+=($!)

# Attendre que le backend soit prêt
for i in $(seq 1 20); do
  curl -sf http://localhost:8000/api/health >/dev/null 2>&1 && break || sleep 0.4
done
log "Backend prêt ✓"

# ── Frontend dev ─────────────────────────────────────────────────────────────
if [[ "$API_ONLY" == "false" ]]; then
  log "Démarrage du frontend sur http://localhost:5173 ..."
  cd frontend
  VITE_API_URL=http://localhost:8000 npm run dev &
  PIDS+=($!)
  cd ..
fi

log ""
log "  Backend  → http://localhost:8000"
log "  Frontend → http://localhost:5173"
log "  Ctrl+C pour arrêter"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
wait
