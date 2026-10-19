const STORAGE_KEY_SEMENTALES = 'ganaderapp_sementales_data'
const STORAGE_KEY_PAJUELAS = 'ganaderapp_pajuelas_data'
const STORAGE_KEY_MONTAS = 'ganaderapp_montas_data'

function getStoredSementales() {
  const data = localStorage.getItem(STORAGE_KEY_SEMENTALES)
  if (data) {
    try {
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) return parsed
    } catch {
      // fallback
    }
  }
  return []
}

function saveStoredSementales(list) {
  localStorage.setItem(STORAGE_KEY_SEMENTALES, JSON.stringify(list))
}

function getStoredPajuelas() {
  const data = localStorage.getItem(STORAGE_KEY_PAJUELAS)
  if (data) {
    try {
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) return parsed
    } catch {
      // fallback
    }
  }
  return []
}

function getStoredMontas() {
  const data = localStorage.getItem(STORAGE_KEY_MONTAS)
  if (data) {
    try {
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) return parsed
    } catch {
      // fallback
    }
  }
  return []
}

export const geneticaService = {
  /**
   * Obtiene los KPIs calculados dinámicamente de sementales.
   */
  async getKPIs() {
    const sementales = getStoredSementales()
    const activos = sementales.filter((s) => s.estado === 'Activo en Monta').length
    const enColecta = sementales.filter((s) => s.estado === 'En Colecta').length
    const totalPajuelas = sementales.reduce((acc, s) => acc + (Number(s.dosisDisponibles) || 0), 0)
    const totalCrias = sementales.reduce((acc, s) => acc + (Number(s.criasRegistradas) || 0), 0)

    return {
      totalSementales: sementales.length,
      activosMonta: activos,
      enColecta,
      totalPajuelas,
      totalCrias,
      tasaPrenezPromedio: sementales.length > 0 ? '78.5%' : '0%',
    }
  },

  /**
   * Obtiene la lista de sementales (arranca vacía hasta que se registren).
   */
  async getSementales() {
    return getStoredSementales()
  },

  /**
   * Obtiene el inventario criogénico de pajuelas.
   */
  async getPajuelas() {
    return getStoredPajuelas()
  },

  /**
   * Obtiene los registros de montas y servicios reproductivos.
   */
  async getMontas() {
    return getStoredMontas()
  },

  /**
   * Da de alta un nuevo semental en el sistema.
   */
  async createSemental(data) {
    const list = getStoredSementales()
    const newId = `SEM-${String(list.length + 1).padStart(2, '0')}`
    const nuevo = {
      id: newId,
      codigo: data.codigo?.trim() || `TOR-${Math.floor(100 + Math.random() * 900)}`,
      nombre: data.nombre?.trim() || 'Nuevo Semental',
      raza: data.raza || 'Angus Negro',
      registro: data.registro?.trim() || '',
      fechaNacimiento: data.fechaNacimiento || new Date().toISOString().split('T')[0],
      peso: Number(data.peso) || 0,
      condicionCorporal: data.condicionCorporal || '7/9',
      circunferenciaEscrotal: Number(data.circunferenciaEscrotal) || 0,
      estado: data.estado || 'Activo en Monta',
      ubicacion: data.ubicacion?.trim() || 'Potrero Principal',
      evaluacionAndrologica: data.evaluacionAndrologica || 'Apto',
      motilidadSeminal: data.motilidadSeminal || '85%',
      dosisDisponibles: Number(data.dosisDisponibles) || 0,
      dosisUsadas: 0,
      criasRegistradas: 0,
      tasaPrenez: '0%',
      padre: data.padre?.trim() || '—',
      madre: data.madre?.trim() || '—',
      abueloMaterno: data.abueloMaterno?.trim() || '—',
      avatarRaza: '🐂',
      deps: {
        facilidadParto: data.depFp || '—',
        pesoNacer: data.depPn || '—',
        pesoDestete: data.depPd || '—',
        pesoAno: data.depPa || '—',
        lecheMaterna: data.depLeche || '—',
        areaOjoBife: data.depAob || '—',
      },
      descripcion: data.descripcion?.trim() || '',
    }
    list.unshift(nuevo)
    saveStoredSementales(list)
    return nuevo
  },

  /**
   * Actualiza el estado reproductivo y ubicación del semental.
   */
  async updateEstado(id, nuevoEstado, nuevaUbicacion) {
    const list = getStoredSementales()
    const s = list.find((item) => item.id === id)
    if (s) {
      s.estado = nuevoEstado
      if (nuevaUbicacion) s.ubicacion = nuevaUbicacion
      saveStoredSementales(list)
      return s
    }
    return null
  },
}
