import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, MessageCircle, Mic, Square, Stethoscope, UserRound, UsersRound } from 'lucide-react'
import { useSession } from '../store/session.jsx'
import { speak, stopSpeaking } from '../utils/speak.js'

const SCRIPT = [
  { q: 'Hello! What brings you to the hospital today?', a: "I've had a fever and a bad headache since two days.", tags: [{ label: 'Fever' }, { label: 'Headache' }] },
  { q: 'How long have you had these symptoms?', a: 'About three days now — it started on Monday evening.', tags: [{ label: '3 days duration' }] },
  { q: 'Any cough, breathing trouble or known allergies?', a: 'A dry cough at night. No allergies that I know of.', tags: [{ label: 'Dry cough' }] },
]

export default function Assistant() {
  const nav = useNavigate()
  const s = useSession()
  const [step, setStep] = useState(0)
  const [listening, setListening] = useState(false)
  const [log, setLog] = useState([])
  const [speaker, setSpeaker] = useState('patient')
  const timer = useRef(null)
  const done = step >= SCRIPT.length
  const current = SCRIPT[Math.min(step, SCRIPT.length - 1)]

  // Do not let a bookmarked or refreshed assistant URL bypass system selection.
  useEffect(() => {
    if (!s.consultationSystem) nav('/system', { replace: true, state: { next: '/assistant' } })
  }, [nav, s.consultationSystem])

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
      setLog((items) => [...items, { q: current.q, a: current.a }])
      s.addSymptoms(current.tags)
      s.patch({ transcript: [...log.map((item) => item.a), current.a].join(' ') })
      setStep((value) => value + 1)
      if (step === SCRIPT.length - 1) timer.current = setTimeout(() => nav('/review'), 650)
    }, 2400)
  }

  if (!s.consultationSystem) return null

  const opdLabel = s.consultationSystem === 'ayush' ? 'AYUSH OPD intake' : 'Allopathic OPD intake'

  return <div className="flex min-h-full flex-col bg-slate-50 px-4 pb-4 pt-3">
    <SpeakerPicker speaker={speaker} onChange={setSpeaker} />
    <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-brand-700"><span className="grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-white"><Stethoscope size={12} strokeWidth={2.8} /></span>Doctor assistant AI <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[9px] text-slate-600">{opdLabel}</span></div>
    <section className="mt-1.5 rounded-2xl border border-brand-100 bg-white px-3.5 py-3 shadow-card"><p className="text-[14px] font-extrabold leading-snug text-ink">“{done ? 'Thank you. I have everything I need.' : current.q}”</p>{!done && <p className="mt-1 text-[11px] font-semibold leading-snug text-slate-500">Please describe what symptoms you are experiencing, when they began, and how severe they feel.</p>}</section>
    <div className="mt-3 space-y-2">{log.map((item, index) => <div key={`${item.q}-${index}`} className="animate-rise ml-8 rounded-2xl rounded-tr-sm bg-brand-600 px-3 py-2.5 text-white shadow-lift"><div className="flex items-center gap-1 text-[9px] font-bold text-brand-100"><UserRound size={11} strokeWidth={3} />{speaker === 'patient' ? 'Patient speaking' : 'Informant speaking'}</div><p className="mt-1 text-[13px] font-bold leading-snug">{item.a}</p></div>)}</div>
    {!done && <button onClick={listen} disabled={listening} className="tap mt-3 flex w-full items-center gap-3 rounded-2xl border border-brand-200 bg-white px-3.5 py-3 text-left shadow-card disabled:opacity-80"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white ${listening ? 'bg-danger' : 'bg-aqua-700'}`}>{listening ? <Square size={18} fill="currentColor" /> : <Mic size={20} strokeWidth={2.6} />}</span><span className="min-w-0 flex-1"><span className="block text-[13px] font-extrabold text-ink">{listening ? 'Listening to your response…' : 'Tap to speak your response'}</span><span className="block text-[11px] font-semibold text-slate-500">Speak clearly, then tap again when you finish.</span></span></button>}
    <div className="mt-3 flex flex-wrap gap-1.5"><span className="self-center text-[10px] font-bold text-slate-500">Quick add:</span>{['High fever', 'Chest tightness', 'Headache', 'Stomach ache'].map((tag) => <span key={tag} className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600">{tag}</span>)}</div>
    <div className="mt-auto flex gap-2 pt-4"><button onClick={() => nav('/type')} className="tap flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 py-3 text-[13px] font-extrabold text-slate-700 hover:bg-slate-100"><MessageCircle size={17} strokeWidth={2.6} />Type instead</button><button onClick={() => nav('/review')} disabled={!log.length} className="tap flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-3 py-3 text-[13px] font-extrabold text-white shadow-lift disabled:bg-slate-300">Finish <ArrowRight size={17} strokeWidth={3} /></button></div>
  </div>
}

function SpeakerPicker({ speaker, onChange }) {
  const choices = [{ id: 'patient', title: 'Patient (Self)', sub: 'Self-reported symptoms & feelings', icon: UserRound }, { id: 'informant', title: 'Informant / Attendant', sub: 'Family member, caregiver observation', icon: UsersRound }]
  return <section className="rounded-2xl border border-slate-300 bg-white p-1.5 shadow-card"><p className="px-1.5 pb-1 text-[10px] font-extrabold text-ink">Who is speaking / providing information?</p><div className="grid grid-cols-2 gap-1.5">{choices.map(({ id, title, sub, icon: Icon }) => <button key={id} onClick={() => onChange(id)} className={`tap flex min-w-0 items-start gap-1.5 rounded-xl px-2 py-2 text-left ${speaker === id ? 'bg-brand-600 text-white' : 'border border-slate-200 bg-slate-50 text-slate-700'}`}><Icon size={15} strokeWidth={2.8} className="mt-0.5 shrink-0" /><span className="min-w-0"><span className="block text-[11px] font-extrabold leading-tight">{title}</span><span className={`mt-0.5 block text-[9px] font-semibold leading-tight ${speaker === id ? 'text-brand-100' : 'text-slate-500'}`}>{sub}</span></span></button>)}</div></section>
}
