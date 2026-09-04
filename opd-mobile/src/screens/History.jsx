import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, FileText, Pill, TestTube } from 'lucide-react'
import { useSession } from '../store/session.jsx'

const VISITS = [
  {
    date: '12 Aug 2025',
    dept: 'General Medicine',
    doctor: 'Dr. R. Sharma',
    dx: 'Viral fever',
    rx: ['Paracetamol 650 mg — 1 tab, 3×/day, 5 days', 'ORS sachet — as needed'],
    labs: ['CBC — normal', 'Dengue NS1 — negative'],
  },
  {
    date: '03 Mar 2025',
    dept: 'Orthopaedics',
    doctor: 'Dr. M. Iyer',
    dx: 'Lower back strain',
    rx: ['Ibuprofen 400 mg — 1 tab, 2×/day, 3 days'],
    labs: ['X-ray lumbar spine — no fracture'],
  },
]

/** Bonus screen — past visits, reachable from the home hub. */
export default function History() {
  const nav = useNavigate()
  const s = useSession()

  return (
    <div className="flex min-h-full flex-col px-4 pb-4 pt-4">
      <button
        onClick={() => nav('/home')}
        className="tap mb-3 flex w-fit items-center gap-1.5 rounded-xl px-1 py-1 text-[14px] font-bold text-slate-500 hover:bg-slate-100"
      >
        <ArrowLeft size={18} strokeWidth={2.8} /> {s.t('back')}
      </button>

      <h1 className="text-[26px] font-extrabold leading-tight tracking-tight">
        {s.t('history')}
      </h1>
      <p className="mt-1 text-[14px] font-semibold text-slate-600">{s.t('historySub')}</p>

      <div className="mt-4 space-y-3">
        {VISITS.map((v) => (
          <article key={v.date} className="card px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[16px] font-extrabold leading-tight">{v.dept}</p>
                <p className="text-[12px] font-semibold text-slate-500">{v.doctor}</p>
              </div>
              <span className="pill bg-brand-50 text-brand-700">{v.date}</span>
            </div>

            <p className="mt-3 text-[13px] font-bold text-slate-500">
              Diagnosis: <span className="text-ink">{v.dx}</span>
            </p>

            <Group icon={Pill} title="Prescription" items={v.rx} />
            <Group icon={TestTube} title="Lab results" items={v.labs} />

            <button className="btn-ghost mt-3 w-full py-3 text-[13px]">
              <Download size={17} strokeWidth={2.6} /> Download report
            </button>
          </article>
        ))}
      </div>

      <div className="mt-auto pt-5">
        <button onClick={() => nav('/assistant')} className="btn-primary w-full">
          <FileText size={19} strokeWidth={2.6} /> Continue check-in
        </button>
      </div>
    </div>
  )
}

function Group({ icon: Icon, title, items }) {
  return (
    <div className="mt-2.5">
      <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-slate-400">
        <Icon size={14} strokeWidth={2.8} /> {title}
      </p>
      <ul className="mt-1 space-y-0.5">
        {items.map((i) => (
          <li key={i} className="text-[13px] font-semibold leading-snug text-slate-700">
            • {i}
          </li>
        ))}
      </ul>
    </div>
  )
}
