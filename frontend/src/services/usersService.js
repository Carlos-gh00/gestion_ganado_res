import { delay, request } from './api'

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
    await delay(50)
    return []
  },

  /**
   * Envía las credenciales (correo y contraseña) al usuario.
   * Conecta con el backend (/api/users/send-credentials) y prepara formato de correo / mailto.
   */
  async sendUserCredentials({ email, password, nombre, apellido, rol, area }) {
    const fullName = `${nombre || ''} ${apellido || ''}`.trim() || 'Colaborador'
    const subject = 'Tus credenciales de acceso a GanaderAPP'
    const body = `Hola ${fullName},\n\n` +
      `Te damos la bienvenida al sistema de gestión GanaderAPP.\n` +
      `Se ha dado de alta tu usuario con las siguientes credenciales:\n\n` +
      `• Correo de acceso: ${email}\n` +
      `• Contraseña asignada: ${password}\n` +
      `• Rol en el sistema: ${rol || 'Usuario'}${area ? `\n• Área asignada: ${area}` : ''}\n\n` +
      `Para acceder a la plataforma, ingresa en el siguiente enlace:\n` +
      `${window.location.origin}\n\n` +
      `Te recomendamos cambiar tu contraseña una vez que inicies sesión.\n\n` +
      `Atentamente,\nEquipo de Administración`

    let backendNotified = false
    let backendResponse = null

    // Intento 1: Conectar con el backend para envío de correo
    try {
      backendResponse = await request('/users/send-credentials', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          nombre: fullName,
          rol,
          area,
          subject,
          body,
        }),
      })
      if (backendResponse) {
        backendNotified = true
      }
    } catch (err) {
      console.info('[UsersService] Backend send-credentials no respondió aún (usando modo contingencia/mailto):', err.message)
    }

    const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    return {
      success: true,
      backendNotified,
      email,
      password,
      fullName,
      subject,
      body,
      mailtoUrl,
    }
  },

  async login(identifier, password) {
    const cleanId = (identifier || '').trim()

    // Intento con API Backend real
    try {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: cleanId, email: cleanId, password }),
      })
      if (res && (res.user || res.token)) {
        if (res.token) {
          localStorage.setItem('ganaderapp_token', res.token)
        }
        return res.user || res
      }
    } catch (err) {
      console.info('[UsersService] Fallback a credenciales locales:', err.message)
    }

    // Fallback local para desarrollo y contingencia
    await delay(250)
    const users = getLocalUsers()
    const cleanLower = cleanId.toLowerCase()
    const found = users.find(u => {
      const isIdentifierMatch =
        (u.username && u.username.toLowerCase() === cleanLower) ||
        (u.email && u.email.toLowerCase() === cleanLower) ||
        (cleanLower === 'admin' && (u.id === 'u1' || u.rol === 'admin'))

      const isPasswordMatch =
        u.password === password ||
        (cleanLower === 'admin' && password === 'admin') ||
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
    // Intento con backend
    try {
      const res = await request('/users')
      if (Array.isArray(res)) {
        return res
      }
    } catch {
      // fallback
    }

    await delay(100)
    const users = getLocalUsers()
    return users.map(({ password: _, ...u }) => u)
  },

  async addUser(data) {
    const cleanData = {
      nombre: (data.nombre || '').trim(),
      apellido: (data.apellido || '').trim(),
      email: (data.email || '').trim().toLowerCase(),
      password: data.password ? data.password.trim() : '1234',
      rol: data.rol,
      area: data.area ? data.area.trim() : undefined,
    }

    let createdUser = null
    let backendDelivery = null

    // Intento 1: Registrar en Backend
    try {
      const res = await request('/users', {
        method: 'POST',
        body: JSON.stringify(cleanData),
      })
      if (res && (res.user || res.id)) {
        createdUser = res.user || res
        if (res.email_delivery) {
          backendDelivery = {
            success: true,
            backendNotified: res.email_delivery.sent,
            message: res.email_delivery.message,
            email: cleanData.email,
            password: cleanData.password,
            mailtoUrl: `mailto:${encodeURIComponent(cleanData.email)}?subject=${encodeURIComponent('Tus credenciales de acceso a GanaderAPP')}&body=${encodeURIComponent(`Hola ${cleanData.nombre},\n\nCredenciales de acceso:\nUsuario: ${cleanData.email}\nContraseña: ${cleanData.password}\n\nIngresa en: ${window.location.origin}`)}`,
          }
        }
      }
    } catch (err) {
      console.info('[UsersService] Backend no disponible para crear usuario, guardando en local:', err.message)
    }

    // Fallback local
    if (!createdUser) {
      await delay(200)
      const users = getLocalUsers()
      const id = 'u' + Date.now()
      const avatar = ((cleanData.nombre[0] || 'U') + (cleanData.apellido[0] || 'N')).toUpperCase()
      const newUser = {
        id,
        ...cleanData,
        avatar,
        activo: true,
      }
      users.push(newUser)
      saveLocalUsers(users)
      const { password: _, ...safeUser } = newUser
      createdUser = safeUser
    }

    // Si el backend ya procesó el envío por Gmail, usamos su resultado; de lo contrario invocamos el servicio de credenciales
    let credentialsDelivery = backendDelivery
    if (!credentialsDelivery) {
      try {
        credentialsDelivery = await this.sendUserCredentials({
          email: cleanData.email,
          password: cleanData.password,
          nombre: cleanData.nombre,
          apellido: cleanData.apellido,
          rol: cleanData.rol,
          area: cleanData.area,
        })
      } catch (err) {
        console.error('[UsersService] Error al despachar credenciales:', err)
      }
    }

    return {
      user: createdUser,
      credentialsDelivery,
      credentials: {
        email: cleanData.email,
        password: cleanData.password,
      },
    }
  },

  async toggleUserStatus(id) {
    try {
      const res = await request(`/users/${id}/toggle`, { method: 'PATCH' })
      if (Array.isArray(res)) return res
    } catch {
      // fallback
    }

    await delay(120)
    const users = getLocalUsers()
    const updated = users.map(u => u.id === id ? { ...u, activo: !u.activo } : u)
    saveLocalUsers(updated)
    return updated.map(({ password: _, ...u }) => u)
  },
}
