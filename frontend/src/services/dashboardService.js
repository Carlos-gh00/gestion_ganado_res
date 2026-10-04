import { delay } from './api'

const DASHBOARD_KPIS = [
  { label: 'Total animales', value: '1,284', sub: 'En 6 acostaderos', icon: '🐄', color: '#2e4829' },
  { label: 'Peso promedio', value: '418 kg', sub: 'Meta: 480 kg', icon: '⚖', color: '#b87333' },
  { label: 'En tratamiento', value: '9', sub: '3 críticos', icon: '✚', color: '#b84040' },
  { label: 'Ventas septiembre', value: '$4.2M', sub: '87 cabezas', icon: '◈', color: '#3a7d44' },
]

const ACOSTADEROS_RESUMEN = [
  { nombre: 'Acostadero A', animales: 148, capacidad: 180, estado: 'Normal' },
  { nombre: 'Acostadero B', animales: 162, capacidad: 160, estado: 'Lleno' },
  { nombre: 'Acostadero C', animales: 95, capacidad: 150, estado: 'Normal' },
  { nombre: 'Acostadero D', animales: 220, capacidad: 200, estado: 'Sobrecargado' },
  { nombre: 'Acostadero E', animales: 110, capacidad: 150, estado: 'Normal' },
  { nombre: 'Acostadero F', animales: 80, capacidad: 160, estado: 'Disponible' },
]

const ALERTAS_DATA = [
  { tipo: 'danger',  msg: '3 animales con fiebre en Acostadero D',      tiempo: '2 h' },
  { tipo: 'warning', msg: 'Alimento balanceado bajo stock — 4,200 kg',  tiempo: '5 h' },
  { tipo: 'success', msg: '48 novillos listos para faena — Lote 04',    tiempo: 'Ayer' },
  { tipo: 'warning', msg: 'Vacuna Aftosa vence en 8 días',              tiempo: 'Ayer' },
]

const MOVIMIENTOS_DATA = [
  { id: 'A-2847', tipo: 'Ingreso',    desc: 'Ingreso por compra — 12 novillos Hereford',    hora: '08:30' },
  { id: 'A-2901', tipo: 'Traslado',   desc: 'Traslado Acostadero B → C — 8 animales',       hora: '10:15' },
  { id: 'A-2733', tipo: 'Salida',     desc: 'Salida a frigorífico — 6 novillos Brangus',    hora: '12:00' },
  { id: 'A-3001', tipo: 'Tratamiento',desc: 'Inicio tratamiento fiebre — Acostadero D',     hora: '14:20' },
  { id: 'A-2655', tipo: 'Ingreso',    desc: 'Ingreso terneros destete — 20 animales',       hora: 'Ayer' },
]

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

const FALLBACK_CLIMA = {
  ubicacion: 'Estancia Ganadera',
  condicion: 'Parcialmente nublado',
  temperatura: '24 °C',
  maxMin: 'Máx: 28°C · Mín: 15°C',
  icon: '🌤️',
  googleUrl: 'https://www.google.com/search?q=clima+hoy',
  actualizadoA: '08:00',
  isLive: false,
  items: [
    { label: 'Temperatura', value: '24 °C', sub: 'Máx 28° / Mín 15°', icon: '🌤️' },
    { label: 'Humedad', value: '62%', sub: 'Humedad relativa', icon: '💧' },
    { label: 'Viento', value: '12 km/h', sub: 'Brisa de campo', icon: '💨' },
    { label: 'Lluvia', value: 'Sin lluvia', sub: 'Probabilidad 10%', icon: '☀️' },
  ],
}

const INVENTARIO_ALERTA = [
  { nombre: 'Alimento balanceado', stock: 4200, unidad: 'kg', critico: true },
  { nombre: 'Vacuna Aftosa', stock: 200, unidad: 'dosis', critico: true },
  { nombre: 'Antibiótico OTC', stock: 48, unidad: 'L', critico: false },
]

export const dashboardService = {
  async getKPIs() {
    await delay(50)
    return [...DASHBOARD_KPIS]
  },

  async getAcostaderosResumen() {
    await delay(60)
    return [...ACOSTADEROS_RESUMEN]
  },

  async getAlertas() {
    await delay(50)
    return [...ALERTAS_DATA]
  },

  async getMovimientos() {
    await delay(60)
    return [...MOVIMIENTOS_DATA]
  },

  async getInventarioCritico() {
    await delay(50)
    return [...INVENTARIO_ALERTA]
  },

  /**
   * Obtiene los datos del día (condiciones climáticas, temperatura, viento, humedad, precipitación)
   * consultando la meteorología en tiempo real y conectando con Google Clima.
   */
  async getClima() {
    try {
      // Coordenadas base (Jalisco / Región ganadera)
      let lat = 20.65
      let lon = -103.35
      let ubicacion = 'Región Ganadera'

      // Detectar geolocalización del navegador si está permitida (con timeout de 1.8s)
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
          // Si no se concede o expira, continuamos con coordenadas default
        }
      }

      // Consulta de la API meteorológica pública y en tiempo real
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
      const probLluvia = daily.precipitation_probability_max?.[0] ?? 0

      const wInfo = WMO_CODE_MAP[cur.weather_code] || { label: 'Condición estable', icon: '🌤️' }
      const rainLabel = precipitation > 0 ? `${precipitation} mm` : 'Sin lluvia'

      const now = new Date()
      const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

      const tzParts = (data.timezone || '').split('/')
      const cityName = tzParts[tzParts.length - 1]?.replace(/_/g, ' ') || ubicacion

      const googleUrl = `https://www.google.com/search?q=clima+${encodeURIComponent(cityName || 'hoy')}`

      return {
        ubicacion: cityName,
        condicion: wInfo.label,
        temperatura: `${temp} °C`,
        maxMin: `Máx: ${maxT}°C · Mín: ${minT}°C`,
        icon: wInfo.icon,
        googleUrl,
        actualizadoA: timeStr,
        isLive: true,
        items: [
          {
            label: 'Temperatura',
            value: `${temp} °C`,
            sub: `Máx ${maxT}° / Mín ${minT}°`,
            icon: wInfo.icon,
          },
          {
            label: 'Humedad',
            value: `${humidity}%`,
            sub: humidity > 70 ? 'Humedad alta' : 'Nivel óptimo',
            icon: '💧',
          },
          {
            label: 'Viento',
            value: `${wind} km/h`,
            sub: wind > 25 ? 'Ráfagas fuertes' : 'Viento moderado',
            icon: '💨',
          },
          {
            label: 'Lluvia',
            value: rainLabel,
            sub: `Probabilidad: ${probLluvia}%`,
            icon: precipitation > 0 ? '🌧️' : '☀️',
          },
        ],
      }
    } catch (err) {
      console.warn('[ClimaService] No se pudo obtener clima en tiempo real, usando fallback:', err.message)
      return { ...FALLBACK_CLIMA }
    }
  },
}

