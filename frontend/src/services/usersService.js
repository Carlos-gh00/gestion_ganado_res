import { request } from './api'

export const usersService = {
  async getDemoAccounts() {
    return []
  },

  /**
   * Envía las credenciales (correo y contraseña) al usuario conectando con el backend.
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
        backendNotified = Boolean(backendResponse.success || backendResponse.sent)
      }
    } catch (err) {
      console.info('[UsersService] Backend send-credentials no respondió aún:', err.message)
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

  /**
   * Inicia sesión con la base de datos del backend.
   */
  async login(identifier, password) {
    const cleanId = (identifier || '').trim()

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
      console.error('[UsersService] Error de autenticación:', err.message)
      throw err
    }

    return null
  },

  /**
   * Obtiene la lista de usuarios reales de la base de datos.
   */
  async getUsers() {
    try {
      const res = await request('/users')
      if (Array.isArray(res)) return res
      return []
    } catch (err) {
      console.warn('[UsersService] Error al obtener usuarios de la BD:', err.message)
      return []
    }
  },

  /**
   * Da de alta un usuario en la base de datos real y despacha las credenciales por Gmail.
   */
  async addUser(data) {
    const cleanData = {
      nombre: (data.nombre || '').trim(),
      apellido: (data.apellido || '').trim(),
      email: (data.email || '').trim().toLowerCase(),
      password: data.password ? data.password.trim() : '1234',
      rol: data.rol,
      area: data.area ? data.area.trim() : undefined,
    }

    const res = await request('/users', {
      method: 'POST',
      body: JSON.stringify(cleanData),
    })

    const createdUser = res.user || res

    let credentialsDelivery = null
    const mailSubject = 'Tus credenciales de acceso a GanaderAPP'
    const mailBody = `Hola ${cleanData.nombre},\n\nCredenciales de acceso:\nUsuario: ${cleanData.email}\nContraseña: ${cleanData.password}\n\nIngresa en: ${window.location.origin}`
    const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(cleanData.email)}&su=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`
    const mailtoUrl = `mailto:${encodeURIComponent(cleanData.email)}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`

    if (res.email_delivery) {
      credentialsDelivery = {
        success: true,
        backendNotified: res.email_delivery.sent,
        message: res.email_delivery.message,
        email: cleanData.email,
        password: cleanData.password,
        gmailWebUrl,
        mailtoUrl,
      }
    } else {
      try {
        credentialsDelivery = await this.sendUserCredentials(cleanData)
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

  /**
   * Activa o desactiva un usuario en la base de datos real.
   */
  async toggleUserStatus(id) {
    try {
      const res = await request(`/users/${id}/toggle`, { method: 'PATCH' })
      if (res && res.id) {
        return await this.getUsers()
      }
      return []
    } catch (err) {
      console.error('[UsersService] Error al cambiar estado de usuario:', err)
      throw err
    }
  },

  /**
   * Elimina un usuario de la base de datos (solo admin).
   */
  async deleteUser(id) {
    try {
      const res = await request(`/users/${id}`, { method: 'DELETE' })
      if (res && res.success) {
        return await this.getUsers()
      }
      return await this.getUsers()
    } catch (err) {
      console.error('[UsersService] Error al eliminar usuario:', err)
      throw err
    }
  },
}
