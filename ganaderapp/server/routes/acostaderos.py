from flask import Blueprint, jsonify, request

from extensions import db, jwt_required, roles_required
from models import Acostadero, Animal

acostaderos_bp = Blueprint("acostaderos", __name__)


@acostaderos_bp.get("")
@jwt_required
def listar(user):
    return jsonify([a.to_dict() for a in db.session.query(Acostadero).order_by(Acostadero.id).all()])


@acostaderos_bp.get("/<acostadero_id>")
@jwt_required
def detalle(user, acostadero_id):
    ac = db.session.get(Acostadero, acostadero_id)
    if not ac:
        return jsonify({"message": "Acostadero no encontrado"}), 404
    return jsonify(ac.to_dict(include_animales=True))


@acostaderos_bp.post("")
@jwt_required
@roles_required("admin", "encargado_general", "encargado_rancho")
def crear(user):
    data = request.get_json(silent=True) or {}
    id_ = (data.get("id") or "").strip().upper()
    nombre = (data.get("nombre") or "").strip()
    if not id_ or not nombre:
        return jsonify({"message": "id y nombre son obligatorios"}), 400
    if db.session.get(Acostadero, id_):
        return jsonify({"message": f"El acostadero {id_} ya existe"}), 409

    ac = Acostadero(
        id=id_,
        nombre=nombre,
        capacidad=int(data.get("capacidad") or 0),
        estado=data.get("estado") or "Normal",
    )
    db.session.add(ac)
    db.session.commit()
    return jsonify(ac.to_dict()), 201


@acostaderos_bp.patch("/<acostadero_id>")
@jwt_required
@roles_required("admin", "encargado_general", "encargado_rancho")
def actualizar(user, acostadero_id):
    ac = db.session.get(Acostadero, acostadero_id)
    if not ac:
        return jsonify({"message": "Acostadero no encontrado"}), 404

    data = request.get_json(silent=True) or {}
    if "nombre" in data:
        ac.nombre = (data["nombre"] or "").strip() or ac.nombre
    if "capacidad" in data:
        ac.capacidad = int(data["capacidad"] or 0)
    if "estado" in data and data["estado"]:
        ac.estado = data["estado"]

    db.session.commit()
    return jsonify(ac.to_dict())


@acostaderos_bp.delete("/<acostadero_id>")
@jwt_required
@roles_required("admin")
def eliminar(user, acostadero_id):
    ac = db.session.get(Acostadero, acostadero_id)
    if not ac:
        return jsonify({"message": "Acostadero no encontrado"}), 404

    animales = ac.animales
    if animales:
        return jsonify({"message": f"No se puede eliminar: contiene {len(animales)} animales"}), 409

    db.session.delete(ac)
    db.session.commit()
    return jsonify({"success": True})
