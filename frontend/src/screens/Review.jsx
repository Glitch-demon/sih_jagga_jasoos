import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CheckCircle2, FileText, Info, Leaf, Pencil, ShieldCheck, Stethoscope } from 'lucide-react'
import { useSession } from '../store/session.jsx'

/** Screen 8 — final review before the summary reaches the doctor. */
export default function Review() {
  const nav = useNavigate()
  const s = useSession()
  const [familyOpen, setFamilyOpen] = useState(false)
  const [acknowledged, setAcknowledged] = useState(s.reviewAcknowledged)
  const familyItem = s.familyHistory[0]
  const needsCheck = familyItem?.biological

  const updateFamilyHistory = (next) => s.patch({ familyHistory: [{ ...familyItem, ...next }] })
  const submit = () => {
    if (!acknowledged) return
    s.patch({ reviewAcknowledged: true, reviewedAt: new Date().toISOString() })
    nav('/done')
  }

  return (
    <div className="flex min-h-full flex-col px-4 pb-4 pt-5">
      <h1 className="text-[28px] font-extrabold leading-none tracking-tight">
        Review before sending
      </h1>
      <p className="mt-2 text-[14px] font-semibold leading-snug text-slate-600">
        Review and correct your information before MediKiosk sends it to the Hospital Information System.
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

        <ClinicalSummary
          system={s.consultationSystem}
          answers={s.intakeAnswers || []}
          onEdit={() => nav('/assistant')}
        />

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

        <section className="card overflow-hidden border-brand-100">
          <div className="flex items-start gap-3 px-4 py-3.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600"><ShieldCheck size={19} strokeWidth={2.6} /></span>
            <div className="min-w-0 flex-1"><p className="text-[12px] font-bold uppercase tracking-wide text-slate-400">Family history check</p><p className="mt-0.5 text-[14px] font-bold leading-snug text-ink">Confirm biological family relationships.</p></div>
            <button onClick={() => setFamilyOpen((open) => !open)} aria-expanded={familyOpen} className="tap grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-brand-600 hover:bg-brand-50" aria-label="Edit family history"><Pencil size={16} strokeWidth={2.6} /></button>
          </div>
          {needsCheck && !familyOpen && <button onClick={() => setFamilyOpen(true)} className="flex w-full items-start gap-2 border-t border-amber-200 bg-amber-50 px-4 py-3 text-left"><AlertTriangle size={18} strokeWidth={2.6} className="mt-0.5 shrink-0 text-amber-700" /><span className="text-[13px] font-bold leading-snug text-amber-900">Check needed: {familyItem.relation} is marked as a biological relative.</span></button>}
          {familyOpen && familyItem && <div className="border-t border-slate-100 bg-slate-50 px-4 py-3.5">
            <label className="text-[12px] font-bold uppercase tracking-wide text-slate-500">Condition</label>
            <input value={familyItem.condition} onChange={(event) => updateFamilyHistory({ condition: event.target.value })} className="mt-1 w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-[15px] font-semibold outline-none focus:border-brand-600" />
            <label className="mt-3 block text-[12px] font-bold uppercase tracking-wide text-slate-500">Relationship to you</label>
            <select value={familyItem.relation} onChange={(event) => updateFamilyHistory({ relation: event.target.value })} className="mt-1 min-h-[44px] w-full rounded-xl border-2 border-slate-200 bg-white px-3 text-[15px] font-semibold outline-none focus:border-brand-600"><option>Mother</option><option>Father</option><option>Sibling</option><option>Stepsister</option><option>Stepbrother</option><option>Other</option></select>
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-2"><p className="px-2 text-[12px] font-bold text-slate-600">Is this a biological relative?</p><div className="mt-2 grid grid-cols-2 gap-2">{[true, false].map((value) => <button key={String(value)} onClick={() => updateFamilyHistory({ biological: value })} aria-pressed={familyItem.biological === value} className={`tap rounded-xl border-2 px-2 py-2.5 text-[13px] font-extrabold ${familyItem.biological === value ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-500'}`}>{value ? 'Yes, biological' : 'No, not biological'}</button>)}</div></div>
            {!familyItem.biological && <p className="mt-3 flex items-start gap-1.5 text-[12px] font-bold leading-snug text-aqua-900"><CheckCircle2 size={16} strokeWidth={2.8} className="shrink-0 text-aqua-700" />Corrected. This condition will not be recorded as biological family history.</p>}
          </div>}
        </section>
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-slate-100 px-3.5 py-3">
        <Info size={19} strokeWidth={2.6} className="mt-0.5 shrink-0 text-slate-500" />
        <p className="text-[13px] font-bold leading-snug text-slate-600">Only your confirmed summary will be transmitted to the Hospital Information System (HIS).</p>
      </div>

      <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-2xl border-2 border-brand-100 bg-brand-50 px-3.5 py-3">
        <input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-brand-600" />
        <span className="text-[13px] font-bold leading-snug text-brand-900">I have reviewed this summary and approve it for transmission to HIS.</span>
      </label>

      <div className="mt-auto pt-5">
        <button onClick={submit} disabled={!acknowledged} className="btn-primary w-full text-[18px] disabled:bg-slate-300 disabled:shadow-none">
          Send approved summary to HIS <ArrowRight size={21} strokeWidth={2.8} />
        </button>
      </div>
    </div>
  )
}

function ClinicalSummary({ system, answers, onEdit }) {
  const isAyush = system === 'ayush'
  const Icon = isAyush ? Leaf : Stethoscope
  const label = isAyush ? 'Ayurvedic structured history' : 'Allopathic structured history'
  const destination = isAyush ? 'Vaidya handoff' : 'Physician handoff'

  return (
    <section className={`card overflow-hidden border ${isAyush ? 'border-aqua-200' : 'border-brand-100'}`}>
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${isAyush ? 'bg-aqua-100 text-aqua-900' : 'bg-brand-50 text-brand-600'}`}><Icon size={19} strokeWidth={2.6} /></span>
        <div className="min-w-0 flex-1"><p className="text-[12px] font-bold uppercase tracking-wide text-slate-400">{destination}</p><p className="mt-0.5 text-[14px] font-extrabold leading-snug text-ink">{label}</p></div>
        <button onClick={onEdit} aria-label="Edit clinical intake" className="tap grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-brand-600 hover:bg-brand-50"><Pencil size={16} strokeWidth={2.6} /></button>
      </div>
      {answers.length ? <dl className="border-t border-slate-100 bg-slate-50 px-4 py-3 space-y-2">{answers.map((item, index) => <div key={`${item.section}-${index}`}><dt className={`text-[10px] font-extrabold uppercase tracking-wide ${isAyush ? 'text-aqua-900' : 'text-brand-700'}`}>{item.section}</dt><dd className="mt-0.5 text-[13px] font-semibold leading-snug text-slate-700">{item.answer}</dd></div>)}</dl> : <p className="border-t border-slate-100 px-4 py-3 text-[13px] font-semibold text-slate-400">No structured intake has been recorded yet.</p>}
    </section>
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
