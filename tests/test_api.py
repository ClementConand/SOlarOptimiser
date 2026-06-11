"""Tests d'intégration — app Flask via test client."""
import json, base64, sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "api"))
from index import app

client = app.test_client()

SAMPLE = {
    "address": "15 av. du Soleil, 06000 Nice",
    "houseType": "maison", "surface": 150,
    "heating": "electric", "hotWater": "electric",
    "hasAC": False, "hasPool": False, "hasEV": False,
    "hasDryer": True, "hasDishwasher": True, "hasElectricCooking": False,
    "monthlyKwhManual": None,
    "roofSections": [{"id":"r1","orientation":"S","inclination":35,"surface":30}],
}


class TestHealth:
    def test_health(self):
        r = client.get("/api/health")
        assert r.status_code == 200
        assert r.get_json()["status"] == "ok"

    def test_health_no_prefix(self):
        assert client.get("/health").status_code == 200


class TestSimulate:
    def test_valid(self):
        r = client.post("/api/simulate", json={"project": SAMPLE, "scenario": "pro"})
        assert r.status_code == 200
        data = r.get_json()
        assert data["simulation"]["annualProductionKwh"] > 0
        assert "roi" in data

    def test_no_roof_422(self):
        r = client.post("/api/simulate", json={"project": {**SAMPLE, "roofSections": []}})
        assert r.status_code == 422

    def test_options(self):
        assert client.options("/api/simulate").status_code == 204

    def test_security_headers(self):
        r = client.get("/api/health")
        assert r.headers["X-Frame-Options"] == "DENY"
        assert r.headers["X-Content-Type-Options"] == "nosniff"


class TestDocument:
    def _result(self):
        r = client.post("/api/simulate", json={"project": SAMPLE, "scenario": "pro"})
        return r.get_json()["simulation"]

    def test_checklist_is_pdf(self):
        res = self._result()
        r = client.post("/api/document", json={"docType": "checklist", "project": SAMPLE, "result": res})
        assert r.status_code == 200
        assert base64.b64decode(r.get_json()["data"])[:4] == b"%PDF"

    def test_all_types(self):
        res = self._result()
        for dt in ["declaration_mairie","courrier_assurance","checklist",
                   "email_devis","guide_administratif","notice_enedis","dossier_complet"]:
            r = client.post("/api/document", json={"docType": dt, "project": SAMPLE, "result": res})
            assert r.status_code == 200, f"Échec: {dt}"
            assert base64.b64decode(r.get_json()["data"])[:4] == b"%PDF", f"Pas un PDF: {dt}"

    def test_unknown_404(self):
        res = self._result()
        r = client.post("/api/document", json={"docType": "inexistant", "project": SAMPLE, "result": res})
        assert r.status_code == 404
