import os
import sys

# Agregar la carpeta server al path de Python
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
SERVER_DIR = os.path.join(BACKEND_DIR, "server")

if SERVER_DIR not in sys.path:
    sys.path.insert(0, SERVER_DIR)

# Si por alguna razon falta alguna libreria en el python global, usar el .venv de server
try:
    import flask
except ImportError:
    venv_python = os.path.join(SERVER_DIR, ".venv", "Scripts", "python.exe")
    if os.path.exists(venv_python):
        import subprocess
        result = subprocess.run([venv_python, os.path.join(SERVER_DIR, "run.py")] + sys.argv[1:])
        sys.exit(result.returncode)

from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
