import { useState } from "react";
import { Flame, Droplets, Wind, Waves, Car, Shirt, ChefHat, Utensils, ArrowRight, ArrowLeft, Zap } from "lucide-react";
import { ProjectData } from "../utils/simulation";

interface Props {
  data: Partial<ProjectData>;
  onNext: (data: Partial<ProjectData>) => void;
  onBack: () => void;
}

const heatingOptions = [
  { id: "electric", label: "Électrique" },
  { id: "gas", label: "Gaz" },
  { id: "fioul", label: "Fioul" },
  { id: "pac", label: "Pompe à chaleur" },
] as const;

const hotWaterOptions = [
  { id: "electric", label: "Électrique" },
  { id: "gas", label: "Gaz" },
  { id: "solar", label: "Solaire" },
] as const;

interface EquipItem {
  key: keyof Pick<ProjectData, "hasAC" | "hasPool" | "hasEV" | "hasDryer" | "hasDishwasher" | "hasElectricCooking">;
  label: string;
  icon: React.ElementType;
  impact: string;
}

const equipmentList: EquipItem[] = [
  { key: "hasAC", label: "Climatisation", icon: Wind, impact: "+800 kWh/an" },
  { key: "hasPool", label: "Piscine", icon: Waves, impact: "+2 000 kWh/an" },
  { key: "hasEV", label: "Véhicule électrique", icon: Car, impact: "+2 200 kWh/an" },
  { key: "hasDryer", label: "Sèche-linge", icon: Shirt, impact: "+400 kWh/an" },
  { key: "hasDishwasher", label: "Lave-vaisselle", icon: Utensils, impact: "+250 kWh/an" },
  { key: "hasElectricCooking", label: "Cuisson électrique", icon: ChefHat, impact: "+600 kWh/an" },
];

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border p-6" style={{ background: "var(--card)" }}>
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--secondary)" }}>
          <Icon className="w-4 h-4" style={{ color: "var(--accent)" }} />
        </div>
        <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function PillGroup({ options, value, onChange }: { options: readonly { id: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer border"
          style={{
            background: value === o.id ? "var(--primary)" : "var(--secondary)",
            color: value === o.id ? "var(--primary-foreground)" : "var(--muted-foreground)",
            borderColor: value === o.id ? "var(--primary)" : "transparent",
            fontWeight: value === o.id ? 700 : 500,
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function EnergyProfile({ data, onNext, onBack }: Props) {
  const [heating, setHeating] = useState<ProjectData["heating"]>(data.heating || "electric");
  const [hotWater, setHotWater] = useState<ProjectData["hotWater"]>(data.hotWater || "electric");
  const [equipment, setEquipment] = useState({
    hasAC: data.hasAC ?? false,
    hasPool: data.hasPool ?? false,
    hasEV: data.hasEV ?? false,
    hasDryer: data.hasDryer ?? true,
    hasDishwasher: data.hasDishwasher ?? true,
    hasElectricCooking: data.hasElectricCooking ?? false,
  });
  const [useManual, setUseManual] = useState(data.monthlyKwhManual != null);
  const [monthlyKwh, setMonthlyKwh] = useState(data.monthlyKwhManual || 350);

  const toggle = (key: keyof typeof equipment) => setEquipment(e => ({ ...e, [key]: !e[key] }));

  return (
    <div className="min-h-screen px-4 py-12 flex flex-col items-center" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-2xl">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm mb-8 transition-colors cursor-pointer hover:opacity-80" style={{ color: "var(--muted-foreground)" }}>
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>Étape 2 / 6</p>
          <h2 className="leading-tight" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "var(--foreground)", letterSpacing: "-0.03em" }}>
            Profil de consommation
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>Décrivez vos équipements pour une estimation précise</p>
        </div>

        <div className="space-y-4">
          <Section title="Système de chauffage" icon={Flame}>
            <PillGroup options={heatingOptions} value={heating} onChange={v => setHeating(v as ProjectData["heating"])} />
          </Section>

          <Section title="Eau chaude sanitaire" icon={Droplets}>
            <PillGroup options={hotWaterOptions} value={hotWater} onChange={v => setHotWater(v as ProjectData["hotWater"])} />
          </Section>

          <Section title="Équipements" icon={Zap}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {equipmentList.map(item => {
                const active = equipment[item.key];
                return (
                  <button
                    key={item.key}
                    onClick={() => toggle(item.key)}
                    className="flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer text-left"
                    style={{
                      background: active ? "rgba(212,240,0,0.06)" : "var(--secondary)",
                      borderColor: active ? "var(--primary)" : "transparent",
                    }}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all"
                      style={{ background: active ? "var(--primary)" : "var(--muted)", color: active ? "var(--primary-foreground)" : "var(--muted-foreground)" }}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{item.label}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{item.impact}</div>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                      style={{ borderColor: active ? "var(--primary)" : "var(--border)", background: active ? "var(--primary)" : "transparent" }}>
                      {active && <div className="w-2 h-2 rounded-full" style={{ background: "var(--primary-foreground)" }} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </Section>

          <div className="rounded-2xl border border-border p-6" style={{ background: "var(--card)" }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Je connais ma consommation mensuelle</span>
              <button
                onClick={() => setUseManual(m => !m)}
                className="relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0"
                style={{ background: useManual ? "var(--primary)" : "var(--switch-background)" }}
              >
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform" style={{ transform: useManual ? "translateX(20px)" : "none" }} />
              </button>
            </div>
            {useManual ? (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>Consommation mensuelle</span>
                  <span className="text-sm font-bold" style={{ color: "var(--primary)" }}>{monthlyKwh} kWh</span>
                </div>
                <input type="range" min={50} max={2000} step={10} value={monthlyKwh}
                  onChange={e => setMonthlyKwh(Number(e.target.value))}
                  className="w-full" style={{ accentColor: "var(--primary)" }} />
                <p className="text-xs mt-2" style={{ color: "var(--muted-foreground)" }}>Retrouvez cette valeur sur votre facture EDF</p>
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Nous calculerons votre consommation à partir de vos équipements.</p>
            )}
          </div>
        </div>

        <button
          onClick={() => onNext({ heating, hotWater, ...equipment, monthlyKwhManual: useManual ? monthlyKwh : null })}
          className="mt-6 w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-sm cursor-pointer transition-all"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)", letterSpacing: "-0.01em" }}
        >
          Configurer ma toiture <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
