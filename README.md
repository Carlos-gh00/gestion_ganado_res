# Gestión Ganado Res

Aplicación web para la gestión de ganado: animales, acostaderos, inventario, salud, reportes y usuarios.

## Estructura del proyecto

```text
gestion reses/
├── frontend/                  # Interfaz (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/        # Componentes de layout y UI
│   │   ├── context/           # Contexto de autenticación
│   │   ├── pages/             # Pantallas (Dashboard, Animales, Salud, ...)
│   │   ├── services/          # Cliente API y servicios
│   │   └── utils/             # Constantes y utilidades
│   ├── index.html
│   ├── package.json
│   └── vite.config.js         # Proxy /api -> http://127.0.0.1:5000
│
├── backend/
│   ├── server/                # Todo lo del servidor (Flask)
│   │   ├── run.py             # Punto de entrada (puerto 5000)
│   │   ├── app/               # Factoría create_app, admin inicial, respaldos
│   │   ├── routes/            # Endpoints /api/*
│   │   ├── models.py          # Modelos de la base de datos
│   │   ├── config.py          # Configuración (ruta de la BD, respaldos)
│   │   ├── backup.py          # Respaldo .bak (manual o automático)
│   │   ├── seed.py            # Datos de ejemplo (opcional, manual)
│   │   ├── extensions.py      # SQLAlchemy, JWT, helpers de auth
│   │   ├── errors.py          # Manejadores de error
│   │   ├── requirements.txt
│   │   └── .venv/             # Entorno virtual Python
│   │
│   └── database/              # Toda la base de datos
│       ├── ganaderapp.db      # Se crea vacía al primer arranque
│       └── backups/
│           └── ganaderapp.db.bak   # Respaldo automático cada 24 h
│
├── .gitignore
└── README.md
```

## Tecnologías

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Flask, Flask-SQLAlchemy, Flask-CORS, PyJWT
- **Base de datos:** SQLite

## Requisitos

- Node.js y npm
- Python 3.10 o superior

## Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/Carlos-gh00/gestion_ganado_res.git
cd gestion_ganado_res
```

2. Frontend:

```bash
cd frontend
npm install
```

3. Backend:

```bash
cd backend/server
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

## Ejecución

Terminal 1 (backend):

```bash
cd backend/server
.venv\Scripts\activate
python run.py                 # http://127.0.0.1:5000
```

Terminal 2 (frontend):

```bash
cd frontend
npm run dev                   # http://localhost:5173
```

## Primer acceso

La base de datos arranca **vacía** (sin datos de ejemplo). Solo se crea un usuario inicial:

- **Usuario:** `admin`
- **Contraseña:** `admin`

Desde ahí se crean el resto de usuarios y se carga la información real.
Si quieres datos de prueba, ejecuta de forma manual: `python seed.py` (dentro de `backend/server`).

## Respaldos

- El servidor genera automáticamente `backend/database/backups/ganaderapp.db.bak`
  cada **24 horas** (sobrescribe el respaldo anterior).
- Intervalo configurable con la variable de entorno `BACKUP_INTERVAL_HOURS`.
- Desactivar con `BACKUP_ENABLED=0`.
- Respaldo inmediato manual:

```bash
cd backend/server
python backup.py
```

## Estructura de la API

Todas las rutas viven bajo `/api`:

- `/api/auth` — login, usuarios
- `/api/acostaderos` — acostaderos
- `/api/animals` — animales
- `/api/inventory` — inventario y movimientos
- `/api/health` — tratamientos y vacunaciones
- `/api/reports` — reportes
- `/api/dashboard` — métricas del panel

## Autor

- Carlos-gh00

## Licencia

Uso académico/práctico.
