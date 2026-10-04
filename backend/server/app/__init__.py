from flask import Flask
from flask_cors import CORS
from config import Config
from errors import register_error_handlers
from extensions import db, jwt_required, get_jwt_identity, generate_token


def create_app(config_object=Config):
    app = Flask(__name__)
    app.config.from_object(config_object)

    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    db.init_app(app)

    from models import register_models
    register_models()

    from routes.auth import auth_bp
    from routes.acostaderos import acostaderos_bp
    from routes.animals import animals_bp
    from routes.inventory import inventory_bp
    from routes.health import health_bp
    from routes.reports import reports_bp
    from routes.dashboard import dashboard_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(acostaderos_bp, url_prefix="/api/acostaderos")
    app.register_blueprint(animals_bp, url_prefix="/api/animals")
    app.register_blueprint(inventory_bp, url_prefix="/api/inventory")
    app.register_blueprint(health_bp, url_prefix="/api/health")
    app.register_blueprint(reports_bp, url_prefix="/api/reports")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")

    with app.app_context():
        db.create_all()

    register_error_handlers(app)

    return app
