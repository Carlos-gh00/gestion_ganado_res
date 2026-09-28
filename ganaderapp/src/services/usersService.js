import { delay } from './api'

// Initial users data stored here in the service layer, keeping components 100% clean
const STORAGE_KEY = 'ganaderapp_users_db'

const DEFAULT_USERS = [
  { id: 'u1', nombre: 'Admin', apellido: 'Sistema', email: 'admin@ceibo.com', password: '1234', rol: 'admin', avatar: 'AS', activo: true },
  { id: 'u2', nombre: 'Carlos', apellido: 'Mendoza', email: 'carlos@ceibo.com', password: '1234', rol: 'encargado_general', avatar: 'CM', activo: true },
  { id: 'u3', nombre: 'Roberto', apellido: 'Fierro', email: 'roberto@ceibo.com', password: '1234', rol: 'encargado_rancho', avatar: 'RF', activo: true },
  { id: 'u4', nombre: 'Ana', apellido: 'Torres', email: 'ana@ceibo.com', password: '1234', rol: 'encargado_area', area: 'Potrero A', avatar: 'AT', activo: true },
]

function getLocalUsers() {
  const data = localStorage.getItem(STORAGE_KEY)
  if (data) {
    try {
      return JSON.parse(data)
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS))
  return [...DEFAULT_USERS]
}

function saveLocalUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

export const usersService = {
  async getDemoAccounts() {
    await delay(100)
    return [
      { email: 'admin@ceibo.com', label: 'Administrador' },
      { email: 'carlos@ceibo.com', label: 'Encargado General' },
      { email: 'roberto@ceibo.com', label: 'Encargado de Rancho' },
      { email: 'ana@ceibo.com', label: 'Encargado de Área' },
    ]
  },

  async login(email, password) {
    await delay(350)
    const users = getLocalUsers()
    const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password && u.activo)
    if (found) {
      const { password: _, ...safeUser } = found
      return safeUser
    }
    return null
  },

  async getUsers() {
    await delay(150)
    const users = getLocalUsers()
    return users.map(({ password: _, ...u }) => u)
  },

  async addUser(data) {
    await delay(250)
    const users = getLocalUsers()
    const id = 'u' + Date.now()
    const avatar = ((data.nombre?.[0] || 'U') + (data.apellido?.[0] || 'N')).toUpperCase()
    const newUser = {
      id,
      nombre: data.nombre.trim(),
      apellido: data.apellido.trim(),
      email: data.email.trim(),
      password: data.password || '1234',
      rol: data.rol,
      area: data.area || undefined,
      avatar,
      activo: true,
    }
    users.push(newUser)
    saveLocalUsers(users)
    const { password: _, ...safeUser } = newUser
    return safeUser
  },

  async toggleUserStatus(id) {
    await delay(150)
    const users = getLocalUsers()
    const updated = users.map(u => u.id === id ? { ...u, activo: !u.activo } : u)
    saveLocalUsers(updated)
    return updated.map(({ password: _, ...u }) => u)
  },
}
