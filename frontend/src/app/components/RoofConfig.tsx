import { useState } from "react";
import { Plus, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { RoofSection } from "../utils/simulation";

interface Props {
  roofSections: RoofSection[];
  onNext: (sections: RoofSection[]) => void;
  onBack: () => void;
}

const orientations = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;
type Ori = typeof orientations[number];

const ORIENT_ANGLES: Record<Ori, number> = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315 };
const ORIENT_YIELD: Record<Ori, number> = { S: 100, SE: 95, SW: 95, E: 80, W: 80, NE: 55, NW: 55, N: 40 };

function yieldColor(y: number) {
  if (y >= 90) return { bg: "rgba(212,240,0,0.12)", color: "#d4f000", border: "rgba(212,240,0,0.3)" };
  if (y >= 70) return { bg: "rgba(34,197,94,0.1)", color: "#22c55e", border: "rgba(34,197,94,0.25)" };
  if (y >= 50) return { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "rgba(245,158,11,0.25)" };
  return { bg: "rgba(239,68,68,0.1)", color: "#ef4444", border: "rgba(239,68,68,0.25)" };
}

function CompassSelector({ value, onChange }: { value: Ori; onChange: (o: Ori) => void }) {
  const size = 180;
  const center = size / 2;
  const radius = 66;
  const toRad = (d: number) => (d - 90) * (Math.PI / 180);

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={80} fill="rgba(255,255,255,0.02)" stroke="var(--border)" strokeWidth="1" />
        <circle cx={center} cy={center} r={18} fill="var(--secondary)" stroke="var(--border)" strokeWidth="1" />
        <text x={center} y={center + 5} textAnchor="middle" fontSize={9} fontWeight={600} fill="var(--muted-foreground)">N</text>
        {[...Array(8)].map((_, i) => {
          const a = (i * 45 - 90) * (Math.PI / 180);
          return <line key={i} x1={center + 20 * Math.cos(a)} y1={center + 20 * Math.sin(a)} x2={center + 30 * Math.cos(a)} y2={center + 30 * Math.sin(a)} stroke="var(--border)" strokeWidth="1" />;
        })}
        {orientations.map(o => {
          const angle = toRad(ORIENT_ANGLES[o]);
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          const selected = value === o;
          const yld = ORIENT_YIELD[o];
          const c = yieldColor(yld);
          return (
            <g key={o} onClick={() => onChange(o)} style={{ cursor: "pointer" }}>
              <circle cx={x} cy={y} r={15}
                fill={selected ? c.bg : "var(--secondary)"}
                stroke={selected ? c.color : "var(--border)"}
                strokeWidth={selected ? 2 : 1}
              />
              <text x={x} y={y + 4} textAnchor="middle" fontSize={10} fontWeight={selected ? 800 : 500}
                fill={selected ? c.color : "var(--muted-foreground)"}>
                {o}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold"
        style={{ ...yieldColor(ORIENT_YIELD[value]), borderColor: yieldColor(ORIENT_YIELD[value]).border }}>
        Rendement {ORIENT_YIELD[value]}%
      </div>
    </div>
  );
}

function SectionCard({ section, index, onUpdate, onDelete, canDelete }: {
  section: RoofSection; index: number;
  onUpdate: (s: RoofSection) => void; onDelete: () => void; canDelete: boolean;
}) {
  const panels = Math.floor(section.surface * 0.85 * 0.16);
  const kwp = (panels * 0.4).toFixed(1);

  return (
    <div className="rounded-2xl border border-border p-6 transition-all" style={{ background: "var(--card)" }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            {index + 1}
          </div>
          <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Pan de toiture {index + 1}</span>
        </div>
        {canDelete && (
          <button onClick={onDelete} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-6 items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted-foreground)" }}>Orientation</p>
          <CompassSelector value={section.orientation} onChange={o => onUpdate({ ...section, orientation: o })} />
        </div>
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Inclinaison</span>
              <span className="text-sm font-bold" style={{ color: "var(--primary)" }}>{section.inclination}°</span>
            </div>
            <input type="range" min={0} max={90} step={5} value={section.inclination}
              onChange={e => onUpdate({ ...section, inclination: Number(e.target.value) })}
              className="w-full" style={{ accentColor: "var(--primary)" }} />
            <div className="flex justify-between text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
              <span>Plat</span><span>35° (optimal)</span><span>Vertical</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Surface</span>
              <span className="text-sm font-bold" style={{ color: "var(--primary)" }}>{section.surface} m²</span>
            </div>
            <input type="range" min={5} max={200} step={5} value={section.surface}
              onChange={e => onUpdate({ ...section, surface: Number(e.target.value) })}
              className="w-full" style={{ accentColor: "var(--primary)" }} />
            <div className="flex justify-between text-xs mt-1" style={{ color: "var(--muted-foreground)" }}><span>5 m²</span><span>200 m²</span></div>
          </div>
          <div className="rounded-xl p-4 border border-border" style={{ background: "var(--secondary)" }}>
            <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Capacité estimée</div>
            <div className="text-2xl font-bold" style={{ color: "var(--primary)" }}>{kwp} <span className="text-sm">kWc</span></div>
            <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{panels} panneaux · {section.surface} m²</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RoofConfig({ roofSections: initial, onNext, onBack }: Props) {
  const [sections, setSections] = useState<RoofSection[]>(
    initial.length > 0 ? initial : [{ id: "1", orientation: "S", inclination: 35, surface: 30 }]
  );

  const totalKwp = sections.reduce((s, sec) => s + Math.floor(sec.surface * 0.85 * 0.16) * 0.4, 0);
  const totalPanels = sections.reduce((s, sec) => s + Math.floor(sec.surface * 0.85 * 0.16), 0);

  return (
    <div className="min-h-screen px-4 py-12 flex flex-col items-center" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-2xl">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm mb-8 cursor-pointer hover:opacity-80 transition-colors" style={{ color: "var(--muted-foreground)" }}>
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>Étape 3 / 6</p>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "var(--foreground)", letterSpacing: "-0.03em" }}>Configuration toiture</h2>
            <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>Décrivez chaque pan disponible</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black" style={{ color: "var(--primary)", letterSpacing: "-0.04em" }}>{totalKwp.toFixed(1)} kWc</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{totalPanels} panneaux</div>
          </div>
        </div>

        <div className="space-y-4">
          {sections.map((sec, i) => (
            <SectionCard key={sec.id} section={sec} index={i}
              onUpdate={u => setSections(s => s.map(x => x.id === sec.id ? u : x))}
              onDelete={() => setSections(s => s.filter(x => x.id !== sec.id))}
              canDelete={sections.length > 1} />
          ))}
          {sections.length < 4 && (
            <button
              onClick={() => setSections(s => [...s, { id: String(Date.now()), orientation: "SE", inclination: 35, surface: 20 }])}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed text-sm font-semibold cursor-pointer transition-all"
              style={{ borderColor: "rgba(212,240,0,0.2)", color: "var(--muted-foreground)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(212,240,0,0.2)"; e.currentTarget.style.color = "var(--muted-foreground)"; }}
            >
              <Plus className="w-4 h-4" /> Ajouter un pan de toit
            </button>
          )}
        </div>

        <button
          onClick={() => onNext(sections)}
          className="mt-6 w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-sm cursor-pointer transition-all"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)", letterSpacing: "-0.01em" }}
        >
          Lancer la simulation <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
