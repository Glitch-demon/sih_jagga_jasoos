import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight, CornerDownLeft, Delete, Mic, UserRound, UsersRound } from 'lucide-react'
import { useSession } from '../store/session.jsx'

const ALPHA = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.'],
]
const NUM = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['-', '/', ':', ';', '(', ')', '₹', '&', '@'],
  ['.', ',', '?', '!', "'", '"', '+', '=', '%'],
]

// Keyword → symptom chip, used to turn free text into structured tags.
const MATCH = [
  [/fever|temperature|bukhar/i, 'Fever'],
  [/head\s?ache|migraine|sar dard/i, 'Headache'],
  [/cough|khansi/i, 'Cough'],
  [/cold|sneez|runny/i, 'Cold'],
  [/vomit|nausea/i, 'Nausea'],
  [/pain|dard|ache/i, 'Body pain'],
  [/breath|saans|wheez/i, 'Breathlessness'],
  [/dizzy|faint|chakkar/i, 'Dizziness'],
  [/rash|itch|skin/i, 'Skin rash'],
  [/stomach|pet|diarr|loose/i, 'Stomach upset'],
]

const QUICK = ['Fever', 'Headache', 'Cough', 'Body pain', 'Stomach upset']

/** Screen 6 — typed symptom entry with a kiosk-safe on-screen keyboard. */
export default function TypeSymptoms() {
  const nav = useNavigate()
  const s = useSession()
  const [text, setText] = useState(s.transcript || '')
  const [shift, setShift] = useState(true)
  const [layer, setLayer] = useState('abc')
  const [speaker, setSpeaker] = useState('patient')

  const rows = layer === 'abc' ? ALPHA : NUM
  const found = useMemo(
    () => MATCH.filter(([re]) => re.test(text)).map(([, label]) => label),
    [text]
  )

  // Keep typed entry in the same selected consultation flow as voice entry.
  if (!s.consultationSystem) {
    return <Navigate to="/system" replace state={{ next: '/type' }} />
  }

  const type = (k) => {
    setText((t) => t + (shift && layer === 'abc' ? k.toUpperCase() : k))
    if (shift) setShift(false)
  }

  const next = () => {
    const tags = (found.length ? found : ['Reported symptoms']).map((label) => ({ label }))
    s.addSymptoms(tags)
    s.patch({ transcript: text.trim() })
    nav('/review')
  }

  return (
    <div className="flex min-h-full flex-col bg-slate-50 px-3 pb-3 pt-3">
      <section className="rounded-2xl border border-slate-300 bg-white p-1.5 shadow-card">
        <div className="flex items-center justify-between px-1.5 pb-1">
          <p className="text-[10px] font-extrabold text-ink">Who is entering information?</p>
          <span className="rounded-full bg-aqua-100 px-2 py-0.5 text-[9px] font-bold text-aqua-900">Recording: Patient</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[{ id: 'patient', title: 'Patient (Self)', sub: 'Self-reported symptoms', icon: UserRound }, { id: 'informant', title: 'Informant / Attendant', sub: 'Family member, caregiver', icon: UsersRound }].map(({ id, title, sub, icon: Icon }) => (
            <button key={id} onClick={() => setSpeaker(id)} className={`tap flex items-start gap-1.5 rounded-xl px-2 py-2 text-left ${speaker === id ? 'bg-brand-600 text-white' : 'border border-slate-200 bg-slate-50 text-slate-700'}`}>
              <Icon size={15} strokeWidth={2.8} className="mt-0.5 shrink-0" />
              <span><span className="block text-[11px] font-extrabold leading-tight">{title}</span><span className={`block text-[9px] font-semibold leading-tight ${speaker === id ? 'text-brand-100' : 'text-slate-500'}`}>{sub}</span></span>
            </button>
          ))}
        </div>
      </section>

      <div className="mt-3 flex items-start justify-between gap-2 px-1">
        <h1 className="text-[19px] font-extrabold leading-tight tracking-tight">Please describe your symptoms</h1>
        <p className="text-right text-[10px] font-bold leading-tight text-slate-500">Who is entering<br />information?</p>
      </div>

      {/* input */}
      <div className="relative mt-2 overflow-hidden rounded-xl border border-brand-400 bg-white shadow-card">
        <p className="flex items-center gap-1 bg-brand-50 px-2 py-1 text-[10px] font-bold text-brand-800">● Recording notes from: {speaker === 'patient' ? 'Patient (Direct)' : 'Informant / Attendant'} <span className="ml-auto">kept separate</span></p>
        <div className="min-h-[78px] p-3 pr-28">
          <p className="text-[16px] font-semibold leading-snug text-ink">
            {text || <span className="text-slate-300">Start typing your symptoms…</span>}
            <span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-brand-600 align-middle" />
          </p>
        </div>
        <button
          onClick={() => nav('/assistant')}
          className="tap absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-slate-700"
        >
          <Mic size={15} strokeWidth={2.8} /> {s.t('speakInstead')}
        </button>
      </div>

      {/* detected + quick add */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {found.map((f) => (
          <span key={f} className="pill animate-rise bg-aqua-200 text-aqua-900">
            {f}
          </span>
        ))}
        {QUICK.filter((q) => !found.includes(q)).map((q) => (
          <button
            key={q}
            onClick={() => setText((t) => (t ? `${t.trim()}, ${q.toLowerCase()}` : q))}
            className="tap rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-[12px] font-bold text-slate-500 hover:border-brand-400 hover:text-brand-600"
          >
            + {q}
          </button>
        ))}
      </div>

      {/* on-screen keyboard */}
      <div className="mt-auto space-y-1.5 rounded-2xl bg-slate-200 p-1.5 pt-2">
        <div className="flex gap-1">
          {rows[0].map((k) => (
            <Key key={k} onClick={() => type(k)}>
              {shift && layer === 'abc' ? k.toUpperCase() : k}
            </Key>
          ))}
          <Key wide onClick={() => setText((t) => t.slice(0, -1))} label="Backspace">
            <Delete size={18} strokeWidth={2.6} />
          </Key>
        </div>
        <div className="flex gap-1 px-1">
          {rows[1].map((k) => (
            <Key key={k} onClick={() => type(k)}>
              {shift && layer === 'abc' ? k.toUpperCase() : k}
            </Key>
          ))}
          <Key wide onClick={() => setText((t) => `${t} `)} label="Enter">
            <CornerDownLeft size={18} strokeWidth={2.6} />
          </Key>
        </div>
        <div className="flex gap-1">
          <Key
            wide
            onClick={() => setShift((v) => !v)}
            className={shift ? '!bg-brand-600 !text-white' : '!bg-slate-300'}
          >
            <span className="text-[11px] font-extrabold">SHIFT</span>
          </Key>
          {rows[2].map((k) => (
            <Key key={k} onClick={() => type(k)}>
              {shift && layer === 'abc' ? k.toUpperCase() : k}
            </Key>
          ))}
          <Key wide onClick={() => setText((t) => t.slice(0, -1))} label="Backspace" className="!bg-slate-300">
            <Delete size={18} strokeWidth={2.6} />
          </Key>
        </div>
        <div className="flex gap-1">
          <Key
            className="!max-w-[54px] !bg-slate-300"
            onClick={() => setLayer((l) => (l === 'abc' ? '123' : 'abc'))}
          >
            <span className="text-[12px] font-extrabold">{layer === 'abc' ? '?123' : 'ABC'}</span>
          </Key>
          <Key onClick={() => type('@')}>@</Key>
          <button
            onClick={() => setText((t) => `${t} `)}
            className="key !flex-[4]"
            aria-label="Space"
          >
            <span className="text-[12px] font-bold text-slate-500">SPACE</span>
          </button>
          <Key onClick={() => type('-')}>-</Key>
          <button
            onClick={next}
            disabled={!text.trim()}
            className="tap flex h-11 flex-[2] items-center justify-center gap-1 rounded-lg bg-brand-600 text-[14px] font-extrabold text-white disabled:bg-slate-300"
          >
            {s.t('next')} <ArrowRight size={16} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  )
}

function Key({ children, onClick, wide, className = '', label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`key ${wide ? 'max-w-[46px]' : ''} ${className}`}
    >
      {children}
    </button>
  )
}
