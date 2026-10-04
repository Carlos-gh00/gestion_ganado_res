import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const ok = await login(username, password)
      if (!ok) {
        setError('Usuario o contraseña incorrectos')
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
          <div className="mt-10 space-y-3 max-w-md">
            {[
              { icon: '🏷️', title: 'Trazabilidad y Pesaje', desc: 'Registro individual de animales y evolución de peso' },
              { icon: '🌾', title: 'Manejo de Potreros', desc: 'Capacidad de carga, rotación y disponibilidad de pasto' },
              { icon: '💉', title: 'Sanidad y Tratamientos', desc: 'Monitoreo clínico, vacunación y control de insumos' },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-3.5 p-3 rounded-xl bg-[#253922]/70 border border-[#2e4829]">
                <span className="text-lg shrink-0">{f.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-white">{f.title}</div>
                  <div className="text-xs" style={{ color: '#8fb88a' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: '#4a6e45' }}>Sistema Administrativo Ganadero · Acceso Seguro</p>
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
                Usuario o Correo
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario o correo"
                autoComplete="username"
                required
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:border-[#2e4829] focus:ring-1 focus:ring-[#2e4829]"
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
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:border-[#2e4829] focus:ring-1 focus:ring-[#2e4829]"
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
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-opacity cursor-pointer hover:opacity-90 mt-2"
              style={{ backgroundColor: '#1c2b1a', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Verificando…' : 'Entrar al sistema'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

