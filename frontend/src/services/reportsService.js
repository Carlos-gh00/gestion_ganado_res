import { request } from './api'

export const TIPOS_REPORTE = [
  { id: 'produccion',   label: 'Producción',   icon: '🐄', desc: 'Cabezas faenadas, pesos, GDP por lote' },
  { id: 'sanidad',      label: 'Sanidad',       icon: '✚', desc: 'Tratamientos, vacunas, mortalidad' },
  { id: 'inventario',   label: 'Inventario',    icon: '⊟', desc: 'Consumos, entradas y stock actual' },
  { id: 'movimientos',  label: 'Movimientos',   icon: '↔', desc: 'Ingresos, traslados y salidas de ganado' },
  { id: 'financiero',   label: 'Financiero',    icon: '◈', desc: 'Ingresos, egresos y rentabilidad' },
]

export const PALETAS_COLOR = [
  { name: 'Verde bosque',  primary: '#2e4829', accent: '#b87333' },
  { name: 'Tierra',        primary: '#7a4f2e', accent: '#c9882a' },
  { name: 'Cielo ranchero',primary: '#1a3a5c', accent: '#4a8fb8' },
  { name: 'Ocre',          primary: '#7a6020', accent: '#b87333' },
  { name: 'Pizarra',       primary: '#2d3748', accent: '#68d391' },
]

export const PERIODOS = [
  { id: 'semana', label: 'Última semana' },
  { id: 'mes', label: 'Último mes' },
  { id: 'trimestre', label: 'Último trimestre' },
  { id: 'año', label: 'Año actual' },
]

export const reportsService = {
  async getTiposReporte() {
    return [...TIPOS_REPORTE]
  },

  async getPaletasColor() {
    return [...PALETAS_COLOR]
  },

  async getPeriodos() {
    return [...PERIODOS]
  },

  /**
   * Obtiene la lista de reportes generados desde la base de datos real.
   */
  async getReportesGenerados() {
    try {
      const res = await request('/reports/reportes')
      return Array.isArray(res) ? res : []
    } catch (err) {
      console.warn('[reportsService] Error al obtener reportes de BD:', err.message)
      return []
    }
  },

  /**
   * Genera y guarda un nuevo reporte en la base de datos.
   */
  async generarReporte(config) {
    try {
      const res = await request('/reports/reportes', {
        method: 'POST',
        body: JSON.stringify({
          tipo: config.tipo || 'produccion',
          periodo: config.periodo || 'mes',
        }),
      })
      return res
    } catch (err) {
      console.error('[reportsService] Error al generar reporte en BD:', err.message)
      throw err
    }
  },
}
