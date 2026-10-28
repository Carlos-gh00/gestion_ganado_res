import { request } from './api'

export const animalsService = {
  /**
   * Obtiene la lista de acostaderos desde la base de datos del backend.
   */
  async getAcostaderos() {
    try {
      const res = await request('/acostaderos')
      return Array.isArray(res) ? res : []
    } catch (err) {
      console.warn('[animalsService] Error al obtener acostaderos de la BD:', err.message)
      return []
    }
  },

  /**
   * Obtiene los animales registrados recientemente desde la BD.
   */
  async getAnimalesRecientes() {
    try {
      const res = await request('/animals/recientes')
      return Array.isArray(res) ? res : []
    } catch (err) {
      console.warn('[animalsService] Error al obtener animales recientes de la BD:', err.message)
      return []
    }
  },

  /**
   * Obtiene todos los animales registrados en la base de datos.
   */
  async getAllAnimales() {
    try {
      const res = await request('/animals')
      return Array.isArray(res) ? res : []
    } catch (err) {
      console.warn('[animalsService] Error al obtener todos los animales de la BD:', err.message)
      return []
    }
  },

  /**
   * Da de alta un nuevo animal en la base de datos real.
   */
  async registerAnimal(animal) {
    try {
      const res = await request('/animals', {
        method: 'POST',
        body: JSON.stringify({
          raza: animal.raza,
          sexo: animal.sexo,
          peso: Number(animal.peso) || 0,
          estado: animal.estado || 'Cría',
          origen: animal.origen || '',
          acostadero: animal.acostaderoId || animal.acostadero || 'A',
        }),
      })
      return res
    } catch (err) {
      console.error('[animalsService] Error al registrar animal en la BD:', err.message)
      throw err
    }
  },

  /**
   * Elimina un animal de la base de datos.
   */
  async deleteAnimal(id) {
    try {
      const res = await request(`/animals/${id}`, {
        method: 'DELETE',
      })
      return res
    } catch (err) {
      console.error('[animalsService] Error al eliminar animal:', err.message)
      throw err
    }
  },

  /**
   * Crea un nuevo acostadero, corral o rancho.
   */
  async createAcostadero(data) {
    try {
      const res = await request('/acostaderos', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return res
    } catch (err) {
      console.error('[animalsService] Error al crear acostadero/corral/rancho:', err.message)
      throw err
    }
  },

  /**
   * Actualiza un acostadero, corral o rancho.
   */
  async updateAcostadero(id, data) {
    try {
      const res = await request(`/acostaderos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
      return res
    } catch (err) {
      console.error('[animalsService] Error al actualizar acostadero/corral/rancho:', err.message)
      throw err
    }
  },

  /**
   * Elimina un acostadero, corral o rancho si no tiene animales.
   */
  async deleteAcostadero(id) {
    try {
      const res = await request(`/acostaderos/${id}`, {
        method: 'DELETE',
      })
      return res
    } catch (err) {
      console.error('[animalsService] Error al eliminar acostadero/corral/rancho:', err.message)
      throw err
    }
  },
}
