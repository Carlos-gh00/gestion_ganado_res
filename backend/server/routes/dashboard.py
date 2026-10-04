from datetime import date, timedelta

from flask import Blueprint, jsonify

from extensions import db, jwt_required
from models import Acostadero, Animal, ItemInventario, Movimiento, Tratamiento, Vacunacion

dashboard_bp = Blueprint("dashboard", __name__)

META_PESO = 480
PRECIO_POR_CABEZA = 48_300


@dashboard_bp.get("/kpis")
@jwt_required
def kpis(user):
    animales = db.session.query(Animal).all()
    pesos = [a.peso for a in animales if a.peso]
    en_tratamiento = (
        db.session.query(db.func.count(Tratamiento.id)).filter(Tratamiento.estado == "Activo").scalar() or 0
    )
    severidad_alta = (
        db.session.query(db.func.count(Tratamiento.id))
        .filter(Tratamiento.estado == "Activo", Tratamiento.severidad == "Alta")
        .scalar()
        or 0
    )

    inicio_mes = date.today().replace(day=1)
    salidas = sum(
        1
        for m in db.session.query(Movimiento).all()
        if m.tipo == "Salida" and m.created_at and m.created_at.date() >= inicio_mes
    )

    return jsonify(
        [
            {
                "label": "Total animales",
                "value": f"{len(animales):,}",
                "sub": f"En {db.session.query(db.func.count(Acostadero.id)).scalar() or 0} acotaderos",
                "icon": "\U0001F404",
                "color": "#2e4829",
            },
            {
                "label": "Peso promedio",
                "value": f"{round(sum(pesos) / len(pesos)) if pesos else 0} kg",
                "sub": f"Meta: {META_PESO} kg",
                "icon": "⚖",
                "color": "#b87333",
            },
            {
                "label": "En tratamiento",
                "value": str(en_tratamiento),
                "sub": f"{severidad_alta} de severidad alta",
                "icon": "✚",
                "color": "#b84040",
            },
            {
                "label": "Ventas del mes",
                "value": f"${salidas * PRECIO_POR_CABEZA:,.0f}",
                "sub": f"{salidas} cabezas",
                "icon": "◈",
                "color": "#3a7d44",
            },
        ]
    )


@dashboard_bp.get("/acostaderos")
@jwt_required
def acotaderos(user):
    filas = db.session.query(Acostadero).order_by(Acostadero.id).all()
    return jsonify([a.to_dict() for a in filas])


@dashboard_bp.get("/inventario-critico")
@jwt_required
def inventario_critico(user):
    items = db.session.query(ItemInventario).all()
    return jsonify(
        [
            {"nombre": i.nombre, "stock": i.stock, "unidad": i.unidad, "critico": i.estado() != "OK"}
            for i in items
            if i.estado() != "OK"
        ]
    )


@dashboard_bp.get("/movimientos")
@jwt_required
def movimientos(user):
    filas = (
        db.session.query(Movimiento).order_by(Movimiento.created_at.desc(), Movimiento.id.desc()).limit(10).all()
    )
    return jsonify([m.to_dict() for m in filas])


@dashboard_bp.get("/alertas")
@jwt_required
def alertas(user):
    resultado = []

    tratamientos_activos = (
        db.session.query(Tratamiento)
        .filter(Tratamiento.estado == "Activo")
        .order_by(Tratamiento.severidad)
        .all()
    )
    graves = [t for t in tratamientos_activos if t.severidad == "Alta"]
    if graves:
        resultado.append(
            {
                "tipo": "danger",
                "msg": f"{len(graves)} animales con tratamiento de severidad alta",
                "tiempo": "reciente",
            }
        )

    items = db.session.query(ItemInventario).all()
    bajos = [i for i in items if i.estado() != "OK"]
    for item in bajos[:3]:
        resultado.append(
            {
                "tipo": "warning",
                "msg": f"{item.nombre} bajo stock — {item.stock:g} {item.unidad}",
                "tiempo": "stock",
            }
        )

    for vacuna in db.session.query(Vacunacion).all():
        dias = vacuna.dias_para_vencer()
        if dias is not None and dias <= 10:
            resultado.append(
                {
                    "tipo": "warning" if dias > 0 else "danger",
                    "msg": f"Vacuna {vacuna.nombre} {'vence en' if dias > 0 else 'vencio hace'} {abs(dias)} dias",
                    "tiempo": "vacuna",
                }
            )

    for ac in db.session.query(Acostadero).all():
        if ac.estado_calculado() == "Sobrecargado":
            resultado.append(
                {"tipo": "danger", "msg": f"{ac.nombre} sobrecargado ({ac.total_calculado()}/{ac.capacidad})", "tiempo": "capacidad"}
            )

    if not resultado:
        resultado.append({"tipo": "success", "msg": "Sin alertas activas", "tiempo": "ahora"})

    return jsonify(resultado)


@dashboard_bp.get("/resumen")
@jwt_required
def resumen(user):
    desde = date.today() - timedelta(days=30)
    animales = db.session.query(Animal).all()
    pesos = [a.peso for a in animales if a.peso]
    return jsonify(
        {
            "totalAnimales": len(animales),
            "pesoPromedio": round(sum(pesos) / len(pesos), 1) if pesos else 0,
            "acostaderos": db.session.query(db.func.count(Acostadero.id)).scalar() or 0,
            "capacidadTotal": db.session.query(db.func.sum(Acostadero.capacidad)).scalar() or 0,
            "inventarioCritico": len(
                [i for i in db.session.query(ItemInventario).all() if i.estado() != "OK"]
            ),
            "tratamientosActivos": db.session.query(db.func.count(Tratamiento.id))
            .filter(Tratamiento.estado == "Activo")
            .scalar()
            or 0,
            "movimientos30d": db.session.query(db.func.count(Movimiento.id))
            .filter(Movimiento.created_at >= desde)
            .scalar()
            or 0,
        }
    )
