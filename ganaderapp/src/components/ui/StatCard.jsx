export default function StatCard({ label, value, sub, trend, accent = '#2e4829', icon }) {
  return (
    <div
      className="bg-white rounded-xl p-5 border flex flex-col gap-3 transition-shadow hover:shadow-sm"
      style={{ borderColor: '#e2d9cc' }}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-widest" style={{ color: '#9a8f82' }}>
          {label}
        </span>
        {icon && (
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
            style={{ backgroundColor: accent + '18', color: accent }}
          >
            {icon}
          </span>
        )}
      </div>
      <div>
        <div className="font-display text-3xl leading-none" style={{ color: '#1c2110' }}>
          {value}
        </div>
        {sub && <div className="text-xs mt-1.5" style={{ color: '#9a8f82' }}>{sub}</div>}
      </div>
      {trend && (
        <div
          className="text-xs font-medium flex items-center gap-1"
          style={{ color: trend.up ? '#3a7d44' : '#b84040' }}
        >
          <span>{trend.up ? '↑' : '↓'}</span>
          {trend.value}
        </div>
      )}
    </div>
  )
}
