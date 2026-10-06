"""Respaldo automatico de la base de datos.

Cada BACKUP_INTERVAL_HOURS (24 h por defecto) copia ganaderapp.db
a backend/database/backups/ganaderapp.db.bak, sobrescribiendo el anterior.

Uso manual desde backend/server:
    python backup.py            # respalda ahora
"""

import os
import sqlite3
import threading
import time

from config import BACKUP_DIR, BACKUP_FILE, DATABASE_FILE


def make_backup(db_path=None, backup_path=None):
    """Copia la BD a un archivo .bak usando el backup API de SQLite."""
    db_path = db_path or DATABASE_FILE
    backup_path = backup_path or BACKUP_FILE

    if not os.path.exists(db_path):
        print(f"[backup] No existe la base de datos: {db_path}")
        return None

    os.makedirs(os.path.dirname(backup_path), exist_ok=True)
    tmp_path = backup_path + ".tmp"

    src = sqlite3.connect(db_path)
    dst = sqlite3.connect(tmp_path)
    try:
        src.backup(dst)
    finally:
        dst.close()
        src.close()

    os.replace(tmp_path, backup_path)
    print(f"[backup] Respaldo generado: {backup_path}")
    return backup_path


def _next_run(interval_seconds):
    """Si ya existe un .bak, espera solo el tiempo restante; si no, el intervalo completo."""
    if os.path.exists(BACKUP_FILE):
        restante = os.path.getmtime(BACKUP_FILE) + interval_seconds - time.time()
        if restante > 0:
            return restante
    return interval_seconds


def start_backup_scheduler(app):
    """Hilo daemon que genera el .bak cada BACKUP_INTERVAL_HOURS."""
    if not app.config.get("BACKUP_ENABLED", True):
        print("[backup] Respaldos automaticos desactivados.")
        return None

    interval_hours = float(app.config.get("BACKUP_INTERVAL_HOURS", 24))
    interval_seconds = max(interval_hours * 3600, 1)

    def _loop():
        while True:
            esperar = _next_run(interval_seconds)
            print(f"[backup] Proximo respaldo en {esperar / 3600:.2f} h")
            time.sleep(esperar)
            try:
                make_backup()
            except Exception as exc:  # el servidor sigue aunque falle un respaldo
                print(f"[backup] Error al respaldar: {exc}")

    thread = threading.Thread(target=_loop, name="db-backup", daemon=True)
    thread.start()
    print(f"[backup] Respaldo automatico cada {interval_hours:g} h -> {BACKUP_FILE}")
    return thread


if __name__ == "__main__":
    make_backup()
