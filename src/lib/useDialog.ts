import { useEffect, type RefObject } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * Comportamento comum de diálogo: prende o foco, Esc fecha, trava o scroll e devolve o foco
 * a quem abriu. Travar o scroll e focar ficam para o quadro seguinte ao clique: no mesmo
 * quadro forçavam layout durante a montagem (medido com perf-modal, docs/perf).
 */
export function useDialog(open: boolean, onClose: () => void, panelRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    const html = document.documentElement
    const prev = { overflow: html.style.overflow, paddingRight: html.style.paddingRight }

    const raf = requestAnimationFrame(() => {
      // Compensa a barra de rolagem que some, para o conteúdo não pular de lado
      const scrollbar = window.innerWidth - html.clientWidth
      html.style.overflow = 'hidden'
      if (scrollbar > 0) html.style.paddingRight = `${scrollbar}px`
      const panel = panelRef.current
      const first = panel?.querySelector<HTMLElement>('[data-autofocus]') ?? panel?.querySelector<HTMLElement>(FOCUSABLE)
      ;(first ?? panel)?.focus({ preventScroll: true })
    })

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null,
      )
      if (!items.length) return
      const first = items[0]!
      const last = items[items.length - 1]!
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKey)
      html.style.overflow = prev.overflow
      html.style.paddingRight = prev.paddingRight
      opener?.focus({ preventScroll: true })
    }
  }, [open, onClose, panelRef])
}
