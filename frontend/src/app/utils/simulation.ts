export interface ProjectData {
  address: string;
  houseType: "maison" | "appartement" | "autre";
  surface: number;
  heating: "electric" | "gas" | "fioul" | "pac";
  hotWater: "electric" | "gas" | "solar";
  hasAC: boolean;
  hasPool: boolean;
  hasEV: boolean;
  hasDryer: boolean;
  hasDishwasher: boolean;
  hasElectricCooking: boolean;
  monthlyKwhManual: number | null;
  roofSections: RoofSection[];
}

export interface RoofSection {
  id: string;
  orientation: "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";
  inclination: number;
  surface: number;
}

export interface SimulationResult {
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

const ORIENTATION_FACTOR: Record<string, number> = {
  S: 1.0, SE: 0.95, SW: 0.95,
  E: 0.8, W: 0.8,
  NE: 0.55, NW: 0.55,
  N: 0.4,
};

const MONTHLY_IRRADIANCE = [0.55, 0.65, 0.85, 1.05, 1.2, 1.3, 1.25, 1.15, 0.95, 0.75, 0.55, 0.5];

function inclinationFactor(angle: number): number {
  const optimal = 35;
  const diff = Math.abs(angle - optimal);
  return 1 - diff * 0.003;
}

export function estimateConsumption(data: Partial<ProjectData>): number {
  if (data.monthlyKwhManual) return data.monthlyKwhManual * 12;
  let base = 2000;
  if (data.heating === "electric") base += 3500;
  if (data.heating === "pac") base += 1800;
  if (data.hotWater === "electric") base += 1200;
  if (data.hasAC) base += 800;
  if (data.hasPool) base += 2000;
  if (data.hasEV) base += 2200;
  if (data.hasDryer) base += 400;
  if (data.hasDishwasher) base += 250;
  if (data.hasElectricCooking) base += 600;
  return base;
}

export function runSimulation(data: ProjectData): SimulationResult {
  const annualConsumptionKwh = estimateConsumption(data);

  let totalUsableSurface = 0;
  let weightedOrientationFactor = 0;
  let weightedInclinationFactor = 0;

  for (const section of data.roofSections) {
    const usable = section.surface * 0.85;
    totalUsableSurface += usable;
    weightedOrientationFactor += usable * ORIENTATION_FACTOR[section.orientation];
    weightedInclinationFactor += usable * inclinationFactor(section.inclination);
  }

  const avgOrientFactor = totalUsableSurface > 0 ? weightedOrientationFactor / totalUsableSurface : 0.9;
  const avgInclFactor = totalUsableSurface > 0 ? weightedInclinationFactor / totalUsableSurface : 0.9;

  const panelsPerM2 = 0.16;
  const panelCount = Math.floor(totalUsableSurface * panelsPerM2);
  const totalPowerKwp = Math.round(panelCount * 0.4 * 10) / 10;

  const peakSunHours = 1300;
  const systemEfficiency = 0.82;
  const annualProductionKwh = Math.round(
    totalPowerKwp * peakSunHours * avgOrientFactor * avgInclFactor * systemEfficiency
  );

  const monthlyProduction = MONTHLY_IRRADIANCE.map(factor =>
    Math.round(annualProductionKwh * factor / MONTHLY_IRRADIANCE.reduce((a, b) => a + b, 0))
  );

  const avgMonthlyConsumption = annualConsumptionKwh / 12;
  const monthlyConsumption = [1.2, 1.15, 1.05, 0.95, 0.9, 0.85, 0.85, 0.9, 0.95, 1.05, 1.1, 1.2].map(
    f => Math.round(avgMonthlyConsumption * f)
  );

  const selfConsumptionRate = Math.min(0.95, Math.max(0.3,
    annualProductionKwh > 0
      ? Math.min(annualConsumptionKwh, annualProductionKwh) / annualProductionKwh
      : 0
  ));

  const electricityPrice = 0.2276;
  const annualSavingsEur = Math.round(annualProductionKwh * selfConsumptionRate * electricityPrice);
  const co2AvoidedKg = Math.round(annualProductionKwh * 0.0571);

  const coverageRatio = annualConsumptionKwh > 0 ? annualProductionKwh / annualConsumptionKwh : 0;
  const energyScore = Math.min(100, Math.round(coverageRatio * 80 + selfConsumptionRate * 20));

  return {
    totalPowerKwp,
    annualProductionKwh,
    selfConsumptionRate,
    annualConsumptionKwh,
    annualSavingsEur,
    co2AvoidedKg,
    panelCount,
    monthlyProduction,
    monthlyConsumption,
    energyScore,
  };
}

export function getROIData(result: SimulationResult, scenario: "diy" | "pro") {
  const installCost = scenario === "diy"
    ? result.totalPowerKwp * 1200
    : result.totalPowerKwp * 2200;
  const aid = scenario === "pro" ? Math.min(1500 + result.totalPowerKwp * 200, 4000) : 0;
  const netCost = installCost - aid;
  const annualGain = result.annualSavingsEur;
  const inflationRate = 0.04;

  const years = Array.from({ length: 21 }, (_, i) => i);
  const optimistic = years.map(y => Math.round(-netCost + annualGain * (y > 0 ? ((Math.pow(1 + inflationRate + 0.01, y) - 1) / (inflationRate + 0.01)) : 0)));
  const realistic = years.map(y => Math.round(-netCost + annualGain * (y > 0 ? ((Math.pow(1 + inflationRate, y) - 1) / inflationRate) : 0)));
  const conservative = years.map(y => Math.round(-netCost + annualGain * (y > 0 ? ((Math.pow(1 + inflationRate - 0.01, y) - 1) / (inflationRate - 0.01)) : 0)));

  const roiYear = realistic.findIndex(v => v >= 0);

  return { installCost, aid, netCost, annualGain, optimistic, realistic, conservative, roiYear };
}
