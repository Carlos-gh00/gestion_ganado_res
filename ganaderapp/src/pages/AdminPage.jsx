import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { ROL_LABELS, ROL_COLORS, ROL_PERMISOS, ROLES_LIST } from '../utils/constants'
import Modal from '../components/ui/Modal'

export default function AdminPage() {
  const { users, addUser, toggleUser } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'encargado_area',
    area: '',
  })

  async function handleAdd(e) {
    e.preventDefault()
    await addUser({ ...form })
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setShowModal(false)
      setForm({ nombre: '', apellido: '', email: '', password: '', rol: 'encargado_area', area: '' })
    }, 1200)
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl" style={{ color: '#1c2110' }}>Administración</h1>
          <p className="text-sm mt-1" style={{ color: '#9a8f82' }}>Gestión de usuarios y permisos del sistema</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 cursor-pointer hover:opacity-90"
          style={{ backgroundColor: '#2e4829' }}
        >
          + Dar de alta perfil
        </button>
      </div>

      {/* Roles & Permisos info */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {Object.entries(ROL_PERMISOS).map(([rol, permisos]) => {
          const rc = ROL_COLORS[rol] || { bg: '#f5f5f5', text: '#555' }
          const count = users.filter((u) => u.rol === rol && u.activo).length
          return (
            <div
              key={rol}
              className="bg-white rounded-2xl border p-5 transition-shadow hover:shadow-sm"
              style={{ borderColor: '#e2d9cc' }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ backgroundColor: rc.bg, color: rc.text }}
                >
                  {ROL_LABELS[rol]}
                </span>
                <span className="font-display text-2xl" style={{ color: '#1c2110' }}>
                  {count}
                </span>
              </div>
              <ul className="space-y-1">
                {permisos.map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-2 text-xs"
                    style={{ color: '#9a8f82' }}
                  >
                    <span style={{ color: '#3a7d44' }}>✓</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#e2d9cc' }}>
        <div
          class="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: '#f0ebe2', backgroundColor: '#faf6ef' }}
        >
          <h2 className="font-display text-xl" style={{ color: '#1c2110' }}>Perfiles registrados</h2>
          <span className="font-mono text-sm" style={{ color: '#9a8f82' }}>{users.length} usuarios</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead style={{ backgroundColor: '#faf6ef' }}>
              <tr style={{ borderBottom: '1px solid #e2d9cc' }}>
                {['Usuario', 'Correo', 'Rol', 'Área', 'Estado', 'Acciones'].map((h) => (
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
              {users.map((u) => {
                const rc = ROL_COLORS[u.rol] || { bg: '#f5f5f5', text: '#555' }
                return (
                  <tr
                    key={u.id}
                    className="border-b transition-colors hover:bg-[#faf8f4]"
                    style={{ borderColor: '#f0ebe2', opacity: u.activo ? 1 : 0.5 }}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 select-none"
                          style={{ backgroundColor: u.activo ? '#2e4829' : '#9a8f82' }}
                        >
                          {u.avatar}
                        </div>
                        <span className="font-medium" style={{ color: '#1c2110' }}>
                          {u.nombre} {u.apellido}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: '#9a8f82' }}>{u.email}</td>
                    <td className="px-5 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: rc.bg, color: rc.text }}
                      >
                        {ROL_LABELS[u.rol]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: '#9a8f82' }}>{u.area ?? '—'}</td>
                    <td className="px-5 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: u.activo ? '#f0fdf4' : '#f5f5f5',
                          color: u.activo ? '#3a7d44' : '#9a8f82',
                        }}
                      >
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        onClick={() => toggleUser(u.id)}
                        className="text-xs font-semibold transition-opacity hover:opacity-70 cursor-pointer"
                        style={{ color: u.activo ? '#b84040' : '#3a7d44' }}
                      >
                        {u.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo Perfil */}
      <Modal show={showModal} title="Nuevo perfil" onClose={() => setShowModal(false)}>
        {saved ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">✓</div>
            <p className="font-display text-xl" style={{ color: '#3a7d44' }}>Perfil creado exitosamente</p>
          </div>
        ) : (
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                  Nombre
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Juan"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                  Apellido
                </label>
                <input
                  type="text"
                  value={form.apellido}
                  onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                  placeholder="García"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="usuario@ceibo.com"
                required
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                Contraseña inicial
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                Rol
              </label>
              <select
                value={form.rol}
                onChange={(e) => setForm({ ...form, rol: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
              >
                {ROLES_LIST.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {form.rol === 'encargado_area' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                  Área asignada
                </label>
                <input
                  type="text"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  placeholder="Ej. Acostadero A"
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
                />
              </div>
            )}

            {/* Permissions preview */}
            <div className="rounded-xl p-4" style={{ backgroundColor: '#f7f2ea' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#9a8f82' }}>
                Permisos de este rol
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(ROL_PERMISOS[form.rol] || []).map((p) => (
                  <span
                    key={p}
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: '#fff', color: '#2e4829', border: '1px solid #e2d9cc' }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-bold text-white cursor-pointer hover:opacity-90"
              style={{ backgroundColor: '#2e4829' }}
            >
              Crear perfil
            </button>
          </form>
        )}
      </Modal>
    </div>
  )
}
