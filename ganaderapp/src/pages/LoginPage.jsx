import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { usersService } from '../services/usersService'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoAccounts, setDemoAccounts] = useState([])

  useEffect(() => {
    usersService.getDemoAccounts().then(setDemoAccounts)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const ok = await login(email, password)
      if (!ok) {
        setError('Correo o contraseña incorrectos')
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f7f2ea' }}>
      {/* Left panel (brand presentation) */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ backgroundColor: '#1c2b1a' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl select-none"
            style={{ backgroundColor: '#b87333' }}
          >
            🐄
          </div>
          <div>
            <div className="font-display text-white text-xl">GanaderAPP</div>
            <div className="text-xs" style={{ color: '#7aa870' }}>Sistema Administrativo</div>
          </div>
        </div>

        <div>
          <h2 className="font-display text-5xl text-white leading-tight mb-5">
            Gestión inteligente<br />para tu estancia
          </h2>
          <p className="text-base leading-relaxed" style={{ color: '#8fb88a' }}>
            Control total de animales, inventario, sanidad y producción desde un solo lugar. Diseñado para el campo.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { v: '1,284', l: 'Animales registrados' },
              { v: '7', l: 'Potreros activos' },
              { v: '$20.2M', l: 'Ingresos 2026' },
            ].map((stat) => (
              <div key={stat.l}>
                <div className="font-display text-3xl text-white">{stat.v}</div>
                <div className="text-xs mt-0.5" style={{ color: '#7aa870' }}>{stat.l}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: '#4a6e45' }}>Estancia El Ceibo · Temporada 2026</p>
      </div>

      {/* Right panel (form) */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ backgroundColor: '#1c2b1a' }}
            >
              🐄
            </div>
            <span className="font-display text-2xl" style={{ color: '#1c2110' }}>GanaderAPP</span>
          </div>

          <h1 className="font-display text-3xl mb-1" style={{ color: '#1c2110' }}>Iniciar sesión</h1>
          <p className="text-sm mb-8" style={{ color: '#9a8f82' }}>Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ceibo.com"
                required
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                style={{ borderColor: '#e2d9cc', backgroundColor: '#fff', color: '#1c2110' }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                style={{ borderColor: '#e2d9cc', backgroundColor: '#fff', color: '#1c2110' }}
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: '#fef2f2', color: '#b84040' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-opacity cursor-pointer"
              style={{ backgroundColor: '#1c2b1a', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Verificando…' : 'Entrar al sistema'}
            </button>
          </form>

          {/* Demo shortcuts */}
          {demoAccounts.length > 0 && (
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9a8f82' }}>
                Acceso de demostración (contraseña: 1234)
              </p>
              <div className="space-y-2">
                {demoAccounts.map((a) => (
                  <button
                    key={a.email}
                    type="button"
                    onClick={() => {
                      setEmail(a.email)
                      setPassword('1234')
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-all hover:border-[#2e4829] cursor-pointer text-left"
                    style={{ borderColor: '#e2d9cc', backgroundColor: '#fff', color: '#1c2110' }}
                  >
                    <span className="font-medium">{a.label}</span>
                    <span className="text-xs" style={{ color: '#9a8f82' }}>{a.email}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
