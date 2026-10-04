export default function Badge({ children, bg = '#f5f5f5', color = '#555', size = 'xs' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${
        size === 'xs' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      }`}
      style={{ backgroundColor: bg, color }}
    >
      {children}
    </span>
  )
}
