# ☀ Solar Optimizer

Application de dimensionnement solaire : simulation de production, analyse ROI et génération de documents administratifs.

## Structure

```
solar-optimizer/
├── api/                    ← Backend Python (Vercel Serverless Functions)
│   ├── _simulation.py      ← Moteur de calcul (partagé)
│   ├── _documents.py       ← Générateur PDF (partagé)
│   ├── simulate.py         ← POST /api/simulate
│   └── document.py         ← POST /api/document
├── frontend/               ← React + TypeScript (maquette Figma)
│   └── src/app/utils/api.ts ← Client API
├── backend/
│   └── server.py           ← Serveur de dev local
├── tests/                  ← Tests unitaires + intégration
├── requirements.txt        ← reportlab uniquement
├── vercel.json             ← Configuration Vercel
├── install.sh              ← Installation locale
├── run.sh                  ← Lancement local
└── test.sh                 ← Tests + audit sécurité
```

## Installation locale

```bash
bash install.sh
bash run.sh
```

- Backend  → http://localhost:8000
- Frontend → http://localhost:5173

## Déploiement Vercel

### 1. Installer la CLI Vercel
```bash
npm install -g vercel
```

### 2. Déployer
```bash
vercel deploy
```

Vercel détecte automatiquement :
- Le frontend React dans `frontend/` → buildé en static
- Les fonctions Python dans `api/` → serverless functions

### 3. Production
```bash
vercel --prod
```

C'est tout. Pas de base de données, pas de serveur à maintenir.

## API

### `POST /api/simulate`
Lance la simulation solaire et calcule le ROI.

```json
{
  "project": {
    "address": "12 rue du Soleil, 06000 Nice",
    "houseType": "maison",
    "surface": 120,
    "heating": "electric",
    "hotWater": "electric",
    "hasAC": false, "hasPool": false, "hasEV": false,
    "hasDryer": true, "hasDishwasher": true, "hasElectricCooking": false,
    "monthlyKwhManual": null,
    "roofSections": [
      { "id": "s1", "orientation": "S", "inclination": 35, "surface": 30 }
    ]
  },
  "scenario": "pro"
}
```

**Réponse :**
```json
{
  "simulation": {
    "totalPowerKwp": 1.6,
    "annualProductionKwh": 1873,
    "selfConsumptionRate": 0.95,
    "annualConsumptionKwh": 8350,
    "annualSavingsEur": 405,
    "co2AvoidedKg": 107,
    "panelCount": 4,
    "monthlyProduction": [...],
    "monthlyConsumption": [...],
    "energyScore": 38
  },
  "roi": {
    "installCost": 3520, "aid": 1820, "netCost": 1700,
    "annualGain": 405, "roiYear": 5,
    "optimistic": [...], "realistic": [...], "conservative": [...]
  }
}
```

### `POST /api/document`
Génère un document PDF (retourné en base64).

```json
{
  "docType": "checklist",
  "project": { ... },
  "result":  { ... }
}
```

**docType** : `declaration_mairie` · `courrier_assurance` · `checklist` · `email_devis` · `guide_administratif` · `notice_enedis` · `dossier_complet`

## Tests

```bash
bash test.sh
```

22 tests — simulation, ROI, génération PDF, sécurité (XSS, codes HTTP).

## Notes de sécurité

- Inputs sanitisés (injection HTML dans les adresses → nettoyé avant écriture PDF)
- Headers sécurité HTTP via `vercel.json` (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`)
- CORS configuré explicitement
- Aucune donnée persistée côté serveur (stateless)
