import { useState, useEffect, useMemo } from 'react'
import { inventoryService, getItemStatus } from '../services/inventoryService'
import Modal from '../components/ui/Modal'

export default function InventoryPage() {
  const [view, setView] = useState('home') // 'home' | 'sanidad' | 'medicamentos' | 'alimento' | 'infraestructura'
  const [categorias, setCategorias] = useState({})
  const [allItems, setAllItems] = useState([])

  // Modal registrar entrada
  const [showModal, setShowModal] = useState(false)
  const [entrySaving, setEntrySaving] = useState(false)
  const [entrySuccess, setEntrySuccess] = useState(false)
  const [entryData, setEntryData] = useState({
    catKey: 'alimento',
    itemId: '',
    cantidad: 100,
  })

  async function loadData() {
    const [catsRes, itemsRes] = await Promise.all([
      inventoryService.getCategorias(),
      inventoryService.getAllItems(),
    ])
    setCategorias(catsRes)
    setAllItems(itemsRes)
  }

  useEffect(() => {
    loadData()
  }, [])

  const currentCat = useMemo(() => {
    if (view === 'home') return null
    return categorias[view]
  }, [view, categorias])

  const totalBajos = useMemo(() => {
    return allItems.filter((i) => i.stock < i.minimo).length
  }, [allItems])

  function openEntryModal() {
    const activeCat = view === 'home' ? 'alimento' : view
    const currentItems = categorias[activeCat]?.items || []
    setEntryData({
      catKey: activeCat,
      itemId: currentItems[0]?.id || '',
      cantidad: 100,
    })
    setShowModal(true)
  }

  async function handleRegistrarEntrada(e) {
    e.preventDefault()
    setEntrySaving(true)
    try {
      await inventoryService.registrarEntrada(entryData.catKey, entryData.itemId, entryData.cantidad)
      setEntrySuccess(true)
      await loadData()
      setTimeout(() => {
        setEntrySuccess(false)
        setShowModal(false)
      }, 1200)
    } finally {
      setEntrySaving(false)
    }
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-7xl mx-auto">
      {/* Category Detail View */}
      {view !== 'home' && currentCat ? (
        <div>
          <div className="flex items-center gap-3 mb-7">
            <button
              onClick={() => setView('home')}
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70 cursor-pointer"
              style={{ color: '#9a8f82' }}
            >
              ← Inventario
            </button>
            <span style={{ color: '#e2d9cc' }}>/</span>
            <span className="text-sm font-semibold" style={{ color: '#1c2110' }}>{currentCat.title}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl select-none"
                  style={{ backgroundColor: currentCat.bg, color: currentCat.color }}
                >
                  {currentCat.icon}
                </span>
                <h1 className="font-display text-3xl" style={{ color: '#1c2110' }}>{currentCat.title}</h1>
              </div>
              <p className="text-sm mt-1 ml-13" style={{ color: '#9a8f82' }}>
                {currentCat.items.length} productos
                {currentCat.items.filter((i) => i.stock < i.minimo).length > 0 && (
                  <span
                    className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: '#fef2f2', color: '#b84040' }}
                  >
                    {currentCat.items.filter((i) => i.stock < i.minimo).length} bajo stock
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={openEntryModal}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90"
              style={{ backgroundColor: currentCat.color }}
            >
              + Registrar entrada
            </button>
          </div>

          {/* Item Table */}
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#e2d9cc' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[660px]">
                <thead style={{ backgroundColor: '#faf6ef' }}>
                  <tr style={{ borderBottom: '1px solid #e2d9cc' }}>
                    {['ID', 'Producto', 'Stock', 'Estado', 'Proveedor', 'Último ingreso', 'Costo/u'].map((h) => (
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
                  {currentCat.items.map((item) => {
                    const st = getItemStatus(item.stock, item.minimo)
                    const pct = Math.min((item.stock / (item.minimo * 2)) * 100, 100)
                    return (
                      <tr
                        key={item.id}
                        className="border-b hover:bg-[#faf8f4] transition-colors"
                        style={{ borderColor: '#f0ebe2' }}
                      >
                        <td className="px-4 py-3 font-mono text-xs" style={{ color: '#9a8f82' }}>{item.id}</td>
                        <td className="px-4 py-3 font-medium" style={{ color: '#1c2110' }}>{item.nombre}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-14 h-1.5 rounded-full" style={{ backgroundColor: '#f0ebe2' }}>
                              <div
                                className="h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${pct}%`, backgroundColor: st.bar }}
                              />
                            </div>
                            <span className="font-mono text-xs whitespace-nowrap" style={{ color: '#1c2110' }}>
                              {item.stock.toLocaleString()} {item.unidad}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ backgroundColor: st.bg, color: st.text }}
                          >
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: '#9a8f82' }}>{item.proveedor}</td>
                        <td className="px-4 py-3 font-mono text-xs" style={{ color: '#9a8f82' }}>{item.ultimo}</td>
                        <td className="px-4 py-3 font-mono text-xs" style={{ color: '#1c2110' }}>
                          ${item.costo.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Home View — Category Cards */
        <div>
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl" style={{ color: '#1c2110' }}>Inventario</h1>
            <p className="text-sm mt-1" style={{ color: '#9a8f82' }}>
              {allItems.length} productos registrados
              {totalBajos > 0 && (
                <span
                  className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: '#fef2f2', color: '#b84040' }}
                >
                  {totalBajos} con stock bajo
                </span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            {Object.entries(categorias).map(([key, cat]) => {
              const bajos = cat.items.filter((i) => i.stock < i.minimo).length
              const criticos = cat.items.filter((i) => i.stock < i.minimo * 0.5).length

              return (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  className="bg-white rounded-2xl border p-6 text-left transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 group cursor-pointer"
                  style={{ borderColor: bajos > 0 ? cat.color + '60' : '#e2d9cc' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl select-none"
                      style={{ backgroundColor: cat.bg }}
                    >
                      {cat.icon}
                    </div>
                    {criticos > 0 && (
                      <span
                        className="text-xs px-2 py-1 rounded-full font-bold"
                        style={{ backgroundColor: '#fef2f2', color: '#b84040' }}
                      >
                        ⚠ {criticos}
                      </span>
                    )}
                  </div>
                  <h2 className="font-display text-xl mb-1" style={{ color: '#1c2110' }}>{cat.title}</h2>
                  <p className="text-sm mb-4" style={{ color: '#9a8f82' }}>{cat.items.length} productos</p>
                  <div className="flex items-center justify-between">
                    <div>
                      {bajos > 0 ? (
                        <span className="text-xs font-semibold" style={{ color: cat.color }}>
                          {bajos} bajo stock
                        </span>
                      ) : (
                        <span className="text-xs font-semibold" style={{ color: '#3a7d44' }}>
                          Todo en orden
                        </span>
                      )}
                    </div>
                    <span
                      className="text-sm font-bold group-hover:translate-x-1 transition-transform inline-block"
                      style={{ color: cat.color }}
                    >
                      →
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Resumen crítico */}
          <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#e2d9cc' }}>
            <h2 className="font-display text-xl mb-4" style={{ color: '#1c2110' }}>
              Productos en estado crítico o bajo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allItems
                .filter((i) => i.stock < i.minimo)
                .map((item) => {
                  const st = getItemStatus(item.stock, item.minimo)
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl border"
                      style={{ borderColor: '#f0ebe2' }}
                    >
                      <div>
                        <div className="text-sm font-medium" style={{ color: '#1c2110' }}>{item.nombre}</div>
                        <div className="text-xs font-mono mt-0.5" style={{ color: st.text }}>
                          {item.stock.toLocaleString()} {item.unidad} · mín {item.minimo.toLocaleString()}
                        </div>
                      </div>
                      <span
                        className="px-2 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: st.bg, color: st.text }}
                      >
                        {st.label}
                      </span>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      )}

      {/* Modal Registrar Entrada */}
      <Modal show={showModal} title="Registrar ingreso de inventario" onClose={() => setShowModal(false)}>
        {entrySuccess ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">✓</div>
            <p className="font-display text-lg" style={{ color: '#3a7d44' }}>Stock actualizado exitosamente</p>
          </div>
        ) : (
          <form onSubmit={handleRegistrarEntrada} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                Categoría
              </label>
              <select
                value={entryData.catKey}
                onChange={(e) => {
                  const key = e.target.value
                  const firstItem = categorias[key]?.items[0]?.id || ''
                  setEntryData({ ...entryData, catKey: key, itemId: firstItem })
                }}
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
              >
                {Object.entries(categorias).map(([k, cat]) => (
                  <option key={k} value={k}>{cat.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                Producto
              </label>
              <select
                value={entryData.itemId}
                onChange={(e) => setEntryData({ ...entryData, itemId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
              >
                {(categorias[entryData.catKey]?.items || []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre} (Stock actual: {item.stock} {item.unidad})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                Cantidad que ingresa
              </label>
              <input
                type="number"
                value={entryData.cantidad}
                onChange={(e) => setEntryData({ ...entryData, cantidad: Number(e.target.value) })}
                min="1"
                required
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
              />
            </div>

            <button
              type="submit"
              disabled={entrySaving}
              className="w-full py-3 rounded-xl text-sm font-bold text-white cursor-pointer transition-opacity"
              style={{ backgroundColor: '#2e4829', opacity: entrySaving ? 0.7 : 1 }}
            >
              {entrySaving ? 'Actualizando…' : 'Registrar ingreso'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  )
}
