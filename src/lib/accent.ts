import { accentThemes, type AccentTheme } from '../config/site'

const KEY = 'fisio:accent'
const isTheme = (v: unknown): v is AccentTheme => accentThemes.some((t) => t.id === v)

/** Ordem: ?acento=sage|blue → preferência salva → padrão azul. */
export function initialAccent(): AccentTheme {
  const param = new URLSearchParams(window.location.search).get('acento')
  if (param === 'sage') return 'clinical-sage'
  if (param === 'blue') return 'clinical-blue'
  try {
    const saved = localStorage.getItem(KEY)
    if (isTheme(saved)) return saved
  } catch {
    // armazenamento bloqueado: segue com o padrão
  }
  return 'clinical-blue'
}

export function applyAccent(theme: AccentTheme, persist = true) {
  document.documentElement.dataset.accent = theme
  if (!persist) return
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // sem persistência, a escolha vale só nesta visita
  }
}
