import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Leaf, MessageCircle, Mic, Square, Stethoscope, UserRound, UsersRound } from 'lucide-react'
import { useSession } from '../store/session.jsx'
import { speak, stopSpeaking } from '../utils/speak.js'

// These flows intentionally ask different questions: allopathic intake prioritizes
// triage and medication safety, while AYUSH intake captures routine and lifestyle context.
const INTAKE_SCRIPTS = {
  allopathy: [
    { section: 'Main concern', q: 'What brings you to the hospital today?', helper: 'Tell us the main problem that needs care today.', a: "I've had a fever and a bad headache for two days.", tags: [{ label: 'Fever' }, { label: 'Headache' }], quick: ['Fever', 'Headache', 'Pain'] },
    { section: 'Symptom timeline', q: 'When did these symptoms start, and are they getting better or worse?', helper: 'A rough date or number of days is enough.', a: 'It started on Monday evening and feels worse today.', tags: [{ label: 'Symptoms for 3 days' }], quick: ['Started today', '2–3 days', 'More than a week'] },
    { section: 'Severity & warning signs', q: 'How severe is the problem? Do you have chest pain, trouble breathing, fainting, or heavy bleeding?', helper: 'Tell us immediately about any severe or sudden symptom.', a: 'The fever is high, but I do not have chest pain or trouble breathing.', tags: [{ label: 'High fever' }], quick: ['Mild', 'Moderate', 'Severe'] },
    { section: 'Medical history', q: 'Do you have any long-term illness, past surgery, or recent hospital visit?', helper: 'For example: diabetes, blood pressure, asthma, or a recent admission.', a: 'I do not have any long-term illness or recent hospital visit.', tags: [], quick: ['Diabetes', 'Blood pressure', 'None known'] },
    { section: 'Medicines & allergies', q: 'What medicines are you taking, and do you have any medicine or food allergies?', helper: 'Include tablets, injections, and any reaction you have had before.', a: 'I am not taking regular medicines and I do not know of any allergies.', tags: [], quick: ['Regular medicines', 'Medicine allergy', 'No known allergy'] },
  ],
  ayush: [
    { section: 'Primary concern', q: 'What would you like help with today?', helper: 'Describe the main concern in your own words.', a: 'I have frequent headaches and feel low in energy.', tags: [{ label: 'Headache' }, { label: 'Low energy' }], quick: ['Headache', 'Joint discomfort', 'Stress'] },
    { section: 'Pattern of concern', q: 'When did this begin, and what makes it better or worse?', helper: 'Mention changes with food, sleep, weather, activity, or time of day.', a: 'It began a few weeks ago and feels worse after poor sleep.', tags: [{ label: 'Symptoms for weeks' }], quick: ['After meals', 'Poor sleep', 'Weather change'] },
    { section: 'Digestion & appetite', q: 'How are your appetite, digestion, and bowel routine lately?', helper: 'For example: normal, acidity, bloating, constipation, or loose stools.', a: 'My appetite is irregular and I sometimes feel bloated after meals.', tags: [{ label: 'Irregular appetite' }, { label: 'Bloating' }], quick: ['Normal digestion', 'Acidity', 'Constipation'] },
    { section: 'Sleep & daily routine', q: 'How have your sleep, stress, and daily routine been?', helper: 'Share any change in rest, work, movement, or emotional stress.', a: 'My sleep has been irregular and work stress has been high.', tags: [{ label: 'Poor sleep' }, { label: 'Stress' }], quick: ['Good sleep', 'Poor sleep', 'High stress'] },
    { section: 'Current care & safety', q: 'Are you taking any medicines, herbs, or supplements, and do you have any diagnosed condition or allergy?', helper: 'Please include all treatments so the AYUSH clinician can guide you safely.', a: 'I am not taking any regular medicine or herbal supplement, and I have no known allergy.', tags: [], quick: ['Herbal supplements', 'Regular medicines', 'No known allergy'] },
  ],
}

const ACKNOWLEDGEMENTS = { en: 'Thanks. I have noted that.', hi: 'धन्यवाद। मैंने आपकी बात समझ ली है।' }
const PROCESSING_LABELS = { en: 'Thanks — I’m processing your answer…', hi: 'धन्यवाद — आपका उत्तर समझा जा रहा है…' }

export default function Assistant() {
  const nav = useNavigate()
  const s = useSession()
  const [step, setStep] = useState(0)
  const [listening, setListening] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [log, setLog] = useState([])
  const [speaker, setSpeaker] = useState('patient')
  const timer = useRef(null)
  const script = INTAKE_SCRIPTS[s.consultationSystem] || INTAKE_SCRIPTS.allopathy
  const done = step >= script.length
  const current = script[Math.min(step, script.length - 1)]
  const isAyush = s.consultationSystem === 'ayush'

  useEffect(() => {
    if (!s.consultationSystem) nav('/system', { replace: true, state: { next: '/assistant' } })
  }, [nav, s.consultationSystem])

  useEffect(() => {
    if (!done && !processing && s.voice) speak(current.q, s.lang)
    return stopSpeaking
  }, [step, done, processing, s.voice, s.lang, current.q])

  useEffect(() => () => clearTimeout(timer.current), [])

  const listen = () => {
    if (done || listening || processing) return
    setListening(true)
    timer.current = setTimeout(() => {
      setListening(false)
      setProcessing(true)
      const answer = current
      const updatedLog = [...log, { q: answer.q, a: answer.a }]
      setLog(updatedLog)
      if (step === 0) s.patch({ symptoms: [] })
      s.addSymptoms(answer.tags)
      s.patch({
        // Starting from question one replaces a previous edit attempt rather than duplicating it.
        intakeAnswers: step === 0 ? [{ section: answer.section, answer: answer.a }] : [...s.intakeAnswers, { section: answer.section, answer: answer.a }],
        transcript: updatedLog.map((item) => item.a).join(' '),
      })
      if (s.voice) speak(ACKNOWLEDGEMENTS[s.lang] ?? ACKNOWLEDGEMENTS.en, s.lang)
      timer.current = setTimeout(() => {
        setProcessing(false)
        setStep((value) => value + 1)
      }, 1500)
    }, 2400)
  }

  if (!s.consultationSystem) return null

  const IntakeIcon = isAyush ? Leaf : Stethoscope
  const opdLabel = isAyush ? 'AYUSH OPD intake' : 'Allopathic OPD intake'
  const accent = isAyush ? 'bg-aqua-700 hover:bg-aqua-900' : 'bg-brand-600 hover:bg-brand-700'

  return (
    <div className="flex min-h-full flex-col bg-slate-50 px-4 pb-4 pt-3">
      <SpeakerPicker speaker={speaker} onChange={setSpeaker} />
      <div className={`mt-3 flex items-center gap-1.5 text-[11px] font-bold ${isAyush ? 'text-aqua-900' : 'text-brand-700'}`}>
        <span className={`grid h-5 w-5 place-items-center rounded-full text-white ${isAyush ? 'bg-aqua-700' : 'bg-brand-600'}`}><IntakeIcon size={12} strokeWidth={2.8} /></span>
        {isAyush ? 'AYUSH intake assistant' : 'Doctor assistant AI'}
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[9px] text-slate-600">{opdLabel}</span>
      </div>

      <section className={`mt-1.5 rounded-2xl border px-3.5 py-3 shadow-card transition-colors duration-200 ${processing ? 'border-aqua-200 bg-aqua-50' : isAyush ? 'border-aqua-200 bg-white' : 'border-brand-100 bg-white'}`}>
        <div className="flex items-center justify-between gap-2">
          <span className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${isAyush ? 'bg-aqua-100 text-aqua-900' : 'bg-brand-50 text-brand-700'}`}>{done ? 'Intake complete' : `Question ${step + 1} of ${script.length}`}</span>
          {!done && <span className="text-[10px] font-bold text-slate-400">{current.section}</span>}
        </div>
        <p className="mt-2 text-[14px] font-extrabold leading-snug text-ink">“{done ? 'Thank you. Your five intake answers are ready for review.' : processing ? (PROCESSING_LABELS[s.lang] ?? PROCESSING_LABELS.en) : current.q}”</p>
        {!done && <p className="mt-1 text-[11px] font-semibold leading-snug text-slate-500">{processing ? 'I’ll continue with the next question in a moment.' : current.helper}</p>}
      </section>

      <div className="mt-3 space-y-2">
        {log.map((item, index) => (
          <div key={`${item.q}-${index}`} className={`animate-rise ml-8 rounded-2xl rounded-tr-sm px-3 py-2.5 text-white shadow-lift ${isAyush ? 'bg-aqua-700' : 'bg-brand-600'}`}>
            <div className={`flex items-center gap-1 text-[9px] font-bold ${isAyush ? 'text-aqua-100' : 'text-brand-100'}`}><UserRound size={11} strokeWidth={3} />{speaker === 'patient' ? 'Patient speaking' : 'Informant speaking'}</div>
            <p className="mt-1 text-[13px] font-bold leading-snug">{item.a}</p>
          </div>
        ))}
      </div>

      {!done && <button onClick={listen} disabled={listening || processing} className={`tap mt-3 flex w-full items-center gap-3 rounded-2xl border bg-white px-3.5 py-3 text-left shadow-card disabled:opacity-80 ${isAyush ? 'border-aqua-200' : 'border-brand-200'}`}><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white ${listening ? 'bg-danger' : processing ? accent.split(' ')[0] : 'bg-aqua-700'}`}>{listening ? <Square size={18} fill="currentColor" /> : <Mic size={20} strokeWidth={2.6} />}</span><span className="min-w-0 flex-1"><span className="block text-[13px] font-extrabold text-ink">{listening ? 'Listening to your response…' : processing ? 'Processing your answer…' : 'Tap to speak your response'}</span><span className="block text-[11px] font-semibold text-slate-500">{processing ? 'Please wait — the next question is coming.' : 'Speak clearly, then tap again when you finish.'}</span></span></button>}

      {!done && <div className="mt-3 flex flex-wrap gap-1.5"><span className="self-center text-[10px] font-bold text-slate-500">Helpful details:</span>{current.quick.map((tag) => <span key={tag} className={`rounded-full border bg-white px-2 py-1 text-[10px] font-bold ${isAyush ? 'border-aqua-200 text-aqua-900' : 'border-slate-200 text-slate-600'}`}>{tag}</span>)}</div>}
      <div className="mt-auto flex gap-2 pt-4"><button onClick={() => nav('/type')} className="tap flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 py-3 text-[13px] font-extrabold text-slate-700 hover:bg-slate-100"><MessageCircle size={17} strokeWidth={2.6} />Type instead</button><button onClick={() => nav('/review')} disabled={!done} className={`tap flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-3 text-[13px] font-extrabold text-white shadow-lift disabled:bg-slate-300 ${accent}`}>Review answers <ArrowRight size={17} strokeWidth={3} /></button></div>
    </div>
  )
}

function SpeakerPicker({ speaker, onChange }) {
  const choices = [{ id: 'patient', title: 'Patient (Self)', sub: 'Self-reported symptoms & feelings', icon: UserRound }, { id: 'informant', title: 'Informant / Attendant', sub: 'Family member, caregiver observation', icon: UsersRound }]
  return <section className="rounded-2xl border border-slate-300 bg-white p-1.5 shadow-card"><p className="px-1.5 pb-1 text-[10px] font-extrabold text-ink">Who is speaking / providing information?</p><div className="grid grid-cols-2 gap-1.5">{choices.map(({ id, title, sub, icon: Icon }) => <button key={id} onClick={() => onChange(id)} className={`tap flex min-w-0 items-start gap-1.5 rounded-xl px-2 py-2 text-left ${speaker === id ? 'bg-brand-600 text-white' : 'border border-slate-200 bg-slate-50 text-slate-700'}`}><Icon size={15} strokeWidth={2.8} className="mt-0.5 shrink-0" /><span className="min-w-0"><span className="block text-[11px] font-extrabold leading-tight">{title}</span><span className={`mt-0.5 block text-[9px] font-semibold leading-tight ${speaker === id ? 'text-brand-100' : 'text-slate-500'}`}>{sub}</span></span></button>)}</div></section>
}
