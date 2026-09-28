# 🐄 GanaderAPP — Sistema de Gestión Ganadera

Frontend migrado a **React 19 + JavaScript + Vite + Tailwind CSS v4**.

## ✨ Características de la Migración
- **Separación total de la carpeta de Figma**: Este proyecto se encuentra en la carpeta independiente `ganaderapp/`. Puedes borrar la carpeta descargada de Figma (`Webapp para gestión de granjas`) sin afectar en absoluto a esta aplicación.
- **Sin datos hardcodeados en vistas**: Toda la capa de datos está desacoplada en `src/services/` con métodos asíncronos (`async/await`), lista para conectar con el backend Flask / PostgreSQL.
- **Arquitectura basada en componentes React**:
  - Layout (`Sidebar`, `MobileSidebar`, `MobileTopbar`, `MobileBottomNav`)
  - UI reutilizable (`StatCard`, `Badge`, `ProgressBar`, `Modal`)
  - Páginas modulares (`LoginPage`, `DashboardPage`, `AnimalsPage`, `HealthPage`, `InventoryPage`, `ReportsPage`, `AdminPage`)
- **Gestión de autenticación y estado**: `src/context/AuthContext.jsx` con persistencia en `localStorage`.
- **Control de acceso por roles**:
  - `admin` (acceso total + gestión de usuarios)
  - `encargado_general` (panel, animales, inventario, sanidad, reportes)
  - `encargado_rancho` (panel, animales, inventario, sanidad)
  - `encargado_area` (panel, animales de su área)

## 📁 Estructura del Proyecto
```
ganaderapp/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── context/
    │   └── AuthContext.jsx
    ├── services/
    │   ├── api.js
    │   ├── usersService.js
    │   ├── animalsService.js
    │   ├── healthService.js
    │   ├── inventoryService.js
    │   ├── reportsService.js
    │   └── dashboardService.js
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.jsx
    │   │   ├── MobileSidebar.jsx
    │   │   ├── MobileTopbar.jsx
    │   │   └── MobileBottomNav.jsx
    │   └── ui/
    │       ├── StatCard.jsx
    │       ├── Badge.jsx
    │       ├── ProgressBar.jsx
    │       └── Modal.jsx
    ├── pages/
    │   ├── LoginPage.jsx
    │   ├── DashboardPage.jsx
    │   ├── AnimalsPage.jsx
    │   ├── HealthPage.jsx
    │   ├── InventoryPage.jsx
    │   ├── ReportsPage.jsx
    │   └── AdminPage.jsx
    └── utils/
        └── constants.js
```

## 🚀 Instalación y Ejecución

```bash
cd ganaderapp
npm install
npm run dev
```

## 🔐 Cuentas de demostración (contraseña: 1234)
- **Administrador**: `admin@ceibo.com`
- **Encargado General**: `carlos@ceibo.com`
- **Encargado de Rancho**: `roberto@ceibo.com`
- **Encargado de Área**: `ana@ceibo.com`
