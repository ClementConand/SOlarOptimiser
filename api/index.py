"""
Solar Optimizer — API unique (Flask).
Entrypoint unique pour Vercel : api.index:app
Lance en local : python3 api/index.py
"""
import sys, os, base64

sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask, request, jsonify, send_from_directory
from _simulation import run_simulation, get_roi_data
from _documents import GENERATORS

app = Flask(__name__)

# Dossier du frontend buildé (commité dans le repo)
DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))


@app.after_request
def add_headers(resp):
    resp.headers["Access-Control-Allow-Origin"]  = "*"
    resp.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
    resp.headers["X-Content-Type-Options"]       = "nosniff"
    resp.headers["X-Frame-Options"]              = "DENY"
    return resp


# Routes déclarées AVEC et SANS préfixe /api pour fonctionner
# quel que soit le montage de la fonction sur Vercel.
@app.route("/api/health", methods=["GET"])
@app.route("/health",     methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/simulate", methods=["POST", "OPTIONS"])
@app.route("/simulate",     methods=["POST", "OPTIONS"])
def simulate():
    if request.method == "OPTIONS":
        return "", 204

    body     = request.get_json(silent=True) or {}
    project  = body.get("project", {})
    scenario = body.get("scenario", "pro")

    if not project.get("roofSections"):
        return jsonify({"error": "roofSections requis"}), 422

    try:
        result = run_simulation(project)
        roi    = get_roi_data(result, scenario)
        return jsonify({"simulation": result, "roi": roi})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/document", methods=["POST", "OPTIONS"])
@app.route("/document",     methods=["POST", "OPTIONS"])
def document():
    if request.method == "OPTIONS":
        return "", 204

    body     = request.get_json(silent=True) or {}
    doc_type = body.get("docType", "")
    project  = body.get("project", {})
    result   = body.get("result", {})

    if doc_type not in GENERATORS:
        return jsonify({"error": f"docType inconnu. Valides : {list(GENERATORS.keys())}"}), 404

    try:
        pdf_bytes = GENERATORS[doc_type](project, result)
        return jsonify({
            "filename": f"solar-optimizer-{doc_type}.pdf",
            "data":     base64.b64encode(pdf_bytes).decode(),
            "size":     len(pdf_bytes),
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── Frontend statique (SPA) ───────────────────────────────────────────────────
@app.route("/")
def serve_root():
    return send_from_directory(DIST_DIR, "index.html")


@app.route("/<path:filepath>")
def serve_static(filepath):
    full = os.path.join(DIST_DIR, filepath)
    # Protection path traversal : le fichier doit rester dans DIST_DIR
    if os.path.isfile(full) and os.path.realpath(full).startswith(DIST_DIR):
        return send_from_directory(DIST_DIR, filepath)
    # Fallback SPA : toute route inconnue → index.html
    return send_from_directory(DIST_DIR, "index.html")


if __name__ == "__main__":
    print("☀  Solar Optimizer — API locale sur http://localhost:8000")
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8000)), debug=False)
