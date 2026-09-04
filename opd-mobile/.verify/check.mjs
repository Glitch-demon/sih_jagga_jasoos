import { writeFileSync } from 'fs'

const PORT = process.env.CDP_PORT || '9350'
const BASE = 'http://localhost:5175'

const tabs = await (await fetch(`http://localhost:${PORT}/json`)).json()
const page = tabs.find((t) => t.type === 'page')
const ws = new WebSocket(page.webSocketDebuggerUrl)
let id = 0
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const mid = ++id
    const h = (e) => {
      const m = JSON.parse(e.data)
      if (m.id === mid) {
        ws.removeEventListener('message', h)
        resolve(m.result)
      }
    }
    ws.addEventListener('message', h)
    ws.send(JSON.stringify({ id: mid, method, params }))
  })

await new Promise((r) => ws.addEventListener('open', r))
await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  mobile: true,
})

const routes = ['/', '/language', '/login', '/home', '/assistant', '/type', '/scan', '/review', '/done', '/history']
let bad = 0
for (const route of routes) {
  await send('Page.navigate', { url: BASE + route })
  await new Promise((r) => setTimeout(r, 1000))
  const expr = `(()=>{const vw=innerWidth;let n=0;let minKeyW=999;document.querySelectorAll("body *").forEach(el=>{const r=el.getBoundingClientRect();if(r.right>vw+0.5)n++;if((el.className||"").toString().split(" ")[0]==="key"&&r.width>0)minKeyW=Math.min(minKeyW,Math.round(r.width));});return JSON.stringify({over:n,minKeyW:minKeyW===999?null:minKeyW});})()`
  const out = (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result.value
  const p = JSON.parse(out)
  if (p.over > 0) bad++
  console.log((p.over === 0 ? '  OK  ' : ' FAIL '), route.padEnd(11), out)
}

await send('Page.navigate', { url: BASE + '/type' })
await new Promise((r) => setTimeout(r, 1300))
const { data } = await send('Page.captureScreenshot', { format: 'png' })
writeFileSync('.verify/fixed_type.png', Buffer.from(data, 'base64'))
console.log('routes_with_overflow:', bad, '/', routes.length)
ws.close()
