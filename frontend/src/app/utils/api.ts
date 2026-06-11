/**
 * Solar Optimizer — API client
 * En local :  VITE_API_URL=http://localhost:8000  (run.sh)
 * Sur Vercel : pas besoin, /api/* est automatiquement routé
 */

const API_BASE = (import.meta as any).env?.VITE_API_URL ?? "";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface SimulationResultAPI {
  totalPowerKwp: number;
  annualProductionKwh: number;
  selfConsumptionRate: number;
  annualConsumptionKwh: number;
  annualSavingsEur: number;
  co2AvoidedKg: number;
  panelCount: number;
  monthlyProduction: number[];
  monthlyConsumption: number[];
  energyScore: number;
}

export interface ROIDataAPI {
  installCost: number;
  aid: number;
  netCost: number;
  annualGain: number;
  roiYear: number;
  optimistic: number[];
  realistic: number[];
  conservative: number[];
}

// ── Simulate ──────────────────────────────────────────────────────────────────
export async function simulateAPI(
  project: object,
  scenario: "diy" | "pro" = "pro"
): Promise<{ simulation: SimulationResultAPI; roi: ROIDataAPI }> {
  const res = await fetch(`${API_BASE}/api/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project, scenario }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Documents ─────────────────────────────────────────────────────────────────
export const DOCUMENT_TYPES = [
  { docType: "declaration_mairie",  label: "Déclaration préalable en mairie",    pages: "3 pages",        category: "Administratif" },
  { docType: "courrier_assurance",  label: "Courrier assurance habitation",       pages: "2 pages",        category: "Administratif" },
  { docType: "checklist",           label: "Checklist installation complète",     pages: "8 pages",        category: "Installation"  },
  { docType: "email_devis",         label: "Email demande de devis installateur", pages: "1 page",         category: "Communication" },
  { docType: "guide_administratif", label: "Guide administratif étape par étape", pages: "12 pages",       category: "Guide"         },
  { docType: "dossier_complet",     label: "Dossier PDF prêt à envoyer",          pages: "Dossier complet", category: "Dossier"      },
  { docType: "notice_enedis",       label: "Notice raccordement ENEDIS",          pages: "4 pages",        category: "Technique"     },
] as const;

export async function downloadDocument(
  docType: string,
  project: object,
  result: SimulationResultAPI
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/document`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ docType, project, result }),
  });
  if (!res.ok) throw new Error(`Erreur génération PDF (${res.status})`);

  const { data, filename } = await res.json();
  // Decode base64 and trigger browser download
  const bytes  = Uint8Array.from(atob(data), c => c.charCodeAt(0));
  const blob   = new Blob([bytes], { type: "application/pdf" });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement("a");
  a.href       = url;
  a.download   = filename;
  a.click();
  URL.revokeObjectURL(url);
}
