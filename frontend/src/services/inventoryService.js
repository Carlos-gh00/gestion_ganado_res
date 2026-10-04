import { delay } from './api'

const SANIDAD_ITEMS = [
  { id: 'S-001', nombre: 'Vacuna Aftosa (dosis)',     stock: 200,  unidad: 'ud',    minimo: 500,  proveedor: 'VetFarma',   ultimo: '01/09/2026', costo: 1200 },
  { id: 'S-002', nombre: 'Vacuna Brucelosis',         stock: 480,  unidad: 'ud',    minimo: 300,  proveedor: 'VetFarma',   ultimo: '10/08/2026', costo: 980 },
  { id: 'S-003', nombre: 'Desparasitante ivermectina',stock: 60,   unidad: 'L',     minimo: 20,   proveedor: 'MedVet SA',  ultimo: '15/09/2026', costo: 4500 },
  { id: 'S-004', nombre: 'Jeringa desechable 20cc',   stock: 1200, unidad: 'pzas',  minimo: 500,  proveedor: 'MedVet SA',  ultimo: '20/08/2026', costo: 15 },
  { id: 'S-005', nombre: 'Vacuna Clostridios',        stock: 600,  unidad: 'ud',    minimo: 300,  proveedor: 'VetFarma',   ultimo: '05/09/2026', costo: 750 },
]

const MEDICAMENTOS_ITEMS = [
  { id: 'M-001', nombre: 'Antibiótico Oxitetraciclina', stock: 48,  unidad: 'L',  minimo: 20,  proveedor: 'VetFarma',  ultimo: '10/09/2026', costo: 8400 },
  { id: 'M-002', nombre: 'Antiinflamatorio Ketoprofeno',stock: 25,  unidad: 'L',  minimo: 10,  proveedor: 'MedVet SA', ultimo: '12/09/2026', costo: 6200 },
  { id: 'M-003', nombre: 'Sulfato de Magnesio',         stock: 30,  unidad: 'kg', minimo: 15,  proveedor: 'AgroFarm',  ultimo: '08/09/2026', costo: 1800 },
  { id: 'M-004', nombre: 'Vitaminas A-D-E',             stock: 15,  unidad: 'L',  minimo: 10,  proveedor: 'Nutriganado',ultimo: '08/09/2026', costo: 6200 },
  { id: 'M-005', nombre: 'Suero fisiológico 1L',        stock: 80,  unidad: 'ud', minimo: 30,  proveedor: 'MedVet SA', ultimo: '01/09/2026', costo: 340 },
]

const ALIMENTO_ITEMS = [
  { id: 'A-001', nombre: 'Alimento balanceado engorde', stock: 4200,  unidad: 'kg',    minimo: 5000,  proveedor: 'AgroNorte SA',  ultimo: '15/09/2026', costo: 320 },
  { id: 'A-002', nombre: 'Heno de alfalfa',             stock: 12000, unidad: 'kg',    minimo: 3000,  proveedor: 'Campo Verde SRL',ultimo: '18/09/2026', costo: 85 },
  { id: 'A-003', nombre: 'Sal mineral',                 stock: 1500,  unidad: 'kg',    minimo: 500,   proveedor: 'Nutriganado',   ultimo: '20/09/2026', costo: 180 },
  { id: 'A-004', nombre: 'Melaza',                      stock: 800,   unidad: 'kg',    minimo: 300,   proveedor: 'AgroNorte SA',  ultimo: '10/09/2026', costo: 125 },
  { id: 'A-005', nombre: 'Rastrojo de maíz',            stock: 8000,  unidad: 'kg',    minimo: 2000,  proveedor: 'Campo Verde SRL',ultimo: '05/09/2026', costo: 40 },
  { id: 'A-006', nombre: 'Concentrado proteico',        stock: 600,   unidad: 'kg',    minimo: 500,   proveedor: 'Nutriganado',   ultimo: '12/09/2026', costo: 520 },
]

const INFRAESTRUCTURA_ITEMS = [
  { id: 'I-001', nombre: 'Hilo eléctrico pastoreo',   stock: 8,   unidad: 'rollos', minimo: 5,  proveedor: 'TechAgro',  ultimo: '12/09/2026', costo: 4500 },
  { id: 'I-002', nombre: 'Postes de madera',           stock: 120, unidad: 'pzas',  minimo: 50, proveedor: 'MaderaRanch',ultimo: '01/09/2026', costo: 280 },
  { id: 'I-003', nombre: 'Grapas galvanizadas',        stock: 15,  unidad: 'kg',    minimo: 5,  proveedor: 'TechAgro',  ultimo: '15/08/2026', costo: 450 },
  { id: 'I-004', nombre: 'Manguera riego 1"',          stock: 200, unidad: 'm',     minimo: 50, proveedor: 'AgroInfra', ultimo: '20/09/2026', costo: 85 },
  { id: 'I-005', nombre: 'Herbicida glifosato',        stock: 120, unidad: 'L',     minimo: 50, proveedor: 'AgroNorte SA',ultimo: '05/09/2026', costo: 2300 },
  { id: 'I-006', nombre: 'Comedero metálico 200L',     stock: 6,   unidad: 'pzas',  minimo: 2,  proveedor: 'AgroInfra', ultimo: '10/08/2026', costo: 18500 },
]

const CATEGORIAS_CONFIG = {
  sanidad:        { title: 'Sanidad', icon: '✚', color: '#b84040', bg: '#fef2f2', items: SANIDAD_ITEMS },
  medicamentos:   { title: 'Medicamentos', icon: '💊', color: '#6020c0', bg: '#f5eeff', items: MEDICAMENTOS_ITEMS },
  alimento:       { title: 'Alimento', icon: '🌾', color: '#b87333', bg: '#fff8ec', items: ALIMENTO_ITEMS },
  infraestructura:{ title: 'Infraestructura', icon: '🔧', color: '#2040a0', bg: '#e8f0ff', items: INFRAESTRUCTURA_ITEMS },
}

export function getItemStatus(stock, minimo) {
  const r = stock / minimo
  if (r < 0.5) return { label: 'Crítico', bg: '#fef2f2', text: '#b84040', bar: '#b84040' }
  if (r < 1)   return { label: 'Bajo',    bg: '#fffbeb', text: '#c9882a', bar: '#c9882a' }
  return { label: 'OK', bg: '#f0fdf4', text: '#3a7d44', bar: '#3a7d44' }
}

export const inventoryService = {
  async getCategorias() {
    await delay(120)
    return JSON.parse(JSON.stringify(CATEGORIAS_CONFIG))
  },

  async getAllItems() {
    await delay(150)
    return [
      ...SANIDAD_ITEMS,
      ...MEDICAMENTOS_ITEMS,
      ...ALIMENTO_ITEMS,
      ...INFRAESTRUCTURA_ITEMS,
    ]
  },

  async getInventarioCritico() {
    await delay(100)
    const all = await this.getAllItems()
    return all.filter((i) => i.stock < i.minimo)
  },

  async registrarEntrada(catKey, id, cantidad) {
    await delay(200)
    const cat = CATEGORIAS_CONFIG[catKey]
    if (cat) {
      const item = cat.items.find(i => i.id === id)
      if (item) {
        item.stock += Number(cantidad)
        item.ultimo = new Date().toLocaleDateString('es-MX')
        return item
      }
    }
    return null
  }
}
