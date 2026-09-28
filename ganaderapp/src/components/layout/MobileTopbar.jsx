export default function MobileTopbar({ user, onToggleSidebar }) {
  return (
    <header
      className="md:hidden flex items-center justify-between px-4 py-3 border-b shrink-0"
      style={{ backgroundColor: '#1c2b1a', borderColor: '#2e4829' }}
    >
      <button
        onClick={onToggleSidebar}
        className="text-white text-xl px-1 cursor-pointer"
        aria-label="Abrir menú"
      >
        ☰
      </button>
      <span className="font-display text-white text-base">GanaderAPP</span>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white select-none"
        style={{ backgroundColor: '#b87333' }}
      >
        {user?.avatar || 'U'}
      </div>
    </header>
  )
}
