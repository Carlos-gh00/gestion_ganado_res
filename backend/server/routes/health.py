from datetime import date

from flask import Blueprint, jsonify, request

from extensions import db, jwt_required, roles_required
from models import Animal, Tratamiento, Vacunacion

health_bp = Blueprint("health", __name__)

SEVERIDADES = ("Baja", "Media", "Alta")


def _parse_date(value, default=None):
    if not value:
        return default
    try:
        return date.fromisoformat(str(value)[:10])
    except ValueError:
        return default


@health_bp.get("/tratamientos")
@jwt_required
def tratamientos(user):
    query = db.session.query(Tratamiento)
    if request.args.get("estado"):
        query = query.filter(Tratamiento.estado == request.args["estado"])
    if request.args.get("severidad"):
        query = query.filter(Tratamiento.severidad == request.args["severidad"])
    return jsonify([t.to_dict() for t in query.order_by(Tratamiento.fecha_inicio.desc()).all()])


@health_bp.post("/tratamientos")
@jwt_required
@roles_required("admin", "encargado_general", "encargado_rancho")
def crear_tratamiento(user):
    data = request.get_json(silent=True) or {}
    animal_id = (data.get("animal") or "").strip()
    diagnostico = (data.get("diagnostico") or "").strip()
    severidad = data.get("severidad") or "Baja"

    if not animal_id or not diagnostico:
        return jsonify({"message": "animal y diagnostico son obligatorios"}), 400
    if not db.session.get(Animal, animal_id):
        return jsonify({"message": f"El animal {animal_id} no existe"}), 404
    if severidad not in SEVERIDADES:
        return jsonify({"message": f"Severidad debe ser una de: {', '.join(SEVERIDADES)}"}), 400

    siguientes = db.session.query(Tratamiento.id).all()
    maximo = 390
    for (ident,) in siguientes:
        try:
            maximo = max(maximo, int(str(ident).split("-")[-1]))
        except ValueError:
            continue

    tratamiento = Tratamiento(
        id=f"T-{maximo + 1:04d}",
        animal_id=animal_id,
        diagnostico=diagnostico,
        veterinario=(data.get("veterinario") or "").strip() or None,
        fecha_inicio=_parse_date(data.get("inicio"), date.today()),
        estado=data.get("estado") or "Activo",
        severidad=severidad,
    )
    db.session.add(tratamiento)
    db.session.commit()
    return jsonify(tratamiento.to_dict()), 201


@health_bp.patch("/tratamientos/<tratamiento_id>")
@jwt_required
@roles_required("admin", "encargado_general", "encargado_rancho")
def actualizar_tratamiento(user, tratamiento_id):
    tratamiento = db.session.get(Tratamiento, tratamiento_id)
    if not tratamiento:
        return jsonify({"message": "Tratamiento no encontrado"}), 404

    data = request.get_json(silent=True) or {}
    if "estado" in data and data["estado"] in ("Activo", "Finalizado"):
        tratamiento.estado = data["estado"]
        if data["estado"] == "Finalizado" and not tratamiento.fecha_fin:
            tratamiento.fecha_fin = date.today()
    if "severidad" in data and data["severidad"] in SEVERIDADES:
        tratamiento.severidad = data["severidad"]
    if "veterinario" in data:
        tratamiento.veterinario = (data["veterinario"] or "").strip() or None

    db.session.commit()
    return jsonify(tratamiento.to_dict())


@health_bp.delete("/tratamientos/<tratamiento_id>")
@jwt_required
@roles_required("admin", "encargado_general")
def eliminar_tratamiento(user, tratamiento_id):
    tratamiento = db.session.get(Tratamiento, tratamiento_id)
    if not tratamiento:
        return jsonify({"message": "Tratamiento no encontrado"}), 404
    db.session.delete(tratamiento)
    db.session.commit()
    return jsonify({"success": True})


@health_bp.get("/vacunacion")
@jwt_required
def vacunacion(user):
    return jsonify([v.to_dict() for v in db.session.query(Vacunacion).order_by(Vacunacion.nombre).all()])


@health_bp.patch("/vacunacion/<int:vacunacion_id>")
@jwt_required
@roles_required("admin", "encargado_general", "encargado_rancho")
def actualizar_vacunacion(user, vacunacion_id):
    vacuna = db.session.get(Vacunacion, vacunacion_id)
    if not vacuna:
        return jsonify({"message": "Vacunacion no encontrada"}), 404

    data = request.get_json(silent=True) or {}
    if "aplicados" in data:
        vacuna.aplicados = max(0, int(data["aplicados"]))
        vacuna.fecha_ultima = date.today()
    if "fechaProxima" in data:
        vacuna.fecha_proxima = _parse_date(data["fechaProxima"])
    if "total" in data:
        vacuna.total = max(0, int(data["total"]))

    db.session.commit()
    return jsonify(vacuna.to_dict())


@health_bp.post("/vacunacion/<int:vacunacion_id>/completar")
@jwt_required
@roles_required("admin", "encargado_general", "encargado_rancho")
def completar_vacunacion(user, vacunacion_id):
    vacuna = db.session.get(Vacunacion, vacunacion_id)
    if not vacuna:
        return jsonify({"message": "Vacunacion no encontrada"}), 404

    vacuna.aplicados = vacuna.total
    vacuna.fecha_ultima = date.today()
    db.session.commit()
    return jsonify(vacuna.to_dict())


@health_bp.get("/kpis")
@jwt_required
def kpis(user):
    activos = db.session.query(db.func.count(Tratamiento.id)).filter(Tratamiento.estado == "Activo").scalar() or 0
    graves = (
        db.session.query(db.func.count(Tratamiento.id))
        .filter(Tratamiento.estado == "Activo", Tratamiento.severidad == "Alta")
        .scalar()
        or 0
    )
    vacunas = db.session.query(Vacunacion).all()
    al_dia = sum(1 for v in vacunas if v.total and v.aplicados >= v.total)
    return jsonify(
        {
            "enTratamiento": activos,
            "severidadAlta": graves,
            "vacunasAlDia": f"{al_dia}/{len(vacunas)}",
            "totalTratamientos": db.session.query(db.func.count(Tratamiento.id)).scalar() or 0,
        }
    )
