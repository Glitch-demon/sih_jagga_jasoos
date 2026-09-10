// Dev-only smoke test: server-renders every route to catch import/runtime errors.
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import App from '../src/App.jsx'
import { SessionProvider } from '../src/store/session.jsx'

const ROUTES = [
  '/',
  '/language',
  '/login',
  '/home',
  '/assistant',
  '/type',
  '/scan',
  '/review',
  '/done',
  '/history',
  '/nope',
]

let failed = 0
for (const route of ROUTES) {
  try {
    const html = renderToString(
      <MemoryRouter initialEntries={[route]}>
        <SessionProvider>
          <App />
        </SessionProvider>
      </MemoryRouter>
    )
    if (html.length < 200) throw new Error(`suspiciously small output (${html.length} chars)`)
    console.log(`  ok   ${route.padEnd(12)} ${html.length} chars`)
  } catch (err) {
    failed++
    console.log(`  FAIL ${route.padEnd(12)} ${err.message}`)
  }
}

console.log(failed ? `\n${failed} route(s) failed` : `\nAll ${ROUTES.length} routes rendered`)
process.exit(failed ? 1 : 0)
