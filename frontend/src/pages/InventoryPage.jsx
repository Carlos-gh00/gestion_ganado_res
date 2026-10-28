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

  // Modal registrar nuevo material / artículo
  const [showNewItemModal, setShowNewItemModal] = useState(false)
  const [itemSaving, setItemSaving] = useState(false)
  const [itemSuccess, setItemSuccess] = useState(false)
  const [itemError, setItemError] = useState('')
  const [newItemData, setNewItemData] = useState({
    nombre: '',
    categoria: 'alimento',
    stock: 0,
    unidad: 'kg',
    minimo: 10,
    costo: 0,
    proveedor: '',
    especificaciones: '',
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

  function openNewItemModal() {
    const activeCat = view === 'home' ? 'alimento' : view
    setItemError('')
    setItemSuccess(false)
    setNewItemData({
      nombre: '',
      categoria: activeCat,
      stock: 0,
      unidad: activeCat === 'medicamentos' ? 'dosis' : activeCat === 'alimento' ? 'kg' : 'pza',
      minimo: 10,
      costo: 0,
      proveedor: '',
      especificaciones: '',
    })
    setShowNewItemModal(true)
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

  async function handleCreateItem(e) {
    e.preventDefault()
    setItemSaving(true)
    setItemError('')
    try {
      const payload = {
        ...newItemData,
        stock: Number(newItemData.stock) || 0,
        minimo: Number(newItemData.minimo) || 0,
        costo: Number(newItemData.costo) || 0,
      }
      await inventoryService.createItem(payload)
      setItemSuccess(true)
      await loadData()
      setTimeout(() => {
        setItemSuccess(false)
        setShowNewItemModal(false)
      }, 1200)
    } catch (err) {
      setItemError(err.message || 'Error al crear el material / artículo')
    } finally {
      setItemSaving(false)
    }
  }

  async function handleDeleteItem(item, e) {
    if (e) e.stopPropagation()
    const confirmed = window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el material "${item.nombre}" (${item.id})?`)
    if (!confirmed) return

    try {
      await inventoryService.deleteItem(item.id)
      await loadData()
    } catch (err) {
      alert(err.message || 'Error al eliminar el material de inventario')
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
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={openNewItemModal}
                className="px-4 py-2 rounded-xl text-sm font-semibold border cursor-pointer hover:bg-white/80 transition-colors"
                style={{ borderColor: currentCat.color, color: currentCat.color, backgroundColor: currentCat.bg }}
              >
                + Nuevo Material / Artículo
              </button>
              <button
                onClick={openEntryModal}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
                style={{ backgroundColor: currentCat.color }}
              >
                + Registrar entrada
              </button>
            </div>
          </div>

          {/* Item Table */}
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#e2d9cc' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[760px]">
                <thead style={{ backgroundColor: '#faf6ef' }}>
                  <tr style={{ borderBottom: '1px solid #e2d9cc' }}>
                    {['ID', 'Producto / Material', 'Especificaciones', 'Stock', 'Estado', 'Proveedor', 'Costo/u', 'Acciones'].map((h) => (
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
                    const pct = Math.min((item.stock / (item.minimo * 2 || 1)) * 100, 100)
                    return (
                      <tr
                        key={item.id}
                        className="border-b hover:bg-[#faf8f4] transition-colors"
                        style={{ borderColor: '#f0ebe2' }}
                      >
                        <td className="px-4 py-3 font-mono text-xs" style={{ color: '#9a8f82' }}>{item.id}</td>
                        <td className="px-4 py-3 font-medium" style={{ color: '#1c2110' }}>{item.nombre}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: '#6b7280' }}>
                          {item.especificaciones ? (
                            <span className="inline-block px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                              {item.especificaciones}
                            </span>
                          ) : (
                            <span className="text-stone-400 italic">Sin especificar</span>
                          )}
                        </td>
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
                        <td className="px-4 py-3 text-xs" style={{ color: '#9a8f82' }}>{item.proveedor || '—'}</td>
                        <td className="px-4 py-3 font-mono text-xs" style={{ color: '#1c2110' }}>
                          ${item.costo.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => handleDeleteItem(item, e)}
                            title="Eliminar material"
                            className="p-1 rounded text-stone-400 hover:text-red-600 hover:bg-red-50 text-xs transition-colors cursor-pointer"
                          >
                            🗑️ Borrar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {currentCat.items.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-sm text-stone-500">
                        No hay materiales o artículos registrados en esta categoría.{' '}
                        <button onClick={openNewItemModal} className="font-semibold underline ml-1 cursor-pointer" style={{ color: currentCat.color }}>
                          Agregar el primero
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Home View — Category Cards */
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
            <div>
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
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={openNewItemModal}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#2e4829' }}
              >
                + Nuevo Material / Artículo
              </button>
              <button
                onClick={openEntryModal}
                className="px-4 py-2 rounded-xl text-sm font-semibold border cursor-pointer hover:bg-white/80 transition-colors"
                style={{ borderColor: '#2e4829', color: '#2e4829', backgroundColor: '#f4f8f3' }}
              >
                + Registrar entrada rápida
              </button>
            </div>
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

      {/* Modal Crear Nuevo Material / Artículo */}
      <Modal
        show={showNewItemModal}
        title="Dar de alta material o insumo"
        onClose={() => setShowNewItemModal(false)}
      >
        {itemSuccess ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">✓</div>
            <p className="font-display text-lg" style={{ color: '#3a7d44' }}>Material registrado exitosamente</p>
          </div>
        ) : (
          <form onSubmit={handleCreateItem} className="space-y-4">
            {itemError && (
              <div className="p-3 rounded-xl text-xs bg-red-50 text-red-700 border border-red-200">
                {itemError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                Nombre del Material / Producto *
              </label>
              <input
                type="text"
                value={newItemData.nombre}
                onChange={(e) => setNewItemData({ ...newItemData, nombre: e.target.value })}
                placeholder="Ej. Alambre de púas 400m, Pacas de alfalfa, Ivermectina..."
                required
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                  Categoría *
                </label>
                <select
                  value={newItemData.categoria}
                  onChange={(e) => setNewItemData({ ...newItemData, categoria: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-white"
                  style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
                >
                  <option value="sanidad">✚ Sanidad</option>
                  <option value="medicamentos">💊 Medicamentos</option>
                  <option value="alimento">🌾 Alimento</option>
                  <option value="infraestructura">🔧 Infraestructura</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                  Unidad de Medida *
                </label>
                <input
                  type="text"
                  value={newItemData.unidad}
                  onChange={(e) => setNewItemData({ ...newItemData, unidad: e.target.value })}
                  placeholder="kg, dosis, rollos, pza..."
                  required
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                Especificaciones a elección (Calibre, Medidas, Marca, Indicaciones)
              </label>
              <input
                type="text"
                value={newItemData.especificaciones}
                onChange={(e) => setNewItemData({ ...newItemData, especificaciones: e.target.value })}
                placeholder="Ej. Calibre 12.5 galvanizado, 25kg por saco, Laboratorio Bayer..."
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
              />
              <p className="text-xs text-stone-500 mt-1">
                Puedes detallar cualquier especificación técnica o cualidad elegida para este insumo.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                  Stock Inicial
                </label>
                <input
                  type="number"
                  value={newItemData.stock}
                  onChange={(e) => setNewItemData({ ...newItemData, stock: e.target.value })}
                  min="0"
                  step="any"
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                  Stock Mínimo
                </label>
                <input
                  type="number"
                  value={newItemData.minimo}
                  onChange={(e) => setNewItemData({ ...newItemData, minimo: e.target.value })}
                  min="0"
                  step="any"
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                  Costo Unitario ($)
                </label>
                <input
                  type="number"
                  value={newItemData.costo}
                  onChange={(e) => setNewItemData({ ...newItemData, costo: e.target.value })}
                  min="0"
                  step="any"
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                Proveedor (Opcional)
              </label>
              <input
                type="text"
                value={newItemData.proveedor}
                onChange={(e) => setNewItemData({ ...newItemData, proveedor: e.target.value })}
                placeholder="Ej. Distribuidora Agropecuaria del Norte"
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
              />
            </div>

            <button
              type="submit"
              disabled={itemSaving}
              className="w-full py-3 rounded-xl text-sm font-bold text-white cursor-pointer transition-opacity"
              style={{ backgroundColor: '#2e4829', opacity: itemSaving ? 0.7 : 1 }}
            >
              {itemSaving ? 'Guardando material…' : 'Guardar Material en Inventario'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  )
}
