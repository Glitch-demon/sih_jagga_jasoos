import { useNavigate } from 'react-router-dom'
import { ArrowRight, FileText, Info, Pencil, Stethoscope } from 'lucide-react'
import { useSession } from '../store/session.jsx'

/** Screen 8 — final review before the summary reaches the doctor. */
export default function Review() {
  const nav = useNavigate()
  const s = useSession()

  return (
    <div className="flex min-h-full flex-col px-4 pb-4 pt-5">
      <h1 className="text-[28px] font-extrabold leading-none tracking-tight">
        {s.t('reviewTitle')}
      </h1>
      <p className="mt-2 text-[14px] font-semibold leading-snug text-slate-600">
        {s.t('reviewSub')}
      </p>

      <div className="mt-4 space-y-2.5">
        <Block label={s.t('patientId')} onEdit={() => nav('/login')}>
          <p className="text-[20px] font-extrabold tracking-tight">
            {s.patient?.id ?? 'Not identified'}
          </p>
          {s.patient?.abha && (
            <p className="mt-0.5 font-mono text-[12px] font-bold text-slate-500">
              ABHA {s.patient.abha}
            </p>
          )}
        </Block>

        <Block label={s.t('reportedSymptoms')} onEdit={() => nav('/assistant')}>
          {s.symptoms.length ? (
            <div className="flex flex-wrap gap-1.5">
              {s.symptoms.map((x) => (
                <span key={x.label} className="pill bg-aqua-200 text-aqua-900">
                  <Stethoscope size={13} strokeWidth={2.8} />
                  {x.label}
                </span>
              ))}
            </div>
          ) : (
            <Empty text="No symptoms recorded yet — tap to add" />
          )}
          {s.transcript && (
            <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-[13px] font-medium italic leading-snug text-slate-600">
              “{s.transcript}”
            </p>
          )}
        </Block>

        <Block label={s.t('scannedDocs')} onEdit={() => nav('/scan')}>
          {s.documents.length ? (
            <ul className="space-y-1.5">
              {s.documents.map((d, i) => (
                <li key={i} className="flex items-center gap-2">
                  <FileText size={17} strokeWidth={2.4} className="shrink-0 text-brand-600" />
                  <span className="truncate text-[14px] font-bold">{d.title}</span>
                  <span className="truncate text-[12px] font-semibold text-slate-400">
                    {d.meta}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="No documents scanned — tap to add" />
          )}
        </Block>
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-slate-100 px-3.5 py-3">
        <Info size={19} strokeWidth={2.6} className="mt-0.5 shrink-0 text-slate-500" />
        <p className="text-[13px] font-bold leading-snug text-slate-600">{s.t('sentToDoctor')}</p>
      </div>

      <div className="mt-auto pt-5">
        <button onClick={() => nav('/done')} className="btn-primary w-full text-[18px]">
          {s.t('submit')} <ArrowRight size={21} strokeWidth={2.8} />
        </button>
      </div>
    </div>
  )
}

function Block({ label, children, onEdit }) {
  return (
    <section className="card px-4 py-3.5">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[12px] font-bold uppercase tracking-wide text-slate-400">
            {label}
          </p>
          {children}
        </div>
        <button
          onClick={onEdit}
          aria-label={`Edit ${label}`}
          className="tap grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-brand-600 hover:bg-brand-50"
        >
          <Pencil size={16} strokeWidth={2.6} />
        </button>
      </div>
    </section>
  )
}

const Empty = ({ text }) => (
  <p className="text-[13px] font-semibold text-slate-400">{text}</p>
)
