import os
from datetime import timedelta
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(BASE_DIR)

# Cargar variables de entorno desde .env (en server o en backend)
load_dotenv(os.path.join(BASE_DIR, ".env"))
load_dotenv(os.path.join(BACKEND_DIR, ".env"))

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

    # Configuracion de Correo (Gmail SMTP)
    MAIL_SERVER = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", "587"))
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", "1").lower() not in ("0", "false", "no")
    MAIL_USE_SSL = os.environ.get("MAIL_USE_SSL", "0").lower() in ("1", "true", "yes")
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME") or os.environ.get("GMAIL_USER", "")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD") or os.environ.get("GMAIL_APP_PASSWORD", "")
    MAIL_DEFAULT_SENDER = os.environ.get("MAIL_DEFAULT_SENDER") or (
        f"GanaderAPP <{os.environ.get('MAIL_USERNAME') or os.environ.get('GMAIL_USER', 'notificaciones@ganaderapp.com')}>"
    )
    APP_URL = os.environ.get("APP_URL", "http://localhost:5173")
