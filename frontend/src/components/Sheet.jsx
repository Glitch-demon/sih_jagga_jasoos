import { X } from 'lucide-react'

/** Accessible bottom sheet used for SOS + accessibility panels. */
export default function Sheet({ open, onClose, title, children, tone = 'brand' }) {
  if (!open) return null
  const head =
    tone === 'danger' ? 'bg-danger text-white' : 'bg-brand-600 text-white'

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]"
      />
      <div className="relative animate-rise rounded-t-3xl bg-white pb-6 shadow-2xl">
        <div className={`flex items-center justify-between rounded-t-3xl px-5 py-4 ${head}`}>
          <h2 className="text-[19px] font-extrabold">{title}</h2>
          <button onClick={onClose} className="tap rounded-full p-1.5 hover:bg-white/20" aria-label="Close">
            <X size={22} strokeWidth={2.6} />
          </button>
        </div>
        <div className="max-h-[58vh] overflow-y-auto px-5 pt-4">{children}</div>
      </div>
    </div>
  )
}
