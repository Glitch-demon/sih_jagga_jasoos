import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Camera,
  Check,
  FileText,
  ImageUp,
  Loader,
  ScanLine,
  Trash2,
} from 'lucide-react'
import { useSession } from '../store/session.jsx'

const QUEUE = [
  { title: 'Previous Prescription', meta: 'Dr. Sharma · 12 Aug 2025' },
  { title: 'Blood Test Report', meta: 'Pathology · Nov 2024' },
  { title: 'ABHA Card', meta: 'Identity document' },
]

/** Screen 7 — document scanner. */
export default function ScanDocs() {
  const nav = useNavigate()
  const s = useSession()
  const [busy, setBusy] = useState(false)
  const timer = useRef(null)
  const file = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const capture = () => {
    if (busy) return
    setBusy(true)
    timer.current = setTimeout(() => {
      const next = QUEUE[s.documents.length % QUEUE.length]
      s.addDocument({ ...next })
      setBusy(false)
    }, 1900)
  }

  const upload = (e) => {
    const f = e.target.files?.[0]
    if (f) s.addDocument({ title: f.name.replace(/\.[^.]+$/, ''), meta: 'Uploaded from device' })
    e.target.value = ''
  }

  const remove = (i) => s.patch({ documents: s.documents.filter((_, n) => n !== i) })

  return (
    <div className="flex min-h-full flex-col px-4 pb-4 pt-4">
      {/* viewfinder */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
        <div className="absolute inset-3 rounded-xl border-2 border-dashed border-white/60" />
        <div className="grid h-full place-items-center">
          <FileText size={72} strokeWidth={1.4} className="text-white/25" />
        </div>
        {busy && (
          <>
            <div className="absolute inset-x-3 top-3 h-1 animate-bar bg-aqua-300 shadow-[0_0_18px_4px_rgba(110,239,224,.7)]" />
            <span className="absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-ink/85 px-3 py-1.5 text-[12px] font-bold text-white">
              <Loader size={14} strokeWidth={3} className="animate-spin" /> {s.t('scanning')}
            </span>
          </>
        )}
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white/80">
          Kiosk camera
        </span>
      </div>

      <div className="mt-4 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
          <ScanLine size={20} strokeWidth={2.6} />
        </span>
        <div>
          <h1 className="text-[19px] font-extrabold leading-tight tracking-tight">
            {s.t('placeDoc')}
          </h1>
          <p className="mt-1 text-[13px] font-semibold leading-snug text-slate-500">
            {s.t('placeDocSub')}
          </p>
        </div>
      </div>

      {/* captured list */}
      {s.documents.length > 0 && (
        <ul className="mt-3 space-y-2">
          {s.documents.map((d, i) => (
            <li key={i} className="card animate-rise flex items-center gap-3 px-3 py-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-aqua-100 text-aqua-700">
                <Check size={18} strokeWidth={3} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-bold">{d.title}</span>
                <span className="block text-[12px] font-semibold text-slate-500">{d.meta}</span>
              </span>
              <button
                onClick={() => remove(i)}
                aria-label={`Remove ${d.title}`}
                className="tap rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-danger"
              >
                <Trash2 size={17} strokeWidth={2.4} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto space-y-2.5 pt-5">
        <button onClick={capture} disabled={busy} className="btn-primary w-full text-[18px] uppercase disabled:bg-slate-400">
          <Camera size={22} strokeWidth={2.6} /> {busy ? s.t('scanning') : s.t('capture')}
        </button>
        <div className="flex gap-2.5">
          <button onClick={() => file.current?.click()} className="btn-ghost flex-1 py-3.5 text-[14px]">
            <ImageUp size={19} strokeWidth={2.6} /> Upload
          </button>
          <input ref={file} onChange={upload} type="file" accept="image/*,.pdf" className="hidden" />
          <button
            onClick={() => nav('/review')}
            disabled={s.documents.length === 0}
            className="btn-ghost flex-1 py-3.5 text-[14px] disabled:opacity-40"
          >
            Done <ArrowRight size={19} strokeWidth={2.6} />
          </button>
        </div>
      </div>
    </div>
  )
}
