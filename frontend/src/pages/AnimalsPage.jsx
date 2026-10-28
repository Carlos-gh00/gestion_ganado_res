import { useState, useEffect, useMemo } from 'react'
import { animalsService } from '../services/animalsService'
import { usersService } from '../services/usersService'
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

const tipoBadges = {
  Acostadero: { bg: '#e8f0fe', text: '#1967d2', icon: '🏕️' },
  Corral:     { bg: '#fef3c7', text: '#92400e', icon: '🪵' },
  Rancho:     { bg: '#eef6ee', text: '#2e6620', icon: '🏡' },
}

export default function AnimalsPage() {
  const [tab, setTab] = useState('acostaderos') // 'acostaderos' | 'recientes' | 'todos'
  const [tipoFiltro, setTipoFiltro] = useState('todos') // 'todos' | 'Acostadero' | 'Corral' | 'Rancho'
  const [expandedAcostadero, setExpandedAcostadero] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [acostaderos, setAcostaderos] = useState([])
  const [recientes, setRecientes] = useState([])
  const [todosAnimales, setTodosAnimales] = useState([])
  const [usuarios, setUsuarios] = useState([])

  // Modal registrar animal
  const [showModal, setShowModal] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [regSuccess, setRegSuccess] = useState(false)
  const [newAnimal, setNewAnimal] = useState({
    raza: 'Hereford',
    sexo: 'M',
    peso: 350,
    estado: 'Adaptación',
    acostaderoId: '',
  })

  // Modal crear Acostadero / Corral / Rancho
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [locationSaving, setLocationSaving] = useState(false)
  const [locationSuccess, setLocationSuccess] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [locationData, setLocationData] = useState({
    id: '',
    nombre: '',
    capacidad: 50,
    tipo: 'Acostadero',
    usuario_id: '',
    estado: 'Normal',
  })

  async function loadData() {
    const [acRes, recRes, allRes, usrRes] = await Promise.all([
      animalsService.getAcostaderos(),
      animalsService.getAnimalesRecientes(),
      animalsService.getAllAnimales(),
      usersService.getUsers(),
    ])
    setAcostaderos(acRes)
    setRecientes(recRes)
    setTodosAnimales(allRes)
    setUsuarios(usrRes)
    if (acRes.length > 0 && !newAnimal.acostaderoId) {
      setNewAnimal((prev) => ({ ...prev, acostaderoId: acRes[0].id }))
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function toggleAcostadero(id) {
    setExpandedAcostadero((prev) => (prev === id ? null : id))
  }

  const acostaderosFiltrados = useMemo(() => {
    if (tipoFiltro === 'todos') return acostaderos
    return acostaderos.filter((a) => (a.tipo || 'Acostadero') === tipoFiltro)
  }, [acostaderos, tipoFiltro])

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
        setNewAnimal({ raza: 'Hereford', sexo: 'M', peso: 350, estado: 'Adaptación', acostaderoId: acostaderos[0]?.id || '' })
      }, 1200)
    } finally {
      setRegistering(false)
    }
  }

  async function handleSaveLocation(e) {
    e.preventDefault()
    setLocationSaving(true)
    setLocationError('')
    try {
      const payload = {
        ...locationData,
        capacidad: Number(locationData.capacidad) || 0,
        usuario_id: locationData.usuario_id ? Number(locationData.usuario_id) : null,
      }
      await animalsService.createAcostadero(payload)
      setLocationSuccess(true)
      await loadData()
      setTimeout(() => {
        setLocationSuccess(false)
        setShowLocationModal(false)
        setLocationData({
          id: '',
          nombre: '',
          capacidad: 50,
          tipo: 'Acostadero',
          usuario_id: '',
          estado: 'Normal',
        })
      }, 1200)
    } catch (err) {
      setLocationError(err.message || 'Error al guardar la ubicación')
    } finally {
      setLocationSaving(false)
    }
  }

  async function handleDeleteLocation(ac, e) {
    if (e) e.stopPropagation()
    const tipo = ac.tipo || 'Acostadero'
    if (ac.total > 0) {
      alert(`No se puede eliminar el ${tipo} "${ac.nombre}" porque contiene ${ac.total} animales. Primero reubícalos.`)
      return
    }
    const confirmed = window.confirm(`¿Estás seguro de que deseas eliminar este ${tipo} (${ac.nombre})?`)
    if (!confirmed) return

    try {
      await animalsService.deleteAcostadero(ac.id)
      await loadData()
    } catch (err) {
      alert(err.message || `Error al eliminar el ${tipo}`)
    }
  }

  async function handleDeleteAnimal(animal, e) {
    if (e) e.stopPropagation()
    const confirmed = window.confirm(`¿Estás seguro de que deseas eliminar el animal con ID ${animal.id} (${animal.raza})?`)
    if (!confirmed) return

    try {
      await animalsService.deleteAnimal(animal.id)
      await loadData()
    } catch (err) {
      alert(err.message || 'Error al eliminar el animal')
    }
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-7">
        <div>
          <h1 className="font-display text-3xl md:text-4xl" style={{ color: '#1c2110' }}>Animales y Ubicaciones</h1>
          <p className="text-sm mt-1" style={{ color: '#9a8f82' }}>
            {todosAnimales.length} registros · {acostaderos.length} acostaderos, corrales y ranchos
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setLocationError('')
              setLocationSuccess(false)
              setShowLocationModal(true)
            }}
            className="px-4 py-2 rounded-xl text-sm font-semibold border cursor-pointer hover:bg-white/80 transition-colors"
            style={{ borderColor: '#2e4829', color: '#2e4829', backgroundColor: '#f4f8f3' }}
          >
            + Nuevo Acostadero / Corral / Rancho
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#2e4829' }}
          >
            + Registrar animal
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ backgroundColor: '#f0ebe2' }}>
          {[
            { id: 'acostaderos', label: 'Ubicaciones' },
            { id: 'recientes', label: 'Recién Llegados' },
            { id: 'todos', label: 'Todos los Animales' },
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

        {/* Sub-filtro por tipo de ubicación cuando está en la pestaña acostaderos */}
        {tab === 'acostaderos' && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-medium" style={{ color: '#9a8f82' }}>Filtrar por:</span>
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'Acostadero', label: '🏕️ Acostaderos' },
              { id: 'Corral', label: '🪵 Corrales' },
              { id: 'Rancho', label: '🏡 Ranchos' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTipoFiltro(f.id)}
                className="px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                style={{
                  backgroundColor: tipoFiltro === f.id ? '#2e4829' : '#fff',
                  color: tipoFiltro === f.id ? '#fff' : '#6b7280',
                  border: '1px solid',
                  borderColor: tipoFiltro === f.id ? '#2e4829' : '#e2d9cc',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab 1: Por Acostadero / Corral / Rancho */}
      {tab === 'acostaderos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {acostaderosFiltrados.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border" style={{ borderColor: '#e2d9cc' }}>
              <p className="text-base font-semibold" style={{ color: '#1c2110' }}>No hay ubicaciones registradas con este filtro</p>
              <p className="text-sm mt-1 mb-4" style={{ color: '#9a8f82' }}>Crea tu primer acostadero, corral o rancho para comenzar a organizar tus reses.</p>
              <button
                onClick={() => setShowLocationModal(true)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: '#2e4829' }}
              >
                + Crear acostadero, corral o rancho
              </button>
            </div>
          ) : (
            acostaderosFiltrados.map((ac) => {
              const pct = ac.capacidad > 0 ? Math.min((ac.total / ac.capacidad) * 100, 100) : 0
              const st = acostaderoEstado[ac.estado] || { border: '#e2d9cc', badge: '#f5f5f5', badgeText: '#9a8f82' }
              const tipoBadge = tipoBadges[ac.tipo] || tipoBadges.Acostadero
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
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
                            style={{ backgroundColor: tipoBadge.bg, color: tipoBadge.text }}
                          >
                            <span>{tipoBadge.icon}</span> {ac.tipo || 'Acostadero'}
                          </span>
                          <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: '#f0ebe2', color: '#6b7280' }}>
                            {ac.id}
                          </span>
                        </div>
                        <h3 className="font-display text-xl" style={{ color: '#1c2110' }}>{ac.nombre}</h3>
                        <div className="flex flex-col gap-1 mt-1">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-semibold w-fit"
                            style={{ backgroundColor: st.badge, color: st.badgeText }}
                          >
                            {ac.estado}
                          </span>
                          {ac.encargado && (
                            <span className="text-xs flex items-center gap-1" style={{ color: '#2e4829' }}>
                              <span>👤</span> Encargado: <strong>{ac.encargado}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleDeleteLocation(ac, e)}
                            title={`Eliminar ${tipoBadge.label || ac.tipo || 'ubicación'}`}
                            className="p-1 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-sm"
                          >
                            🗑️
                          </button>
                          <div className="font-display text-3xl" style={{ color: '#1c2110' }}>{ac.total}</div>
                        </div>
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
                      <span>{ac.capacidad > 0 ? `${((ac.total / ac.capacidad) * 100).toFixed(0)}% ocupado` : 'Sin límite'}</span>
                      <span>{isOpen ? '▲ Ocultar' : '▼ Ver reses'}</span>
                    </div>
                  </div>

                  {isOpen && (
                    <div style={{ borderTop: '1px solid #f0ebe2' }} onClick={(e) => e.stopPropagation()}>
                      <div
                        className="px-5 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-between"
                        style={{ color: '#9a8f82', backgroundColor: '#faf6ef' }}
                      >
                        <span>Muestra ({ac.animales?.length || 0} de {ac.total})</span>
                        {ac.encargado && <span className="font-normal capitalize">Resp: {ac.encargado}</span>}
                      </div>
                      {(ac.animales || []).map((a) => {
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
                            <button
                              onClick={(e) => handleDeleteAnimal(a, e)}
                              title="Eliminar res"
                              className="p-1 rounded text-stone-300 hover:text-red-600 hover:bg-red-50 text-xs transition-colors cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        )
                      })}
                      {(!ac.animales || ac.animales.length === 0) && (
                        <div className="p-4 text-center text-xs text-stone-500">
                          No hay reses asignadas a esta ubicación actualmente.
                        </div>
                      )}
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
            })
          )}
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
                  {['ID', 'Raza', 'Sexo', 'Acostadero', 'Peso', 'Estado', 'Acciones'].map((h) => (
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
                      <td className="px-5 py-3">
                        <button
                          onClick={(e) => handleDeleteAnimal(a, e)}
                          title="Eliminar animal"
                          className="p-1 rounded text-stone-400 hover:text-red-600 hover:bg-red-50 text-xs transition-colors cursor-pointer"
                        >
                          🗑️ Borrar
                        </button>
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

      {/* Modal Crear Acostadero / Corral / Rancho */}
      <Modal
        show={showLocationModal}
        title="Crear Acostadero, Corral o Rancho"
        onClose={() => setShowLocationModal(false)}
      >
        {locationSuccess ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">✓</div>
            <p className="font-display text-lg" style={{ color: '#3a7d44' }}>Ubicación creada exitosamente</p>
          </div>
        ) : (
          <form onSubmit={handleSaveLocation} className="space-y-4">
            {locationError && (
              <div className="p-3 rounded-xl text-xs bg-red-50 text-red-700 border border-red-200">
                {locationError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                Tipo de Ubicación *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Acostadero', label: 'Acostadero', icon: '🏕️' },
                  { id: 'Corral',     label: 'Corral',     icon: '🪵' },
                  { id: 'Rancho',     label: 'Rancho',     icon: '🏡' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setLocationData({ ...locationData, tipo: t.id })}
                    className="p-2.5 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer flex flex-col items-center gap-1"
                    style={{
                      borderColor: locationData.tipo === t.id ? '#2e4829' : '#e2d9cc',
                      backgroundColor: locationData.tipo === t.id ? '#f4f8f3' : '#fff',
                      color: locationData.tipo === t.id ? '#2e4829' : '#6b7280',
                    }}
                  >
                    <span className="text-lg">{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                  Código / ID *
                </label>
                <input
                  type="text"
                  value={locationData.id}
                  onChange={(e) => setLocationData({ ...locationData, id: e.target.value.toUpperCase() })}
                  placeholder="Ej. R-01, C-3, F"
                  required
                  maxLength={10}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm uppercase outline-none"
                  style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                  Nombre descriptivo *
                </label>
                <input
                  type="text"
                  value={locationData.nombre}
                  onChange={(e) => setLocationData({ ...locationData, nombre: e.target.value })}
                  placeholder="Ej. Rancho San Carlos, Corral de Manejo 2..."
                  required
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                  Capacidad de Reses
                </label>
                <input
                  type="number"
                  value={locationData.capacidad}
                  onChange={(e) => setLocationData({ ...locationData, capacidad: e.target.value })}
                  min="0"
                  max="5000"
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                  Estado inicial
                </label>
                <select
                  value={locationData.estado}
                  onChange={(e) => setLocationData({ ...locationData, estado: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-white"
                  style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
                >
                  <option value="Normal">Normal</option>
                  <option value="Disponible">Disponible</option>
                  <option value="Lleno">Lleno</option>
                  <option value="Sobrecargado">Sobrecargado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                Asignar Usuario Encargado / Responsable
              </label>
              <select
                value={locationData.usuario_id}
                onChange={(e) => setLocationData({ ...locationData, usuario_id: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-white"
                style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
              >
                <option value="">-- Sin usuario asignado --</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} {u.apellido} ({u.email}) — {u.rol}
                  </option>
                ))}
              </select>
              <p className="text-xs text-stone-500 mt-1">
                El usuario asignado podrá figurar como el encargado directo de este rancho, corral o acostadero.
              </p>
            </div>

            <button
              type="submit"
              disabled={locationSaving}
              className="w-full py-3 rounded-xl text-sm font-bold text-white cursor-pointer transition-opacity"
              style={{ backgroundColor: '#2e4829', opacity: locationSaving ? 0.7 : 1 }}
            >
              {locationSaving ? 'Guardando ubicación…' : `Crear ${locationData.tipo}`}
            </button>
          </form>
        )}
      </Modal>
    </div>
  )
}
