from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from flask import current_app, request
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

db = SQLAlchemy()


def hash_password(raw):
    return generate_password_hash(raw)


def verify_password(hash_value, raw):
    return check_password_hash(hash_value, raw)


def generate_token(user):
    payload = {
        "sub": str(user.id),
        "rol": user.rol,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + current_app.config["JWT_ACCESS_TOKEN_EXPIRES"],
    }
    return jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")


def decode_token(token):
    return jwt.decode(token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"])


class AuthError(Exception):
    def __init__(self, message="No autorizado", status=401):
        super().__init__(message)
        self.message = message
        self.status = status


def jwt_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        from models import Usuario

        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            raise AuthError("Falta el token de autenticacion")

        try:
            payload = decode_token(header[7:])
        except jwt.ExpiredSignatureError:
            raise AuthError("Token expirado")
        except jwt.InvalidTokenError:
            raise AuthError("Token invalido")

        user = db.session.get(Usuario, int(payload["sub"]))
        if not user:
            raise AuthError("Usuario no encontrado")
        if not user.activo:
            raise AuthError("Usuario desactivado", status=403)

        return fn(user, *args, **kwargs)

    return wrapper


def roles_required(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(user, *args, **kwargs):
            if user.rol not in roles:
                raise AuthError("No tienes permisos para esta accion", status=403)
            return fn(user, *args, **kwargs)

        return wrapper

    return decorator


def get_jwt_identity(user):
    return user.id
