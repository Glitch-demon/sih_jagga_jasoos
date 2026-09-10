import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, CircleCheck, Volume2, VolumeX } from 'lucide-react'
import { LANGUAGES } from '../data/i18n.js'
import { useSession } from '../store/session.jsx'

/** Screen 2 — Select Language (2-up grid on mobile). */
export default function Language() {
  const nav = useNavigate()
  const s = useSession()
  const [picked, setPicked] = useState(s.lang)

  const confirm = () => {
    s.patch({ lang: picked })
    nav('/login')
  }

  return (
    <div className="flex min-h-full flex-col px-4 pb-4 pt-4">
      <button
        onClick={() => nav('/')}
        className="tap mb-3 flex w-fit items-center gap-1.5 rounded-xl px-1 py-1 text-[14px] font-bold text-slate-500 hover:bg-slate-100"
      >
        <ArrowLeft size={18} strokeWidth={2.8} /> {s.t('back')}
      </button>

      <h1 className="text-[30px] font-extrabold leading-none tracking-tight">
        {s.t('selectLanguage')}
      </h1>
      <p className="mt-2 text-[15px] font-semibold leading-snug text-slate-600">
        {s.t('languageSub')}
      </p>

      <button
        onClick={() => s.patch({ voice: !s.voice })}
        role="switch"
        aria-checked={s.voice}
        className={`tap mt-3 flex w-fit items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-bold ${
          s.voice ? 'bg-brand-100 text-brand-700' : 'bg-slate-200 text-slate-500'
        }`}
      >
        {s.voice ? <Volume2 size={17} strokeWidth={2.8} /> : <VolumeX size={17} strokeWidth={2.8} />}
        {s.voice ? s.t('voiceOn') : s.t('voiceOff')}
      </button>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {LANGUAGES.map((l) => {
          const on = picked === l.code
          return (
            <button
              key={l.code}
              onClick={() => setPicked(l.code)}
              aria-pressed={on}
              className={`tap relative flex flex-col items-center gap-1.5 rounded-2xl border-2 bg-white px-2 py-4 ${
                on
                  ? 'border-brand-600 bg-brand-50 shadow-lift'
                  : 'border-slate-200 hover:border-brand-200'
              }`}
            >
              {on && (
                <CircleCheck
                  size={20}
                  className="absolute right-2 top-2 fill-brand-600 text-white"
                />
              )}
              <span className="grid h-11 w-11 place-items-center rounded-full bg-slate-200 text-[12px] font-extrabold text-slate-600">
                {l.region}
              </span>
              <span
                dir={l.rtl ? 'rtl' : 'ltr'}
                className="text-[19px] font-extrabold leading-tight text-ink"
              >
                {l.native}
              </span>
              <span className="text-[12px] font-semibold text-slate-500">{l.label}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-auto pt-5">
        <button onClick={confirm} className="btn-primary w-full text-[18px] uppercase">
          {s.t('agree')} <Check size={22} strokeWidth={3} />
        </button>
      </div>
    </div>
  )
}
