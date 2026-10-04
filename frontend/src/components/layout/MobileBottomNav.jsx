export default function MobileBottomNav({ currentPage, navItems, onNavigate }) {
  return (
    <nav
      className="md:hidden flex border-t shrink-0"
      style={{ backgroundColor: '#1c2b1a', borderColor: '#2e4829' }}
    >
      {navItems.slice(0, 5).map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all cursor-pointer"
          style={{ color: currentPage === item.id ? '#d4f0cc' : '#6a9966' }}
        >
          <span className="text-base">{item.icon}</span>
          <span className="text-[10px] font-medium">{item.mobileLabel}</span>
        </button>
      ))}
    </nav>
  )
}
