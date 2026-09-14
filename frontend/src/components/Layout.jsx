import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Accessibility,
  ArrowLeft,
  Cross,
  Globe,
  House,
  Languages,
  Lock,
  PhoneCall,
  Siren,
  Type,
  Volume2,
  VolumeX,
} from 'lucide-react'
import ProgressBar from './ProgressBar.jsx'
import Sheet from './Sheet.jsx'
import { LANGUAGES } from '../data/i18n.js'
import { useSession } from '../store/session.jsx'

export default function Layout() {
  const s = useSession()
  const nav = useNavigate()
  const { pathname } = useLocation()
  const [sos, setSos] = useState(false)
  const [a11y, setA11y] = useState(false)
  const isIdle = pathname === '/'

  const openLanguage = () => nav('/language', { state: { returnTo: pathname } })
  const goBack = () => {
    const fallback = {
      '/language': '/',
      '/login': '/language',
      '/home': '/login',
      '/system': '/home',
      '/assistant': '/system',
      '/type': '/assistant',
      '/scan': '/home',
      '/review': '/home',
      '/done': '/review',
      '/history': '/home',
    }[pathname] || '/'

    if (window.history.length > 1) nav(-1)
    else nav(fallback)
  }

  // Accessibility: "larger text" scales the whole rem-based type scale.
  useEffect(() => {
    document.documentElement.style.fontSize = s.largeText ? '18px' : '16px'
  }, [s.largeText])

  useEffect(() => {
    const language = LANGUAGES.find((item) => item.code === s.lang)
    document.documentElement.lang = s.lang
    document.documentElement.dir = language?.rtl ? 'rtl' : 'ltr'
  }, [s.lang])

  return (
    <div className="flex min-h-full items-center justify-center sm:p-6">
      <div className="relative flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-canvas sm:h-[880px] sm:rounded-[2.5rem] sm:border-[10px] sm:border-slate-900 sm:shadow-2xl">
        {/* ── Top bar ─────────────────────────────────────────── */}
        <header className="z-20 flex shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3 py-2.5">
          {!isIdle && (
            <button
              onClick={goBack}
              className="tap grid h-11 w-11 shrink-0 place-items-center rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label={s.t('back')}
              title={s.t('back')}
            >
              <ArrowLeft size={22} strokeWidth={2.6} />
            </button>
          )}
          <button
            onClick={() => nav('/')}
            className="tap flex items-center gap-1.5 rounded-xl px-1 py-1"
            aria-label="MediKiosk home"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
              <Cross size={18} strokeWidth={3} />
            </span>
            <span className="text-[17px] font-extrabold tracking-tight text-brand-700">
              MediKiosk
            </span>
          </button>

          <div className="ml-auto flex items-center gap-1">
            {!isIdle && (
              <button
                onClick={() => nav('/home')}
                className="tap flex flex-col items-center rounded-xl px-2 py-1 text-slate-600 hover:bg-slate-100"
              >
                <House size={20} strokeWidth={2.4} />
                <span className="text-[10px] font-semibold">{s.t('home')}</span>
              </button>
            )}
            <button
              onClick={openLanguage}
              className="tap flex flex-col items-center rounded-xl px-2 py-1 text-slate-600 hover:bg-slate-100"
            >
              <Languages size={20} strokeWidth={2.4} />
              <span className="text-[10px] font-semibold">{s.t('translate')}</span>
            </button>
            <button
              onClick={() => setSos(true)}
              className="tap flex items-center gap-1.5 rounded-full bg-danger px-3 py-2 text-[13px] font-extrabold text-white shadow-md hover:bg-red-800"
            >
              <Siren size={17} strokeWidth={2.8} />
              SOS
            </button>
          </div>
        </header>

        <ProgressBar />

        {/* ── Screen ──────────────────────────────────────────── */}
        <main
          className="no-scrollbar relative flex-1 overflow-y-auto overscroll-contain"
          lang={s.lang}
          dir={LANGUAGES.find((item) => item.code === s.lang)?.rtl ? 'rtl' : 'ltr'}
        >
          <Outlet />
        </main>

        {/* ── Privacy footer ──────────────────────────────────── */}
        <footer className="z-20 shrink-0 border-t border-aqua-200 bg-aqua-300 px-3 py-2">
          <div className="flex items-center gap-2">
            <Lock size={14} strokeWidth={3} className="shrink-0 text-aqua-900" />
            <p className="flex-1 text-[11px] font-semibold leading-tight text-aqua-900">
              {s.t('privacy')}
            </p>
            <button
              onClick={() => setA11y(true)}
              className="tap flex items-center gap-1 rounded-lg px-1.5 py-1 text-[11px] font-bold text-aqua-900 hover:bg-white/40"
            >
              <Accessibility size={14} strokeWidth={2.8} />
              {s.t('accessibility')}
            </button>
            <button
              onClick={openLanguage}
              className="tap flex items-center gap-1 rounded-lg px-1.5 py-1 text-[11px] font-bold text-aqua-900 hover:bg-white/40"
            >
              <Globe size={14} strokeWidth={2.8} />
              {s.t('language')}
            </button>
          </div>
        </footer>

        {/* ── SOS sheet ───────────────────────────────────────── */}
        <Sheet open={sos} onClose={() => setSos(false)} title={s.t('sos')} tone="danger">
          <p className="text-[15px] font-medium text-slate-600">
            A staff member has been notified and is on the way to this kiosk. Stay where you are.
          </p>
          <div className="mt-4 space-y-2">
            {[
              { label: 'Help desk', num: 'Ext. 104', icon: PhoneCall },
              { label: 'Medical emergency', num: '108', icon: Siren },
            ].map(({ label, num, icon: Icon }) => (
              <div key={label} className="card flex items-center gap-3 px-4 py-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-red-50 text-danger">
                  <Icon size={20} strokeWidth={2.6} />
                </span>
                <span className="flex-1 text-[15px] font-bold">{label}</span>
                <span className="text-[15px] font-extrabold text-danger">{num}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setSos(false)} className="btn-primary mt-4 w-full">
            Okay, I understand
          </button>
        </Sheet>

        {/* ── Accessibility sheet ─────────────────────────────── */}
        <Sheet open={a11y} onClose={() => setA11y(false)} title="Accessibility Settings">
          <div className="space-y-2">
            <Toggle
              icon={s.voice ? Volume2 : VolumeX}
              label="Voice guidance"
              hint="Read every screen aloud"
              on={s.voice}
              onClick={() => s.patch({ voice: !s.voice })}
            />
            <Toggle
              icon={Type}
              label="Larger text"
              hint="Increase text size across the app"
              on={s.largeText}
              onClick={() => s.patch({ largeText: !s.largeText })}
            />
          </div>
          <div className="mt-4">
            <p className="mb-2 text-[13px] font-bold uppercase tracking-wide text-slate-400">
              {s.t('language')}
            </p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => s.patch({ lang: l.code })}
                  className={`tap rounded-xl border-2 px-3 py-2 text-[14px] font-bold ${
                    s.lang === l.code
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  {l.native}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setA11y(false)} className="btn-primary mt-4 w-full">
            Done
          </button>
        </Sheet>
      </div>
    </div>
  )
}

function Toggle({ icon: Icon, label, hint, on, onClick }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      className="card tap flex w-full items-center gap-3 px-4 py-3 text-left"
    >
      <span
        className={`grid h-10 w-10 place-items-center rounded-full ${
          on ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-400'
        }`}
      >
        <Icon size={20} strokeWidth={2.6} />
      </span>
      <span className="flex-1">
        <span className="block text-[15px] font-bold">{label}</span>
        <span className="block text-[12px] font-medium text-slate-500">{hint}</span>
      </span>
      <span
        className={`relative h-7 w-12 rounded-full transition-colors ${
          on ? 'bg-brand-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
            on ? 'left-6' : 'left-1'
          }`}
        />
      </span>
    </button>
  )
}
