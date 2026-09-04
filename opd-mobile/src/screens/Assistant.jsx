import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Keyboard, Mic, Square, Volume2 } from 'lucide-react'
import { useSession } from '../store/session.jsx'
import { speak, stopSpeaking } from '../utils/speak.js'

// Scripted triage interview — deterministic so the demo behaves the same every run.
const SCRIPT = [
  {
    q: 'What brings you to the hospital today?',
    a: "I've had a fever and a bad headache since two days.",
    tags: [{ label: 'Fever' }, { label: 'Headache' }],
  },
  {
    q: 'How long have you had these symptoms?',
    a: 'About three days now — it started on Monday evening.',
    tags: [{ label: '3 days duration' }],
  },
  {
    q: 'Any cough, breathing trouble or known allergies?',
    a: 'A dry cough at night. No allergies that I know of.',
    tags: [{ label: 'Dry cough' }],
  },
]

/** Screen 5 — voice triage with the AI doctor assistant. */
export default function Assistant() {
  const nav = useNavigate()
  const s = useSession()
  const [step, setStep] = useState(0)
  const [listening, setListening] = useState(false)
  const [log, setLog] = useState([])
  const timer = useRef(null)

  const done = step >= SCRIPT.length
  const current = SCRIPT[Math.min(step, SCRIPT.length - 1)]

  // Read each question aloud when voice guidance is enabled.
  useEffect(() => {
    if (!done && s.voice) speak(current.q, s.lang)
    return stopSpeaking
  }, [step, done, s.voice, s.lang, current.q])

  useEffect(() => () => clearTimeout(timer.current), [])

  const listen = () => {
    if (done || listening) return
    setListening(true)
    timer.current = setTimeout(() => {
      setListening(false)
      setLog((l) => [...l, { q: current.q, a: current.a }])
      s.addSymptoms(current.tags)
      s.patch({ transcript: [...log.map((x) => x.a), current.a].join(' ') })
      setStep((n) => n + 1)
    }, 2400)
  }

  return (
    <div className="flex min-h-full flex-col px-4 pb-4 pt-4">
      <span className="mx-auto flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1.5 text-[12px] font-extrabold text-slate-600">
        <Volume2 size={14} strokeWidth={3} /> {s.t('doctorAssistant')}
        <span className="ml-1 text-slate-400">
          {Math.min(step + 1, SCRIPT.length)}/{SCRIPT.length}
        </span>
      </span>

      {/* question card */}
      <div className="card mt-3 px-4 py-5 text-center">
        <p className="text-[22px] font-extrabold leading-snug tracking-tight">
          {done ? 'Thank you. I have everything I need.' : `“${current.q}”`}
        </p>
      </div>

      {/* answered so far */}
      {log.length > 0 && (
        <div className="mt-3 space-y-2">
          {log.map((l, i) => (
            <div key={i} className="animate-rise rounded-2xl bg-brand-50 px-3.5 py-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-brand-600">You said</p>
              <p className="text-[14px] font-semibold leading-snug text-ink">{l.a}</p>
            </div>
          ))}
        </div>
      )}

      {/* mic */}
      <div className="mt-6 flex flex-col items-center">
        <button
          onClick={listen}
          disabled={done}
          aria-label={listening ? 'Listening' : 'Start speaking'}
          className="relative grid h-28 w-28 place-items-center"
        >
          {listening && (
            <>
              <span className="absolute inset-0 animate-ping2 rounded-full bg-aqua-500/50" />
              <span className="absolute inset-2 animate-ping2 rounded-full bg-aqua-500/40 [animation-delay:.6s]" />
            </>
          )}
          <span
            className={`relative grid h-24 w-24 place-items-center rounded-full shadow-xl transition-colors ${
              done ? 'bg-slate-300' : listening ? 'bg-danger' : 'bg-aqua-700 hover:bg-aqua-900'
            }`}
          >
            {listening ? (
              <Square size={30} strokeWidth={3} className="text-white" />
            ) : (
              <Mic size={38} strokeWidth={2.4} className="text-white" />
            )}
          </span>
        </button>

        {listening ? (
          <div className="mt-4 flex h-7 items-end gap-1" aria-hidden>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <span
                key={i}
                className="w-1.5 animate-wave rounded-full bg-aqua-700"
                style={{ height: '100%', animationDelay: `${i * 0.09}s` }}
              />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-center text-[14px] font-bold text-slate-500">
            {done ? 'Interview complete' : s.t('listening')}
          </p>
        )}

        <button onClick={() => nav('/type')} className="btn-ghost mt-4 rounded-full px-5 py-3">
          <Keyboard size={19} strokeWidth={2.6} /> {s.t('typeInstead')}
        </button>
      </div>

      <div className="mt-auto pt-6">
        <button
          onClick={() => nav('/review')}
          disabled={log.length === 0}
          className="btn-primary w-full disabled:bg-slate-300 disabled:shadow-none"
        >
          {s.t('finish')} <ArrowRight size={20} strokeWidth={2.8} />
        </button>
      </div>
    </div>
  )
}
