import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { ROL_LABELS, ROL_COLORS, ROL_PERMISOS, ROLES_LIST } from '../utils/constants'
import Modal from '../components/ui/Modal'

export default function AdminPage() {
  const { users, addUser, toggleUser, sendCredentials } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [createdResult, setCreatedResult] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sendByEmail, setSendByEmail] = useState(true)

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'encargado_area',
    area: '',
  })

  function generateRandomPassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
    let pwd = 'G-'
    for (let i = 0; i < 6; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setForm((prev) => ({ ...prev, password: pwd }))
  }

  async function handleAdd(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const finalPassword = form.password || `G-${Math.floor(1000 + Math.random() * 9000)}`
      const payload = { ...form, password: finalPassword }
      const res = await addUser(payload)

      setCreatedResult({
        nombre: `${form.nombre} ${form.apellido}`.trim(),
        email: form.email.trim(),
        password: finalPassword,
        rol: form.rol,
        area: form.area,
        credentialsDelivery: res?.credentialsDelivery || null,
        backendNotified: res?.credentialsDelivery?.backendNotified,
        mailtoUrl: res?.credentialsDelivery?.mailtoUrl,
      })
    } catch (err) {
      console.error('Error al dar de alta:', err)
    } finally {
      setSubmitting(false)
    }
  }

  function handleCloseModal() {
    setShowModal(false)
    setCreatedResult(null)
    setCopied(false)
    setShowPassword(false)
    setForm({ nombre: '', apellido: '', email: '', password: '', rol: 'encargado_area', area: '' })
  }

  function handleCopyCredentials() {
    if (!createdResult) return
    const text = `Credenciales de acceso a GanaderAPP:\nUsuario / Correo: ${createdResult.email}\nContraseña: ${createdResult.password}\nRol: ${ROL_LABELS[createdResult.rol] || createdResult.rol}\nAcceso: ${window.location.origin}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
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
          onClick={() => {
            setCreatedResult(null)
            setShowModal(true)
          }}
          className="px-4 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#2e4829' }}
        >
          + Dar de alta usuario
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
          className="px-5 py-4 border-b flex items-center justify-between"
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

      {/* Modal Nuevo Usuario */}
      <Modal show={showModal} title={createdResult ? 'Usuario registrado' : 'Dar de alta nuevo usuario'} onClose={handleCloseModal}>
        {createdResult ? (
          <div className="py-2 space-y-4">
            <div className="text-center py-3">
              <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-2xl text-white mb-2" style={{ backgroundColor: '#2e4829' }}>
                ✓
              </div>
              <h3 className="font-display text-2xl" style={{ color: '#1c2110' }}>Usuario registrado</h3>
              <p className="text-xs mt-1" style={{ color: '#7a7065' }}>
                Se ha generado y enviado el acceso para <strong>{createdResult.nombre}</strong>
              </p>
            </div>

            {/* Credenciales Card */}
            <div className="rounded-2xl p-4 border" style={{ backgroundColor: '#faf6ef', borderColor: '#e2d9cc' }}>
              <div className="flex items-center justify-between mb-3 border-b pb-2" style={{ borderColor: '#e8e0d4' }}>
                {createdResult.backendNotified ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-[#e6f4ea] text-[#137333]">
                    ✓ Enviado por Gmail
                  </span>
                ) : (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-[#fef3c7] text-[#92400e]" title={createdResult.credentialsDelivery?.message || 'Revisa la configuración de Gmail en .env'}>
                    ⚠️ Credenciales listas (Gmail pendiente en .env)
                  </span>
                )}
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9a8f82]">Correo:</span>
                  <span className="font-mono font-medium text-[#1c2110] select-all">{createdResult.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9a8f82]">Contraseña:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-[#2e4829] select-all bg-white px-2 py-0.5 rounded border border-[#e2d9cc]">
                      {showPassword ? createdResult.password : '••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs text-[#7a7065] hover:text-[#1c2110] cursor-pointer"
                      title={showPassword ? 'Ocultar' : 'Mostrar'}
                    >
                      {showPassword ? '👁️‍🗨️' : '👁️'}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9a8f82]">Rol:</span>
                  <span className="text-xs font-medium text-[#1c2110]">
                    {ROL_LABELS[createdResult.rol] || createdResult.rol}
                    {createdResult.area ? ` (${createdResult.area})` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Botones de acción para las credenciales */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="w-full py-2.5 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                style={{
                  backgroundColor: copied ? '#f0fdf4' : '#fff',
                  borderColor: copied ? '#86efac' : '#e2d9cc',
                  color: copied ? '#15803d' : '#1c2110',
                }}
              >
                {copied ? '✓ ¡Credenciales copiadas al portapapeles!' : '📋 Copiar mensaje con correo y contraseña'}
              </button>

              {createdResult.mailtoUrl && (
                <a
                  href={createdResult.mailtoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors bg-white hover:bg-[#faf6ef] text-[#2e4829]"
                  style={{ borderColor: '#2e4829' }}
                >
                  ✉️ Abrir en cliente de correo (enviar por email)
                </a>
              )}

              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer hover:opacity-90"
                style={{ backgroundColor: '#2e4829' }}
              >
                Listo
              </button>
            </div>
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
                placeholder="usuario@estancia.com"
                required
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: '#9a8f82' }}>
                  Contraseña inicial
                </label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-xs font-medium text-[#2e4829] hover:underline cursor-pointer"
                >
                  ⚡ Generar segura
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2.5 pr-10 rounded-xl border text-sm outline-none font-mono"
                  style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-xs text-[#9a8f82] hover:text-[#1c2110] cursor-pointer"
                >
                  {showPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9a8f82' }}>
                Rol del colaborador
              </label>
              <select
                value={form.rol}
                onChange={(e) => setForm({ ...form, rol: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-white"
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
                  placeholder="Ej. Potrero Norte / Acostadero A"
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#e2d9cc', color: '#1c2110' }}
                />
              </div>
            )}

            {/* Notificación de envío de correo */}
            <div className="rounded-xl p-3 border flex items-start gap-2.5" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
              <span className="text-base">✉️</span>
              <div className="text-xs text-[#166534] leading-relaxed">
                <strong>Envío de credenciales:</strong> Al dar de alta el perfil, se generará la función para mandar el correo y la contraseña directamente al usuario.
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl text-sm font-bold text-white cursor-pointer hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#2e4829', opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? 'Creando y enviando credenciales…' : 'Crear perfil y enviar correo y contraseña'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  )
}
