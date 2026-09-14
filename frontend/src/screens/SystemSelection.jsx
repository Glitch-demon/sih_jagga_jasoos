import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Leaf, Stethoscope, Volume2 } from 'lucide-react'
import { useSession } from '../store/session.jsx'

const OPTIONS = [
  {
    id: 'allopathy',
    icon: Stethoscope,
    iconTone: 'bg-brand-100 text-brand-600',
    badge: 'MODERN OPD',
    badgeTone: 'bg-brand-50 text-brand-700',
    title: 'Allopathic Medicine',
    hindi: 'एलोपैथी / आधुनिक चिकित्सा',
    description: 'General Medicine, Surgery, Cardiology, Orthopaedics, Pediatrics, Emergency Care and more.',
    tags: ['Standard hospital care', 'Fast triage desk'],
    action: 'Select Allopathic',
    actionTone: 'bg-brand-600 hover:bg-brand-700',
  },
  {
    id: 'ayush',
    icon: Leaf,
    iconTone: 'bg-aqua-200 text-aqua-700',
    badge: 'INTEGRATIVE OPD',
    badgeTone: 'bg-aqua-100 text-aqua-900',
    title: 'AYUSH Healthcare',
    hindi: 'आयुष – आयुर्वेद, योग, यूनानी, सिद्ध, होम्योपैथी',
    description: 'Specialized consultation for Ayurveda, Yoga, Naturopathy, Unani, Siddha and Homeopathy.',
    tags: ['Holistic & natural therapy', 'Specialized AYUSH wing'],
    action: 'Select AYUSH',
    actionTone: 'bg-aqua-700 hover:bg-aqua-900',
  },
]

/** Step 5 — choose the consultation system before continuing check-in. */
export default function SystemSelection() {
  const nav = useNavigate()
  const { state } = useLocation()
  const s = useSession()
  const next = state?.next || '/assistant'

  const select = (system) => {
    // A new system selection starts a clean, system-specific clinical intake.
    s.patch({ consultationSystem: system, intakeAnswers: [], symptoms: [], transcript: '' })
    nav(next)
  }

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-brand-50/70 via-white to-white px-4 pb-4 pt-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-extrabold uppercase tracking-wider text-brand-600">
            Step 1 of 4 · System selection
          </p>
          <h1 className="mt-1 text-[25px] font-extrabold leading-tight tracking-tight text-ink">
            Select your system of medicine
          </h1>
          <p className="mt-1 text-[14px] font-bold text-brand-700">चिकित्सा पद्धति चुनें</p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-aqua-100 text-aqua-900" aria-hidden="true">
          <Volume2 size={21} strokeWidth={2.5} />
        </span>
      </div>

      <p className="mt-3 text-[13px] font-semibold leading-snug text-slate-600">
        Choose the kind of consultation you would like today. You can continue to your next check-in step after making a selection.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {OPTIONS.map((option) => {
          const Icon = option.icon
          return (
            <article key={option.id} className="card flex flex-col px-4 py-4">
              <div className="flex items-center justify-between gap-2">
                <span className={`grid h-11 w-11 place-items-center rounded-xl ${option.iconTone}`}>
                  <Icon size={24} strokeWidth={2.5} />
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wide ${option.badgeTone}`}>
                  {option.badge}
                </span>
              </div>
              <h2 className="mt-4 text-[19px] font-extrabold leading-tight tracking-tight">{option.title}</h2>
              <p className="mt-0.5 text-[13px] font-bold leading-tight text-brand-700">{option.hindi}</p>
              <p className="mt-3 min-h-[58px] text-[12px] font-semibold leading-snug text-slate-600">{option.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {option.tags.map((tag) => (
                  <span key={tag} className="rounded-lg bg-aqua-100 px-2 py-1 text-[10px] font-bold text-aqua-900">
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => select(option.id)}
                className={`tap mt-4 flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-[14px] font-extrabold text-white shadow-sm ${option.actionTone}`}
                aria-label={`${option.action} and continue`}
              >
                {option.action} <ArrowRight size={19} strokeWidth={3} />
              </button>
            </article>
          )
        })}
      </div>

      <button
        onClick={() => nav('/home')}
        className="tap mt-auto flex w-fit items-center gap-1.5 rounded-xl px-1 py-2 text-[13px] font-bold text-slate-600 hover:bg-slate-100"
      >
        <ArrowLeft size={18} strokeWidth={2.8} /> Back to main screen
      </button>
    </div>
  )
}
