import { useState } from "react";
import { Lock, FileText, Mail, CheckSquare, BookOpen, FileCheck, FileWarning, ArrowLeft, CreditCard, Star, X, Download } from "lucide-react";
import { SimulationResult } from "../utils/simulation";

interface Props {
  result: SimulationResult;
  onBack: () => void;
}

const DOCUMENTS = [
  { icon: FileText, label: "Déclaration préalable en mairie", pages: "3 pages", category: "Administratif" },
  { icon: Mail, label: "Courrier assurance habitation", pages: "2 pages", category: "Administratif" },
  { icon: CheckSquare, label: "Checklist installation complète", pages: "8 pages", category: "Installation" },
  { icon: Mail, label: "Email demande de devis installateur", pages: "1 page", category: "Communication" },
  { icon: BookOpen, label: "Guide administratif étape par étape", pages: "12 pages", category: "Guide" },
  { icon: FileCheck, label: "Dossier PDF prêt à envoyer", pages: "Dossier complet", category: "Dossier" },
  { icon: FileWarning, label: "Notice raccordement ENEDIS", pages: "4 pages", category: "Technique" },
];

function DocRow({ doc, locked, unlocked }: { doc: typeof DOCUMENTS[0]; locked?: boolean; unlocked?: boolean }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${locked ? "opacity-40" : ""}`}
      style={{ background: "var(--secondary)", borderColor: "var(--border)" }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--muted)", color: "var(--accent)" }}>
        <doc.icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate" style={{ color: locked ? "transparent" : "var(--foreground)", textShadow: locked ? "0 0 8px rgba(255,255,255,0.3)" : "none", filter: locked ? "blur(4px)" : "none" }}>
          {doc.label}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{doc.pages}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>{doc.category}</span>
        </div>
      </div>
      {locked ? <Lock className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--muted-foreground)" }} /> :
        unlocked ? <Download className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--primary)" }} /> : null}
    </div>
  );
}

function PaywallModal({ onClose, onUnlock }: { onClose: () => void; onUnlock: () => void }) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-md rounded-2xl border border-border p-8 relative" style={{ background: "var(--card)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl cursor-pointer hover:opacity-70 transition-opacity" style={{ background: "var(--secondary)" }}>
          <X className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(212,240,0,0.1)" }}>
            <Star className="w-6 h-6" style={{ color: "var(--primary)" }} />
          </div>
          <div>
            <div className="font-black text-lg" style={{ color: "var(--foreground)", letterSpacing: "-0.03em" }}>Dossier complet</div>
            <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>7 documents prêts à envoyer</div>
          </div>
        </div>

        <div className="rounded-xl p-5 mb-6 border border-border" style={{ background: "var(--secondary)" }}>
          <div className="flex items-baseline justify-between mb-1">
            <div className="text-4xl font-black" style={{ color: "var(--primary)", letterSpacing: "-0.04em" }}>19,99€</div>
            <div className="text-xs px-2 py-1 rounded-lg font-semibold" style={{ background: "rgba(212,240,0,0.1)", color: "var(--primary)" }}>Paiement unique</div>
          </div>
          <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Accès à vie · PDF téléchargeables immédiatement</div>
        </div>

        <div className="space-y-2 mb-6">
          {DOCUMENTS.map((doc, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: "rgba(34,197,94,0.1)" }}>
                <doc.icon className="w-3 h-3" style={{ color: "var(--accent)" }} />
              </div>
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{doc.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); onUnlock(); }, 1800); }}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-sm cursor-pointer transition-all"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)", opacity: loading ? 0.7 : 1 }}
        >
          <CreditCard className="w-4 h-4" />
          {loading ? "Traitement en cours…" : "Débloquer mon dossier — 19,99€"}
        </button>
        <p className="text-center text-xs mt-3" style={{ color: "var(--muted-foreground)" }}>
          Paiement sécurisé · Remboursé si non satisfait sous 30 jours
        </p>
      </div>
    </div>
  );
}

export function PremiumDocuments({ result, onBack }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  return (
    <div className="min-h-screen px-4 py-12 flex flex-col items-center" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-2xl">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm mb-8 cursor-pointer hover:opacity-80" style={{ color: "var(--muted-foreground)" }}>
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "var(--foreground)", letterSpacing: "-0.03em" }}>Documents administratifs</h2>
            {!unlocked && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border" style={{ background: "rgba(212,240,0,0.06)", color: "var(--primary)", borderColor: "rgba(212,240,0,0.2)" }}>
                <Lock className="w-3 h-3" /> Premium
              </span>
            )}
          </div>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            {unlocked ? "Tous vos documents sont prêts à télécharger" : "Débloquez votre dossier complet de mise en service"}
          </p>
        </div>

        {!unlocked && (
          <>
            {/* Paywall preview */}
            <div className="relative mb-6 rounded-2xl overflow-hidden border border-border" style={{ background: "var(--card)" }}>
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-8 px-6"
                style={{ background: "linear-gradient(to bottom, transparent 20%, var(--background) 80%)" }}>
                <p className="text-sm font-medium mb-4 text-center" style={{ color: "var(--muted-foreground)" }}>
                  7 documents personnalisés pour votre projet
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-sm cursor-pointer"
                  style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                >
                  <Lock className="w-4 h-4" /> Débloquer — 19,99€
                </button>
              </div>
              <div className="p-5 space-y-2.5 pointer-events-none select-none">
                {DOCUMENTS.map((doc, i) => <DocRow key={i} doc={doc} locked />)}
              </div>
            </div>

            {/* Value prop card */}
            <div className="rounded-2xl border border-border p-6" style={{ background: "var(--card)" }}>
              <div className="text-sm font-semibold mb-4" style={{ color: "var(--foreground)" }}>Ce que vous obtenez</div>
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                {[
                  "Déclaration préalable pré-remplie",
                  "Modèle courrier assurance",
                  "Guide des démarches complet",
                  "Checklist d'installation",
                  "Emails installateurs",
                  "Notice raccordement ENEDIS",
                ].map(item => (
                  <div key={item} className="flex items-center gap-2.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
                    <div className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: "rgba(34,197,94,0.1)" }}>
                      <FileText className="w-2.5 h-2.5" style={{ color: "var(--accent)" }} />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-black" style={{ color: "var(--foreground)", letterSpacing: "-0.04em" }}>19,99€</span>
                <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>paiement unique · accès à vie</span>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-sm cursor-pointer"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                <CreditCard className="w-4 h-4" /> Débloquer mon dossier
              </button>
            </div>
          </>
        )}

        {unlocked && (
          <>
            <div className="rounded-2xl border p-5 mb-5 flex items-center gap-3" style={{ borderColor: "rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.05)" }}>
              <Star className="w-5 h-5 shrink-0" style={{ color: "var(--accent)" }} />
              <div>
                <div className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Dossier débloqué avec succès</div>
                <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Cliquez sur un document pour le télécharger en PDF</div>
              </div>
            </div>
            <div className="space-y-2.5">
              {DOCUMENTS.map((doc, i) => (
                <button key={i} className="w-full text-left cursor-pointer hover:opacity-80 transition-opacity">
                  <DocRow doc={doc} unlocked />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {showModal && <PaywallModal onClose={() => setShowModal(false)} onUnlock={() => { setUnlocked(true); setShowModal(false); }} />}
    </div>
  );
}
