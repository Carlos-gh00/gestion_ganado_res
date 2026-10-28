import { request } from './api'

export function getItemStatus(stock, minimo) {
  if (!minimo || minimo <= 0) return { label: 'OK', bg: '#f0fdf4', text: '#3a7d44', bar: '#3a7d44' }
  const r = stock / minimo
  if (r < 0.5) return { label: 'Crítico', bg: '#fef2f2', text: '#b84040', bar: '#b84040' }
  if (r < 1)   return { label: 'Bajo',    bg: '#fffbeb', text: '#c9882a', bar: '#c9882a' }
  return { label: 'OK', bg: '#f0fdf4', text: '#3a7d44', bar: '#3a7d44' }
}

export const inventoryService = {
  /**
   * Obtiene las categorías de inventario con sus artículos reales desde la base de datos.
   */
  async getCategorias() {
    try {
      const res = await request('/inventory/categorias')
      if (res && typeof res === 'object') return res
      return {
        sanidad: { title: 'Sanidad', icon: '✚', color: '#b84040', bg: '#fef2f2', items: [] },
        medicamentos: { title: 'Medicamentos', icon: '💊', color: '#6020c0', bg: '#f5eeff', items: [] },
        alimento: { title: 'Alimento', icon: '🌾', color: '#b87333', bg: '#fff8ec', items: [] },
        infraestructura: { title: 'Infraestructura', icon: '🔧', color: '#2040a0', bg: '#e8f0ff', items: [] },
      }
    } catch (err) {
      console.warn('[inventoryService] Error al obtener categorías de BD:', err.message)
      return {
        sanidad: { title: 'Sanidad', icon: '✚', color: '#b84040', bg: '#fef2f2', items: [] },
        medicamentos: { title: 'Medicamentos', icon: '💊', color: '#6020c0', bg: '#f5eeff', items: [] },
        alimento: { title: 'Alimento', icon: '🌾', color: '#b87333', bg: '#fff8ec', items: [] },
        infraestructura: { title: 'Infraestructura', icon: '🔧', color: '#2040a0', bg: '#e8f0ff', items: [] },
      }
    }
  },

  /**
   * Obtiene todos los artículos registrados en el inventario desde la BD.
   */
  async getAllItems() {
    try {
      const res = await request('/inventory/items')
      return Array.isArray(res) ? res : []
    } catch (err) {
      console.warn('[inventoryService] Error al obtener items de BD:', err.message)
      return []
    }
  },

  /**
   * Obtiene las alertas de stock crítico desde la BD.
   */
  async getAlertas() {
    try {
      const res = await request('/inventory/alertas')
      return Array.isArray(res) ? res : []
    } catch (err) {
      console.warn('[inventoryService] Error al obtener alertas de BD:', err.message)
      return []
    }
  },

  /**
   * Obtiene el historial de movimientos de inventario desde la BD.
   */
  async getMovimientos() {
    try {
      const res = await request('/inventory/movimientos')
      return Array.isArray(res) ? res : []
    } catch (err) {
      console.warn('[inventoryService] Error al obtener movimientos de BD:', err.message)
      return []
    }
  },

  /**
   * Registra un nuevo movimiento (Entrada / Salida / Ajuste) en la BD.
   */
  async registrarMovimiento(data) {
    try {
      const res = await request('/inventory/movimientos', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return res
    } catch (err) {
      console.error('[inventoryService] Error al registrar movimiento:', err.message)
      throw err
    }
  },

  /**
   * Da de alta un nuevo artículo de inventario en la BD.
   */
  async createItem(data) {
    try {
      const res = await request('/inventory/items', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return res
    } catch (err) {
      console.error('[inventoryService] Error al crear artículo en BD:', err.message)
      throw err
    }
  },

  /**
   * Registra una entrada rápida para un ítem específico.
   */
  async registrarEntrada(catKey, itemId, cantidad) {
    return this.registrarMovimiento({
      itemId,
      tipo: 'Entrada',
      cantidad: Number(cantidad) || 0,
      nota: `Entrada registrada en sección ${catKey}`,
    })
  },

  /**
   * Elimina un ítem del inventario (solo admin).
   */
  async deleteItem(id) {
    try {
      const res = await request(`/inventory/items/${id}`, {
        method: 'DELETE',
      })
      return res
    } catch (err) {
      console.error('[inventoryService] Error al eliminar artículo:', err.message)
      throw err
    }
  },
}
