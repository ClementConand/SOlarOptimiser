import { useState } from "react";
import { ArrowRight, ArrowLeft, Wrench, HardHat, Check, X, Star, Shield, Clock } from "lucide-react";
import { SimulationResult, getROIData } from "../utils/simulation";

interface Props {
  result: SimulationResult;
  onNext: () => void;
  onBack: () => void;
}

const tableRows = [
  { label: "Démarches administratives", diy: false as const, pro: true as const },
  { label: "Raccordement réseau", diy: "Complexe", pro: "Inclus" },
  { label: "Garantie décennale", diy: false as const, pro: true as const },
  { label: "Aides MaPrimeRénov'", diy: false as const, pro: true as const },
  { label: "SAV inclus", diy: false as const, pro: true as const },
  { label: "Revente surplus", diy: "Possible", pro: "Optimisée" },
  { label: "Monitoring", diy: "Basique", pro: "Avancé" },
];

export function ScenarioComparison({ result, onNext, onBack }: Props) {
  const [selected, setSelected] = useState<"diy" | "pro">("pro");
  const diy = getROIData(result, "diy");
  const pro = getROIData(result, "pro");

  const scenarios = [
    {
      id: "diy" as const, icon: Wrench, title: "Auto-installation", sub: "Kit solaire",
      cost: diy.installCost, aid: 0, netCost: diy.netCost, roi: diy.roiYear, gain: diy.annualGain,
      badge: null,
      features: ["Compétences techniques requises", "2–5 jours d'installation", "Garantie produit fabricant"],
      featureIcons: [Wrench, Clock, Shield],
    },
    {
      id: "pro" as const, icon: HardHat, title: "Installateur pro", sub: "Clé en main",
      cost: pro.installCost, aid: pro.aid, netCost: pro.netCost, roi: pro.roiYear, gain: pro.annualGain,
      badge: "Recommandé",
      features: ["Installation certifiée RGE", "1 jour d'installation", "Garantie 10 ans pose + 25 ans"],
      featureIcons: [Check, Clock, Shield],
    },
  ];

  return (
    <div className="min-h-screen px-4 py-12 flex flex-col items-center" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-3xl">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm mb-8 cursor-pointer hover:opacity-80" style={{ color: "var(--muted-foreground)" }}>
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>Étape 5 / 6</p>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "var(--foreground)", letterSpacing: "-0.03em" }}>Comparatif des scénarios</h2>
          <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>Choisissez votre mode d'installation</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {scenarios.map(sc => {
            const isSelected = selected === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => setSelected(sc.id)}
                className="text-left rounded-2xl border-2 p-6 transition-all cursor-pointer relative"
                style={{
                  borderColor: isSelected ? "var(--primary)" : "var(--border)",
                  background: isSelected ? "rgba(212,240,0,0.04)" : "var(--card)",
                }}
              >
                {sc.badge && (
                  <div className="absolute -top-3 right-5">
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                      <Star className="w-3 h-3" /> {sc.badge}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--secondary)", color: isSelected ? "var(--primary)" : "var(--muted-foreground)" }}>
                    <sc.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{sc.title}</div>
                    <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{sc.sub}</div>
                  </div>
                </div>

                <div className="space-y-2.5 mb-5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Coût installation</span>
                    <span className="text-xl font-black" style={{ color: "var(--foreground)", letterSpacing: "-0.03em" }}>{sc.cost.toLocaleString("fr")} €</span>
                  </div>
                  {sc.aid > 0 && (
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Aide MaPrimeRénov'</span>
                      <span className="text-sm font-bold" style={{ color: "var(--accent)" }}>- {sc.aid.toLocaleString("fr")} €</span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                    <span className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>Coût net</span>
                    <span className="text-sm font-black" style={{ color: isSelected ? "var(--primary)" : "var(--foreground)" }}>{sc.netCost.toLocaleString("fr")} €</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="rounded-xl p-3 text-center" style={{ background: "var(--secondary)" }}>
                      <div className="text-xs mb-0.5" style={{ color: "var(--muted-foreground)" }}>Retour invest.</div>
                      <div className="text-lg font-black" style={{ color: "var(--foreground)", letterSpacing: "-0.03em" }}>{sc.roi} ans</div>
                    </div>
                    <div className="rounded-xl p-3 text-center" style={{ background: "var(--secondary)" }}>
                      <div className="text-xs mb-0.5" style={{ color: "var(--muted-foreground)" }}>Éco. / an</div>
                      <div className="text-lg font-black" style={{ color: isSelected ? "var(--primary)" : "var(--foreground)", letterSpacing: "-0.03em" }}>{sc.gain.toLocaleString("fr")} €</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                  {sc.features.map((f, i) => {
                    const FeatureIcon = sc.featureIcons[i];
                    return (
                      <div key={f} className="flex items-center gap-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
                        <FeatureIcon className="w-3.5 h-3.5 shrink-0" style={{ color: isSelected && sc.id === "pro" ? "var(--accent)" : "var(--muted-foreground)" }} />
                        {f}
                      </div>
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>

        {/* Comparison table */}
        <div className="rounded-2xl border border-border p-6 mb-6" style={{ background: "var(--card)" }}>
          <div className="text-sm font-semibold mb-5" style={{ color: "var(--foreground)" }}>Tableau comparatif</div>
          <div className="grid grid-cols-3 mb-3">
            <div />
            <div className="text-center text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>DIY</div>
            <div className="text-center text-xs font-bold uppercase tracking-widest" style={{ color: "var(--accent)" }}>Pro</div>
          </div>
          {tableRows.map(row => (
            <div key={row.label} className="grid grid-cols-3 items-center py-3 border-t" style={{ borderColor: "var(--border)" }}>
              <div className="text-xs pr-2" style={{ color: "var(--muted-foreground)" }}>{row.label}</div>
              <div className="text-center">
                {typeof row.diy === "boolean"
                  ? (row.diy ? <Check className="w-4 h-4 mx-auto" style={{ color: "var(--accent)" }} /> : <X className="w-4 h-4 mx-auto" style={{ color: "var(--muted-foreground)" }} />)
                  : <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{row.diy}</span>}
              </div>
              <div className="text-center">
                {typeof row.pro === "boolean"
                  ? (row.pro ? <Check className="w-4 h-4 mx-auto" style={{ color: "var(--accent)" }} /> : <X className="w-4 h-4 mx-auto" style={{ color: "var(--muted-foreground)" }} />)
                  : <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{row.pro}</span>}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onNext}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-sm cursor-pointer transition-all"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)", letterSpacing: "-0.01em" }}
        >
          Voir l'analyse financière <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
