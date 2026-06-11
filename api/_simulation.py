"""
Solar simulation engine — shared by all API functions.
Pure Python, no external dependencies.
"""
from __future__ import annotations
import math
from typing import Optional

ORIENTATION_FACTOR = {
    "S": 1.00, "SE": 0.95, "SW": 0.95,
    "E": 0.80, "W": 0.80,
    "NE": 0.55, "NW": 0.55,
    "N": 0.40,
}
MONTHLY_IRRADIANCE        = [0.55,0.65,0.85,1.05,1.20,1.30,1.25,1.15,0.95,0.75,0.55,0.50]
MONTHLY_CONSUMPTION_FACTOR= [1.20,1.15,1.05,0.95,0.90,0.85,0.85,0.90,0.95,1.05,1.10,1.20]

PANELS_PER_M2     = 0.16
PANEL_PEAK_KWP    = 0.40
USABLE_ROOF_RATIO = 0.85
PEAK_SUN_HOURS    = 1300
SYSTEM_EFFICIENCY = 0.82
ELECTRICITY_PRICE = 0.2276
CO2_FACTOR        = 0.0571
INFLATION_RATE    = 0.04


def _inclination_factor(angle: float) -> float:
    return max(0.0, 1.0 - abs(angle - 35) * 0.003)


def estimate_consumption(p: dict) -> float:
    if p.get("monthlyKwhManual"):
        return p["monthlyKwhManual"] * 12
    base = 2000.0
    if p.get("heating") == "electric":  base += 3500
    elif p.get("heating") == "pac":     base += 1800
    if p.get("hotWater") == "electric": base += 1200
    if p.get("hasAC"):     base += 800
    if p.get("hasPool"):   base += 2000
    if p.get("hasEV"):     base += 2200
    if p.get("hasDryer"):  base += 400
    if p.get("hasDishwasher"):     base += 250
    if p.get("hasElectricCooking"): base += 600
    return base


def run_simulation(project: dict) -> dict:
    consumption = estimate_consumption(project)
    sections = project.get("roofSections", [])

    total_usable = weighted_orient = weighted_incl = 0.0
    for s in sections:
        usable = s["surface"] * USABLE_ROOF_RATIO
        total_usable    += usable
        weighted_orient += usable * ORIENTATION_FACTOR.get(s["orientation"], 0.9)
        weighted_incl   += usable * _inclination_factor(s["inclination"])

    avg_orient = weighted_orient / total_usable if total_usable else 0.9
    avg_incl   = weighted_incl  / total_usable if total_usable else 0.9

    panel_count     = math.floor(total_usable * PANELS_PER_M2)
    total_power_kwp = round(panel_count * PANEL_PEAK_KWP, 1)
    irr_sum         = sum(MONTHLY_IRRADIANCE)
    annual_prod     = round(total_power_kwp * PEAK_SUN_HOURS * avg_orient * avg_incl * SYSTEM_EFFICIENCY)

    monthly_prod = [round(annual_prod * f / irr_sum) for f in MONTHLY_IRRADIANCE]
    avg_monthly  = consumption / 12
    monthly_cons = [round(avg_monthly * f) for f in MONTHLY_CONSUMPTION_FACTOR]

    self_cons_rate = 0.0
    if annual_prod > 0:
        self_cons_rate = min(0.95, max(0.30, min(consumption, annual_prod) / annual_prod))

    savings  = round(annual_prod * self_cons_rate * ELECTRICITY_PRICE)
    co2      = round(annual_prod * CO2_FACTOR)
    coverage = annual_prod / consumption if consumption else 0
    score    = min(100, round(coverage * 80 + self_cons_rate * 20))

    return {
        "totalPowerKwp":       total_power_kwp,
        "annualProductionKwh": annual_prod,
        "selfConsumptionRate": self_cons_rate,
        "annualConsumptionKwh": consumption,
        "annualSavingsEur":    savings,
        "co2AvoidedKg":        co2,
        "panelCount":          panel_count,
        "monthlyProduction":   monthly_prod,
        "monthlyConsumption":  monthly_cons,
        "energyScore":         score,
    }


def get_roi_data(result: dict, scenario: str) -> dict:
    kwp      = result["totalPowerKwp"]
    gain     = result["annualSavingsEur"]
    cost     = kwp * (1200 if scenario == "diy" else 2200)
    aid      = min(1500 + kwp * 200, 4000) if scenario == "pro" else 0.0
    net_cost = cost - aid

    def cum(years: int, r: float) -> float:
        if years == 0: return 0.0
        if r == 0:     return gain * years
        return gain * ((math.pow(1 + r, years) - 1) / r)

    yrs         = list(range(21))
    optimistic  = [round(-net_cost + cum(y, INFLATION_RATE + 0.01)) for y in yrs]
    realistic   = [round(-net_cost + cum(y, INFLATION_RATE))        for y in yrs]
    conservative= [round(-net_cost + cum(y, max(0.001, INFLATION_RATE - 0.01))) for y in yrs]
    roi_year    = next((i for i, v in enumerate(realistic) if v >= 0), -1)

    return {
        "installCost": cost, "aid": aid, "netCost": net_cost,
        "annualGain": gain,  "roiYear": roi_year,
        "optimistic": optimistic, "realistic": realistic, "conservative": conservative,
    }
