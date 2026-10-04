from datetime import date, datetime

from extensions import db, hash_password

ROLES = ("admin", "encargado_general", "encargado_rancho", "encargado_area")


def _iso(value):
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.isoformat(sep=" ", timespec="seconds")
    if isinstance(value, date):
        return value.isoformat()
    return value


class Usuario(db.Model):
    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(80), nullable=False)
    apellido = db.Column(db.String(80), nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.String(30), nullable=False, default="encargado_area")
    area = db.Column(db.String(80))
    avatar = db.Column(db.String(4))
    activo = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, raw):
        self.password_hash = hash_password(raw)

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "username": self.username,
            "email": self.email,
            "rol": self.rol,
            "area": self.area,
            "avatar": self.avatar,
            "activo": self.activo,
        }


class Acostadero(db.Model):
    __tablename__ = "acostaderos"

    id = db.Column(db.String(4), primary_key=True)
    nombre = db.Column(db.String(80), nullable=False)
    capacidad = db.Column(db.Integer, nullable=False, default=0)
    estado = db.Column(db.String(30), nullable=False, default="Normal")

    animales = db.relationship(
        "Animal", back_populates="acostadero", cascade="all, delete-orphan", lazy="selectin"
    )

    def to_dict(self, include_animales=False):
        total = self.total_calculado()
        data = {
            "id": self.id,
            "nombre": self.nombre,
            "capacidad": self.capacidad,
            "estado": self.estado,
            "total": total,
            "estadoCalculado": self.estado_calculado(total),
        }
        if include_animales:
            data["animales"] = [a.to_dict() for a in self.animales]
        return data

    def total_calculado(self):
        return db.session.query(db.func.count(Animal.id)).filter(Animal.acostadero_id == self.id).scalar() or 0

    def estado_calculado(self, total=None):
        if total is None:
            total = self.total_calculado()
        if self.capacidad <= 0:
            return "Normal"
        ratio = total / self.capacidad
        if ratio > 1:
            return "Sobrecargado"
        if ratio >= 1:
            return "Lleno"
        if ratio < 0.6:
            return "Disponible"
        return "Normal"


class Animal(db.Model):
    __tablename__ = "animales"

    id = db.Column(db.String(20), primary_key=True)
    raza = db.Column(db.String(50), nullable=False)
    sexo = db.Column(db.String(2), nullable=False)
    peso = db.Column(db.Float, nullable=False, default=0)
    estado = db.Column(db.String(40), nullable=False, default="Cría")
    origen = db.Column(db.String(120))
    fecha_ingreso = db.Column(db.Date)
    fecha_salida = db.Column(db.Date)
    acostadero_id = db.Column(db.String(4), db.ForeignKey("acostaderos.id"), index=True)

    acostadero = db.relationship("Acostadero", back_populates="animales")
    tratamientos = db.relationship("Tratamiento", back_populates="animal", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "raza": self.raza,
            "sexo": self.sexo,
            "peso": self.peso,
            "estado": self.estado,
            "origen": self.origen,
            "fecha": _iso(self.fecha_ingreso),
            "acostadero": self.acostadero_id,
            "acostaderoNombre": self.acostadero.nombre if self.acostadero else None,
            "acostaderoId": self.acostadero_id,
        }


class ItemInventario(db.Model):
    __tablename__ = "inventario_items"

    id = db.Column(db.String(20), primary_key=True)
    nombre = db.Column(db.String(120), nullable=False)
    categoria = db.Column(db.String(30), nullable=False, index=True)
    stock = db.Column(db.Float, nullable=False, default=0)
    unidad = db.Column(db.String(20), nullable=False)
    minimo = db.Column(db.Float, nullable=False, default=0)
    proveedor = db.Column(db.String(120))
    costo = db.Column(db.Float, default=0)
    ultima_entrada = db.Column(db.Date)

    def estado(self):
        if self.minimo <= 0:
            return "OK"
        ratio = self.stock / self.minimo
        if ratio < 0.5:
            return "Critico"
        if ratio < 1:
            return "Bajo"
        return "OK"

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "categoria": self.categoria,
            "stock": self.stock,
            "unidad": self.unidad,
            "minimo": self.minimo,
            "proveedor": self.proveedor,
            "costo": self.costo,
            "ultimo": _iso(self.ultima_entrada),
            "estado": self.estado(),
        }


class MovimientoInventario(db.Model):
    __tablename__ = "movimientos_inventario"

    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.String(20), db.ForeignKey("inventario_items.id"), index=True)
    tipo = db.Column(db.String(20), nullable=False)
    cantidad = db.Column(db.Float, nullable=False)
    responsable = db.Column(db.String(120))
    nota = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    item = db.relationship("ItemInventario")

    def to_dict(self):
        return {
            "id": self.id,
            "item": self.item.nombre if self.item else self.item_id,
            "itemId": self.item_id,
            "tipo": self.tipo,
            "cantidad": self.cantidad,
            "responsable": self.responsable,
            "nota": self.nota,
            "fecha": _iso(self.created_at),
        }


class Tratamiento(db.Model):
    __tablename__ = "tratamientos"

    id = db.Column(db.String(20), primary_key=True)
    animal_id = db.Column(db.String(20), db.ForeignKey("animales.id"), index=True)
    diagnostico = db.Column(db.String(200), nullable=False)
    veterinario = db.Column(db.String(120))
    fecha_inicio = db.Column(db.Date, nullable=False, default=date.today)
    fecha_fin = db.Column(db.Date)
    estado = db.Column(db.String(20), nullable=False, default="Activo")
    severidad = db.Column(db.String(20), nullable=False, default="Baja")

    animal = db.relationship("Animal", back_populates="tratamientos")

    def to_dict(self):
        return {
            "id": self.id,
            "animal": self.animal_id,
            "raza": self.animal.raza if self.animal else None,
            "diagnostico": self.diagnostico,
            "veterinario": self.veterinario,
            "inicio": _iso(self.fecha_inicio),
            "fin": _iso(self.fecha_fin),
            "estado": self.estado,
            "severidad": self.severidad,
        }


class Vacunacion(db.Model):
    __tablename__ = "vacunaciones"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(80), unique=True, nullable=False)
    fecha_proxima = db.Column(db.Date)
    fecha_ultima = db.Column(db.Date)
    aplicados = db.Column(db.Integer, default=0)
    total = db.Column(db.Integer, default=0)

    def dias_para_vencer(self):
        if not self.fecha_proxima:
            return None
        return (self.fecha_proxima - date.today()).days

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "proxima": _iso(self.fecha_proxima),
            "ultima": _iso(self.fecha_ultima),
            "aplicados": self.aplicados,
            "total": self.total,
            "venceDias": self.dias_para_vencer(),
            "alDia": bool(self.total and self.aplicados >= self.total),
        }


class Movimiento(db.Model):
    __tablename__ = "movimientos"

    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.String(20), db.ForeignKey("animales.id"))
    tipo = db.Column(db.String(30), nullable=False)
    descripcion = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.animal_id,
            "tipo": self.tipo,
            "desc": self.descripcion,
            "hora": self.created_at.strftime("%H:%M") if self.created_at else "",
            "fecha": _iso(self.created_at),
        }


class Reporte(db.Model):
    __tablename__ = "reportes"

    id = db.Column(db.String(20), primary_key=True)
    tipo = db.Column(db.String(40), nullable=False)
    periodo = db.Column(db.String(60))
    generado = db.Column(db.Date, nullable=False, default=date.today)
    autor = db.Column(db.String(120))
    color = db.Column(db.String(9), default="#2e4829")

    def to_dict(self):
        return {
            "id": self.id,
            "tipo": self.tipo,
            "periodo": self.periodo,
            "generado": _iso(self.generado),
            "autor": self.autor,
            "color": self.color,
        }


def register_models():
    return None
