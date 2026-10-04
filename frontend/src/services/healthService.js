import { delay } from './api'

const TRATAMIENTOS_DATA = [
  { id: 'T-0391', animal: 'A-3001', raza: 'Hereford', diagnostico: 'Fiebre aftosa sospechosa', veterinario: 'Dr. Soria', inicio: '20/09/2026', estado: 'Activo',    severidad: 'Alta' },
  { id: 'T-0388', animal: 'A-2980', raza: 'Angus',    diagnostico: 'Neumonía leve',            veterinario: 'Dra. Ríos', inicio: '18/09/2026', estado: 'Activo',    severidad: 'Media' },
  { id: 'T-0385', animal: 'A-2741', raza: 'Brangus',  diagnostico: 'Lesión podal',             veterinario: 'Dr. Soria', inicio: '15/09/2026', estado: 'Activo',    severidad: 'Baja' },
  { id: 'T-0380', animal: 'A-2612', raza: 'Hereford', diagnostico: 'Parásitos internos',       veterinario: 'Dra. Ríos', inicio: '12/09/2026', estado: 'Finalizado', severidad: 'Baja' },
  { id: 'T-0375', animal: 'A-2810', raza: 'Shorthorn',diagnostico: 'Mastitis subclínica',      veterinario: 'Dr. Soria', inicio: '08/09/2026', estado: 'Finalizado', severidad: 'Media' },
]

const VACUNAS_DATA = [
  { nombre: 'Aftosa',         proxima: '30/09/2026', aplicados: 1180, total: 1284, venceDias: 8 },
  { nombre: 'Brucelosis',     proxima: '15/11/2026', aplicados: 1284, total: 1284, venceDias: 54 },
  { nombre: 'Carbunclo',      proxima: '01/10/2026', aplicados: 980,  total: 1284, venceDias: 9 },
  { nombre: 'Clostridios',    proxima: '20/12/2026', aplicados: 1284, total: 1284, venceDias: 89 },
]

export const healthService = {
  async getSanidadKPIs() {
    await delay(100)
    return [
      { label: 'En tratamiento', value: '9', color: '#b84040' },
      { label: 'Alta severidad', value: '3', color: '#c9882a' },
      { label: 'Vacunas al día', value: '2/4', color: '#3a7d44' },
      { label: 'Muertes mes', value: '2', color: '#9a8f82' },
    ]
  },

  async getTratamientos() {
    await delay(120)
    return JSON.parse(JSON.stringify(TRATAMIENTOS_DATA))
  },

  async getVacunacion() {
    await delay(120)
    return JSON.parse(JSON.stringify(VACUNAS_DATA))
  },

  async createTratamiento(data) {
    await delay(200)
    const nuevo = {
      id: 'T-0' + (392 + Math.floor(Math.random() * 50)),
      animal: data.animal || 'A-3050',
      raza: data.raza || 'Hereford',
      diagnostico: data.diagnostico || 'Revisión preventiva',
      veterinario: data.veterinario || 'Dr. Soria',
      inicio: new Date().toLocaleDateString('es-MX'),
      estado: 'Activo',
      severidad: data.severidad || 'Baja',
    }
    TRATAMIENTOS_DATA.unshift(nuevo)
    return nuevo
  },

  async registrarAplicacionVacuna(nombre) {
    await delay(180)
    const v = VACUNAS_DATA.find((x) => x.nombre === nombre)
    if (v && v.aplicados < v.total) {
      v.aplicados = v.total
    }
    return v
  },
}
