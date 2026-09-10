import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CornerDownLeft, Delete, Mic } from 'lucide-react'
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

  const rows = layer === 'abc' ? ALPHA : NUM
  const found = useMemo(
    () => MATCH.filter(([re]) => re.test(text)).map(([, label]) => label),
    [text]
  )

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
    <div className="flex min-h-full flex-col px-3 pb-3 pt-4">
      <h1 className="px-1 text-[22px] font-extrabold leading-tight tracking-tight">
        {s.t('describeSymptoms')}
      </h1>

      {/* input */}
      <div className="relative mt-3">
        <div className="min-h-[92px] rounded-2xl border-2 border-brand-600 bg-white p-3.5 pr-28">
          <p className="text-[16px] font-semibold leading-snug text-ink">
            {text || <span className="text-slate-300">Start typing your symptoms…</span>}
            <span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-brand-600 align-middle" />
          </p>
        </div>
        <button
          onClick={() => nav('/assistant')}
          className="tap absolute right-2 top-2 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-[12px] font-bold text-slate-600 shadow-sm"
        >
          <Mic size={15} strokeWidth={2.8} /> {s.t('speakInstead')}
        </button>
      </div>

      {/* detected + quick add */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
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
