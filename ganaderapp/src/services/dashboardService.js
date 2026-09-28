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

const CLIMA_DATA = [
  { label: 'Temperatura', value: '24 °C', icon: '🌤' },
  { label: 'Humedad', value: '62%', icon: '💧' },
  { label: 'Viento', value: '12 km/h', icon: '💨' },
  { label: 'Lluvia', value: 'Sin lluvia', icon: '☀️' },
]

const INVENTARIO_ALERTA = [
  { nombre: 'Alimento balanceado', stock: 4200, unidad: 'kg', critico: true },
  { nombre: 'Vacuna Aftosa', stock: 200, unidad: 'dosis', critico: true },
  { nombre: 'Antibiótico OTC', stock: 48, unidad: 'L', critico: false },
]

export const dashboardService = {
  async getKPIs() {
    await delay(100)
    return [...DASHBOARD_KPIS]
  },

  async getAcostaderosResumen() {
    await delay(120)
    return [...ACOSTADEROS_RESUMEN]
  },

  async getAlertas() {
    await delay(100)
    return [...ALERTAS_DATA]
  },

  async getMovimientos() {
    await delay(120)
    return [...MOVIMIENTOS_DATA]
  },

  async getInventarioCritico() {
    await delay(100)
    return [...INVENTARIO_ALERTA]
  },

  async getClima() {
    await delay(80)
    return [...CLIMA_DATA]
  },
}
