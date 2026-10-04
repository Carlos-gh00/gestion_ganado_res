export default function Modal({ show, title, onClose, children }) {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Content Card */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-7 z-10"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl" style={{ color: '#1c2110' }}>{title}</h2>
            <button
              onClick={onClose}
              className="text-xl leading-none p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
              style={{ color: '#9a8f82' }}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
