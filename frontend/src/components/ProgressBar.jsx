import { useLocation } from 'react-router-dom'

// Ordered flow used to render the thin progress bar at the top of the kiosk.
const STEPS = ['/', '/language', '/login', '/home', '/system', '/assistant', '/scan', '/review', '/done']

export default function ProgressBar() {
  const { pathname } = useLocation()
  const idx = STEPS.indexOf(pathname === '/type' ? '/assistant' : pathname)
  const pct = idx <= 0 ? 0 : ((idx + 1) / STEPS.length) * 100

  return (
    <div
      className="h-1.5 w-full bg-slate-200"
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Check-in progress"
    >
      <div
        className="h-full rounded-r-full bg-brand-600 transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
