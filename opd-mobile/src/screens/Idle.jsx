import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Hand } from 'lucide-react'
import { GREETINGS } from '../data/i18n.js'
import { useSession } from '../store/session.jsx'

/** Screen 1 — idle attractor. Whole screen is tappable. */
export default function Idle() {
  const nav = useNavigate()
  const s = useSession()
  const [i, setI] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % GREETINGS.length), 2200)
    return () => clearInterval(id)
  }, [])

  const begin = () => {
    s.reset()
    nav('/language')
  }

  return (
    <button
      onClick={begin}
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-brand-100 via-brand-50 to-white px-6 text-center"
      aria-label="Tap to begin check-in"
    >
      {/* watermark */}
      <span className="pointer-events-none absolute select-none text-[22rem] font-extrabold leading-none text-brand-600/[0.06]">
        ॐ
      </span>

      <h1
        key={i}
        className="animate-rise text-[44px] font-extrabold leading-none tracking-tight text-ink"
      >
        {GREETINGS[i]}
      </h1>
      <p className="mt-4 max-w-[19rem] text-[16px] font-semibold leading-snug text-slate-600">
        {s.t('idleSub')}
      </p>

      <span className="relative mt-10 block w-full max-w-[19rem]">
        <span className="absolute inset-0 animate-ping2 rounded-3xl bg-brand-500/40" />
        <span className="relative flex w-full flex-col items-center gap-2 rounded-3xl bg-brand-600 px-6 py-7 shadow-lift ring-8 ring-brand-200/60">
          <Hand size={34} strokeWidth={2.4} className="text-white" />
          <span className="text-[26px] font-extrabold text-white">{s.t('tapToBegin')}</span>
        </span>
      </span>

      <span className="mt-8 text-[12px] font-bold uppercase tracking-widest text-slate-400">
        Kiosk 04 · General OPD · Ground Floor
      </span>
    </button>
  )
}
