from flask import Blueprint, jsonify, request

from extensions import AuthError, db, generate_token, jwt_required, roles_required, verify_password
from models import Usuario

auth_bp = Blueprint("auth", __name__)


def _find_user(identifier):
    clean = (identifier or "").strip().lower()
    if not clean:
        return None
    return (
        db.session.query(Usuario)
        .filter(db.or_(Usuario.username == clean, Usuario.email == clean))
        .first()
    )


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    identifier = data.get("username") or data.get("email") or ""
    password = data.get("password") or ""

    if not identifier or not password:
        return jsonify({"message": "Usuario y contrasena son obligatorios"}), 400

    user = _find_user(identifier)
    if not user or not verify_password(user.password_hash, password):
        return jsonify({"message": "Credenciales incorrectas"}), 401
    if not user.activo:
        return jsonify({"message": "El usuario esta desactivado"}), 403

    return jsonify({"token": generate_token(user), "user": user.to_dict()})


@auth_bp.post("/logout")
@jwt_required
def logout(user):
    return jsonify({"success": True})


@auth_bp.get("/me")
@jwt_required
def me(user):
    return jsonify(user.to_dict())


@auth_bp.get("/users")
@jwt_required
@roles_required("admin", "encargado_general")
def list_users(user):
    query = db.session.query(Usuario)
    if (request.args.get("q") or "").strip():
        term = f"%{request.args['q'].strip()}%"
        query = query.filter(
            db.or_(Usuario.nombre.ilike(term), Usuario.apellido.ilike(term), Usuario.email.ilike(term))
        )
    return jsonify([u.to_dict() for u in query.order_by(Usuario.nombre).all()])


@auth_bp.post("/users")
@jwt_required
@roles_required("admin")
def create_user(user):
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    username = (data.get("username") or email.split("@")[0] or "").strip().lower()
    nombre = (data.get("nombre") or "").strip()
    apellido = (data.get("apellido") or "").strip()
    password = (data.get("password") or "").strip()
    rol = data.get("rol") or "encargado_area"

    faltantes = [c for c, v in (("nombre", nombre), ("apellido", apellido), ("email", email), ("password", password)) if not v]
    if faltantes:
        return jsonify({"message": f"Campos obligatorios: {', '.join(faltantes)}"}), 400
    if len(password) < 4:
        return jsonify({"message": "La contrasena debe tener al menos 4 caracteres"}), 400
    if rol not in ("admin", "encargado_general", "encargado_rancho", "encargado_area"):
        return jsonify({"message": "Rol no valido"}), 400

    existe = db.session.query(Usuario).filter(db.or_(Usuario.email == email, Usuario.username == username)).first()
    if existe:
        return jsonify({"message": "El correo o usuario ya esta registrado"}), 409

    nuevo = Usuario(
        nombre=nombre,
        apellido=apellido,
        username=username,
        email=email,
        rol=rol,
        area=(data.get("area") or "").strip() or None,
        avatar=((nombre[0] if nombre else "U") + (apellido[0] if apellido else "N")).upper(),
        activo=True,
    )
    nuevo.set_password(password)
    db.session.add(nuevo)
    db.session.commit()

    return jsonify({"user": nuevo.to_dict()}), 201


@auth_bp.patch("/users/<int:user_id>")
@jwt_required
@roles_required("admin")
def update_user(user, user_id):
    target = db.session.get(Usuario, user_id)
    if not target:
        return jsonify({"message": "Usuario no encontrado"}), 404

    data = request.get_json(silent=True) or {}
    for campo in ("nombre", "apellido", "area"):
        if campo in data:
            valor = (data.get(campo) or "").strip()
            setattr(target, campo, valor or None)
    if "rol" in data and data["rol"] in ("admin", "encargado_general", "encargado_rancho", "encargado_area"):
        target.rol = data["rol"]
    if "activo" in data:
        if target.id == user.id and not data["activo"]:
            return jsonify({"message": "No puedes desactivar tu propia cuenta"}), 400
        target.activo = bool(data["activo"])
    if data.get("password"):
        if len(data["password"]) < 4:
            return jsonify({"message": "La contrasena debe tener al menos 4 caracteres"}), 400
        target.set_password(data["password"])

    db.session.commit()
    return jsonify({"user": target.to_dict()})


@auth_bp.patch("/users/<int:user_id>/toggle")
@jwt_required
@roles_required("admin")
def toggle_user(user, user_id):
    target = db.session.get(Usuario, user_id)
    if not target:
        return jsonify({"message": "Usuario no encontrado"}), 404
    if target.id == user.id:
        return jsonify({"message": "No puedes desactivar tu propia cuenta"}), 400

    target.activo = not target.activo
    db.session.commit()
    return jsonify(target.to_dict())
