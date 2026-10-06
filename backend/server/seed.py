"""Carga datos de ejemplo en la base de datos (OPCIONAL y manual).

La base de datos arranca VACIA con un unico usuario admin/admin;
ejecuta este script solo si quieres datos de prueba.

Uso:  python seed.py          (agrega datos si la BD esta vacia)
      python seed.py --reset  (borra todo y vuelve a cargar)
"""

import os
import sys
from datetime import date, datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from extensions import db
from models import (
    Acostadero,
    Animal,
    ItemInventario,
    Movimiento,
    Reporte,
    Tratamiento,
    Usuario,
    Vacunacion,
)

app = create_app()

ACOSTADEROS = [
    ("A", "Acostadero A", 180, "Normal"),
    ("B", "Acostadero B", 160, "Lleno"),
    ("C", "Acostadero C", 150, "Normal"),
    ("D", "Acostadero D", 200, "Sobrecargado"),
    ("E", "Acostadero E", 150, "Normal"),
    ("F", "Acostadero F", 160, "Disponible"),
]

# (id, raza, sexo, peso, estado, acostadero, origen, dias_atras)
ANIMALES = [
    ("A-2655", "Hereford", "H", 275, "Cría", "A", None, 400),
    ("A-2612", "Brangus", "H", 330, "Cría", "A", None, 420),
    ("A-2780", "Shorthorn", "H", 415, "Engorde", "A", None, 300),
    ("A-2820", "Hereford", "M", 460, "Engorde", "A", None, 280),
    ("A-2901", "Angus", "H", 310, "Cría", "B", None, 250),
    ("A-2810", "Shorthorn", "M", 465, "Engorde", "B", None, 290),
    ("A-3001", "Hereford", "M", 210, "Tratamiento", "B", None, 30),
    ("A-2877", "Angus", "M", 490, "Engorde", "B", None, 260),
    ("A-2733", "Brangus", "M", 520, "Venta", "C", None, 320),
    ("A-2670", "Angus", "M", 495, "Venta", "C", None, 340),
    ("A-2705", "Hereford", "H", 340, "Cría", "C", None, 310),
    ("A-2950", "Angus", "M", 390, "Engorde", "D", None, 150),
    ("A-2968", "Brangus", "M", 420, "Engorde", "D", None, 145),
    ("A-2975", "Hereford", "M", 355, "Engorde", "D", None, 140),
    ("A-2980", "Angus", "M", 380, "Tratamiento", "D", None, 20),
    ("A-2847", "Hereford", "M", 482, "Engorde", "E", None, 200),
    ("A-2860", "Shorthorn", "H", 395, "Engorde", "E", None, 195),
    ("A-2890", "Angus", "H", 290, "Cría", "F", None, 120),
    ("A-2895", "Hereford", "H", 310, "Cría", "F", None, 118),
    ("A-2741", "Brangus", "M", 350, "Tratamiento", "C", None, 35),
    ("A-2613", "Angus", "H", 295, "Cría", "A", None, 410),
    ("A-3050", "Angus", "M", 280, "Adaptación", "E", "Rancho Durán", 7),
    ("A-3051", "Hereford", "M", 295, "Adaptación", "E", "Rancho Durán", 7),
    ("A-3048", "Brangus", "H", 260, "Cuarentena", "F", "La Esperanza SA", 9),
    ("A-3049", "Brangus", "H", 270, "Cuarentena", "F", "La Esperanza SA", 9),
    ("A-3040", "Shorthorn", "M", 310, "Integrado", "A", "Subasta Torreón", 11),
]

# (id, categoria, nombre, stock, unidad, minimo, proveedor, costo, dias_atras)
INVENTARIO = [
    ("S-001", "sanidad", "Vacuna Aftosa (dosis)", 200, "ud", 500, "VetFarma", 1200, 27),
    ("S-002", "sanidad", "Vacuna Brucelosis", 480, "ud", 300, "VetFarma", 980, 48),
    ("S-003", "sanidad", "Desparasitante ivermectina", 60, "L", 20, "MedVet SA", 4500, 13),
    ("S-004", "sanidad", "Jeringa desechable 20cc", 1200, "pzas", 500, "MedVet SA", 15, 38),
    ("S-005", "sanidad", "Vacuna Clostridios", 600, "ud", 300, "VetFarma", 750, 23),
    ("M-001", "medicamentos", "Antibiotico Oxitetraciclina", 48, "L", 20, "VetFarma", 8400, 18),
    ("M-002", "medicamentos", "Antiinflamatorio Ketoprofeno", 25, "L", 10, "MedVet SA", 6200, 16),
    ("M-003", "medicamentos", "Sulfato de Magnesio", 30, "kg", 15, "AgroFarm", 1800, 20),
    ("M-004", "medicamentos", "Vitaminas A-D-E", 15, "L", 10, "Nutriganado", 6200, 20),
    ("M-005", "medicamentos", "Suero fisiologico 1L", 80, "ud", 30, "MedVet SA", 340, 27),
    ("A-001", "alimento", "Alimento balanceado engorde", 4200, "kg", 5000, "AgroNorte SA", 320, 13),
    ("A-002", "alimento", "Heno de alfalfa", 12000, "kg", 3000, "Campo Verde SRL", 85, 9),
    ("A-003", "alimento", "Sal mineral", 1500, "kg", 500, "Nutriganado", 180, 7),
    ("A-004", "alimento", "Melaza", 800, "kg", 300, "AgroNorte SA", 125, 17),
    ("A-005", "alimento", "Rastrojo de maiz", 8000, "kg", 2000, "Campo Verde SRL", 40, 22),
    ("A-006", "alimento", "Concentrado proteico", 600, "kg", 500, "Nutriganado", 520, 15),
    ("I-001", "infraestructura", "Hilo electrico pastoreo", 8, "rollos", 5, "TechAgro", 4500, 16),
    ("I-002", "infraestructura", "Postes de madera", 120, "pzas", 50, "MaderaRanch", 280, 27),
    ("I-003", "infraestructura", "Grapas galvanizadas", 15, "kg", 5, "TechAgro", 450, 43),
    ("I-004", "infraestructura", "Manguera riego 1 pulg", 200, "m", 50, "AgroInfra", 85, 7),
    ("I-005", "infraestructura", "Herbicida glifosato", 120, "L", 50, "AgroNorte SA", 2300, 22),
    ("I-006", "infraestructura", "Comedero metalico 200L", 6, "pzas", 2, "AgroInfra", 18500, 47),
]

# (id, animal, diagnostico, veterinario, dias_inicio, dias_fin, estado, severidad)
TRATAMIENTOS = [
    ("T-0391", "A-3001", "Fiebre aftosa sospechosa", "Dr. Soria", 2, None, "Activo", "Alta"),
    ("T-0388", "A-2980", "Neumonia leve", "Dra. Rios", 4, None, "Activo", "Media"),
    ("T-0385", "A-2741", "Lesion podal", "Dr. Soria", 7, None, "Activo", "Baja"),
    ("T-0380", "A-2612", "Parasitos internos", "Dra. Rios", 10, 3, "Finalizado", "Baja"),
    ("T-0375", "A-2810", "Mastitis subclinica", "Dr. Soria", 14, 6, "Finalizado", "Media"),
]

# (nombre, dias_proxima, dias_ultima, aplicados, total)
VACUNAS = [
    ("Aftosa", 8, 172, 1180, 1284),
    ("Brucelosis", 54, 126, 1284, 1284),
    ("Carbunclo", 9, 179, 980, 1284),
    ("Clostridios", 89, 91, 1284, 1284),
]

# (animal, tipo, descripcion, dias_atras)
MOVIMIENTOS = [
    ("A-2847", "Ingreso", "Ingreso por compra — 12 novillos Hereford", 1),
    ("A-2901", "Traslado", "Traslado Acostadero B → C — 8 animales", 1),
    ("A-2733", "Salida", "Salida a frigorifico — 6 novillos Brangus", 1),
    ("A-3001", "Tratamiento", "Inicio tratamiento fiebre — Acostadero D", 1),
    ("A-2655", "Ingreso", "Ingreso terneros destete — 20 animales", 2),
]

REPORTES = [
    ("R-240", "Produccion", "Agosto 2026", 28, "Carlos Mendoza", "#2e4829"),
    ("R-239", "Sanidad", "Q3 2026", 14, "Admin Sistema", "#b84040"),
    ("R-238", "Inventario", "Julio 2026", 58, "Roberto Fierro", "#1a3a5c"),
    ("R-237", "Financiero", "Semestre 1 2026", 90, "Carlos Mendoza", "#7a4f2e"),
]

USUARIOS = [
    ("Admin", "Sistema", "admin", "admin@ceibo.com", "admin", "admin", None),
    ("Carlos", "Mendoza", "carlos", "carlos@ceibo.com", "admin", "encargado_general", None),
    ("Roberto", "Fierro", "roberto", "roberto@ceibo.com", "admin", "encargado_rancho", None),
    ("Ana", "Torres", "ana", "ana@ceibo.com", "admin", "encargado_area", "Potrero A"),
]


def seed():
    hoy = date.today()

    for nombre, apellido, username, email, password, rol, area in USUARIOS:
        usuario = Usuario(
            nombre=nombre,
            apellido=apellido,
            username=username,
            email=email,
            rol=rol,
            area=area,
            avatar=(nombre[0] + apellido[0]).upper(),
            activo=True,
        )
        usuario.set_password(password)
        db.session.add(usuario)

    for id_, nombre, capacidad, estado in ACOSTADEROS:
        db.session.add(Acostadero(id=id_, nombre=nombre, capacidad=capacidad, estado=estado))

    for id_, raza, sexo, peso, estado, ac, origen, dias in ANIMALES:
        db.session.add(
            Animal(
                id=id_,
                raza=raza,
                sexo=sexo,
                peso=peso,
                estado=estado,
                origen=origen,
                fecha_ingreso=hoy - timedelta(days=dias),
                acostadero_id=ac,
            )
        )

    for id_, cat, nombre, stock, unidad, minimo, prov, costo, dias in INVENTARIO:
        db.session.add(
            ItemInventario(
                id=id_,
                nombre=nombre,
                categoria=cat,
                stock=stock,
                unidad=unidad,
                minimo=minimo,
                proveedor=prov,
                costo=costo,
                ultima_entrada=hoy - timedelta(days=dias),
            )
        )

    for id_, animal, diag, vet, d_ini, d_fin, estado, sev in TRATAMIENTOS:
        db.session.add(
            Tratamiento(
                id=id_,
                animal_id=animal,
                diagnostico=diag,
                veterinario=vet,
                fecha_inicio=hoy - timedelta(days=d_ini),
                fecha_fin=hoy - timedelta(days=d_fin) if d_fin else None,
                estado=estado,
                severidad=sev,
            )
        )

    for nombre, d_prox, d_ult, aplicados, total in VACUNAS:
        db.session.add(
            Vacunacion(
                nombre=nombre,
                fecha_proxima=hoy + timedelta(days=d_prox),
                fecha_ultima=hoy - timedelta(days=d_ult),
                aplicados=aplicados,
                total=total,
            )
        )

    for animal, tipo, desc, dias in MOVIMIENTOS:
        db.session.add(
            Movimiento(
                animal_id=animal,
                tipo=tipo,
                descripcion=desc,
                created_at=datetime.now() - timedelta(days=dias, hours=2),
            )
        )

    for id_, tipo, periodo, dias, autor, color in REPORTES:
        db.session.add(
            Reporte(
                id=id_,
                tipo=tipo,
                periodo=periodo,
                generado=hoy - timedelta(days=dias),
                autor=autor,
                color=color,
            )
        )

    db.session.commit()
    print("Datos de ejemplo cargados.")


if __name__ == "__main__":
    with app.app_context():
        if "--reset" in sys.argv:
            db.drop_all()
            db.create_all()
            print("Base de datos reiniciada.")
        elif db.session.query(Usuario).count() > 0:
            print("La base de datos ya tiene datos. Usa --reset para recargar.")
            sys.exit(0)
        seed()
