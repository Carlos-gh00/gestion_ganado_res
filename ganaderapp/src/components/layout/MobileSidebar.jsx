import { ROL_LABELS, ROL_COLORS } from '../../utils/constants'

export default function MobileSidebar({ isOpen, currentPage, navItems, user, onClose, onNavigate, onLogout }) {
  if (!isOpen) return null

  const roleColor = ROL_COLORS[user?.rol] || { bg: '#eef6ee', text: '#2e6620' }

  return (
    <div className="md:hidden fixed inset-0 z-40 flex" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <aside
        className="relative z-50 w-64 flex flex-col h-full"
        style={{ backgroundColor: '#1c2b1a' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: '#2e4829' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{ backgroundColor: '#b87333' }}>
              🐄
            </div>
            <span className="font-display text-white text-lg">GanaderAPP</span>
          </div>
          <button onClick={onClose} className="text-white/60 text-xl cursor-pointer p-1">
            ✕
          </button>
        </div>

        {/* User info mobile */}
        <div className="px-5 py-4 border-b" style={{ borderColor: '#2e4829' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ backgroundColor: '#b87333' }}
            >
              {user?.avatar || 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">
                {user?.nombre} {user?.apellido}
              </div>
              <span
                class="text-xs px-1.5 py-0.5 rounded-full font-medium inline-block mt-0.5"
                style={{ backgroundColor: roleColor.bg, color: roleColor.text }}
              >
                {ROL_LABELS[user?.rol]}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id)
                onClose()
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left cursor-pointer"
              style={{
                backgroundColor: currentPage === item.id ? '#2e4829' : 'transparent',
                color: currentPage === item.id ? '#d4f0cc' : '#8fb88a',
                fontWeight: currentPage === item.id ? 600 : 400,
              }}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t" style={{ borderColor: '#2e4829' }}>
          <button
            onClick={onLogout}
            className="w-full text-xs py-2 rounded-lg text-center font-medium cursor-pointer"
            style={{ backgroundColor: '#2e4829', color: '#8fb88a' }}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
    </div>
  )
}
