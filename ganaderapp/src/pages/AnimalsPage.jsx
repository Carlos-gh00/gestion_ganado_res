import { useState, useEffect, useMemo } from 'react'
import { animalsService } from '../services/animalsService'
import Modal from '../components/ui/Modal'

const estadoColors = {
  Engorde:     { bg: '#eef6ee', text: '#2e6620' },
  Cría:        { bg: '#fef9ec', text: '#7a5200' },
  Venta:       { bg: '#f0f4ff', text: '#2040a0' },
  Tratamiento: { bg: '#fef2f2', text: '#b84040' },
  Adaptación:  { bg: '#f5eeff', text: '#6020b0' },
  Cuarentena:  { bg: '#fff0e8', text: '#a04020' },
  Integrado:   { bg: '#eef6ee', text: '#2e6620' },
}

const acostaderoEstado = {
  Normal:       { border: '#e2d9cc', badge: '#f0fdf4', badgeText: '#3a7d44' },
  Lleno:        { border: '#fde68a', badge: '#fffbeb', badgeText: '#c9882a' },
  Sobrecargado: { border: '#fecaca', badge: '#fef2f2', badgeText: '#b84040' },
  Disponible:   { border: '#e2d9cc', badge: '#f5f5f5', badgeText: '#9a8f82' },
}

export default function AnimalsPage() {
  const [tab, setTab] = useState('acostaderos') // 'acostaderos' | 'recientes' | 'todos'
  const [expandedAcostadero, setExpandedAcostadero] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [acostaderos, setAcostaderos] = useState([])
  const [recientes, setRecientes] = useState([])
  const [todosAnimales, setTodosAnimales] = useState([])

  // Modal registration
  const [showModal, setShowModal] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [regSuccess, setRegSuccess] = useState(false)
  const [newAnimal, setNewAnimal] = useState({
    raza: 'Hereford',
    sexo: 'M',
    peso: 350,
    estado: 'Adaptación',
    acostaderoId: 'A',
  })

  async function loadData() {
    const [acRes, recRes, allRes] = await Promise.all([
      animalsService.getAcostaderos(),
      animalsService.getAnimalesRecientes(),
      animalsService.getAllAnimales(),
    ])
    setAcostaderos(acRes)
    setRecientes(recRes)
    setTodosAnimales(allRes)
  }

  useEffect(() => {
    loadData()
  }, [])

  function toggleAcostadero(id) {
    setExpandedAcostadero((prev) => (prev === id ? null : id))
  }

  const filteredTodos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return todosAnimales
    return todosAnimales.filter(
      (a) =>
        a.id.toLowerCase().includes(q) ||
        a.raza.toLowerCase().includes(q) ||
        a.acostaderoNombre?.toLowerCase().includes(q) ||
        a.estado.toLowerCase().includes(q)
    )
  }, [todosAnimales, searchQuery])

  async function handleRegisterAnimal(e) {
    e.preventDefault()
    setRegistering(true)
    try {
      await animalsService.registerAnimal(newAnimal)
      setRegSuccess(true)
      await loadData()
      setTimeout(() => {
        setRegSuccess(false)
        setShowModal(false)
        setNewAnimal({ raza: 'Hereford', sexo: 'M', peso: 350, estado: 'Adaptación', acostaderoId: 'A' })
      }, 1200)
    } finally {
      setRegistering(false)
    }
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-7">
        <div>
          <h1 className="font-display text-3xl md:text-4xl" style={{ color: '#1c2110' }}>Animales</h1>
          <p className="text-sm mt-1" style={{ color: '#9a8f82' }}>
            1,284 registros · {acostaderos.length} acostaderos activos
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#2e4829' }}
        >
          + Registrar animal
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ backgroundColor: '#f0ebe2' }}>
        {[
          { id: 'acostaderos', label: 'Por Acostadero' },
          { id: 'recientes', label: 'Recién Llegados' },
          { id: 'todos', label: 'Todos' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
            style={{
              backgroundColor: tab === t.id ? '#fff' : 'transparent',
              color: tab === t.id ? '#1c2110' : '#9a8f82',
              boxShadow: tab === t.id ? '0 1px 3px rgba(0,0,0,0.08)' : undefined,
            }}
          >
            {t.label}
            {t.id === 'recientes' && recientes.length > 0 && (
              <span
                className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: '#b87333', color: '#fff' }}
              >
                {recientes.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Por Acostadero */}
      {tab === 'acostaderos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {acostaderos.map((ac) => {
            const pct = Math.min((ac.total / ac.capacidad) * 100, 100)
            const st = acostaderoEstado[ac.estado] || { border: '#e2d9cc', badge: '#f5f5f5', badgeText: '#9a8f82' }
            const isOpen = expandedAcostadero === ac.id

            return (
              <div
                key={ac.id}
                className="bg-white rounded-2xl border overflow-hidden transition-shadow hover:shadow-md cursor-pointer"
                style={{ borderColor: st.border }}
                onClick={() => toggleAcostadero(ac.id)}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-display text-xl" style={{ color: '#1c2110' }}>{ac.nombre}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ backgroundColor: st.badge, color: st.badgeText }}
                        >
                          {ac.estado}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-3xl" style={{ color: '#1c2110' }}>{ac.total}</div>
                      <div className="text-xs" style={{ color: '#9a8f82' }}>de {ac.capacidad}</div>
                    </div>
                  </div>

                  <div className="h-2 rounded-full mb-1" style={{ backgroundColor: '#f0ebe2' }}>
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: ac.estado === 'Sobrecargado' ? '#b84040' : ac.estado === 'Lleno' ? '#c9882a' : '#3a7d44',
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1" style={{ color: '#9a8f82' }}>
                    <span>{((ac.total / ac.capacidad) * 100).toFixed(0)}% ocupado</span>
                    <span>{isOpen ? '▲ Ocultar' : '▼ Ver animales'}</span>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ borderTop: '1px solid #f0ebe2' }} onClick={(e) => e.stopPropagation()}>
                    <div
                      className="px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#9a8f82', backgroundColor: '#faf6ef' }}
                    >
                      Muestra ({ac.animales.length} de {ac.total})
                    </div>
                    {ac.animales.map((a) => {
                      const ec = estadoColors[a.estado] || { bg: '#f5f5f5', text: '#555' }
                      return (
                        <div
                          key={a.id}
                          className="flex items-center px-5 py-2.5 gap-3 border-b"
                          style={{ borderColor: '#f0ebe2' }}
                        >
                          <span className="font-mono text-xs font-semibold" style={{ color: '#2e4829' }}>{a.id}</span>
                          <span className="flex-1 text-sm" style={{ color: '#1c2110' }}>
                            {a.raza} · {a.sexo === 'M' ? 'Macho' : 'Hembra'}
                          </span>
                          <span className="font-mono text-xs" style={{ color: '#9a8f82' }}>{a.peso} kg</span>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ backgroundColor: ec.bg, color: ec.text }}
                          >
                            {a.estado}
                          </span>
                        </div>
                      )
                    })}
                    <div className="px-5 py-3">
                      <button
                        onClick={() => setTab('todos')}
                        className="text-xs font-semibold cursor-pointer"
                        style={{ color: '#2e4829' }}
                      >
                        Ver todos los {ac.total} animales →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Tab 2: Recién llegados */}
      {tab === 'recientes' && (
        <div>
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-xl mb-4 text-sm"
            style={{ backgroundColor: '#fff8ec', border: '1px solid #fde68a' }}
          >
            <span>🕐</span>
            <span style={{ color: '#7a5200' }}>
              <strong>{recientes.length} animales</strong> ingresados en los últimos 7 días — requieren seguimiento de adaptación
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {recientes.map((a) => {
              const ec = estadoColors[a.estado] || { bg: '#f5f5f5', text: '#555' }
              return (
                <div key={a.id} className="bg-white rounded-2xl border p-5" style={{ borderColor: '#e2d9cc' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-mono text-sm font-bold" style={{ color: '#2e4829' }}>{a.id}</div>
                      <div className="text-base font-medium mt-0.5" style={{ color: '#1c2110' }}>
                        {a.raza} · {a.sexo === 'M' ? 'Macho' : 'Hembra'}
                      </div>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: ec.bg, color: ec.text }}
                    >
                      {a.estado}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    {[
                      ['Peso ingreso', `${a.peso} kg`],
                      ['Origen', a.origen],
                      ['Acostadero', `Acostadero ${a.acostadero}`],
                      ['Fecha ingreso', a.fecha],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span style={{ color: '#9a8f82' }}>{k}</span>
                        <span className="font-medium" style={{ color: '#1c2110' }}>{v}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      className="flex-1 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer"
                      style={{ backgroundColor: '#2e4829' }}
                    >
                      Registrar control
                    </button>
                    <button
                      className="flex-1 py-2 rounded-xl text-xs font-medium border cursor-pointer hover:bg-black/5"
                      style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
                    >
                      Ver ficha
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Todos los animales */}
      {tab === 'todos' && (
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#e2d9cc' }}>
          <div
            className="px-5 py-4 border-b flex items-center gap-3"
            style={{ borderColor: '#f0ebe2', backgroundColor: '#faf6ef' }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por ID, raza, acostadero…"
              className="flex-1 px-4 py-2 rounded-xl border text-sm outline-none"
              style={{ borderColor: '#e2d9cc', backgroundColor: '#fff', color: '#1c2110' }}
            />
            <span className="text-xs font-mono" style={{ color: '#9a8f82' }}>
              {filteredTodos.length} encontrados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead style={{ backgroundColor: '#faf6ef' }}>
                <tr style={{ borderBottom: '1px solid #e2d9cc' }}>
                  {['ID', 'Raza', 'Sexo', 'Acostadero', 'Peso', 'Estado'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs uppercase tracking-wider font-semibold"
                      style={{ color: '#9a8f82' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTodos.map((a) => {
                  const ec = estadoColors[a.estado] || { bg: '#f5f5f5', text: '#555' }
                  return (
                    <tr
                      key={a.id}
                      className="border-b hover:bg-[#faf8f4] transition-colors"
                      style={{ borderColor: '#f0ebe2' }}
                    >
                      <td className="px-5 py-3 font-mono text-xs font-semibold" style={{ color: '#2e4829' }}>{a.id}</td>
                      <td className="px-5 py-3" style={{ color: '#1c2110' }}>{a.raza}</td>
                      <td className="px-5 py-3" style={{ color: '#9a8f82' }}>{a.sexo === 'M' ? 'Macho' : 'Hembra'}</td>
                      <td className="px-5 py-3" style={{ color: '#9a8f82' }}>{a.acostaderoNombre}</td>
                      <td className="px-5 py-3 font-mono text-xs" style={{ color: '#1c2110' }}>{a.peso} kg</td>
                      <td className="px-5 py-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: ec.bg, color: ec.text }}
                        >
                          {a.estado}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      <Modal show={showModal} title="Registrar nuevo animal" onClose={() => setShowModal(false)}>
        {regSuccess ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">✓</div>
            <p className="font-display text-lg" style={{ color: '#3a7d44' }}>Animal registrado correctamente</p>
          </div>
        ) : (
          <form onSubmit={handleRegisterAnimal} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                Raza
              </label>
              <select
                value={newAnimal.raza}
                onChange={(e) => setNewAnimal({ ...newAnimal, raza: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
              >
                <option value="Hereford">Hereford</option>
                <option value="Angus">Angus</option>
                <option value="Brangus">Brangus</option>
                <option value="Shorthorn">Shorthorn</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                  Sexo
                </label>
                <select
                  value={newAnimal.sexo}
                  onChange={(e) => setNewAnimal({ ...newAnimal, sexo: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
                >
                  <option value="M">Macho</option>
                  <option value="H">Hembra</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                  Peso (kg)
                </label>
                <input
                  type="number"
                  value={newAnimal.peso}
                  onChange={(e) => setNewAnimal({ ...newAnimal, peso: e.target.value })}
                  min="50"
                  max="900"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                Acostadero destino
              </label>
              <select
                value={newAnimal.acostaderoId}
                onChange={(e) => setNewAnimal({ ...newAnimal, acostaderoId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
              >
                {acostaderos.map((ac) => (
                  <option key={ac.id} value={ac.id}>
                    {ac.nombre} ({ac.total}/{ac.capacidad})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                Estado
              </label>
              <select
                value={newAnimal.estado}
                onChange={(e) => setNewAnimal({ ...newAnimal, estado: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
              >
                <option value="Adaptación">Adaptación</option>
                <option value="Engorde">Engorde</option>
                <option value="Cría">Cría</option>
                <option value="Cuarentena">Cuarentena</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={registering}
              className="w-full py-3 rounded-xl text-sm font-bold text-white cursor-pointer transition-opacity"
              style={{ backgroundColor: '#2e4829', opacity: registering ? 0.7 : 1 }}
            >
              {registering ? 'Guardando…' : 'Guardar animal'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  )
}
