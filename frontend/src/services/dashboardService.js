import { request } from './api'

const WMO_CODE_MAP = {
  0: { label: 'Cielo despejado', icon: '☀️' },
  1: { label: 'Mayormente despejado', icon: '🌤️' },
  2: { label: 'Parcialmente nublado', icon: '⛅' },
  3: { label: 'Nublado', icon: '☁️' },
  45: { label: 'Neblina', icon: '🌫️' },
  48: { label: 'Niebla con escarcha', icon: '🌫️' },
  51: { label: 'Llovizna ligera', icon: '🌦️' },
  53: { label: 'Llovizna moderada', icon: '🌦️' },
  55: { label: 'Llovizna densa', icon: '🌧️' },
  61: { label: 'Lluvia leve', icon: '🌧️' },
  63: { label: 'Lluvia moderada', icon: '🌧️' },
  65: { label: 'Lluvia fuerte', icon: '🌧️' },
  71: { label: 'Nevada ligera', icon: '🌨️' },
  73: { label: 'Nevada moderada', icon: '❄️' },
  75: { label: 'Nevada fuerte', icon: '❄️' },
  80: { label: 'Chubascos leves', icon: '🌦️' },
  81: { label: 'Chubascos moderados', icon: '🌧️' },
  82: { label: 'Chubascos violentos', icon: '⛈️' },
  95: { label: 'Tormenta eléctrica', icon: '⛈️' },
  96: { label: 'Tormenta con granizo', icon: '⛈️' },
  99: { label: 'Tormenta severa', icon: '⛈️' },
}

const DEFAULT_KPIS = [
  { label: 'Total animales', value: '0', sub: 'En 0 acostaderos', icon: '🐄', color: '#2e4829' },
  { label: 'Peso promedio', value: '0 kg', sub: 'Meta: 480 kg', icon: '⚖', color: '#b87333' },
  { label: 'En tratamiento', value: '0', sub: '0 críticos', icon: '✚', color: '#b84040' },
  { label: 'Ventas del mes', value: '$0', sub: '0 cabezas', icon: '◈', color: '#3a7d44' },
]

export const dashboardService = {
  /**
   * Obtiene los KPIs generales calculados en tiempo real desde la BD.
   */
  async getKPIs() {
    try {
      const res = await request('/dashboard/kpis')
      return Array.isArray(res) && res.length > 0 ? res : DEFAULT_KPIS
    } catch (err) {
      console.warn('[dashboardService] Error al obtener KPIs de BD:', err.message)
      return DEFAULT_KPIS
    }
  },

  /**
   * Obtiene el resumen de acostaderos desde la base de datos real.
   */
  async getAcostaderosResumen() {
    try {
      const res = await request('/acostaderos')
      return Array.isArray(res) ? res : []
    } catch (err) {
      console.warn('[dashboardService] Error al obtener acostaderos de BD:', err.message)
      return []
    }
  },

  /**
   * Obtiene las alertas del rancho desde la base de datos real.
   */
  async getAlertas() {
    try {
      const res = await request('/dashboard/alertas')
      return Array.isArray(res) ? res : []
    } catch (err) {
      console.warn('[dashboardService] Error al obtener alertas de BD:', err.message)
      return []
    }
  },

  /**
   * Obtiene los movimientos recientes de ganado desde la base de datos real.
   */
  async getMovimientos() {
    try {
      const res = await request('/dashboard/actividad')
      return Array.isArray(res) ? res : []
    } catch (err) {
      console.warn('[dashboardService] Error al obtener movimientos de BD:', err.message)
      return []
    }
  },

  /**
   * Obtiene los artículos en estado crítico desde la base de datos real.
   */
  async getInventarioCritico() {
    try {
      const res = await request('/inventory/items?critico=true')
      return Array.isArray(res) ? res : []
    } catch (err) {
      console.warn('[dashboardService] Error al obtener inventario crítico de BD:', err.message)
      return []
    }
  },

  /**
   * Consulta el clima satelital en tiempo real para el rancho.
   */
  async getClima() {
    try {
      let lat = 20.65
      let lon = -103.35
      let ubicacion = 'Región Ganadera'

      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        try {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 1800 })
          })
          if (pos && pos.coords) {
            lat = Number(pos.coords.latitude.toFixed(2))
            lon = Number(pos.coords.longitude.toFixed(2))
            ubicacion = 'Tu ubicación'
          }
        } catch {
          // Continuar con coordenadas base
        }
      }

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`
      )

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      const cur = data.current || {}
      const daily = data.daily || {}

      const temp = Math.round(cur.temperature_2m ?? 24)
      const maxT = Math.round(daily.temperature_2m_max?.[0] ?? (temp + 4))
      const minT = Math.round(daily.temperature_2m_min?.[0] ?? (temp - 5))
      const humidity = Math.round(cur.relative_humidity_2m ?? 60)
      const wind = Math.round(cur.wind_speed_10m ?? 10)
      const precipitation = cur.precipitation ?? 0
      const rainProb = Math.round(daily.precipitation_probability_max?.[0] ?? 0)

      const weatherCode = cur.weather_code ?? 1
      const weatherInfo = WMO_CODE_MAP[weatherCode] || { label: 'Despejado', icon: '☀️' }

      return {
        ubicacion,
        condicion: weatherInfo.label,
        icono: weatherInfo.icon,
        icon: weatherInfo.icon,
        tempActual: temp,
        temperatura: `${temp} °C`,
        tempMax: maxT,
        tempMin: minT,
        maxMin: `Máx: ${maxT}°C · Mín: ${minT}°C`,
        googleUrl: `https://www.google.com/search?q=clima+${encodeURIComponent(ubicacion)}`,
        actualizadoA: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLive: true,
        items: [
          { label: 'Temperatura', value: `${temp} °C`, sub: `Máx ${maxT}° / Mín ${minT}°`, icon: weatherInfo.icon },
          { label: 'Humedad', value: `${humidity}%`, sub: 'Humedad relativa', icon: '💧' },
          { label: 'Viento', value: `${wind} km/h`, sub: 'Brisa de campo', icon: '💨' },
          {
            label: 'Lluvia',
            value: precipitation > 0 ? `${precipitation} mm` : 'Sin lluvia',
            sub: `Probabilidad ${rainProb}%`,
            icon: precipitation > 0 ? '🌧️' : '☀️',
          },
        ],
      }
    } catch {
      return {
        ubicacion: 'Estancia Ganadera',
        condicion: 'Despejado',
        icono: '☀️',
        icon: '☀️',
        tempActual: 24,
        temperatura: '24 °C',
        tempMax: 28,
        tempMin: 15,
        maxMin: 'Máx: 28°C · Mín: 15°C',
        googleUrl: 'https://www.google.com/search?q=clima+rancho',
        actualizadoA: '08:00',
        isLive: false,
        items: [
          { label: 'Temperatura', value: '24 °C', sub: 'Máx 28° / Mín 15°', icon: '🌤️' },
          { label: 'Humedad', value: '60%', sub: 'Humedad relativa', icon: '💧' },
          { label: 'Viento', value: '10 km/h', sub: 'Brisa de campo', icon: '💨' },
          { label: 'Lluvia', value: 'Sin lluvia', sub: 'Probabilidad 0%', icon: '☀️' },
        ],
      }
    }
  },
}
