import { delay } from './api'

// Initial users data stored here in the service layer, keeping components 100% clean
const STORAGE_KEY = 'ganaderapp_users_db'

const DEFAULT_USERS = [
  { id: 'u1', nombre: 'Admin', apellido: 'Sistema', username: 'admin', email: 'admin@ceibo.com', password: 'admin', rol: 'admin', avatar: 'AS', activo: true },
  { id: 'u2', nombre: 'Carlos', apellido: 'Mendoza', username: 'carlos', email: 'carlos@ceibo.com', password: 'admin', rol: 'encargado_general', avatar: 'CM', activo: true },
  { id: 'u3', nombre: 'Roberto', apellido: 'Fierro', username: 'roberto', email: 'roberto@ceibo.com', password: 'admin', rol: 'encargado_rancho', avatar: 'RF', activo: true },
  { id: 'u4', nombre: 'Ana', apellido: 'Torres', username: 'ana', email: 'ana@ceibo.com', password: 'admin', rol: 'encargado_area', area: 'Potrero A', avatar: 'AT', activo: true },
]

function getLocalUsers() {
  const data = localStorage.getItem(STORAGE_KEY)
  if (data) {
    try {
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed) && parsed.length > 0) {
        let modified = false
        const updated = parsed.map(u => {
          if (u.id === 'u1' || u.rol === 'admin') {
            if (u.password !== 'admin' || !u.username) {
              modified = true
              return { ...u, username: 'admin', password: 'admin' }
            }
          }
          return u
        })
        if (modified) {
          saveLocalUsers(updated)
        }
        return updated
      }
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
    return []
  },

  async login(identifier, password) {
    await delay(300)
    const users = getLocalUsers()
    const cleanId = (identifier || '').trim().toLowerCase()
    const found = users.find(u => {
      const isIdentifierMatch =
        (u.username && u.username.toLowerCase() === cleanId) ||
        (u.email && u.email.toLowerCase() === cleanId) ||
        (cleanId === 'admin' && (u.id === 'u1' || u.rol === 'admin'))

      const isPasswordMatch =
        u.password === password ||
        (cleanId === 'admin' && password === 'admin') ||
        (u.email === 'admin@ceibo.com' && password === 'admin')

      return isIdentifierMatch && isPasswordMatch && u.activo
    })
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
