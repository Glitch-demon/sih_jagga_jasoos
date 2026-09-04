import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleCheck, Clock, DoorOpen, Home, Printer, Stethoscope } from 'lucide-react'
import { useSession } from '../store/session.jsx'
import { speak } from '../utils/speak.js'

/** Screen 9 — queue token issued. Auto-returns to idle like a real kiosk. */
export default function Done() {
  const nav = useNavigate()
  const s = useSession()
  const [left, setLeft] = useState(30)

  useEffect(() => {
    if (s.voice) speak('Your token number is A 24. Please proceed to room 12 on the ground floor.', s.lang)
  }, [s.voice, s.lang])

  useEffect(() => {
    const id = setInterval(() => setLeft((n) => n - 1), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (left <= 0) {
      s.reset()
      nav('/')
    }
  }, [left, nav, s])

  return (
    <div className="flex min-h-full flex-col items-center bg-gradient-to-b from-aqua-100 to-white px-4 pb-4 pt-8 text-center">
      <span className="grid h-20 w-20 place-items-center rounded-full bg-aqua-200 text-aqua-700">
        <CircleCheck size={46} strokeWidth={2.4} />
      </span>
      <h1 className="mt-4 text-[27px] font-extrabold leading-tight tracking-tight">
        Sent to your doctor
      </h1>
      <p className="mt-1.5 max-w-[19rem] text-[14px] font-semibold leading-snug text-slate-600">
        Your details are on Dr. Sharma’s screen. Please wait for your token to be called.
      </p>

      <div className="card mt-5 w-full px-5 py-5">
        <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400">
          Your token
        </p>
        <p className="text-[54px] font-extrabold leading-none tracking-tight text-brand-600">
          A-24
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
          <Stat icon={DoorOpen} label="Room" value="12" />
          <Stat icon={Stethoscope} label="Doctor" value="Sharma" />
          <Stat icon={Clock} label="Wait" value="~18 min" />
        </div>
      </div>

      <div className="mt-auto w-full space-y-2.5 pt-6">
        <button onClick={() => window.print()} className="btn-ghost w-full">
          <Printer size={19} strokeWidth={2.6} /> Print token slip
        </button>
        <button
          onClick={() => {
            s.reset()
            nav('/')
          }}
          className="btn-primary w-full"
        >
          <Home size={20} strokeWidth={2.6} /> Finish ({Math.max(left, 0)}s)
        </button>
      </div>
    </div>
  )
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <Icon size={17} strokeWidth={2.6} className="text-slate-400" />
      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
      <span className="text-[14px] font-extrabold">{value}</span>
    </div>
  )
}
