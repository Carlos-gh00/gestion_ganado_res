from datetime import date

from flask import Blueprint, jsonify, request
from sqlalchemy import or_

from extensions import db, jwt_required, roles_required
from models import Animal, Acostadero, Movimiento

animals_bp = Blueprint("animals", __name__)

ESTADOS = ("Cría", "Engorde", "Tratamiento", "Venta", "Adaptación", "Cuarentena", "Integrado")


def _parse_date(value):
    if not value:
        return None
    try:
        return date.fromisoformat(str(value)[:10])
    except ValueError:
        return None


def _siguiente_id():
    nums = db.session.query(Animal.id).all()
    maximo = 3000
    for (ident,) in nums:
        try:
            maximo = max(maximo, int(str(ident).split("-")[-1]))
        except ValueError:
            continue
    return f"A-{maximo + 1}"


@animals_bp.get("")
@jwt_required
def listar(user):
    query = db.session.query(Animal)

    if request.args.get("acostadero"):
        query = query.filter(Animal.acostadero_id == request.args["acostadero"])
    if request.args.get("raza"):
        query = query.filter(Animal.raza == request.args["raza"])
    if request.args.get("sexo"):
        query = query.filter(Animal.sexo == request.args["sexo"])
    if request.args.get("estado"):
        query = query.filter(Animal.estado == request.args["estado"])
    if request.args.get("q"):
        term = f"%{request.args['q'].strip()}%"
        query = query.filter(or_(Animal.id.ilike(term), Animal.raza.ilike(term), Animal.origen.ilike(term)))

    animales = query.order_by(Animal.id).all()
    return jsonify([a.to_dict() for a in animales])


@animals_bp.get("/recientes")
@jwt_required
def recientes(user):
    limite = int(request.args.get("limit") or 20)
    animales = (
        db.session.query(Animal)
        .filter(Animal.fecha_ingreso.isnot(None))
        .order_by(Animal.fecha_ingreso.desc(), Animal.id.desc())
        .limit(limite)
        .all()
    )
    return jsonify([a.to_dict() for a in animales])


@animals_bp.get("/<animal_id>")
@jwt_required
def detalle(user, animal_id):
    animal = db.session.get(Animal, animal_id)
    if not animal:
        return jsonify({"message": "Animal no encontrado"}), 404
    data = animal.to_dict()
    data["tratamientos"] = [t.to_dict() for t in animal.tratamientos]
    return jsonify(data)


@animals_bp.post("")
@jwt_required
@roles_required("admin", "encargado_general", "encargado_rancho")
def crear(user):
    data = request.get_json(silent=True) or {}
    raza = (data.get("raza") or "").strip()
    sexo = (data.get("sexo") or "").strip().upper()[:1]

    if not raza or sexo not in ("H", "M"):
        return jsonify({"message": "raza y sexo (H/M) son obligatorios"}), 400

    peso = float(data.get("peso") or 0)
    if peso < 0:
        return jsonify({"message": "El peso no puede ser negativo"}), 400

    acostadero_id = data.get("acostaderoId") or data.get("acostadero")
    if not db.session.get(Acostadero, acostadero_id):
        return jsonify({"message": f"El acostadero {acostadero_id} no existe"}), 400

    id_manual = (data.get("id") or "").strip().upper()
    animal_id = id_manual or _siguiente_id()
    if db.session.get(Animal, animal_id):
        return jsonify({"message": f"El animal {animal_id} ya existe"}), 409

    animal = Animal(
        id=animal_id,
        raza=raza,
        sexo=sexo,
        peso=peso,
        estado=data.get("estado") or "Adaptación",
        origen=(data.get("origen") or "").strip() or None,
        fecha_ingreso=_parse_date(data.get("fecha")) or date.today(),
        acostadero_id=acostadero_id,
    )
    db.session.add(animal)
    db.session.add(
        Movimiento(
            animal_id=animal_id,
            tipo="Ingreso",
            descripcion=f"Alta de {raza} {sexo} ({peso:.0f} kg) en Acostadero {acostadero_id}",
        )
    )
    db.session.commit()
    return jsonify(animal.to_dict()), 201


@animals_bp.patch("/<animal_id>")
@jwt_required
@roles_required("admin", "encargado_general", "encargado_rancho")
def actualizar(user, animal_id):
    animal = db.session.get(Animal, animal_id)
    if not animal:
        return jsonify({"message": "Animal no encontrado"}), 404

    data = request.get_json(silent=True) or {}
    if "raza" in data and data["raza"]:
        animal.raza = data["raza"].strip()
    if "peso" in data:
        animal.peso = float(data["peso"] or 0)
    if "estado" in data and data["estado"]:
        animal.estado = data["estado"]
    if "origen" in data:
        animal.origen = (data["origen"] or "").strip() or None
    if "acostaderoId" in data and data["acostaderoId"]:
        destino = data["acostaderoId"]
        if not db.session.get(Acostadero, destino):
            return jsonify({"message": f"El acostadero {destino} no existe"}), 400
        if destino != animal.acostadero_id:
            db.session.add(
                Movimiento(
                    animal_id=animal.id,
                    tipo="Traslado",
                    descripcion=f"Traslado Acostadero {animal.acostadero_id} → {destino}",
                )
            )
        animal.acostadero_id = destino

    db.session.commit()
    return jsonify(animal.to_dict())


@animals_bp.delete("/<animal_id>")
@jwt_required
@roles_required("admin", "encargado_general")
def eliminar(user, animal_id):
    animal = db.session.get(Animal, animal_id)
    if not animal:
        return jsonify({"message": "Animal no encontrado"}), 404

    db.session.delete(animal)
    db.session.commit()
    return jsonify({"success": True})


@animals_bp.get("/stats/estados")
@jwt_required
def stats_estados(user):
    filas = db.session.query(Animal.estado, db.func.count(Animal.id)).group_by(Animal.estado).all()
    return jsonify({estado: total for estado, total in filas})
