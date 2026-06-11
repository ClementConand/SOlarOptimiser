import { useState } from "react";
import { ArrowRight, ArrowLeft, TrendingUp, Euro, Calendar } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from "recharts";
import { SimulationResult, getROIData } from "../utils/simulation";

interface Props {
  result: SimulationResult;
  onNext: () => void;
  onBack: () => void;
}

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--foreground)",
};

export function ROIAnalysis({ result, onNext, onBack }: Props) {
  const [scenario, setScenario] = useState<"diy" | "pro">("pro");
  const roi = getROIData(result, scenario);

  const chartData = Array.from({ length: 21 }, (_, i) => ({
    year: `${i}`,
    Optimiste: roi.optimistic[i],
    Réaliste: roi.realistic[i],
    Conservateur: roi.conservative[i],
  }));

  const savings20 = roi.realistic[20];

  return (
    <div className="min-h-screen px-4 py-12 flex flex-col items-center" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-3xl">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm mb-8 cursor-pointer hover:opacity-80" style={{ color: "var(--muted-foreground)" }}>
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>Étape 6 / 6</p>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "var(--foreground)", letterSpacing: "-0.03em" }}>Amortissement & ROI</h2>
          <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>Projection financière sur 20 ans</p>
        </div>

        <div className="flex gap-2 mb-6">
          {(["diy", "pro"] as const).map(s => (
            <button key={s} onClick={() => setScenario(s)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer border"
              style={{
                background: scenario === s ? "var(--primary)" : "var(--card)",
                color: scenario === s ? "var(--primary-foreground)" : "var(--muted-foreground)",
                borderColor: scenario === s ? "var(--primary)" : "var(--border)",
              }}
            >
              {s === "diy" ? "Auto-installation" : "Installateur pro"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: Euro, label: "Coût net", value: `${roi.netCost.toLocaleString("fr")} €`, color: "var(--foreground)" },
            { icon: Calendar, label: "Retour invest.", value: roi.roiYear > 0 ? `${roi.roiYear} ans` : "< 1 an", color: "var(--foreground)" },
            { icon: TrendingUp, label: "Gain sur 20 ans", value: `${savings20 >= 0 ? "+" : ""}${savings20.toLocaleString("fr")} €`, color: savings20 >= 0 ? "var(--primary)" : "var(--destructive)" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="rounded-2xl border border-border p-5" style={{ background: "var(--card)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: "var(--secondary)" }}>
                <Icon className="w-4 h-4" style={{ color: "var(--accent)" }} />
              </div>
              <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>{label}</div>
              <div className="text-xl font-black" style={{ color, letterSpacing: "-0.03em" }}>{value}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border p-6 mb-5" style={{ background: "var(--card)" }}>
          <div className="mb-5">
            <div className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Cashflow cumulé sur 20 ans</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Gain net cumulé (€) selon l'évolution du prix de l'électricité</div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                label={{ value: "Années", position: "insideBottom", offset: -10, fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={v => `${(v / 1000).toFixed(0)}k€`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toLocaleString("fr")} €`]} />
              <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} />
              <Line type="monotone" dataKey="Optimiste" stroke="#d4f000" strokeWidth={2} dot={false} strokeDasharray="5 3" />
              <Line type="monotone" dataKey="Réaliste" stroke="#22c55e" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="Conservateur" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border p-5 mb-6 flex gap-3 items-start" style={{ background: "var(--card)" }}>
          <TrendingUp className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--accent)" }} />
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>Impact hausse prix de l'électricité</p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              En France, le prix de l'électricité a augmenté en moyenne de <strong style={{ color: "var(--foreground)" }}>+4%/an</strong> sur 20 ans.
              Scénario optimiste +5%, réaliste +4%, conservateur +3%.
            </p>
          </div>
        </div>

        <button
          onClick={onNext}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-sm cursor-pointer transition-all"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)", letterSpacing: "-0.01em" }}
        >
          Générer mon dossier complet <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
