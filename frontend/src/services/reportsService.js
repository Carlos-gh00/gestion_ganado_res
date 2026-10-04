import { delay } from './api'

const TIPOS_REPORTE = [
  { id: 'produccion',   label: 'Producción',   icon: '🐄', desc: 'Cabezas faenadas, pesos, GDP por lote' },
  { id: 'sanidad',      label: 'Sanidad',       icon: '✚', desc: 'Tratamientos, vacunas, mortalidad' },
  { id: 'inventario',   label: 'Inventario',    icon: '⊟', desc: 'Consumos, entradas y stock actual' },
  { id: 'movimientos',  label: 'Movimientos',   icon: '↔', desc: 'Ingresos, traslados y salidas de ganado' },
  { id: 'financiero',   label: 'Financiero',    icon: '◈', desc: 'Ingresos, egresos y rentabilidad' },
]

const PALETAS_COLOR = [
  { name: 'Verde bosque',  primary: '#2e4829', accent: '#b87333' },
  { name: 'Tierra',        primary: '#7a4f2e', accent: '#c9882a' },
  { name: 'Cielo ranchero',primary: '#1a3a5c', accent: '#4a8fb8' },
  { name: 'Ocre',          primary: '#7a6020', accent: '#b87333' },
  { name: 'Pizarra',       primary: '#2d3748', accent: '#68d391' },
]

const PERIODOS = [
  { id: 'semana', label: 'Última semana' },
  { id: 'mes', label: 'Último mes' },
  { id: 'trimestre', label: 'Último trimestre' },
  { id: 'año', label: 'Año actual' },
]

const REPORTES_GENERADOS = [
  { id: 'R-240', tipo: 'Producción',  periodo: 'Agosto 2026',     generado: '01/09/2026', autor: 'Carlos Mendoza',  color: '#2e4829' },
  { id: 'R-239', tipo: 'Sanidad',     periodo: 'Q3 2026',         generado: '15/09/2026', autor: 'Admin Sistema',   color: '#b84040' },
  { id: 'R-238', tipo: 'Inventario',  periodo: 'Julio 2026',      generado: '02/08/2026', autor: 'Roberto Fierro',  color: '#1a3a5c' },
  { id: 'R-237', tipo: 'Financiero',  periodo: 'Semestre 1 2026', generado: '01/07/2026', autor: 'Carlos Mendoza',  color: '#7a4f2e' },
]

export const reportsService = {
  async getTiposReporte() {
    await delay(80)
    return [...TIPOS_REPORTE]
  },

  async getPaletasColor() {
    await delay(80)
    return [...PALETAS_COLOR]
  },

  async getPeriodos() {
    await delay(80)
    return [...PERIODOS]
  },

  async getReportesGenerados() {
    await delay(120)
    return [...REPORTES_GENERADOS]
  },

  async generarReporte(config) {
    await delay(1500)
    const nuevo = {
      id: 'R-' + (241 + Math.floor(Math.random() * 20)),
      tipo: config.tipoLabel || 'Producción',
      periodo: config.periodoLabel || 'Último mes',
      generado: new Date().toLocaleDateString('es-MX'),
      autor: config.autor || 'Admin Sistema',
      color: config.color || '#2e4829',
    }
    REPORTES_GENERADOS.unshift(nuevo)
    return nuevo
  },
}
