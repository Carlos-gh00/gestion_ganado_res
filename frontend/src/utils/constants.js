export const ROL_LABELS = {
  admin: 'Administrador',
  encargado_general: 'Encargado General',
  encargado_rancho: 'Encargado de Rancho',
  encargado_area: 'Encargado de Área',
}

export const ROL_COLORS = {
  admin: { bg: '#f0e8ff', text: '#6020c0' },
  encargado_general: { bg: '#e8f0ff', text: '#2040c0' },
  encargado_rancho: { bg: '#eef6ee', text: '#2e6620' },
  encargado_area: { bg: '#fef9ec', text: '#7a5200' },
}

export const ROL_PERMISOS = {
  admin: ['Panel general', 'Animales', 'Genética', 'Inventario', 'Sanidad', 'Reportes', 'Admin', 'Alta de usuarios'],
  encargado_general: ['Panel general', 'Animales', 'Genética', 'Inventario', 'Sanidad', 'Reportes'],
  encargado_rancho: ['Panel general', 'Animales', 'Genética', 'Inventario', 'Sanidad'],
  encargado_area: ['Panel general', 'Animales (solo su área)', 'Genética'],
}

export const ROLES_LIST = [
  { id: 'encargado_area', label: 'Encargado de Área' },
  { id: 'encargado_rancho', label: 'Encargado de Rancho' },
  { id: 'encargado_general', label: 'Encargado General' },
  { id: 'admin', label: 'Administrador' },
]

export const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Panel General',  mobileLabel: 'Panel',      icon: '▣',  roles: ['admin', 'encargado_general', 'encargado_rancho', 'encargado_area'] },
  { id: 'animals',    label: 'Animales',        mobileLabel: 'Animales',   icon: '🐄',  roles: ['admin', 'encargado_general', 'encargado_rancho', 'encargado_area'] },
  { id: 'genetica',   label: 'Genética',        mobileLabel: 'Genética',   icon: '🧬',  roles: ['admin', 'encargado_general', 'encargado_rancho', 'encargado_area'] },
  { id: 'inventory',  label: 'Inventario',      mobileLabel: 'Inventario', icon: '⊟',  roles: ['admin', 'encargado_general', 'encargado_rancho'] },
  { id: 'health',     label: 'Sanidad',         mobileLabel: 'Sanidad',    icon: '✚',  roles: ['admin', 'encargado_general', 'encargado_rancho'] },
  { id: 'reports',    label: 'Reportes',        mobileLabel: 'Reportes',   icon: '◈',  roles: ['admin', 'encargado_general'] },
  { id: 'admin',      label: 'Administración',  mobileLabel: 'Admin',      icon: '⚙',  roles: ['admin'] },
]
