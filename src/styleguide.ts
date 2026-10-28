import '@fontsource-variable/bricolage-grotesque/index.css'
import '@fontsource-variable/manrope/index.css'
import '@fontsource/jetbrains-mono/latin-500.css'
import '@fontsource/jetbrains-mono/latin-600.css'
import './styles/globals.css'
import { contrastRatio, parseColor } from './lib/contrast'

const SWATCHES = [
  'bg',
  'surface-card',
  'surface-elevated',
  'night-clinical',
  'ink',
  'ink-body',
  'ink-soft',
  'accent',
  'accent-action',
  'accent-halo',
]

const PAIRS: [text: string, surface: string, use: string, min: number][] = [
  ['ink', 'bg', 'Títulos e texto forte', 4.5],
  ['ink', 'surface-card', 'Títulos nos módulos', 4.5],
  ['ink-body', 'bg', 'Parágrafos', 4.5],
  ['ink-body', 'surface-card', 'Parágrafos nos módulos', 4.5],
  ['ink-soft', 'bg', 'Complemento de título (≥ 32px)', 3],
  ['ink-soft', 'surface-card', 'Complemento de título (≥ 32px)', 3],
  ['on-accent', 'accent-action', 'Texto do botão principal', 4.5],
  ['accent', 'bg', 'Marcas gráficas e foco', 3],
  ['accent', 'surface-card', 'Marcas gráficas e foco', 3],
  ['accent-action', 'bg', 'Link "Saiba mais"', 4.5],
  ['ink-on-night', 'night-clinical', 'Texto no bloco de contato', 4.5],
  ['ink-on-night-muted', 'night-clinical', 'Texto secundário no contato', 4.5],
  ['warning', 'surface-card', 'Aviso de sinais de alerta', 4.5],
]

const css = () => getComputedStyle(document.documentElement)
const token = (name: string) => css().getPropertyValue(`--${name}`).trim()

function render() {
  const swatches = document.getElementById('swatches')!
  swatches.innerHTML = SWATCHES.map(
    (name) => `<figure class="overflow-hidden rounded-[16px] border border-line">
      <div class="h-20" style="background: var(--${name})"></div>
      <figcaption class="p-3 font-data text-xs"><span class="block font-semibold text-ink">--${name}</span><span class="text-ink-body">${token(name)}</span></figcaption>
    </figure>`,
  ).join('')

  const rows = document.getElementById('contrast-rows')!
  rows.innerHTML = PAIRS.map(([t, s, use, min]) => {
    const ratio = contrastRatio(parseColor(token(t)), parseColor(token(s)))
    const ok = ratio >= min
    return `<tr>
      <td class="px-4 py-3"><span class="inline-block size-3 rounded-full align-middle" style="background:var(--${t})"></span> --${t}</td>
      <td class="px-4 py-3">--${s}</td>
      <td class="px-4 py-3 font-sans text-ink-body">${use}</td>
      <td class="px-4 py-3 font-semibold">${ratio.toFixed(2).replace('.', ',')}:1</td>
      <td class="px-4 py-3">${ok ? '● passa' : '■ reprova'} (≥ ${String(min).replace('.', ',')})</td>
    </tr>`
  }).join('')

  document.querySelectorAll<HTMLButtonElement>('#accent-switch button').forEach((b) => {
    const active = b.dataset.accent === document.documentElement.dataset.accent
    b.setAttribute('aria-pressed', String(active))
    b.classList.toggle('bg-surface-card', active)
  })
}

document.querySelectorAll<HTMLButtonElement>('#accent-switch button').forEach((b) =>
  b.addEventListener('click', () => {
    document.documentElement.dataset.accent = b.dataset.accent
    render()
  }),
)

render()
