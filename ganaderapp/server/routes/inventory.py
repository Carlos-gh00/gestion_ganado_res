from datetime import date

from flask import Blueprint, jsonify, request

from extensions import db, jwt_required, roles_required
from models import ItemInventario, MovimientoInventario

inventory_bp = Blueprint("inventory", __name__)

CATEGORIAS = {
    "sanidad": {"title": "Sanidad", "icon": "✚", "color": "#b84040", "bg": "#fef2f2"},
    "medicamentos": {"title": "Medicamentos", "icon": "💊", "color": "#6020c0", "bg": "#f5eeff"},
    "alimento": {"title": "Alimento", "icon": "🌾", "color": "#b87333", "bg": "#fff8ec"},
    "infraestructura": {"title": "Infraestructura", "icon": "🔧", "color": "#2040a0", "bg": "#e8f0ff"},
}


@inventory_bp.get("/categorias")
@jwt_required
def categorias(user):
    items = db.session.query(ItemInventario).all()
    resultado = {}
    for key, meta in CATEGORIAS.items():
        resultado[key] = {
            **meta,
            "items": [i.to_dict() for i in items if i.categoria == key],
        }
    return jsonify(resultado)


@inventory_bp.get("/items")
@jwt_required
def listar(user):
    query = db.session.query(ItemInventario)
    if request.args.get("categoria"):
        query = query.filter(ItemInventario.categoria == request.args["categoria"])
    if request.args.get("critico") == "true":
        return jsonify([i.to_dict() for i in query.all() if i.estado() != "OK"])
    return jsonify([i.to_dict() for i in query.order_by(ItemInventario.id).all()])


@inventory_bp.post("/items")
@jwt_required
@roles_required("admin", "encargado_general", "encargado_rancho")
def crear(user):
    data = request.get_json(silent=True) or {}
    nombre = (data.get("nombre") or "").strip()
    categoria = data.get("categoria")
    unidad = (data.get("unidad") or "").strip()

    if not nombre or not categoria or not unidad:
        return jsonify({"message": "nombre, categoria y unidad son obligatorios"}), 400
    if categoria not in CATEGORIAS:
        return jsonify({"message": f"Categoria no valida. Usa una de: {', '.join(CATEGORIAS)}"}), 400

    id_item = (data.get("id") or "").strip().upper()
    if not id_item:
        prefijo = {"sanidad": "S", "medicamentos": "M", "alimento": "A", "infraestructura": "I"}[categoria]
        existentes = db.session.query(ItemInventario.id).filter(ItemInventario.id.like(f"{prefijo}-%")).all()
        maximo = 0
        for (ident,) in existentes:
            try:
                maximo = max(maximo, int(str(ident).split("-")[-1]))
            except ValueError:
                continue
        id_item = f"{prefijo}-{maximo + 1:03d}"

    if db.session.get(ItemInventario, id_item):
        return jsonify({"message": f"El articulo {id_item} ya existe"}), 409

    item = ItemInventario(
        id=id_item,
        nombre=nombre,
        categoria=categoria,
        unidad=unidad,
        stock=float(data.get("stock") or 0),
        minimo=float(data.get("minimo") or 0),
        proveedor=(data.get("proveedor") or "").strip() or None,
        costo=float(data.get("costo") or 0),
    )
    db.session.add(item)
    db.session.add(
        MovimientoInventario(
            item_id=id_item,
            tipo="Entrada",
            cantidad=item.stock,
            responsable=f"{user.nombre} {user.apellido}",
            nota="Alta de articulo",
        )
    )
    db.session.commit()
    return jsonify(item.to_dict()), 201


@inventory_bp.patch("/items/<item_id>")
@jwt_required
@roles_required("admin", "encargado_general", "encargado_rancho")
def actualizar(user, item_id):
    item = db.session.get(ItemInventario, item_id)
    if not item:
        return jsonify({"message": "Articulo no encontrado"}), 404

    data = request.get_json(silent=True) or {}
    for campo in ("nombre", "proveedor", "unidad"):
        if campo in data and data[campo]:
            setattr(item, campo, str(data[campo]).strip())
    if "minimo" in data:
        item.minimo = float(data["minimo"] or 0)
    if "costo" in data:
        item.costo = float(data["costo"] or 0)
    if "stock" in data:
        item.stock = float(data["stock"] or 0)
        db.session.add(
            MovimientoInventario(
                item_id=item.id,
                tipo="Ajuste",
                cantidad=item.stock,
                responsable=f"{user.nombre} {user.apellido}",
                nota="Ajuste manual de stock",
            )
        )

    db.session.commit()
    return jsonify(item.to_dict())


@inventory_bp.post("/items/<item_id>/movimiento")
@jwt_required
@roles_required("admin", "encargado_general", "encargado_rancho")
def movimiento(user, item_id):
    item = db.session.get(ItemInventario, item_id)
    if not item:
        return jsonify({"message": "Articulo no encontrado"}), 404

    data = request.get_json(silent=True) or {}
    tipo = (data.get("tipo") or "Entrada").strip().capitalize()
    cantidad = float(data.get("cantidad") or 0)
    if cantidad <= 0:
        return jsonify({"message": "La cantidad debe ser mayor a cero"}), 400
    if tipo not in ("Entrada", "Salida", "Ajuste"):
        return jsonify({"message": "El tipo debe ser Entrada, Salida o Ajuste"}), 400
    if tipo == "Salida" and cantidad > item.stock:
        return jsonify({"message": f"Stock insuficiente: hay {item.stock:g} {item.unidad}"}), 409

    if tipo == "Entrada":
        item.stock += cantidad
    elif tipo == "Salida":
        item.stock -= cantidad
    else:
        item.stock = cantidad

    item.ultima_entrada = date.today()
    db.session.add(
        MovimientoInventario(
            item_id=item.id,
            tipo=tipo,
            cantidad=cantidad,
            responsable=f"{user.nombre} {user.apellido}",
            nota=(data.get("nota") or "").strip() or None,
        )
    )
    db.session.commit()
    return jsonify(item.to_dict())


@inventory_bp.get("/items/<item_id>/movimientos")
@jwt_required
def movimientos(user, item_id):
    filas = (
        db.session.query(MovimientoInventario)
        .filter(MovimientoInventario.item_id == item_id)
        .order_by(MovimientoInventario.created_at.desc())
        .all()
    )
    return jsonify([m.to_dict() for m in filas])


@inventory_bp.delete("/items/<item_id>")
@jwt_required
@roles_required("admin")
def eliminar(user, item_id):
    item = db.session.get(ItemInventario, item_id)
    if not item:
        return jsonify({"message": "Articulo no encontrado"}), 404

    db.session.query(MovimientoInventario).filter(MovimientoInventario.item_id == item_id).delete()
    db.session.delete(item)
    db.session.commit()
    return jsonify({"success": True})
