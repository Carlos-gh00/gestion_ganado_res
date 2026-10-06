import os
from datetime import timedelta

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(BASE_DIR)

# Toda la base de datos vive fuera del servidor: backend/database/
DATABASE_DIR = os.environ.get("DATABASE_DIR", os.path.join(BACKEND_DIR, "database"))
BACKUP_DIR = os.path.join(DATABASE_DIR, "backups")
DATABASE_FILE = os.path.join(DATABASE_DIR, "ganaderapp.db")
BACKUP_FILE = os.path.join(BACKUP_DIR, "ganaderapp.db.bak")


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "cambia-esta-clave-en-produccion")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "cambia-este-jwt-secret-en-produccion")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=12)

    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", f"sqlite:///{DATABASE_FILE}")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Respaldo .bak automatico (cada 24 h por defecto)
    BACKUP_ENABLED = os.environ.get("BACKUP_ENABLED", "1").lower() not in ("0", "false", "no")
    BACKUP_INTERVAL_HOURS = float(os.environ.get("BACKUP_INTERVAL_HOURS", "24"))
    BACKUP_PATH = BACKUP_FILE

    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")

    JSON_SORT_KEYS = False
