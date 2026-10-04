import { delay } from './api'

const ACOSTADEROS_DATA = [
  {
    id: 'A', nombre: 'Acostadero A', capacidad: 180, estado: 'Normal',
    animales: [
      { id: 'A-2655', raza: 'Hereford', sexo: 'H', peso: 275, estado: 'Cría' },
      { id: 'A-2612', raza: 'Brangus',  sexo: 'H', peso: 330, estado: 'Cría' },
      { id: 'A-2780', raza: 'Shorthorn',sexo: 'H', peso: 415, estado: 'Engorde' },
      { id: 'A-2820', raza: 'Hereford', sexo: 'M', peso: 460, estado: 'Engorde' },
    ],
    total: 148,
  },
  {
    id: 'B', nombre: 'Acostadero B', capacidad: 160, estado: 'Lleno',
    animales: [
      { id: 'A-2901', raza: 'Angus',    sexo: 'H', peso: 310, estado: 'Cría' },
      { id: 'A-2810', raza: 'Shorthorn',sexo: 'M', peso: 465, estado: 'Engorde' },
      { id: 'A-3001', raza: 'Hereford', sexo: 'M', peso: 210, estado: 'Tratamiento' },
      { id: 'A-2877', raza: 'Angus',    sexo: 'M', peso: 490, estado: 'Engorde' },
    ],
    total: 162,
  },
  {
    id: 'C', nombre: 'Acostadero C', capacidad: 150, estado: 'Normal',
    animales: [
      { id: 'A-2733', raza: 'Brangus',  sexo: 'M', peso: 520, estado: 'Venta' },
      { id: 'A-2670', raza: 'Angus',    sexo: 'M', peso: 495, estado: 'Venta' },
      { id: 'A-2705', raza: 'Hereford', sexo: 'H', peso: 340, estado: 'Cría' },
    ],
    total: 95,
  },
  {
    id: 'D', nombre: 'Acostadero D', capacidad: 200, estado: 'Sobrecargado',
    animales: [
      { id: 'A-2950', raza: 'Angus',    sexo: 'M', peso: 390, estado: 'Engorde' },
      { id: 'A-2968', raza: 'Brangus',  sexo: 'M', peso: 420, estado: 'Engorde' },
      { id: 'A-2975', raza: 'Hereford', sexo: 'M', peso: 355, estado: 'Engorde' },
    ],
    total: 220,
  },
  {
    id: 'E', nombre: 'Acostadero E', capacidad: 150, estado: 'Normal',
    animales: [
      { id: 'A-2847', raza: 'Hereford', sexo: 'M', peso: 482, estado: 'Engorde' },
      { id: 'A-2860', raza: 'Shorthorn',sexo: 'H', peso: 395, estado: 'Engorde' },
    ],
    total: 110,
  },
  {
    id: 'F', nombre: 'Acostadero F', capacidad: 160, estado: 'Disponible',
    animales: [
      { id: 'A-2890', raza: 'Angus',    sexo: 'H', peso: 290, estado: 'Cría' },
      { id: 'A-2895', raza: 'Hereford', sexo: 'H', peso: 310, estado: 'Cría' },
    ],
    total: 80,
  },
]

const RECIENTES_DATA = [
  { id: 'A-3050', raza: 'Angus',    sexo: 'M', peso: 280, origen: 'Rancho Durán',    fecha: '22/09/2026', acostadero: 'E', estado: 'Adaptación' },
  { id: 'A-3051', raza: 'Hereford', sexo: 'M', peso: 295, origen: 'Rancho Durán',    fecha: '22/09/2026', acostadero: 'E', estado: 'Adaptación' },
  { id: 'A-3048', raza: 'Brangus',  sexo: 'H', peso: 260, origen: 'La Esperanza SA', fecha: '20/09/2026', acostadero: 'F', estado: 'Cuarentena' },
  { id: 'A-3049', raza: 'Brangus',  sexo: 'H', peso: 270, origen: 'La Esperanza SA', fecha: '20/09/2026', acostadero: 'F', estado: 'Cuarentena' },
  { id: 'A-3040', raza: 'Shorthorn',sexo: 'M', peso: 310, origen: 'Subasta Torreón', fecha: '18/09/2026', acostadero: 'A', estado: 'Integrado' },
]

export const animalsService = {
  async getAcostaderos() {
    await delay(120)
    return JSON.parse(JSON.stringify(ACOSTADEROS_DATA))
  },

  async getAnimalesRecientes() {
    await delay(120)
    return JSON.parse(JSON.stringify(RECIENTES_DATA))
  },

  async getAllAnimales() {
    await delay(150)
    const list = []
    ACOSTADEROS_DATA.forEach((ac) => {
      ac.animales.forEach((a) => {
        list.push({ ...a, acostaderoNombre: ac.nombre, acostaderoId: ac.id })
      })
    })
    return list
  },

  async registerAnimal(animal) {
    await delay(200)
    const targetAc = ACOSTADEROS_DATA.find((a) => a.id === animal.acostaderoId) || ACOSTADEROS_DATA[0]
    const newAnimal = {
      id: 'A-' + (3052 + Math.floor(Math.random() * 100)),
      raza: animal.raza || 'Hereford',
      sexo: animal.sexo || 'M',
      peso: Number(animal.peso) || 300,
      estado: animal.estado || 'Adaptación',
    }
    targetAc.animales.unshift(newAnimal)
    targetAc.total += 1
    return newAnimal
  },
}
