from flask import jsonify

from extensions import AuthError


def register_error_handlers(app):
    @app.errorhandler(AuthError)
    def handle_auth_error(err):
        return jsonify({"message": err.message}), err.status

    @app.errorhandler(404)
    def handle_404(_):
        return jsonify({"message": "Recurso no encontrado"}), 404

    @app.errorhandler(405)
    def handle_405(_):
        return jsonify({"message": "Metodo no permitido"}), 405

    @app.errorhandler(500)
    def handle_500(err):
        return jsonify({"message": "Error interno del servidor"}), 500
