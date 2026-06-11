import { useState } from "react";
import { Sun, Check } from "lucide-react";
import { Onboarding } from "./components/Onboarding";
import { EnergyProfile } from "./components/EnergyProfile";
import { RoofConfig } from "./components/RoofConfig";
import { SimulationDashboard } from "./components/SimulationDashboard";
import { ScenarioComparison } from "./components/ScenarioComparison";
import { ROIAnalysis } from "./components/ROIAnalysis";
import { PremiumDocuments } from "./components/PremiumDocuments";
import { ProjectData, RoofSection, SimulationResult, runSimulation } from "./utils/simulation";

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const STEPS = [
  { label: "Projet" },
  { label: "Consommation" },
  { label: "Toiture" },
  { label: "Simulation" },
  { label: "Scénarios" },
  { label: "ROI" },
  { label: "Documents" },
];

const defaultProject: Partial<ProjectData> = {
  address: "",
  houseType: "maison",
  surface: 120,
  heating: "electric",
  hotWater: "electric",
  hasAC: false,
  hasPool: false,
  hasEV: false,
  hasDryer: true,
  hasDishwasher: true,
  hasElectricCooking: false,
  monthlyKwhManual: null,
  roofSections: [],
};

function ProgressBar({ step }: { step: Step }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 border-b border-border" style={{ background: "rgba(9,13,8,0.92)", backdropFilter: "blur(12px)" }}>
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "var(--primary)" }}>
              <Sun className="w-3.5 h-3.5" style={{ color: "var(--primary-foreground)" }} />
            </div>
            <span className="text-sm font-bold" style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}>Solar Optimizer</span>
          </div>
          <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
            {step + 1} / {STEPS.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1">
              <div className="h-1 w-full rounded-full transition-all duration-500"
                style={{ background: i <= step ? "var(--primary)" : "var(--secondary)" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState<Step>(0);
  const [project, setProject] = useState<Partial<ProjectData>>(defaultProject);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);

  const merge = (data: Partial<ProjectData>) => {
    setProject(prev => ({ ...prev, ...data }));
  };

  const goTo = (s: Step) => setStep(s);

  const handleRoofNext = (sections: RoofSection[]) => {
    const fullProject = { ...project, roofSections: sections } as ProjectData;
    merge({ roofSections: sections });
    const result = runSimulation(fullProject);
    setSimulation(result);
    goTo(3);
  };

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* MARKER-MAKE-KIT-INVOKED */}
      {step > 0 && <ProgressBar step={step} />}
      <div className={step > 0 ? "pt-[72px]" : ""}>
        {step === 0 && (
          <Onboarding
            data={project}
            onNext={data => { merge(data); goTo(1); }}
          />
        )}
        {step === 1 && (
          <EnergyProfile
            data={project}
            onNext={data => { merge(data); goTo(2); }}
            onBack={() => goTo(0)}
          />
        )}
        {step === 2 && (
          <RoofConfig
            roofSections={project.roofSections || []}
            onNext={handleRoofNext}
            onBack={() => goTo(1)}
          />
        )}
        {step === 3 && simulation && (
          <SimulationDashboard
            result={simulation}
            onNext={() => goTo(4)}
            onBack={() => goTo(2)}
          />
        )}
        {step === 4 && simulation && (
          <ScenarioComparison
            result={simulation}
            onNext={() => goTo(5)}
            onBack={() => goTo(3)}
          />
        )}
        {step === 5 && simulation && (
          <ROIAnalysis
            result={simulation}
            onNext={() => goTo(6)}
            onBack={() => goTo(4)}
          />
        )}
        {step === 6 && simulation && (
          <PremiumDocuments
            result={simulation}
            onBack={() => goTo(5)}
          />
        )}
      </div>
    </div>
  );
}
