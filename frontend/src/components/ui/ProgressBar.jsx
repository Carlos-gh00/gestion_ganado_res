export default function ProgressBar({ value, color = '#3a7d44', height = 'h-1.5', trackColor = '#e2d9cc' }) {
  const percentage = Math.min(Math.max(value, 0), 100)
  return (
    <div className={`rounded-full w-full overflow-hidden ${height}`} style={{ backgroundColor: trackColor }}>
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  )
}
