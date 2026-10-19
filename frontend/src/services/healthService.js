import { request } from './api'

export const healthService = {
  /**
   * Obtiene los KPIs de sanidad calculados directamente desde la base de datos.
   */
  async getSanidadKPIs() {
    try {
      const res = await request('/health/kpis')
      return Array.isArray(res) ? res : []
    } catch (err) {
      console.warn('[healthService] Error al obtener KPIs de sanidad:', err.message)
      return [
        { label: 'En tratamiento', value: '0', color: '#b84040' },
        { label: 'Alta severidad', value: '0', color: '#c9882a' },
        { label: 'Vacunas al día', value: '0/0', color: '#3a7d44' },
        { label: 'Muertes mes', value: '0', color: '#9a8f82' },
      ]
    }
  },

  /**
   * Obtiene la lista de tratamientos clínicos desde la base de datos.
   */
  async getTratamientos() {
    try {
      const res = await request('/health/tratamientos')
      return Array.isArray(res) ? res : []
    } catch (err) {
      console.warn('[healthService] Error al obtener tratamientos de la BD:', err.message)
      return []
    }
  },

  /**
   * Obtiene el plan de vacunación desde la base de datos.
   */
  async getVacunacion() {
    try {
      const res = await request('/health/vacunacion')
      return Array.isArray(res) ? res : []
    } catch (err) {
      console.warn('[healthService] Error al obtener vacunación de la BD:', err.message)
      return []
    }
  },

  /**
   * Registra un nuevo tratamiento en la base de datos.
   */
  async createTratamiento(data) {
    try {
      const res = await request('/health/tratamientos', {
        method: 'POST',
        body: JSON.stringify({
          animal: data.animal,
          diagnostico: data.diagnostico,
          veterinario: data.veterinario || '',
          severidad: data.severidad || 'Baja',
        }),
      })
      return res
    } catch (err) {
      console.error('[healthService] Error al crear tratamiento en la BD:', err.message)
      throw err
    }
  },

  /**
   * Marca una vacuna como aplicada en la base de datos.
   */
  async registrarAplicacionVacuna(vacunacionId) {
    try {
      const res = await request(`/health/vacunacion/${vacunacionId}/completar`, {
        method: 'POST',
      })
      return res
    } catch (err) {
      console.error('[healthService] Error al actualizar vacunación:', err.message)
      throw err
    }
  },
}
