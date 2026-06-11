import { useState } from "react";
import { MapPin, Home, Building2, Warehouse, ArrowRight } from "lucide-react";
import { ProjectData } from "../utils/simulation";

interface Props {
  data: Partial<ProjectData>;
  onNext: (data: Partial<ProjectData>) => void;
}

const houseTypes = [
  { id: "maison", label: "Maison", icon: Home },
  { id: "appartement", label: "Appartement", icon: Building2 },
  { id: "autre", label: "Autre", icon: Warehouse },
] as const;

export function Onboarding({ data, onNext }: Props) {
  const [address, setAddress] = useState(data.address || "");
  const [houseType, setHouseType] = useState<ProjectData["houseType"]>(data.houseType || "maison");
  const [surface, setSurface] = useState(data.surface || 120);

  const canContinue = address.trim().length > 3;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--primary)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4" fill="var(--primary-foreground)" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" stroke="var(--primary-foreground)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-semibold tracking-tight" style={{ color: "var(--foreground)" }}>Solar Optimizer</span>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-full border border-border" style={{ color: "var(--muted-foreground)" }}>
          Simulation gratuite
        </span>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl">
          {/* Hero text */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border mb-6" style={{ background: "var(--secondary)" }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
              <span className="text-xs font-medium" style={{ color: "var(--secondary-foreground)" }}>Dimensionnement solaire</span>
            </div>
            <h1 className="mb-4 leading-tight" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, color: "var(--foreground)", letterSpacing: "-0.03em" }}>
              Votre installation solaire<br />
              <span style={{ color: "var(--primary)" }}>optimisée en 5 minutes.</span>
            </h1>
            <p style={{ color: "var(--muted-foreground)", lineHeight: 1.7 }}>
              Simulation personnalisée, comparatif de scénarios et analyse financière complète — sans inscription.
            </p>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-border p-7" style={{ background: "var(--card)" }}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm mb-2.5 font-medium" style={{ color: "var(--foreground)" }}>Adresse du logement</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="12 rue de la Paix, 75001 Paris"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border focus:outline-none transition-all"
                    style={{
                      background: "var(--input-background)",
                      color: "var(--foreground)",
                      borderColor: "var(--border)",
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,240,0,0.1)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-3 font-medium" style={{ color: "var(--foreground)" }}>Type de logement</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {houseTypes.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setHouseType(id)}
                      className="flex flex-col items-center gap-2.5 py-4 px-3 rounded-xl border-2 transition-all cursor-pointer"
                      style={{
                        borderColor: houseType === id ? "var(--primary)" : "var(--border)",
                        background: houseType === id ? "rgba(212,240,0,0.06)" : "var(--secondary)",
                        color: houseType === id ? "var(--primary)" : "var(--muted-foreground)",
                      }}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-semibold">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium" style={{ color: "var(--foreground)" }}>Surface habitable</label>
                  <span className="text-sm font-bold px-2.5 py-0.5 rounded-lg" style={{ background: "rgba(212,240,0,0.1)", color: "var(--primary)" }}>{surface} m²</span>
                </div>
                <input
                  type="range" min={20} max={500} step={5} value={surface}
                  onChange={e => setSurface(Number(e.target.value))}
                  className="w-full" style={{ accentColor: "var(--primary)" }}
                />
                <div className="flex justify-between text-xs mt-1.5" style={{ color: "var(--muted-foreground)" }}>
                  <span>20 m²</span><span>500 m²</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNext({ address, houseType, surface })}
              disabled={!canContinue}
              className="mt-7 w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-sm transition-all cursor-pointer"
              style={{
                background: canContinue ? "var(--primary)" : "var(--secondary)",
                color: canContinue ? "var(--primary-foreground)" : "var(--muted-foreground)",
                opacity: canContinue ? 1 : 0.5,
                letterSpacing: "-0.01em",
              }}
            >
              Commencer l'analyse
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Trust bar */}
          <div className="flex items-center justify-center gap-6 mt-7 flex-wrap">
            {["Simulation gratuite", "Aucun engagement", "Données privées"].map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
