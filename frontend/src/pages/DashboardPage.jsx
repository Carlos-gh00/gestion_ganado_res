import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { dashboardService } from '../services/dashboardService'

const estadoAcostadero = {
  Normal:        { dot: '#3a7d44', text: '#3a7d44', bg: '#f0fdf4' },
  Lleno:         { dot: '#c9882a', text: '#c9882a', bg: '#fffbeb' },
  Sobrecargado:  { dot: '#b84040', text: '#b84040', bg: '#fef2f2' },
  Disponible:    { dot: '#9a8f82', text: '#9a8f82', bg: '#f5f5f5' },
}

const alertColor = {
  danger:  { bg: '#fef2f2', border: '#fecaca', dot: '#b84040' },
  warning: { bg: '#fffbeb', border: '#fde68a', dot: '#c9882a' },
  success: { bg: '#f0fdf4', border: '#bbf7d0', dot: '#3a7d44' },
}

const tipoColor = {
  Ingreso:     { bg: '#eef6ee', text: '#2e6620' },
  Traslado:    { bg: '#e8f0ff', text: '#2040a0' },
  Salida:      { bg: '#f5f5f5', text: '#555' },
  Tratamiento: { bg: '#fef2f2', text: '#b84040' },
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [kpis, setKpis] = useState([])
  const [acostaderos, setAcostaderos] = useState([])
  const [alertas, setAlertas] = useState([])
  const [movimientos, setMovimientos] = useState([])
  const [inventarioCritico, setInventarioCritico] = useState([])
  const [climaData, setClimaData] = useState(null)
  const [refreshingClima, setRefreshingClima] = useState(false)

  async function loadClima() {
    try {
      const cliRes = await dashboardService.getClima()
      setClimaData(cliRes)
    } catch (err) {
      console.error('Error cargando clima:', err)
    }
  }

  async function reloadClima() {
    setRefreshingClima(true)
    try {
      await loadClima()
    } finally {
      setTimeout(() => setRefreshingClima(false), 400)
    }
  }

  useEffect(() => {
    Promise.all([
      dashboardService.getKPIs(),
      dashboardService.getAcostaderosResumen(),
      dashboardService.getAlertas(),
      dashboardService.getMovimientos(),
      dashboardService.getInventarioCritico(),
      dashboardService.getClima(),
    ]).then(([kpiRes, acRes, alRes, movRes, invRes, cliRes]) => {
      setKpis(kpiRes)
      setAcostaderos(acRes)
      setAlertas(alRes)
      setMovimientos(movRes)
      setInventarioCritico(invRes)
      setClimaData(cliRes)
    })
  }, [])

  const currentDateFormatted = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl capitalize" style={{ color: '#1c2110' }}>
          Buen día, {user?.nombre} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: '#9a8f82' }}>
          Estancia El Ceibo · {currentDateFormatted}
        </p>
      </div>

      {/* Fila 1 — KPIs principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="bg-white rounded-2xl border p-5 flex flex-col gap-3 transition-shadow hover:shadow-sm"
            style={{ borderColor: '#e2d9cc' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9a8f82' }}>
                {k.label}
              </span>
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                style={{ backgroundColor: k.color + '18', color: k.color }}
              >
                {k.icon}
              </span>
            </div>
            <div>
              <div className="font-display text-3xl leading-none" style={{ color: '#1c2110' }}>
                {k.value}
              </div>
              <div className="text-xs mt-1.5" style={{ color: '#9a8f82' }}>
                {k.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fila 2 — Acostaderos + Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
        {/* Acostaderos */}
        <div className="lg:col-span-3 bg-white rounded-2xl border p-5" style={{ borderColor: '#e2d9cc' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl" style={{ color: '#1c2110' }}>Estado de Acostaderos</h2>
            <span className="text-xs font-mono" style={{ color: '#9a8f82' }}>815 / 1,000 ocupados</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {acostaderos.map((a) => {
              const pct = Math.min((a.animales / a.capacidad) * 100, 100)
              const ec = estadoAcostadero[a.estado] || { dot: '#9a8f82', text: '#9a8f82', bg: '#f5f5f5' }
              return (
                <div
                  key={a.nombre}
                  className="rounded-xl p-4 border"
                  style={{ borderColor: '#f0ebe2', backgroundColor: ec.bg }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold" style={{ color: '#1c2110' }}>{a.nombre}</span>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ec.dot }} />
                  </div>
                  <div className="font-display text-2xl mb-1" style={{ color: '#1c2110' }}>{a.animales}</div>
                  <div className="h-1.5 rounded-full mb-1" style={{ backgroundColor: '#e2d9cc' }}>
                    <div
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, backgroundColor: ec.dot }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: ec.text }}>{a.estado}</span>
                    <span className="text-xs font-mono" style={{ color: '#9a8f82' }}>{a.capacidad} cap.</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Alertas */}
        <div className="lg:col-span-2 bg-white rounded-2xl border p-5" style={{ borderColor: '#e2d9cc' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl" style={{ color: '#1c2110' }}>Alertas</h2>
            <span
              className="text-xs px-2 py-1 rounded-full font-semibold"
              style={{ backgroundColor: '#fef2f2', color: '#b84040' }}
            >
              {alertas.length} activas
            </span>
          </div>
          <div className="space-y-2.5">
            {alertas.map((a, i) => {
              const c = alertColor[a.tipo] || alertColor.warning
              return (
                <div
                  key={i}
                  className="flex gap-3 rounded-xl p-3 border"
                  style={{ backgroundColor: c.bg, borderColor: c.border }}
                >
                  <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: c.dot }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-snug" style={{ color: '#1c2110' }}>{a.msg}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9a8f82' }}>Hace {a.tiempo}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Fila 3 — Movimientos + Inventario crítico + Clima */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Movimientos del día */}
        <div className="lg:col-span-2 bg-white rounded-2xl border p-5" style={{ borderColor: '#e2d9cc' }}>
          <h2 className="font-display text-xl mb-4" style={{ color: '#1c2110' }}>Movimientos del día</h2>
          <div className="space-y-2">
            {movimientos.map((m) => {
              const tc = tipoColor[m.tipo] || { bg: '#f5f5f5', text: '#555' }
              return (
                <div key={m.id} className="flex items-center gap-3 py-2.5 border-b" style={{ borderColor: '#f0ebe2' }}>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-semibold shrink-0"
                    style={{ backgroundColor: tc.bg, color: tc.text }}
                  >
                    {m.tipo}
                  </span>
                  <span className="flex-1 text-sm" style={{ color: '#1c2110' }}>{m.desc}</span>
                  <span className="text-xs font-mono shrink-0" style={{ color: '#9a8f82' }}>{m.hora}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Inventario crítico + Clima */}
        <div className="flex flex-col gap-4">
          {/* Inventario crítico */}
          <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#e2d9cc' }}>
            <h2 className="font-display text-lg mb-3" style={{ color: '#1c2110' }}>Inventario Crítico</h2>
            <div className="space-y-3">
              {inventarioCritico.map((inv) => (
                <div key={inv.nombre} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium" style={{ color: '#1c2110' }}>{inv.nombre}</div>
                    <div
                      className="text-xs font-mono"
                      style={{ color: inv.critico ? '#b84040' : '#c9882a' }}
                    >
                      {inv.stock.toLocaleString()} {inv.unidad}
                    </div>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full font-semibold"
                    style={{
                      backgroundColor: inv.critico ? '#fef2f2' : '#fffbeb',
                      color: inv.critico ? '#b84040' : '#c9882a'
                    }}
                  >
                    {inv.critico ? 'Crítico' : 'Bajo'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Condiciones del día (Google Clima / En vivo) */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: '#2e4829' }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg text-white">Condiciones del día</h2>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Datos en vivo" />
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#8fb88a' }}>
                  📍 {climaData?.ubicacion || 'Estancia El Ceibo'} · {climaData?.condicion || 'Cielo despejado'}
                </div>
              </div>
              <button
                type="button"
                onClick={reloadClima}
                disabled={refreshingClima}
                title="Actualizar datos del día"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs text-white bg-[#3a5e35] hover:bg-[#466e40] transition-colors cursor-pointer"
              >
                <span className={refreshingClima ? 'animate-spin inline-block' : ''}>🔄</span>
              </button>
            </div>

            {/* Banner resumen del clima actual */}
            <div className="flex items-center justify-between p-2.5 rounded-xl mb-3 border border-[#3f653a] bg-[#243c20]/80">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{climaData?.icon || '🌤️'}</span>
                <div>
                  <div className="text-white font-bold text-base leading-tight">
                    {climaData?.temperatura || '24 °C'}
                  </div>
                  <div className="text-[11px]" style={{ color: '#a2caa0' }}>
                    {climaData?.maxMin || 'Máx: 28°C · Mín: 15°C'}
                  </div>
                </div>
              </div>

              {climaData?.googleUrl && (
                <a
                  href={climaData.googleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-[#c8e6c9] hover:text-white px-2.5 py-1 rounded-lg bg-[#33532f] hover:bg-[#3d6538] transition-colors flex items-center gap-1"
                >
                  <span>Google Clima</span> ↗
                </a>
              )}
            </div>

            {/* Grid con métricas del día */}
            <div className="grid grid-cols-2 gap-2.5">
              {(climaData?.items || []).map((c) => (
                <div key={c.label} className="rounded-xl p-2.5" style={{ backgroundColor: '#3a5e35' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: '#a2caa0' }}>{c.label}</span>
                    <span className="text-sm">{c.icon}</span>
                  </div>
                  <div className="text-white font-semibold text-sm leading-tight">{c.value}</div>
                  {c.sub && (
                    <div className="text-[10px] mt-0.5 truncate" style={{ color: '#8fb88a' }}>
                      {c.sub}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {climaData?.actualizadoA && (
              <div className="text-[10px] text-right mt-3" style={{ color: '#7ea87a' }}>
                Sincronizado a las {climaData.actualizadoA}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
