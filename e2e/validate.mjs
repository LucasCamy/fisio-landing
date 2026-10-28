// Validação visual e de layout com Playwright (sem test runner):
//   node e2e/validate.mjs http://localhost:5173
// Gera screenshots em e2e/screenshots e imprime um relatório JSON.
import { chromium } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'

const base = process.argv[2] ?? 'http://localhost:5173'
const out = 'e2e/screenshots'
mkdirSync(out, { recursive: true })

const channel = process.env.PW_CHANNEL ?? 'msedge'
const browser = await chromium.launch({ channel })
const report = { base, channel, runs: [] }

const OVERFLOW = `(() => { const iw = document.documentElement.clientWidth; const bad = [];
  for (const e of document.querySelectorAll('main *, footer *, header *')) {
    const r = e.getBoundingClientRect(); if (!r.width || r.right <= iw + 1) continue;
    let p = e.parentElement, clipped = false;
    while (p && p !== document.body) { if (/(hidden|clip|auto|scroll)/.test(getComputedStyle(p).overflowX) && p.getBoundingClientRect().right <= iw + 1) { clipped = true; break; } p = p.parentElement; }
    if (!clipped) bad.push(e.tagName + ' ' + (e.textContent || '').trim().slice(0, 30)); }
  const broken = [...new Set([...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href')))].filter(h => h.length > 1 && !document.getElementById(h.slice(1)));
  return { iw, scrollW: document.documentElement.scrollWidth, overflow: bad.slice(0, 10), brokenAnchors: broken }; })()`

async function run({ width, height = 900, reducedMotion, query = '', shots = false, label }) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion, deviceScaleFactor: 1 })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push('console: ' + m.text()))
  await page.goto(base + '/' + query, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)

  // Rola a página inteira em passos para disparar lazy loading e cenas
  const total = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < total; y += Math.round(height * 0.8)) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)
    await page.waitForTimeout(60)
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(300)

  const layout = await page.evaluate(OVERFLOW)
  const h1Lines = await page.evaluate(() => {
    const h1 = document.querySelector('h1')
    const lh = parseFloat(getComputedStyle(h1).lineHeight)
    return Math.round(h1.getBoundingClientRect().height / lh)
  })
  const wrappedButtons = await page.evaluate(() =>
    [...document.querySelectorAll('a.rounded-full, button.rounded-full')]
      .filter((b) => b.offsetParent && b.getClientRects().length && b.getBoundingClientRect().height > 64)
      .map((b) => b.textContent.trim().slice(0, 40)),
  )
  const frameFormat = await page.evaluate(async () => {
    const ok = await new Promise((res) => {
      const img = new Image()
      img.src = '/media/frames/frame_0001.avif'
      img.decode().then(() => res(img.naturalWidth), () => res(0))
    })
    return { avifFrame0001Width: ok, sceneFormat: document.querySelector('#abordagem')?.getAttribute('data-frame-format') }
  })

  if (shots) {
    const ids = ['inicio', 'queixas', 'abordagem', 'atendimento', 'como-funciona', 'sobre', 'duvidas', 'contato']
    for (const id of ids) {
      // Posição real (considera o pin-spacer de cenas fixadas)
      const top = await page.evaluate((id) => {
        const el = document.getElementById(id)
        const spacer = el.querySelector('.pin-spacer')
        const target = spacer ?? el
        return target.getBoundingClientRect().top + window.scrollY - (spacer ? 0 : 76)
      }, id)
      await page.evaluate((t) => window.scrollTo({ top: t, behavior: 'instant' }), top)
      await page.waitForTimeout(1200)
      await page.screenshot({ path: `${out}/${label}-${id}.png` })
      if (id === 'abordagem' && reducedMotion === 'no-preference' && width >= 1024) {
        // Meio e fim da cena fixada
        const spacerH = await page.evaluate(() => document.querySelector('#abordagem .pin-spacer')?.getBoundingClientRect().height ?? 0)
        for (const f of [0.45, 0.95]) {
          await page.evaluate((t) => window.scrollTo({ top: t, behavior: 'instant' }), top + (spacerH - height) * f)
          await page.waitForTimeout(1500)
          await page.screenshot({ path: `${out}/${label}-abordagem-${Math.round(f * 100)}.png` })
        }
      }
    }
  }

  report.runs.push({ label, width, reducedMotion, query, errors, h1Lines, wrappedButtons, ...layout, ...frameFormat })
  await context.close()
}

const widths = [360, 375, 390, 768, 1024, 1280, 1440, 1920]
for (const width of widths) {
  for (const reducedMotion of ['no-preference', 'reduce']) {
    await run({ width, reducedMotion, label: `w${width}-${reducedMotion}` })
  }
}
await run({ width: 1440, reducedMotion: 'reduce', query: '?movimento=1', label: 'w1440-reduce-movimento1', shots: false })
await run({ width: 1440, reducedMotion: 'no-preference', shots: true, label: 'desk' })
await run({ width: 1440, reducedMotion: 'reduce', shots: true, label: 'desk-reduce' })
await run({ width: 390, height: 844, reducedMotion: 'no-preference', shots: true, label: 'mob' })

await browser.close()
writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2))
const summary = report.runs.map((r) => ({
  label: r.label,
  scrollOverflow: r.scrollW - r.iw,
  overflow: r.overflow.length,
  anchors: r.brokenAnchors.length,
  h1Lines: r.h1Lines,
  wrapped: r.wrappedButtons.length,
  errors: r.errors.length,
  avif: r.avifFrame0001Width,
  scene: r.sceneFormat,
}))
console.table(summary)
for (const r of report.runs) {
  if (r.errors.length || r.overflow.length || r.wrappedButtons.length) {
    console.log(r.label, JSON.stringify({ errors: r.errors.slice(0, 5), overflow: r.overflow, wrapped: r.wrappedButtons }))
  }
}
