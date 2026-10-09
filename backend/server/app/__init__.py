import os

from flask import Flask
from flask_cors import CORS
from config import Config, DATABASE_DIR
from errors import register_error_handlers
from extensions import db, jwt_required, get_jwt_identity, generate_token


def _ensure_initial_admin():
    """Crea un unico admin inicial si la base de datos esta vacia.

    La BD arranca sin datos de ejemplo: solo este usuario para poder entrar.
    """
    from models import Usuario

    if db.session.query(Usuario).count() > 0:
        return None

    admin = Usuario(
        nombre="Admin",
        apellido="Sistema",
        username="admin",
        email="admin@localhost",
        rol="admin",
        avatar="AS",
        activo=True,
    )
    admin.set_password("admin")
    db.session.add(admin)
    db.session.commit()
    print("[inicio] Base de datos vacia: creado usuario admin / admin")


def create_app(config_object=Config):
    app = Flask(__name__)
    app.config.from_object(config_object)

    os.makedirs(DATABASE_DIR, exist_ok=True)

    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    db.init_app(app)

    from models import register_models
    register_models()

    from routes.auth import auth_bp, users_bp
    from routes.acostaderos import acostaderos_bp
    from routes.animals import animals_bp
    from routes.inventory import inventory_bp
    from routes.health import health_bp
    from routes.reports import reports_bp
    from routes.dashboard import dashboard_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(acostaderos_bp, url_prefix="/api/acostaderos")
    app.register_blueprint(animals_bp, url_prefix="/api/animals")
    app.register_blueprint(inventory_bp, url_prefix="/api/inventory")
    app.register_blueprint(health_bp, url_prefix="/api/health")
    app.register_blueprint(reports_bp, url_prefix="/api/reports")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")

    with app.app_context():
        db.create_all()
        _ensure_initial_admin()

        from backup import start_backup_scheduler

        # Con debug + reloader, el proceso padre no debe lanzar respaldos
        if not (app.debug and os.environ.get("WERKZEUG_RUN_MAIN") is None):
            start_backup_scheduler(app)

    register_error_handlers(app)

    return app
