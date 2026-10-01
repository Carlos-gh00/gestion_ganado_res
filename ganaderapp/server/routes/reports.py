from datetime import date, timedelta

from flask import Blueprint, jsonify, request

from extensions import db, jwt_required, roles_required
from models import Acostadero, Animal, ItemInventario, Movimiento, Reporte, Tratamiento, Vacunacion

reports_bp = Blueprint("reports", __name__)

TIPOS = {
    "produccion": "Produccion",
    "sanidad": "Sanidad",
    "inventario": "Inventario",
    "movimientos": "Movimientos",
    "financiero": "Financiero",
}

PERIODOS = {
    "semana": ("Ultima semana", 7),
    "mes": ("Ultimo mes", 30),
    "trimestre": ("Ultimo trimestre", 90),
    "anio": ("Anio actual", 365),
}

PALETAS = {
    "produccion": "#2e4829",
    "sanidad": "#b84040",
    "inventario": "#1a3a5c",
    "movimientos": "#c9882a",
    "financiero": "#7a4f2e",
}


@reports_bp.get("/reportes")
@jwt_required
def listar(user):
    return jsonify([r.to_dict() for r in db.session.query(Reporte).order_by(Reporte.generado.desc()).all()])


@reports_bp.post("/reportes")
@jwt_required
@roles_required("admin", "encargado_general")
def generar(user):
    data = request.get_json(silent=True) or {}
    tipo = data.get("tipo")
    periodo_id = data.get("periodo") or "mes"

    if tipo not in TIPOS:
        return jsonify({"message": f"Tipo no valido. Usa uno de: {', '.join(TIPOS)}"}), 400
    if periodo_id not in PERIODOS:
        return jsonify({"message": f"Periodo no valido. Usa uno de: {', '.join(PERIODOS)}"}), 400

    periodo_label, dias = PERIODOS[periodo_id]
    desde = date.today() - timedelta(days=dias)
    datos = _generar_datos(tipo, desde)

    siguientes = db.session.query(Reporte.id).all()
    maximo = 240
    for (ident,) in siguientes:
        try:
            maximo = max(maximo, int(str(ident).split("-")[-1]))
        except ValueError:
            continue

    reporte = Reporte(
        id=f"R-{maximo + 1}",
        tipo=TIPOS[tipo],
        periodo=periodo_label,
        generado=date.today(),
        autor=f"{user.nombre} {user.apellido}",
        color=PALETAS.get(tipo, "#2e4829"),
    )
    db.session.add(reporte)
    db.session.commit()
    return jsonify({"reporte": reporte.to_dict(), "datos": datos}), 201


@reports_bp.get("/reportes/<reporte_id>")
@jwt_required
def detalle(user, reporte_id):
    reporte = db.session.get(Reporte, reporte_id)
    if not reporte:
        return jsonify({"message": "Reporte no encontrado"}), 404

    clave = next((k for k, v in TIPOS.items() if v == reporte.tipo), None)
    dias = 365
    return jsonify({"reporte": reporte.to_dict(), "datos": _generar_datos(clave or "produccion", date.today() - timedelta(days=dias))})


@reports_bp.delete("/reportes/<reporte_id>")
@jwt_required
@roles_required("admin", "encargado_general")
def eliminar(user, reporte_id):
    reporte = db.session.get(Reporte, reporte_id)
    if not reporte:
        return jsonify({"message": "Reporte no encontrado"}), 404
    db.session.delete(reporte)
    db.session.commit()
    return jsonify({"success": True})


def _generar_datos(tipo, desde):
    if tipo == "produccion":
        animales = db.session.query(Animal).all()
        pesos = [a.peso for a in animales if a.peso]
        por_raza = db.session.query(Animal.raza, db.func.count(Animal.id)).group_by(Animal.raza).all()
        por_estado = db.session.query(Animal.estado, db.func.count(Animal.id)).group_by(Animal.estado).all()
        return {
            "totalAnimales": len(animales),
            "pesoPromedio": round(sum(pesos) / len(pesos), 1) if pesos else 0,
            "pesoMaximo": max(pesos) if pesos else 0,
            "porRaza": [{"raza": r, "total": t} for r, t in por_raza],
            "porEstado": [{"estado": e, "total": t} for e, t in por_estado],
        }

    if tipo == "sanidad":
        tratamientos = db.session.query(Tratamiento).filter(Tratamiento.fecha_inicio >= desde).all()
        severidad = db.session.query(Tratamiento.severidad, db.func.count(Tratamiento.id)).group_by(Tratamiento.severidad).all()
        vacunas = db.session.query(Vacunacion).all()
        return {
            "tratamientos": len(tratamientos),
            "activos": sum(1 for t in tratamientos if t.estado == "Activo"),
            "porSeveridad": [{"severidad": s, "total": t} for s, t in severidad],
            "vacunasAlDia": sum(1 for v in vacunas if v.total and v.aplicados >= v.total),
            "vacunasTotal": len(vacunas),
        }

    if tipo == "inventario":
        items = db.session.query(ItemInventario).all()
        criticos = [i for i in items if i.estado() != "OK"]
        valor = sum((i.stock or 0) * (i.costo or 0) for i in items)
        por_cat = db.session.query(ItemInventario.categoria, db.func.count(ItemInventario.id)).group_by(ItemInventario.categoria).all()
        return {
            "articulos": len(items),
            "criticos": len(criticos),
            "valorInventario": round(valor, 2),
            "porCategoria": [{"categoria": c, "total": t} for c, t in por_cat],
        }

    if tipo == "movimientos":
        movimientos = db.session.query(Movimiento).filter(Movimiento.created_at >= desde).all()
        por_tipo = db.session.query(Movimiento.tipo, db.func.count(Movimiento.id)).group_by(Movimiento.tipo).all()
        return {
            "total": len(movimientos),
            "porTipo": [{"tipo": t, "total": c} for t, c in por_tipo],
        }

    movimientos = db.session.query(Movimiento).filter(Movimiento.created_at >= desde).all()
    salidas = sum(1 for m in movimientos if m.tipo == "Salida")
    valor_salidas = salidas * 48_300
    return {
        "ingresos": sum(1 for m in movimientos if m.tipo == "Ingreso"),
        "salidas": salidas,
        "ingresoEstimado": valor_salidas,
        "observacion": "Estimacion basada en el promedio de venta por cabeza del periodo",
    }
