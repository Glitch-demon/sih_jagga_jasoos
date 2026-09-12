import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Delete, IdCard, UserPlus } from 'lucide-react'
import { useSession } from '../store/session.jsx'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok']

/** Screen 3 — identify the patient via ABHA/Aadhaar or a new registration. */
export default function Login() {
  const nav = useNavigate()
  const s = useSession()
  const [mode, setMode] = useState('abha')
  const [abha, setAbha] = useState('')
  const [form, setForm] = useState({ name: '', age: '', gender: 'Female', phone: '' })

  const pretty = abha.replace(/(.{4})/g, '$1-').replace(/-$/, '')
  // Presentation accounts provide recognizable patient details, but the patient
  // still chooses their consultation system on the following screen.
  const demoSystem = abha === '00000000000000' ? 'allopathy' : /^1{13,14}$/.test(abha) ? 'ayush' : null
  const ready = mode === 'abha' ? abha.length === 14 : form.name.trim().length > 1 && form.age

  const tap = (k) => {
    if (k === 'del') return setAbha((v) => v.slice(0, -1))
    if (k === 'ok') return ready && submit()
    setAbha((v) => (v.length < 14 ? v + k : v))
  }

  const submit = () => {
    if (!ready) return
    s.patch({
      patient:
        mode === 'abha'
          ? demoSystem === 'allopathy'
            ? { name: 'Aarav', id: 'DEMO-ALLO-001', abha: pretty }
            : demoSystem === 'ayush'
              ? { name: 'Ananya', id: 'DEMO-AYUSH-001', abha: pretty }
              : { name: 'Aarav', id: 'PID-9876-5432', abha: pretty }
          : { name: form.name.trim().split(' ')[0], id: 'PID-NEW-2041', ...form },
      consultationSystem: null,
      symptoms: [],
      transcript: '',
      intakeAnswers: [],
    })
    nav(mode === 'abha' ? '/system' : '/home')
  }

  return (
    <div className="flex min-h-full flex-col px-4 pb-4 pt-4">
      <h1 className="text-[26px] font-extrabold leading-tight tracking-tight">
        {s.t('welcomeKiosk')}
      </h1>
      <p className="mt-1 text-[14px] font-semibold text-slate-600">{s.t('selectOption')}</p>

      {/* method switch */}
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <Method
          active={mode === 'abha'}
          onClick={() => setMode('abha')}
          icon={IdCard}
          label={s.t('useAbha')}
        />
        <Method
          active={mode === 'new'}
          onClick={() => setMode('new')}
          icon={UserPlus}
          label={s.t('newPatient')}
        />
      </div>

      {mode === 'abha' ? (
        <div className="mt-5 animate-rise">
          <label className="text-[13px] font-bold text-slate-500">{s.t('enterAbha')}</label>
          <div className="mt-1 flex items-center border-b-[3px] border-brand-600 pb-1.5">
            <span
              className={`flex-1 font-mono text-[24px] font-bold tracking-tight ${
                abha ? 'text-ink' : 'text-slate-300'
              }`}
            >
              {pretty || 'XXXX-XXXX-XXXX-XX'}
            </span>
            <span className="text-[12px] font-bold text-slate-400">{abha.length}/14</span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {KEYS.map((k) => (
              <button
                key={k}
                onClick={() => tap(k)}
                disabled={k === 'ok' && !ready}
                aria-label={k === 'del' ? 'Delete' : k === 'ok' ? 'Confirm' : k}
                className={`tap flex h-14 items-center justify-center rounded-2xl border-2 text-[22px] font-extrabold ${
                  k === 'del'
                    ? 'border-red-100 bg-red-50 text-danger'
                    : k === 'ok'
                      ? 'border-brand-600 bg-brand-600 text-white disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none'
                      : 'border-slate-200 bg-white text-ink hover:border-brand-300'
                }`}
              >
                {k === 'del' ? (
                  <Delete size={24} strokeWidth={2.6} />
                ) : k === 'ok' ? (
                  <Check size={26} strokeWidth={3} />
                ) : (
                  k
                )}
              </button>
            ))}
          </div>
          <aside className="mt-4 rounded-2xl border border-dashed border-brand-200 bg-brand-50 px-3.5 py-3" aria-label="Demo account details">
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-brand-700">Presentation demo accounts</p>
            <p className="mt-1 text-[12px] font-semibold leading-snug text-slate-600"><span className="font-mono font-bold text-ink">0000 0000 0000 00</span> and <span className="font-mono font-bold text-ink">1111 1111 1111 11</span> load sample patient details. You will then choose Allopathic or Ayurvedic care.</p>
          </aside>
        </div>
      ) : (
        <div className="mt-5 animate-rise space-y-3">
          <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Aarav Sharma" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Age" value={form.age} onChange={(v) => setForm({ ...form, age: v.replace(/\D/g, '').slice(0, 3) })} placeholder="32" inputMode="numeric" />
            <div>
              <label className="text-[13px] font-bold text-slate-500">Gender</label>
              <div className="mt-1 flex gap-1.5">
                {['Female', 'Male', 'Other'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setForm({ ...form, gender: g })}
                    className={`tap flex-1 rounded-xl border-2 px-1 py-2.5 text-[12px] font-bold ${
                      form.gender === g
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-slate-200 bg-white text-slate-500'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Field label="Mobile number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit number" inputMode="numeric" />
        </div>
      )}

      <div className="mt-auto flex items-center gap-2.5 pt-6">
        <button onClick={() => nav('/language')} className="btn-ghost flex-1">
          <ArrowLeft size={20} strokeWidth={2.8} /> {s.t('back')}
        </button>
        <button onClick={submit} disabled={!ready} className="btn-primary flex-[1.4] disabled:bg-slate-300 disabled:shadow-none">
          {s.t('next')} <ArrowRight size={20} strokeWidth={2.8} />
        </button>
      </div>
    </div>
  )
}

function Method({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`tap flex flex-col items-center justify-center gap-2 rounded-2xl border-2 px-2 py-4 text-center ${
        active ? 'border-brand-600 bg-brand-50 shadow-lift' : 'border-slate-200 bg-white'
      }`}
    >
      <Icon size={26} strokeWidth={2.4} className={active ? 'text-brand-600' : 'text-slate-400'} />
      <span className={`text-[14px] font-extrabold leading-tight ${active ? 'text-brand-700' : 'text-slate-600'}`}>
        {label}
      </span>
    </button>
  )
}

function Field({ label, value, onChange, placeholder, inputMode = 'text' }) {
  return (
    <div>
      <label className="text-[13px] font-bold text-slate-500">{label}</label>
      <input
        value={value}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border-2 border-slate-200 bg-white px-3.5 py-3 text-[16px] font-semibold outline-none focus:border-brand-600"
      />
    </div>
  )
}
