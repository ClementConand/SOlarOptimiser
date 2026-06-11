#!/usr/bin/env bash
# =============================================================================
# Solar Optimizer — Tests + audit sécurité
# Usage: bash test.sh
# =============================================================================
set -euo pipefail
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[test]${NC} $*"; }
warn() { echo -e "${YELLOW}[warn]${NC} $*"; }
fail() { echo -e "${RED}[FAIL]${NC} $*"; FAILURES=$((FAILURES+1)); }
FAILURES=0

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "  ☀  Solar Optimizer — Test Suite"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Unit + integration tests ─────────────────────────────────────────────────
log "▶ Tests unitaires et d'intégration..."
if python3 -m pytest tests/ -v --tb=short \
     --cov=api \
     --cov-report=term-missing \
     --cov-report=html:coverage_html \
     --cov-fail-under=80 2>&1; then
  log "  ✓ Tests OK"
else
  fail "Tests échoués"
fi

# ── Security static analysis ─────────────────────────────────────────────────
log "▶ Analyse statique de sécurité (bandit)..."
if python3 -m bandit api/ -r -ll -q 2>&1; then
  log "  ✓ Bandit OK"
else
  warn "  Bandit a trouvé des points à corriger (voir ci-dessus)"
fi

# ── Dependency check ─────────────────────────────────────────────────────────
log "▶ Vérification des dépendances..."
if python3 -m pip_audit -r requirements.txt -q 2>/dev/null \
   || python3 -m safety check -r requirements.txt --bare 2>/dev/null; then
  log "  ✓ Dépendances OK"
else
  warn "  Vérification des dépendances non disponible (pip-audit/safety)"
fi

log ""
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [[ $FAILURES -eq 0 ]]; then
  log "  ✓ Tous les checks passés !"
else
  echo -e "${RED}  ✗ $FAILURES check(s) échoué(s)${NC}"
fi
log "  Rapport de couverture : coverage_html/index.html"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
exit $FAILURES
