"""Tests unitaires — moteur de simulation solaire."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "api"))
from _simulation import run_simulation, get_roi_data, estimate_consumption, _inclination_factor


def proj(**kw):
    base = dict(
        address="12 rue du Soleil, 06000 Nice",
        houseType="maison", surface=120,
        heating="electric", hotWater="electric",
        hasAC=False, hasPool=False, hasEV=False,
        hasDryer=True, hasDishwasher=True, hasElectricCooking=False,
        monthlyKwhManual=None,
        roofSections=[{"id":"s1","orientation":"S","inclination":35,"surface":30}],
    )
    base.update(kw)
    return base


class TestConsumption:
    def test_manual_override(self):
        assert estimate_consumption(proj(monthlyKwhManual=400)) == 4800.0

    def test_electric_heating(self):
        diff = estimate_consumption(proj(heating="electric")) - estimate_consumption(proj(heating="gas"))
        assert diff == 3500

    def test_ev(self):
        diff = estimate_consumption(proj(hasEV=True)) - estimate_consumption(proj(hasEV=False))
        assert diff == 2200


class TestSimulation:
    def test_south_beats_north(self):
        s = run_simulation(proj(roofSections=[{"id":"s1","orientation":"S","inclination":35,"surface":30}]))
        n = run_simulation(proj(roofSections=[{"id":"s1","orientation":"N","inclination":35,"surface":30}]))
        assert s["annualProductionKwh"] > n["annualProductionKwh"]

    def test_no_roof_zero(self):
        r = run_simulation(proj(roofSections=[]))
        assert r["annualProductionKwh"] == 0 and r["panelCount"] == 0

    def test_monthly_12_values(self):
        r = run_simulation(proj())
        assert len(r["monthlyProduction"]) == 12
        assert len(r["monthlyConsumption"]) == 12

    def test_score_in_range(self):
        assert 0 <= run_simulation(proj())["energyScore"] <= 100

    def test_savings_positive(self):
        assert run_simulation(proj())["annualSavingsEur"] > 0

    def test_inclination_optimal(self):
        assert _inclination_factor(35) == 1.0

    def test_inclination_symmetric(self):
        assert abs(_inclination_factor(20) - _inclination_factor(50)) < 0.01


class TestROI:
    def _r(self):
        return run_simulation(proj())

    def test_pro_more_expensive(self):
        r = self._r()
        assert get_roi_data(r, "pro")["installCost"] > get_roi_data(r, "diy")["installCost"]

    def test_pro_has_aid(self):
        r = self._r()
        assert get_roi_data(r, "pro")["aid"] > 0
        assert get_roi_data(r, "diy")["aid"] == 0

    def test_21_years(self):
        r = self._r()
        roi = get_roi_data(r, "pro")
        assert len(roi["realistic"]) == 21

    def test_optimistic_gte_conservative(self):
        r = self._r()
        roi = get_roi_data(r, "pro")
        assert roi["optimistic"][20] >= roi["conservative"][20]
