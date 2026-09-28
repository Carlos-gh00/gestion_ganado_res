import { useState, useEffect } from 'react'
import { healthService } from '../services/healthService'
import Modal from '../components/ui/Modal'

const sevColors = {
  Alta:  { bg: '#fef2f2', text: '#b84040' },
  Media: { bg: '#fffbeb', text: '#c9882a' },
  Baja:  { bg: '#f0fdf4', text: '#3a7d44' },
}

export default function HealthPage() {
  const [tab, setTab] = useState('tratamientos') // 'tratamientos' | 'vacunas'
  const [kpis, setKpis] = useState([])
  const [tratamientos, setTratamientos] = useState([])
  const [vacunas, setVacunas] = useState([])

  // Modal nuevo tratamiento
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newTratamiento, setNewTratamiento] = useState({
    animal: 'A-3001',
    raza: 'Hereford',
    diagnostico: '',
    veterinario: 'Dr. Soria',
    severidad: 'Media',
  })

  async function loadData() {
    const [kRes, tRes, vRes] = await Promise.all([
      healthService.getSanidadKPIs(),
      healthService.getTratamientos(),
      healthService.getVacunacion(),
    ])
    setKpis(kRes)
    setTratamientos(tRes)
    setVacunas(vRes)
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleCrearTratamiento(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await healthService.createTratamiento(newTratamiento)
      setSaved(true)
      await loadData()
      setTimeout(() => {
        setSaved(false)
        setShowModal(false)
        setNewTratamiento({
          animal: 'A-3001',
          raza: 'Hereford',
          diagnostico: '',
          veterinario: 'Dr. Soria',
          severidad: 'Media',
        })
      }, 1200)
    } finally {
      setSaving(false)
    }
  }

  async function handleAplicarVacuna(nombre) {
    await healthService.registrarAplicacionVacuna(nombre)
    await loadData()
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-7">
        <h1 className="font-display text-3xl md:text-4xl" style={{ color: '#1c2110' }}>Sanidad</h1>
        <p className="text-sm mt-1" style={{ color: '#9a8f82' }}>Tratamientos activos y plan de vacunación</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        {kpis.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border p-4 transition-shadow hover:shadow-sm"
            style={{ borderColor: '#e2d9cc' }}
          >
            <div className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: '#9a8f82' }}>
              {s.label}
            </div>
            <div className="font-display text-3xl" style={{ color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-lg w-fit" style={{ backgroundColor: '#f0ebe2' }}>
        {['tratamientos', 'vacunas'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all cursor-pointer"
            style={{
              backgroundColor: tab === t ? '#fff' : 'transparent',
              color: tab === t ? '#1c2110' : '#9a8f82',
              boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : undefined,
            }}
          >
            {t === 'tratamientos' ? 'Tratamientos' : 'Vacunación'}
          </button>
        ))}
      </div>

      {/* Tab 1: Tratamientos */}
      {tab === 'tratamientos' && (
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#e2d9cc' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#f0ebe2' }}>
            <span className="text-sm font-semibold" style={{ color: '#1c2110' }}>Registro de tratamientos</span>
            <button
              onClick={() => setShowModal(true)}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white cursor-pointer hover:opacity-90"
              style={{ backgroundColor: '#b84040' }}
            >
              + Nuevo caso
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead style={{ backgroundColor: '#faf6ef' }}>
                <tr style={{ borderBottom: '1px solid #e2d9cc' }}>
                  {['ID', 'Animal', 'Diagnóstico', 'Veterinario', 'Inicio', 'Severidad', 'Estado'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs uppercase tracking-wider font-semibold"
                      style={{ color: '#9a8f82' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tratamientos.map((t) => {
                  const sc = sevColors[t.severidad] || { bg: '#f5f5f5', text: '#555' }
                  return (
                    <tr key={t.id} className="border-b hover:bg-[#faf8f4] transition-colors" style={{ borderColor: '#f0ebe2' }}>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: '#9a8f82' }}>{t.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs font-semibold" style={{ color: '#2e4829' }}>{t.animal}</div>
                        <div className="text-xs" style={{ color: '#9a8f82' }}>{t.raza}</div>
                      </td>
                      <td className="px-4 py-3 max-w-[180px]" style={{ color: '#1c2110' }}>{t.diagnostico}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#9a8f82' }}>{t.veterinario}</td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: '#9a8f82' }}>{t.inicio}</td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: sc.bg, color: sc.text }}
                        >
                          {t.severidad}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: t.estado === 'Activo' ? '#fef9ec' : '#f0fdf4',
                            color: t.estado === 'Activo' ? '#7a5200' : '#3a7d44',
                          }}
                        >
                          {t.estado}
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

      {/* Tab 2: Vacunas */}
      {tab === 'vacunas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vacunas.map((v) => {
            const pct = Math.round((v.aplicados / v.total) * 100)
            const urgent = v.venceDias <= 10
            return (
              <div key={v.nombre} className="bg-white rounded-xl border p-5" style={{ borderColor: '#e2d9cc' }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-base" style={{ color: '#1c2110' }}>{v.nombre}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#9a8f82' }}>Próxima campaña: {v.proxima}</div>
                  </div>
                  {urgent && (
                    <span
                      className="text-xs px-2 py-1 rounded-full font-semibold"
                      style={{ backgroundColor: '#fef2f2', color: '#b84040' }}
                    >
                      ⚠ {v.venceDias} días
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: '#9a8f82' }}>
                  <span>Animales vacunados</span>
                  <span className="font-mono font-medium" style={{ color: '#1c2110' }}>
                    {v.aplicados}/{v.total}
                  </span>
                </div>

                <div className="h-2.5 rounded-full" style={{ backgroundColor: '#f0ebe2' }}>
                  <div
                    className="h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: pct === 100 ? '#3a7d44' : '#b87333',
                    }}
                  />
                </div>
                <div className="text-xs mt-1" style={{ color: '#9a8f82' }}>{pct}% completado</div>

                <button
                  onClick={() => handleAplicarVacuna(v.nombre)}
                  className="mt-4 w-full py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-[#f7f2ea] cursor-pointer"
                  style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
                >
                  {v.aplicados === v.total ? 'Campaña completada ✓' : 'Registrar aplicación'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal nuevo tratamiento */}
      <Modal show={showModal} title="Registrar caso sanitario" onClose={() => setShowModal(false)}>
        {saved ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">✓</div>
            <p className="font-display text-lg" style={{ color: '#3a7d44' }}>Tratamiento registrado</p>
          </div>
        ) : (
          <form onSubmit={handleCrearTratamiento} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                Identificador del animal
              </label>
              <input
                type="text"
                value={newTratamiento.animal}
                onChange={(e) => setNewTratamiento({ ...newTratamiento, animal: e.target.value })}
                placeholder="Ej. A-3001"
                required
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                Diagnóstico / Síntomas
              </label>
              <textarea
                value={newTratamiento.diagnostico}
                onChange={(e) => setNewTratamiento({ ...newTratamiento, diagnostico: e.target.value })}
                placeholder="Describa el cuadro observado..."
                rows="3"
                required
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none"
                style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                  Veterinario
                </label>
                <input
                  type="text"
                  value={newTratamiento.veterinario}
                  onChange={(e) => setNewTratamiento({ ...newTratamiento, veterinario: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                  Severidad
                </label>
                <select
                  value={newTratamiento.severidad}
                  onChange={(e) => setNewTratamiento({ ...newTratamiento, severidad: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
                >
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl text-sm font-bold text-white cursor-pointer transition-opacity"
              style={{ backgroundColor: '#b84040', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Guardando…' : 'Iniciar tratamiento'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  )
}
