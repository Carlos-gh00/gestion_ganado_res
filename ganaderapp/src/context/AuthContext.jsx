import { createContext, useContext, useState, useEffect } from 'react'
import { usersService } from '../services/usersService'
import { ROL_LABELS, ROL_COLORS, ROL_PERMISOS } from '../utils/constants'

const CURRENT_USER_KEY = 'ganaderapp_current_user'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(CURRENT_USER_KEY)
    if (saved) {
      try { return JSON.parse(saved) } catch { localStorage.removeItem(CURRENT_USER_KEY) }
    }
    return null
  })

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  async function loadUsers() {
    try {
      const list = await usersService.getUsers()
      setUsers(list)
    } catch (err) {
      console.error('Error loading users:', err)
    }
  }

  useEffect(() => {
    if (user) {
      loadUsers()
    }
  }, [user])

  async function login(email, password) {
    setLoading(true)
    try {
      const loggedUser = await usersService.login(email, password)
      if (loggedUser) {
        setUser(loggedUser)
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(loggedUser))
        await loadUsers()
        return true
      }
      return false
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    setUser(null)
    localStorage.removeItem(CURRENT_USER_KEY)
  }

  async function addUser(userData) {
    setLoading(true)
    try {
      const result = await usersService.addUser(userData)
      await loadUsers()
      return result
    } finally {
      setLoading(false)
    }
  }

  async function sendCredentials(userData) {
    return await usersService.sendUserCredentials(userData)
  }

  async function toggleUser(id) {
    setLoading(true)
    try {
      const updated = await usersService.toggleUserStatus(id)
      setUsers(updated)
      if (user && user.id === id) {
        const found = updated.find(u => u.id === id)
        if (found) {
          const updatedCurrentUser = { ...user, activo: found.activo }
          setUser(updatedCurrentUser)
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedCurrentUser))
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        loading,
        login,
        logout,
        addUser,
        sendCredentials,
        toggleUser,
        loadUsers,
        ROL_LABELS,
        ROL_COLORS,
        ROL_PERMISOS,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
