import { useState, useEffect } from 'react'
import { reportsService } from '../services/reportsService'
import { useAuth } from '../context/AuthContext'

export default function ReportsPage() {
  const { user } = useAuth()
  const [step, setStep] = useState(1) // 1 | 2 | 3
  const [tipo, setTipo] = useState(null)
  const [periodo, setPeriodo] = useState('mes')
  const [colorIdx, setColorIdx] = useState(0)
  const [titulo, setTitulo] = useState('')
  const [notas, setNotas] = useState('')
  const [generando, setGenerando] = useState(false)
  const [generado, setGenerado] = useState(false)

  const [tiposReporte, setTiposReporte] = useState([])
  const [paletasColor, setPaletasColor] = useState([])
  const [periodos, setPeriodos] = useState([])
  const [reportesGenerados, setReportesGenerados] = useState([])

  async function loadData() {
    const [tRes, pRes, perRes, repRes] = await Promise.all([
      reportsService.getTiposReporte(),
      reportsService.getPaletasColor(),
      reportsService.getPeriodos(),
      reportsService.getReportesGenerados(),
    ])
    setTiposReporte(tRes)
    setPaletasColor(pRes)
    setPeriodos(perRes)
    setReportesGenerados(repRes)
  }

  useEffect(() => {
    loadData()
  }, [])

  const tipoSel = tiposReporte.find((t) => t.id === tipo)
  const colorSel = paletasColor[colorIdx] || { primary: '#2e4829', accent: '#b87333' }
  const periodoSel = periodos.find((p) => p.id === periodo)

  async function handleGenerar() {
    setGenerando(true)
    try {
      await reportsService.generarReporte({
        tipoLabel: tipoSel?.label,
        periodoLabel: periodoSel?.label,
        autor: `${user?.nombre || 'Admin'} ${user?.apellido || ''}`,
        color: colorSel.primary,
      })
      setGenerando(false)
      setGenerado(true)
      await loadData()
    } catch {
      setGenerando(false)
    }
  }

  function reset() {
    setStep(1)
    setTipo(null)
    setPeriodo('mes')
    setColorIdx(0)
    setTitulo('')
    setNotas('')
    setGenerado(false)
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl" style={{ color: '#1c2110' }}>Reportes</h1>
        <p className="text-sm mt-1" style={{ color: '#9a8f82' }}>
          Genera reportes desde plantillas o consulta los anteriores
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* Builder */}
        <div className="lg:col-span-2">
          {/* Progress */}
          <div className="flex items-center gap-3 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    backgroundColor: step >= s ? '#2e4829' : '#f0ebe2',
                    color: step >= s ? '#fff' : '#9a8f82',
                  }}
                >
                  {s}
                </div>
                <span
                  className="text-sm hidden sm:inline"
                  style={{
                    color: step === s ? '#1c2110' : '#9a8f82',
                    fontWeight: step === s ? 600 : 400,
                  }}
                >
                  {s === 1 ? 'Tipo y período' : s === 2 ? 'Personalizar' : 'Confirmar'}
                </span>
                {s < 3 && <span style={{ color: '#e2d9cc' }}>›</span>}
              </div>
            ))}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#e2d9cc' }}>
              <h2 className="font-display text-xl mb-4" style={{ color: '#1c2110' }}>¿Qué tipo de reporte necesitas?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {tiposReporte.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTipo(t.id)}
                    className="flex items-start gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer"
                    style={{
                      borderColor: tipo === t.id ? '#2e4829' : '#e2d9cc',
                      backgroundColor: tipo === t.id ? '#f0f7ee' : '#fff',
                      boxShadow: tipo === t.id ? '0 0 0 2px #2e482940' : undefined,
                    }}
                  >
                    <span className="text-2xl select-none">{t.icon}</span>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: '#1c2110' }}>{t.label}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#9a8f82' }}>{t.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              <h2 className="font-display text-xl mb-3" style={{ color: '#1c2110' }}>Período</h2>
              <div className="flex flex-wrap gap-2 mb-6">
                {periodos.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPeriodo(p.id)}
                    className="px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer"
                    style={{
                      backgroundColor: periodo === p.id ? '#2e4829' : '#fff',
                      color: periodo === p.id ? '#fff' : '#9a8f82',
                      borderColor: periodo === p.id ? '#2e4829' : '#e2d9cc',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={!tipo}
                onClick={() => setStep(2)}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity cursor-pointer"
                style={{ backgroundColor: '#2e4829', opacity: tipo ? 1 : 0.4 }}
              >
                Continuar →
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#e2d9cc' }}>
              <h2 className="font-display text-xl mb-4" style={{ color: '#1c2110' }}>Personalizar reporte</h2>

              <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#9a8f82' }}>
                  Título del reporte
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder={`Reporte ${tipoSel?.label} · ${periodoSel?.label}`}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#e2d9cc', backgroundColor: '#fff', color: '#1c2110' }}
                />
              </div>

              <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9a8f82' }}>
                  Paleta de colores
                </label>
                <div className="flex flex-wrap gap-3">
                  {paletasColor.map((c, i) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setColorIdx(i)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all cursor-pointer"
                      style={{
                        borderColor: colorIdx === i ? c.primary : '#e2d9cc',
                        backgroundColor: colorIdx === i ? c.primary + '12' : '#fff',
                      }}
                    >
                      <div className="flex gap-1">
                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: c.primary }} />
                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: c.accent }} />
                      </div>
                      <span className="text-xs" style={{ color: '#1c2110' }}>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#9a8f82' }}>
                  Notas adicionales (opcional)
                </label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  rows={3}
                  placeholder="Observaciones, contexto o indicaciones para incluir en el reporte…"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
                  style={{ borderColor: '#e2d9cc', backgroundColor: '#fff', color: '#1c2110' }}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-xl text-sm font-medium border cursor-pointer hover:bg-black/5"
                  style={{ borderColor: '#e2d9cc', color: '#9a8f82' }}
                >
                  ← Atrás
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white cursor-pointer"
                  style={{ backgroundColor: '#2e4829' }}
                >
                  Vista previa →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Preview */}
          {step === 3 && !generado && (
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden border" style={{ borderColor: colorSel.primary + '60' }}>
                <div className="px-7 py-5 flex items-center justify-between" style={{ backgroundColor: colorSel.primary }}>
                  <div>
                    <div className="text-white/60 text-xs font-mono uppercase tracking-wider mb-1">Estancia El Ceibo</div>
                    <div className="font-display text-2xl text-white">
                      {titulo || `Reporte ${tipoSel?.label} · ${periodoSel?.label}`}
                    </div>
                    <div className="text-white/70 text-xs mt-1">
                      {periodoSel?.label} · Generado {new Date().toLocaleDateString('es-MX')}
                    </div>
                  </div>
                  <span className="text-4xl opacity-60">{tipoSel?.icon}</span>
                </div>
                <div className="px-7 py-5 bg-white">
                  <div className="grid grid-cols-3 gap-4 mb-5">
                    {[
                      ['Total animales', '1,284'],
                      ['Período', periodoSel?.label || ''],
                      ['Generado por', `${user?.nombre} ${user?.apellido}`],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-xl p-4" style={{ backgroundColor: colorSel.primary + '0d' }}>
                        <div className="text-xs" style={{ color: '#9a8f82' }}>{k}</div>
                        <div className="font-display text-lg mt-1" style={{ color: colorSel.primary }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: '#faf6ef' }}>
                    <div className="font-semibold mb-2" style={{ color: '#1c2110' }}>Contenido del reporte</div>
                    <ul className="space-y-1" style={{ color: '#9a8f82' }}>
                      <li>• Resumen ejecutivo del período</li>
                      <li>• Indicadores clave de desempeño</li>
                      <li>• Tablas de detalle por {tipoSel?.label?.toLowerCase()}</li>
                      <li>• Gráficas comparativas</li>
                      {notas && <li>• Nota: {notas}</li>}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-3 rounded-xl text-sm font-medium border cursor-pointer hover:bg-black/5"
                  style={{ borderColor: '#e2d9cc', color: '#9a8f82' }}
                >
                  ← Editar
                </button>
                <button
                  type="button"
                  onClick={handleGenerar}
                  disabled={generando}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-opacity cursor-pointer"
                  style={{ backgroundColor: colorSel.primary, opacity: generando ? 0.7 : 1 }}
                >
                  {generando ? '⟳ Generando…' : 'Generar reporte PDF'}
                </button>
              </div>
            </div>
          )}

          {/* Success */}
          {generado && (
            <div className="bg-white rounded-2xl border p-10 text-center" style={{ borderColor: '#e2d9cc' }}>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
                style={{ backgroundColor: '#f0fdf4' }}
              >
                ✓
              </div>
              <h2 className="font-display text-2xl mb-2" style={{ color: '#1c2110' }}>Reporte generado</h2>
              <p className="text-sm mb-6" style={{ color: '#9a8f82' }}>
                Tu reporte está listo. Puedes descargarlo o compartirlo.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
                  style={{ backgroundColor: '#2e4829' }}
                >
                  Descargar PDF
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium border cursor-pointer hover:bg-black/5"
                  style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
                >
                  Nuevo reporte
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Historial */}
        <div>
          <h2 className="font-display text-xl mb-4" style={{ color: '#1c2110' }}>Reportes anteriores</h2>
          <div className="space-y-3">
            {reportesGenerados.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border overflow-hidden transition-shadow hover:shadow-sm"
                style={{ borderColor: '#e2d9cc' }}
              >
                <div className="h-1.5" style={{ backgroundColor: r.color }} />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <div className="font-semibold text-sm" style={{ color: '#1c2110' }}>{r.tipo}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#9a8f82' }}>{r.periodo}</div>
                    </div>
                    <span className="font-mono text-xs" style={{ color: '#9a8f82' }}>{r.id}</span>
                  </div>
                  <div className="text-xs mt-2" style={{ color: '#9a8f82' }}>
                    {r.generado} · {r.autor}
                  </div>
                  <button
                    type="button"
                    className="mt-3 text-xs font-semibold cursor-pointer"
                    style={{ color: r.color }}
                  >
                    Descargar →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
