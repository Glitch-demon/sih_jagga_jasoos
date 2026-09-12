import { useNavigate } from 'react-router-dom'
import {
  AudioLines,
  ChevronRight,
  ClipboardCheck,
  History,
  Mic,
  ScanLine,
} from 'lucide-react'
import { useSession } from '../store/session.jsx'

/** Screen 4 — patient hub. Three primary actions, stacked for one-thumb reach. */
export default function Home() {
  const nav = useNavigate()
  const s = useSession()
  const name = s.patient?.name ?? 'Guest'
  const hasData = s.symptoms.length > 0 || s.documents.length > 0

  const actions = [
    {
      to: '/assistant',
      icon: Mic,
      tone: 'bg-brand-100 text-brand-600',
      title: s.t('talkAi'),
      sub: s.t('talkAiSub'),
      badge: s.symptoms.length ? `${s.symptoms.length} noted` : null,
    },
    {
      to: '/scan',
      icon: ScanLine,
      tone: 'bg-aqua-200 text-aqua-700',
      title: s.t('scanDocs'),
      sub: s.t('scanDocsSub'),
      badge: s.documents.length ? `${s.documents.length} scanned` : null,
    },
    {
      to: '/history',
      icon: History,
      tone: 'bg-slate-200 text-slate-600',
      title: s.t('history'),
      sub: s.t('historySub'),
      badge: null,
    },
  ]

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-brand-50 to-white px-4 pb-4 pt-6">
      <h1 className="text-center text-[30px] font-extrabold leading-none tracking-tight">
        {s.t('welcomeName')}, {name}
      </h1>
      <p className="mt-2 text-center text-[15px] font-semibold text-slate-600">
        {s.t('selectOption')}
      </p>
      {s.patient?.id && (
        <p className="mt-1 text-center text-[12px] font-bold uppercase tracking-wider text-slate-400">
          {s.patient.id}
        </p>
      )}

      <div className="mt-5 space-y-3">
        {actions.map((a) => (
          <button
            key={a.to}
            onClick={() => nav('/system', { state: { next: a.to } })}
            className="card tap flex w-full items-center gap-3.5 px-4 py-4 text-left hover:border-brand-200 hover:shadow-lift"
          >
            <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${a.tone}`}>
              <a.icon size={26} strokeWidth={2.4} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="text-[18px] font-extrabold leading-tight">{a.title}</span>
                {a.badge && (
                  <span className="pill bg-aqua-100 text-aqua-900">{a.badge}</span>
                )}
              </span>
              <span className="mt-0.5 block text-[13px] font-semibold text-slate-500">
                {a.sub}
              </span>
            </span>
            <ChevronRight size={22} strokeWidth={2.8} className="shrink-0 text-slate-300" />
          </button>
        ))}
      </div>

      {/* progress → review */}
      <div className="mt-auto pt-6">
        {hasData ? (
          <button onClick={() => nav('/review')} className="btn-primary w-full">
            <ClipboardCheck size={21} strokeWidth={2.6} /> {s.t('reviewTitle')}
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3.5">
            <AudioLines size={18} strokeWidth={2.6} className="animate-pulse text-brand-500" />
            <p className="text-[13px] font-bold text-slate-500">
              Start with the AI assistant to build your visit summary
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
