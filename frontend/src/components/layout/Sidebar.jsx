import { ROL_LABELS, ROL_COLORS } from '../../utils/constants'

export default function Sidebar({ currentPage, navItems, user, onNavigate, onLogout }) {
  const roleColor = ROL_COLORS[user?.rol] || { bg: '#eef6ee', text: '#2e6620' }

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0" style={{ backgroundColor: '#1c2b1a' }}>
      {/* Logo */}
      <div className="px-6 py-6 border-b" style={{ borderColor: '#2e4829' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg select-none"
            style={{ backgroundColor: '#b87333' }}
          >
            🐄
          </div>
          <div>
            <div className="font-display text-white text-lg leading-tight">GanaderAPP</div>
            <div className="text-xs" style={{ color: '#7aa870' }}>Sistema Administrativo</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer text-left"
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

      {/* User footer */}
      <div className="px-4 py-4 border-t" style={{ borderColor: '#2e4829' }}>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 select-none"
            style={{ backgroundColor: '#b87333' }}
          >
            {user?.avatar || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              {user?.nombre} {user?.apellido}
            </div>
            <span
              className="text-[11px] px-1.5 py-0.5 rounded-full font-medium inline-block mt-0.5"
              style={{ backgroundColor: roleColor.bg, color: roleColor.text }}
            >
              {ROL_LABELS[user?.rol]}
            </span>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full text-xs py-2 rounded-lg transition-colors text-center font-medium cursor-pointer hover:opacity-90"
          style={{ backgroundColor: '#2e4829', color: '#8fb88a' }}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
