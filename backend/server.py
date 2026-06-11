"""Serveur local de dev. Lance: python3 -m backend.server"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "api"))
from index import app

if __name__ == "__main__":
    print("☀  Solar Optimizer — Backend local sur http://localhost:8000")
    app.run(host="0.0.0.0", port=8000)
