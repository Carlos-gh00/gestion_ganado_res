import { useState, useEffect, useMemo } from 'react'
import { geneticaService } from '../services/geneticaService'
import Modal from '../components/ui/Modal'
import StatCard from '../components/ui/StatCard'

const estadoColors = {
  'Activo en Monta': { bg: '#eef6ee', text: '#2e6620', border: '#b8deb0' },
  'En Colecta':       { bg: '#e8f0ff', text: '#2040c0', border: '#b8cffc' },
  'En Descanso':      { bg: '#fef9ec', text: '#7a5200', border: '#f7e3ad' },
  'Baja':             { bg: '#fef2f2', text: '#b84040', border: '#fccac7' },
}

const RAZAS_LIST = [
  'Todas las razas',
  'Angus Negro',
  'Brangus 3/8',
  'Hereford Polled',
  'Brahman Blanco',
  'Charolais Francés',
  'Simmental',
  'Nelore',
]

export default function GeneticaPage() {
  const [tab, setTab] = useState('catalogo') // 'catalogo' | 'pajuelas' | 'montas'
  const [viewMode, setViewMode] = useState('cards') // 'cards' | 'table'
  const [searchQuery, setSearchQuery] = useState('')
  const [filtroRaza, setFiltroRaza] = useState('Todas las razas')
  const [filtroEstado, setFiltroEstado] = useState('Todos los estados')

  const [kpis, setKpis] = useState(null)
  const [sementales, setSementales] = useState([])
  const [pajuelas, setPajuelas] = useState([])
  const [montas, setMontas] = useState([])

  // Modal Detalle / Ficha Genética
  const [selectedSemental, setSelectedSemental] = useState(null)
  const [updatingEstado, setUpdatingEstado] = useState(false)

  // Modal Alta Nuevo Semental
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [addSuccess, setAddSuccess] = useState(false)
  const [nuevoForm, setNuevoForm] = useState({
    nombre: '',
    codigo: '',
    raza: 'Angus Negro',
    registro: '',
    peso: '880',
    circunferenciaEscrotal: '42.5',
    condicionCorporal: '7/9',
    ubicacion: 'Potrero Los Robles',
    estado: 'Activo en Monta',
    evaluacionAndrologica: 'Apto - Sobresaliente',
    motilidadSeminal: '85%',
    dosisDisponibles: '100',
    padre: '',
    madre: '',
    abueloMaterno: '',
    descripcion: '',
  })

  async function loadData() {
    const [kpiRes, semRes, pajRes, monRes] = await Promise.all([
      geneticaService.getKPIs(),
      geneticaService.getSementales(),
      geneticaService.getPajuelas(),
      geneticaService.getMontas(),
    ])
    setKpis(kpiRes)
    setSementales(semRes)
    setPajuelas(pajRes)
    setMontas(monRes)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filtrado de sementales
  const sementalesFiltrados = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return sementales.filter((s) => {
      const matchSearch =
        !q ||
        s.nombre.toLowerCase().includes(q) ||
        s.codigo.toLowerCase().includes(q) ||
        s.registro.toLowerCase().includes(q) ||
        s.raza.toLowerCase().includes(q) ||
        s.ubicacion.toLowerCase().includes(q)

      const matchRaza = filtroRaza === 'Todas las razas' || s.raza === filtroRaza
      const matchEstado = filtroEstado === 'Todos los estados' || s.estado === filtroEstado

      return matchSearch && matchRaza && matchEstado
    })
  }, [sementales, searchQuery, filtroRaza, filtroEstado])

  async function handleCambiarEstado(id, nuevoEstado) {
    setUpdatingEstado(true)
    try {
      const updated = await geneticaService.updateEstado(id, nuevoEstado)
      if (updated) {
        setSelectedSemental({ ...updated })
        await loadData()
      }
    } finally {
      setUpdatingEstado(false)
    }
  }

  async function handleCreateSemental(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await geneticaService.createSemental(nuevoForm)
      setAddSuccess(true)
      await loadData()
      setTimeout(() => {
        setShowAddModal(false)
        setAddSuccess(false)
        setNuevoForm({
          nombre: '',
          codigo: '',
          raza: 'Angus Negro',
          registro: '',
          peso: '880',
          circunferenciaEscrotal: '42.5',
          condicionCorporal: '7/9',
          ubicacion: 'Potrero Los Robles',
          estado: 'Activo en Monta',
          evaluacionAndrologica: 'Apto - Sobresaliente',
          motilidadSeminal: '85%',
          dosisDisponibles: '100',
          padre: '',
          madre: '',
          abueloMaterno: '',
          descripcion: '',
        })
      }, 1200)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-7xl mx-auto space-y-7">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🧬</span>
            <h1 className="font-display text-3xl md:text-4xl" style={{ color: '#1c2110' }}>
              Genética y Sementales
            </h1>
          </div>
          <p className="text-sm" style={{ color: '#9a8f82' }}>
            Control reproductivo, toros de cabaña, evaluación andrológica, DEPs y banco criogénico
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 cursor-pointer shadow-sm hover:opacity-95 transition-all"
            style={{ backgroundColor: '#2e4829' }}
          >
            <span>+</span> Registrar Semental
          </button>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Sementales Activos"
          value={kpis ? `${kpis.activosMonta} en monta` : '—'}
          sub={kpis ? `${kpis.totalSementales} toros en total (${kpis.enColecta} en colecta)` : ''}
          icon="🐂"
          accent="#2e4829"
        />
        <StatCard
          label="Stock de Pajuelas"
          value={kpis ? `${kpis.totalPajuelas} dosis` : '—'}
          sub="Disponibles en nitrógeno líquido"
          icon="❄️"
          accent="#2040c0"
        />
        <StatCard
          label="Tasa Preñez Estimada"
          value={kpis?.tasaPrenezPromedio || '—'}
          sub="Efectividad en IATF y monta"
          icon="📈"
          trend={{ up: true, value: '+3.2% vs ciclo anterior' }}
          accent="#3a7d44"
        />
        <StatCard
          label="Crías Identificadas"
          value={kpis ? `${kpis.totalCrias} hijos` : '—'}
          sub="Descendencia viva registrada"
          icon="🌱"
          accent="#7a5200"
        />
      </div>

      {/* Pestañas de Navegación del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 gap-3" style={{ borderColor: '#e2d9cc' }}>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('catalogo')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              tab === 'catalogo' ? 'bg-[#2e4829] text-white shadow-sm' : 'bg-white hover:bg-[#eee7dc] text-[#1c2110]'
            }`}
          >
            <span>🐂</span> Catálogo de Toros ({sementales.length})
          </button>
          <button
            onClick={() => setTab('pajuelas')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              tab === 'pajuelas' ? 'bg-[#2e4829] text-white shadow-sm' : 'bg-white hover:bg-[#eee7dc] text-[#1c2110]'
            }`}
          >
            <span>❄️</span> Banco de Semen ({pajuelas.length})
          </button>
          <button
            onClick={() => setTab('montas')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              tab === 'montas' ? 'bg-[#2e4829] text-white shadow-sm' : 'bg-white hover:bg-[#eee7dc] text-[#1c2110]'
            }`}
          >
            <span>📋</span> Servicios y Montas ({montas.length})
          </button>
        </div>

        {tab === 'catalogo' && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-[#9a8f82] mr-1">Vista:</span>
            <button
              onClick={() => setViewMode('cards')}
              title="Vista de Tarjetas"
              className={`p-2 rounded-lg border text-xs cursor-pointer ${
                viewMode === 'cards' ? 'bg-[#2e4829] text-white border-[#2e4829]' : 'bg-white text-[#555] border-[#e2d9cc]'
              }`}
            >
              ⊞ Tarjetas
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Vista de Tabla"
              className={`p-2 rounded-lg border text-xs cursor-pointer ${
                viewMode === 'table' ? 'bg-[#2e4829] text-white border-[#2e4829]' : 'bg-white text-[#555] border-[#e2d9cc]'
              }`}
            >
              ☰ Tabla
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          CONTENIDO: PESTAÑA 1 - CATÁLOGO DE SEMENTALES
          ========================================================================= */}
      {tab === 'catalogo' && (
        <div className="space-y-5">
          {/* Barra de Filtros */}
          <div className="bg-white rounded-2xl p-4 border flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between" style={{ borderColor: '#e2d9cc' }}>
            {/* Buscador */}
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-2.5 text-sm text-[#9a8f82]">🔍</span>
              <input
                type="text"
                placeholder="Buscar por nombre, código, registro, ubicación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-[#faf7f2] focus:outline-none focus:ring-2 focus:ring-[#2e4829]"
                style={{ borderColor: '#e2d9cc' }}
              />
            </div>

            {/* Select Raza */}
            <select
              value={filtroRaza}
              onChange={(e) => setFiltroRaza(e.target.value)}
              className="py-2 px-3 text-sm rounded-xl border bg-[#faf7f2] focus:outline-none focus:ring-2 focus:ring-[#2e4829] cursor-pointer"
              style={{ borderColor: '#e2d9cc' }}
            >
              {RAZAS_LIST.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {/* Select Estado */}
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="py-2 px-3 text-sm rounded-xl border bg-[#faf7f2] focus:outline-none focus:ring-2 focus:ring-[#2e4829] cursor-pointer"
              style={{ borderColor: '#e2d9cc' }}
            >
              <option value="Todos los estados">Todos los estados</option>
              <option value="Activo en Monta">Activo en Monta</option>
              <option value="En Colecta">En Colecta</option>
              <option value="En Descanso">En Descanso</option>
              <option value="Baja">Baja</option>
            </select>
          </div>

          {/* VISTA TARJETAS */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sementalesFiltrados.map((sem) => {
                const estStyle = estadoColors[sem.estado] || { bg: '#f5f5f5', text: '#555', border: '#ddd' }
                return (
                  <div
                    key={sem.id}
                    className="bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    style={{ borderColor: '#e2d9cc' }}
                  >
                    {/* Tarjeta Header */}
                    <div className="p-5 pb-3">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner"
                            style={{ backgroundColor: '#faf6ef', border: '1px solid #e5dcce' }}
                          >
                            {sem.avatarRaza || '🐂'}
                          </div>
                          <div>
                            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#7a7065]">
                              {sem.codigo}
                            </span>
                            <h3 className="font-display text-xl font-bold leading-tight" style={{ color: '#1c2110' }}>
                              {sem.nombre}
                            </h3>
                            <span className="text-xs font-semibold" style={{ color: '#2e4829' }}>
                              {sem.raza}
                            </span>
                          </div>
                        </div>

                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap border"
                          style={{ backgroundColor: estStyle.bg, color: estStyle.text, borderColor: estStyle.border }}
                        >
                          {sem.estado}
                        </span>
                      </div>

                      {/* Ubicación y Registro */}
                      <div className="flex items-center justify-between text-xs py-2 border-t border-b my-3" style={{ borderColor: '#f0e9dc' }}>
                        <span className="text-[#7a7065] flex items-center gap-1">
                          📍 {sem.ubicacion}
                        </span>
                        <span className="font-mono text-[#9a8f82]">
                          Reg: {sem.registro}
                        </span>
                      </div>

                      {/* Métricas Biométricas Clave */}
                      <div className="grid grid-cols-3 gap-2 py-1 text-center">
                        <div className="p-2 rounded-xl bg-[#faf7f2] border border-[#eee7dc]">
                          <div className="text-[11px] text-[#9a8f82] uppercase font-semibold">Peso</div>
                          <div className="font-bold text-sm text-[#1c2110]">{sem.peso} kg</div>
                        </div>
                        <div className="p-2 rounded-xl bg-[#faf7f2] border border-[#eee7dc]">
                          <div className="text-[11px] text-[#9a8f82] uppercase font-semibold">C. Escrotal</div>
                          <div className="font-bold text-sm text-[#1c2110]">{sem.circunferenciaEscrotal} cm</div>
                        </div>
                        <div className="p-2 rounded-xl bg-[#faf7f2] border border-[#eee7dc]">
                          <div className="text-[11px] text-[#9a8f82] uppercase font-semibold">Fertilidad</div>
                          <div className="font-bold text-sm text-[#2e4829]">{sem.motilidadSeminal}</div>
                        </div>
                      </div>

                      {/* Indicadores Reproductivos */}
                      <div className="mt-3 text-xs space-y-1.5 bg-[#fbf9f5] p-3 rounded-xl border border-[#efe8dc]">
                        <div className="flex justify-between">
                          <span className="text-[#7a7065]">Dosis Criogénicas:</span>
                          <span className="font-semibold text-[#1c2110] font-mono">
                            ❄️ {sem.dosisDisponibles} pajuelas
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#7a7065]">Crías Registradas:</span>
                          <span className="font-semibold text-[#1c2110]">
                            🌱 {sem.criasRegistradas} hijos ({sem.tasaPrenez} preñez)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#7a7065]">Padre:</span>
                          <span className="font-medium text-[#4a4237] truncate max-w-[170px]">
                            {sem.padre}
                          </span>
                        </div>
                      </div>

                      {/* Mini DEPs destacados */}
                      <div className="mt-3 pt-2">
                        <div className="text-[11px] font-bold text-[#7a7065] uppercase tracking-wider mb-1.5">
                          Mérito Genético (DEPs):
                        </div>
                        <div className="flex flex-wrap gap-1.5 text-[11px]">
                          <span className="px-2 py-0.5 rounded-md bg-[#eef6ee] text-[#2e6620] font-medium">
                            Parto: {sem.deps.facilidadParto}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-[#e8f0ff] text-[#2040c0] font-medium">
                            Destete: {sem.deps.pesoDestete}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-[#fef9ec] text-[#7a5200] font-medium">
                            AOB: {sem.deps.areaOjoBife}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer de Tarjeta */}
                    <div className="p-4 pt-3 bg-[#faf7f2] border-t flex items-center justify-between" style={{ borderColor: '#e2d9cc' }}>
                      <span className="text-xs text-[#9a8f82]">
                        Eval: <strong className="text-[#2e4829]">{sem.evaluacionAndrologica.split('-')[0]}</strong>
                      </span>
                      <button
                        onClick={() => setSelectedSemental(sem)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 cursor-pointer flex items-center gap-1 shadow-xs"
                        style={{ backgroundColor: '#2e4829' }}
                      >
                        Ver Ficha Genética →
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* VISTA TABLA */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: '#e2d9cc' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#faf6ef] border-b text-xs uppercase font-semibold text-[#7a7065]" style={{ borderColor: '#e2d9cc' }}>
                    <tr>
                      <th className="px-5 py-3.5">Semental</th>
                      <th className="px-5 py-3.5">Raza</th>
                      <th className="px-5 py-3.5">Registro</th>
                      <th className="px-5 py-3.5">Peso / CE</th>
                      <th className="px-5 py-3.5">Estado</th>
                      <th className="px-5 py-3.5">Ubicación</th>
                      <th className="px-5 py-3.5">Dosis Semen</th>
                      <th className="px-5 py-3.5 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eee7dc]">
                    {sementalesFiltrados.map((s) => {
                      const estStyle = estadoColors[s.estado] || { bg: '#f5f5f5', text: '#555', border: '#ddd' }
                      return (
                        <tr key={s.id} className="hover:bg-[#faf7f2] transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">{s.avatarRaza || '🐂'}</span>
                              <div>
                                <div className="font-bold text-[#1c2110]">{s.nombre}</div>
                                <div className="text-xs font-mono text-[#7a7065]">{s.codigo}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-medium text-[#2e4829]">{s.raza}</td>
                          <td className="px-5 py-4 font-mono text-xs text-[#7a7065]">{s.registro}</td>
                          <td className="px-5 py-4">
                            <span className="font-bold text-[#1c2110]">{s.peso} kg</span>
                            <span className="text-xs text-[#9a8f82] ml-1.5">({s.circunferenciaEscrotal} cm)</span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className="px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                              style={{ backgroundColor: estStyle.bg, color: estStyle.text, borderColor: estStyle.border }}
                            >
                              {s.estado}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs text-[#555]">{s.ubicacion}</td>
                          <td className="px-5 py-4 font-mono font-bold text-xs text-[#2040c0]">
                            ❄️ {s.dosisDisponibles} dosis
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => setSelectedSemental(s)}
                              className="px-3 py-1 rounded-lg text-xs font-bold text-[#2e4829] hover:bg-[#eef6ee] transition-colors cursor-pointer"
                            >
                              Ficha →
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

          {sementalesFiltrados.length === 0 && (
            <div className="bg-white rounded-2xl border p-12 text-center" style={{ borderColor: '#e2d9cc' }}>
              <span className="text-4xl mb-2 block">🔍</span>
              <h3 className="font-display text-xl text-[#1c2110]">No se encontraron sementales</h3>
              <p className="text-xs text-[#9a8f82] mt-1">Prueba cambiando los filtros de raza, estado o la búsqueda.</p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          CONTENIDO: PESTAÑA 2 - BANCO DE SEMEN / PAJUELAS CRIOGÉNICAS
          ========================================================================= */}
      {tab === 'pajuelas' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#e2d9cc' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-display text-xl font-bold" style={{ color: '#1c2110' }}>
                  Inventario Criogénico de Pajuelas (Semen Congelado)
                </h3>
                <p className="text-xs text-[#7a7065]">
                  Almacenamiento en termos de nitrógeno líquido a -196°C para Inseminación Artificial (IA / IATF)
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-[#e8f0ff] text-[#2040c0] font-semibold text-xs flex items-center gap-1.5 self-start sm:self-auto">
                <span>❄️</span> Nitrógeno Líquido: Nivel Óptimo (98%)
              </div>
            </div>

            {pajuelas.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#faf6ef] border-b text-xs uppercase font-semibold text-[#7a7065]" style={{ borderColor: '#e2d9cc' }}>
                    <tr>
                      <th className="px-4 py-3">Código Lote</th>
                      <th className="px-4 py-3">Toro Donante</th>
                      <th className="px-4 py-3">Raza</th>
                      <th className="px-4 py-3">Ubicación Criogénica</th>
                      <th className="px-4 py-3">Concentración</th>
                      <th className="px-4 py-3">Dosis en Stock</th>
                      <th className="px-4 py-3">Fecha Congelación</th>
                      <th className="px-4 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eee7dc]">
                    {pajuelas.map((p) => (
                      <tr key={p.id} className="hover:bg-[#faf7f2]">
                        <td className="px-4 py-3.5 font-mono text-xs font-bold text-[#1c2110]">{p.lote}</td>
                        <td className="px-4 py-3.5 font-semibold text-[#1c2110]">
                          {p.semental} <span className="font-mono text-xs text-[#9a8f82]">({p.codigo})</span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-[#2e4829] font-medium">{p.raza}</td>
                        <td className="px-4 py-3.5 text-xs text-[#555]">
                          📦 {p.termo} • <span className="font-mono font-semibold">{p.canastilla}</span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs text-[#7a7065]">{p.concentracion}</td>
                        <td className="px-4 py-3.5 font-mono font-bold text-sm text-[#2040c0]">
                          {p.dosis} pajuelas
                        </td>
                        <td className="px-4 py-3.5 text-xs text-[#9a8f82]">{p.fechaCongelacion}</td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#eef6ee] text-[#2e6620]">
                            ✓ Certificado Apto
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-10 text-center text-[#9a8f82] text-sm">
                <span className="text-3xl block mb-2">❄️</span>
                No hay lotes de pajuelas criogénicas registrados aún en la base de datos.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          CONTENIDO: PESTAÑA 3 - SERVICIOS Y MONTAS
          ========================================================================= */}
      {tab === 'montas' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#e2d9cc' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-display text-xl font-bold" style={{ color: '#1c2110' }}>
                  Historial de Servicios Reproductivos y Montas
                </h3>
                <p className="text-xs text-[#7a7065]">
                  Control de servicios naturales e Inseminación Artificial a Tiempo Fijo (IATF) con confirmación diagnóstica
                </p>
              </div>
            </div>

            {montas.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#faf6ef] border-b text-xs uppercase font-semibold text-[#7a7065]" style={{ borderColor: '#e2d9cc' }}>
                    <tr>
                      <th className="px-4 py-3">ID Servicio</th>
                      <th className="px-4 py-3">Semental Empleado</th>
                      <th className="px-4 py-3">Modalidad</th>
                      <th className="px-4 py-3">Hembras / Lote</th>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Responsable</th>
                      <th className="px-4 py-3">Resultado / Diagnóstico</th>
                      <th className="px-4 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eee7dc]">
                    {montas.map((m) => (
                      <tr key={m.id} className="hover:bg-[#faf7f2]">
                        <td className="px-4 py-3.5 font-mono text-xs font-bold text-[#1c2110]">{m.id}</td>
                        <td className="px-4 py-3.5 font-semibold text-[#1c2110]">{m.semental}</td>
                        <td className="px-4 py-3.5 text-xs text-[#2e4829] font-medium">{m.tipo}</td>
                        <td className="px-4 py-3.5 text-xs text-[#444]">{m.hembras}</td>
                        <td className="px-4 py-3.5 text-xs text-[#9a8f82]">{m.fecha}</td>
                        <td className="px-4 py-3.5 text-xs text-[#7a7065]">{m.responsable}</td>
                        <td className="px-4 py-3.5 text-xs font-semibold text-[#1c2110]">
                          {m.resultado}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              m.estado === 'Completado'
                                ? 'bg-[#eef6ee] text-[#2e6620]'
                                : m.estado === 'En Proceso'
                                ? 'bg-[#fef9ec] text-[#7a5200]'
                                : 'bg-[#e8f0ff] text-[#2040c0]'
                            }`}
                          >
                            {m.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-10 text-center text-[#9a8f82] text-sm">
                <span className="text-3xl block mb-2">📋</span>
                No hay servicios reproductivos ni montas registradas aún en la base de datos.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: FICHA GENÉTICA COMPLETA DEL SEMENTAL
          ========================================================================= */}
      <Modal
        show={Boolean(selectedSemental)}
        title={selectedSemental ? `Ficha Genética: ${selectedSemental.nombre} (${selectedSemental.codigo})` : ''}
        onClose={() => setSelectedSemental(null)}
      >
        {selectedSemental && (
          <div className="space-y-5 text-sm">
            {/* Header Ficha */}
            <div className="flex items-start justify-between bg-[#faf7f2] p-4 rounded-2xl border" style={{ borderColor: '#e2d9cc' }}>
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-2xl bg-white border border-[#e2d9cc] flex items-center justify-center text-3xl shadow-sm">
                  {selectedSemental.avatarRaza || '🐂'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-2xl font-bold" style={{ color: '#1c2110' }}>
                      {selectedSemental.nombre}
                    </h2>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-white border border-[#e2d9cc] font-bold text-[#7a7065]">
                      {selectedSemental.codigo}
                    </span>
                  </div>
                  <div className="text-xs text-[#2e4829] font-bold mt-0.5">
                    Raza: {selectedSemental.raza} • Reg: {selectedSemental.registro}
                  </div>
                  <div className="text-xs text-[#7a7065] mt-0.5">
                    📍 Ubicación: <strong>{selectedSemental.ubicacion}</strong>
                  </div>
                </div>
              </div>

              {/* Selector de Estado Rápido */}
              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider text-[#9a8f82] font-semibold block mb-1">
                  Estado Reproductivo
                </span>
                <select
                  disabled={updatingEstado}
                  value={selectedSemental.estado}
                  onChange={(e) => handleCambiarEstado(selectedSemental.id, e.target.value)}
                  className="text-xs font-bold py-1.5 px-2.5 rounded-xl border bg-white cursor-pointer shadow-xs"
                  style={{ borderColor: '#2e4829', color: '#2e4829' }}
                >
                  <option value="Activo en Monta">🟢 Activo en Monta</option>
                  <option value="En Colecta">🔵 En Colecta (Semen)</option>
                  <option value="En Descanso">🟡 En Descanso</option>
                  <option value="Baja">🔴 Baja / Retirado</option>
                </select>
              </div>
            </div>

            {/* Datos Biométricos & Andrológicos */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7a7065] mb-2">
                1. Evaluación Andrológica y Biometría
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-white border border-[#e2d9cc]">
                  <span className="text-xs text-[#9a8f82] block">Peso Actual</span>
                  <span className="font-display text-lg font-bold text-[#1c2110]">{selectedSemental.peso} kg</span>
                  <span className="text-[11px] text-[#7a7065] block">CC: {selectedSemental.condicionCorporal}</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#e2d9cc]">
                  <span className="text-xs text-[#9a8f82] block">C. Escrotal (CE)</span>
                  <span className="font-display text-lg font-bold text-[#1c2110]">{selectedSemental.circunferenciaEscrotal} cm</span>
                  <span className="text-[11px] text-[#2e4829] font-medium block">Excelente fertilidad</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#e2d9cc]">
                  <span className="text-xs text-[#9a8f82] block">Motilidad Seminal</span>
                  <span className="font-display text-lg font-bold text-[#2e4829]">{selectedSemental.motilidadSeminal}</span>
                  <span className="text-[11px] text-[#7a7065] block">{selectedSemental.evaluacionAndrologica.split('-')[0]}</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#e2d9cc]">
                  <span className="text-xs text-[#9a8f82] block">Stock Pajuelas</span>
                  <span className="font-display text-lg font-bold text-[#2040c0]">{selectedSemental.dosisDisponibles}</span>
                  <span className="text-[11px] text-[#7a7065] block">{selectedSemental.dosisUsadas} utilizadas</span>
                </div>
              </div>
            </div>

            {/* Genealogía / Pedigree */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7a7065] mb-2">
                2. Árbol Genealógico (Pedigree)
              </h4>
              <div className="bg-[#faf7f2] p-3.5 rounded-xl border border-[#e2d9cc] space-y-2">
                <div className="flex items-center justify-between text-xs border-b pb-1.5" style={{ borderColor: '#eee7dc' }}>
                  <span className="text-[#7a7065]">Padre (Sire):</span>
                  <span className="font-semibold text-[#1c2110]">🐂 {selectedSemental.padre}</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b pb-1.5" style={{ borderColor: '#eee7dc' }}>
                  <span className="text-[#7a7065]">Madre (Dam):</span>
                  <span className="font-semibold text-[#1c2110]">🐄 {selectedSemental.madre}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#7a7065]">Abuelo Materno:</span>
                  <span className="font-medium text-[#555]">🌾 {selectedSemental.abueloMaterno}</span>
                </div>
              </div>
            </div>

            {/* DEPs (Diferencias Esperadas de Progenie) */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7a7065] mb-2">
                3. Diferencias Esperadas de Progenie (DEPs)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="p-2.5 rounded-lg bg-white border border-[#e2d9cc]">
                  <span className="text-[11px] text-[#7a7065] block font-semibold">Facilidad de Parto (FP)</span>
                  <span className="font-bold text-sm text-[#2e6620]">{selectedSemental.deps.facilidadParto}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#e2d9cc]">
                  <span className="text-[11px] text-[#7a7065] block font-semibold">Peso al Nacer (PN)</span>
                  <span className="font-bold text-sm text-[#1c2110]">{selectedSemental.deps.pesoNacer}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#e2d9cc]">
                  <span className="text-[11px] text-[#7a7065] block font-semibold">Peso al Destete (PD)</span>
                  <span className="font-bold text-sm text-[#2040c0]">{selectedSemental.deps.pesoDestete}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#e2d9cc]">
                  <span className="text-[11px] text-[#7a7065] block font-semibold">Peso al Año (PA)</span>
                  <span className="font-bold text-sm text-[#2040c0]">{selectedSemental.deps.pesoAno}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#e2d9cc]">
                  <span className="text-[11px] text-[#7a7065] block font-semibold">Leche / Aptitud Materna</span>
                  <span className="font-bold text-sm text-[#7a5200]">{selectedSemental.deps.lecheMaterna}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#e2d9cc]">
                  <span className="text-[11px] text-[#7a7065] block font-semibold">Área Ojo de Bife (AOB)</span>
                  <span className="font-bold text-sm text-[#6020c0]">{selectedSemental.deps.areaOjoBife}</span>
                </div>
              </div>
            </div>

            {/* Descripción Técnica */}
            <div className="bg-[#fffdfa] p-3 rounded-xl border border-[#e8e0d4] text-xs text-[#555] leading-relaxed">
              <strong>Nota técnica de cabaña:</strong> {selectedSemental.descripcion}
            </div>

            {/* Botón Cerrar */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedSemental(null)}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#faf7f2] border border-[#e2d9cc] text-[#1c2110] hover:bg-[#eee7dc] cursor-pointer"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* =========================================================================
          MODAL: REGISTRAR NUEVO SEMENTAL
          ========================================================================= */}
      <Modal
        show={showAddModal}
        title="Dar de alta nuevo Semental Reproductor"
        onClose={() => setShowAddModal(false)}
      >
        <form onSubmit={handleCreateSemental} className="space-y-4 text-sm">
          {addSuccess && (
            <div className="p-3 bg-[#eef6ee] border border-[#b8deb0] text-[#2e6620] rounded-xl text-center font-bold text-sm">
              ✓ ¡Semental registrado exitosamente en el catálogo!
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#7a7065] uppercase mb-1">Nombre o Apodo *</label>
              <input
                required
                type="text"
                placeholder="Ej: Gran Campeón 2026"
                value={nuevoForm.nombre}
                onChange={(e) => setNuevoForm({ ...nuevoForm, nombre: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border bg-[#faf7f2] focus:ring-2 focus:ring-[#2e4829] focus:outline-none"
                style={{ borderColor: '#e2d9cc' }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#7a7065] uppercase mb-1">Código de Arete / Tatuaje *</label>
              <input
                required
                type="text"
                placeholder="Ej: TOR-955"
                value={nuevoForm.codigo}
                onChange={(e) => setNuevoForm({ ...nuevoForm, codigo: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border bg-[#faf7f2] focus:ring-2 focus:ring-[#2e4829] focus:outline-none"
                style={{ borderColor: '#e2d9cc' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#7a7065] uppercase mb-1">Raza *</label>
              <select
                value={nuevoForm.raza}
                onChange={(e) => setNuevoForm({ ...nuevoForm, raza: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border bg-[#faf7f2] focus:ring-2 focus:ring-[#2e4829] focus:outline-none cursor-pointer"
                style={{ borderColor: '#e2d9cc' }}
              >
                {RAZAS_LIST.filter((r) => r !== 'Todas las razas').map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#7a7065] uppercase mb-1">Registro Genealógico / HBA</label>
              <input
                type="text"
                placeholder="Ej: RG-772910"
                value={nuevoForm.registro}
                onChange={(e) => setNuevoForm({ ...nuevoForm, registro: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border bg-[#faf7f2] focus:ring-2 focus:ring-[#2e4829] focus:outline-none"
                style={{ borderColor: '#e2d9cc' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#7a7065] uppercase mb-1">Peso (kg)</label>
              <input
                type="number"
                value={nuevoForm.peso}
                onChange={(e) => setNuevoForm({ ...nuevoForm, peso: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border bg-[#faf7f2] focus:ring-2 focus:ring-[#2e4829] focus:outline-none"
                style={{ borderColor: '#e2d9cc' }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#7a7065] uppercase mb-1">C. Escrotal (cm)</label>
              <input
                type="number"
                step="0.5"
                value={nuevoForm.circunferenciaEscrotal}
                onChange={(e) => setNuevoForm({ ...nuevoForm, circunferenciaEscrotal: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border bg-[#faf7f2] focus:ring-2 focus:ring-[#2e4829] focus:outline-none"
                style={{ borderColor: '#e2d9cc' }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#7a7065] uppercase mb-1">Dosis Semen</label>
              <input
                type="number"
                value={nuevoForm.dosisDisponibles}
                onChange={(e) => setNuevoForm({ ...nuevoForm, dosisDisponibles: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border bg-[#faf7f2] focus:ring-2 focus:ring-[#2e4829] focus:outline-none"
                style={{ borderColor: '#e2d9cc' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#7a7065] uppercase mb-1">Ubicación / Potrero</label>
              <input
                type="text"
                placeholder="Ej: Potrero Los Robles"
                value={nuevoForm.ubicacion}
                onChange={(e) => setNuevoForm({ ...nuevoForm, ubicacion: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border bg-[#faf7f2] focus:ring-2 focus:ring-[#2e4829] focus:outline-none"
                style={{ borderColor: '#e2d9cc' }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#7a7065] uppercase mb-1">Estado Reproductivo</label>
              <select
                value={nuevoForm.estado}
                onChange={(e) => setNuevoForm({ ...nuevoForm, estado: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border bg-[#faf7f2] focus:ring-2 focus:ring-[#2e4829] focus:outline-none cursor-pointer"
                style={{ borderColor: '#e2d9cc' }}
              >
                <option value="Activo en Monta">Activo en Monta</option>
                <option value="En Colecta">En Colecta (Semen)</option>
                <option value="En Descanso">En Descanso</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#7a7065] uppercase mb-1">Padre (Sire)</label>
              <input
                type="text"
                placeholder="Ej: Net Worth 4200"
                value={nuevoForm.padre}
                onChange={(e) => setNuevoForm({ ...nuevoForm, padre: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border bg-[#faf7f2] focus:ring-2 focus:ring-[#2e4829] focus:outline-none"
                style={{ borderColor: '#e2d9cc' }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#7a7065] uppercase mb-1">Madre (Dam)</label>
              <input
                type="text"
                placeholder="Ej: Doña Flor 302"
                value={nuevoForm.madre}
                onChange={(e) => setNuevoForm({ ...nuevoForm, madre: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border bg-[#faf7f2] focus:ring-2 focus:ring-[#2e4829] focus:outline-none"
                style={{ borderColor: '#e2d9cc' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#7a7065] uppercase mb-1">Descripción / Observaciones</label>
            <textarea
              rows="2"
              placeholder="Características fenotípicas, docilidad, aplomos, recomendaciones..."
              value={nuevoForm.descripcion}
              onChange={(e) => setNuevoForm({ ...nuevoForm, descripcion: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border bg-[#faf7f2] focus:ring-2 focus:ring-[#2e4829] focus:outline-none"
              style={{ borderColor: '#e2d9cc' }}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl border bg-white text-[#7a7065] hover:bg-[#faf7f2] font-semibold cursor-pointer"
              style={{ borderColor: '#e2d9cc' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-white font-bold transition-opacity hover:opacity-90 cursor-pointer shadow-sm"
              style={{ backgroundColor: '#2e4829' }}
            >
              {submitting ? 'Guardando...' : 'Guardar Semental'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
