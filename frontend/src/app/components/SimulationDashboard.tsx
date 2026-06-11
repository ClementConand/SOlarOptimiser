import { ArrowRight, ArrowLeft, Zap, Euro, Leaf, Sun } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Legend, ResponsiveContainer,
} from "recharts";
import { SimulationResult } from "../utils/simulation";

interface Props {
  result: SimulationResult;
  onNext: () => void;
  onBack: () => void;
}

const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

function Stat({ icon: Icon, label, value, sub, accent }: { icon: React.ElementType; label: string; value: string; sub: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-border p-5" style={{ background: "var(--card)" }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--secondary)" }}>
          <Icon className="w-4 h-4" style={{ color: accent || "var(--accent)" }} />
        </div>
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{label}</span>
      </div>
      <div className="text-2xl font-black leading-none mb-1" style={{ color: accent || "var(--foreground)", letterSpacing: "-0.03em" }}>{value}</div>
      <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{sub}</div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 52, cx = 64, cy = 64;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ * 0.75;
  const gap = circ - dash;
  const rotation = -225;
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Très bon" : score >= 40 ? "Bon" : "Moyen";
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 128, height: 128 }}>
        <svg width={128} height={128} viewBox="0 0 128 128">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--secondary)" strokeWidth={10} strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} strokeDashoffset={0} strokeLinecap="round" transform={`rotate(${rotation} ${cx} ${cy})`} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--primary)" strokeWidth={10} strokeDasharray={`${dash} ${gap + circ * 0.25}`} strokeLinecap="round" transform={`rotate(${rotation} ${cx} ${cy})`} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black" style={{ color: "var(--primary)", letterSpacing: "-0.04em" }}>{score}</span>
          <span className="text-[10px] font-medium" style={{ color: "var(--muted-foreground)" }}>{label}</span>
        </div>
      </div>
      <span className="text-[10px] mt-1" style={{ color: "var(--muted-foreground)" }}>Score d'autonomie</span>
    </div>
  );
}

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--foreground)",
};

export function SimulationDashboard({ result, onNext, onBack }: Props) {
  const monthlyData = MONTHS.map((month, i) => ({
    month,
    Production: result.monthlyProduction[i],
    Consommation: result.monthlyConsumption[i],
    Autoconsommation: Math.min(result.monthlyProduction[i], result.monthlyConsumption[i]),
    Surplus: Math.max(0, result.monthlyProduction[i] - result.monthlyConsumption[i]),
  }));

  const selfPct = Math.round(result.selfConsumptionRate * 100);
  const coverPct = Math.min(100, Math.round((result.annualProductionKwh / result.annualConsumptionKwh) * 100));

  return (
    <div className="min-h-screen px-4 py-12 flex flex-col items-center" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-3xl">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm mb-8 cursor-pointer hover:opacity-80" style={{ color: "var(--muted-foreground)" }}>
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>Étape 4 / 6</p>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "var(--foreground)", letterSpacing: "-0.03em" }}>Simulation solaire</h2>
            <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>Installation recommandée : {result.totalPowerKwp} kWc · {result.panelCount} panneaux</p>
          </div>
          <ScoreRing score={result.energyScore} />
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <Stat icon={Sun} label="Production annuelle" value={`${result.annualProductionKwh.toLocaleString("fr")} kWh`} sub="par an" accent="#f59e0b" />
          <Stat icon={Zap} label="Puissance installée" value={`${result.totalPowerKwp} kWc`} sub={`${result.panelCount} panneaux`} accent="#60a5fa" />
          <Stat icon={Euro} label="Économie annuelle" value={`${result.annualSavingsEur.toLocaleString("fr")} €`} sub="sur facture EDF" accent="var(--primary)" />
          <Stat icon={Leaf} label="CO₂ évité" value={`${result.co2AvoidedKg} kg`} sub="par an" accent="var(--accent)" />
        </div>

        {/* Rate cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: "Taux d'autoconsommation", value: selfPct, color: "var(--primary)", sub: "de la production directement consommée" },
            { label: "Taux de couverture", value: coverPct, color: "#60a5fa", sub: "de votre consommation couverte" },
          ].map(({ label, value, color, sub }) => (
            <div key={label} className="rounded-2xl border border-border p-5" style={{ background: "var(--card)" }}>
              <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>{label}</div>
              <div className="text-3xl font-black mb-3" style={{ color, letterSpacing: "-0.04em" }}>{value}%</div>
              <div className="w-full h-1.5 rounded-full" style={{ background: "var(--secondary)" }}>
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--muted-foreground)" }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Area chart */}
        <div className="rounded-2xl border border-border p-6 mb-4" style={{ background: "var(--card)" }}>
          <div className="mb-5">
            <div className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Production vs Consommation</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Comparaison mensuelle (kWh)</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="gProd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4f000" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#d4f000" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gConso" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }} />
              <Area type="monotone" dataKey="Production" stroke="#d4f000" fill="url(#gProd)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="Consommation" stroke="#60a5fa" fill="url(#gConso)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart */}
        <div className="rounded-2xl border border-border p-6 mb-6" style={{ background: "var(--card)" }}>
          <div className="mb-5">
            <div className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Répartition mensuelle</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Autoconsommation et surplus (kWh)</div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }} />
              <Bar dataKey="Autoconsommation" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Surplus" stackId="a" fill="#d4f000" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <button
          onClick={onNext}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-sm cursor-pointer transition-all"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)", letterSpacing: "-0.01em" }}
        >
          Comparer les scénarios <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
