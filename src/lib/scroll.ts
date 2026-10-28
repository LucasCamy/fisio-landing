import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSyncExternalStore } from 'react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export { gsap, ScrollTrigger, useGSAP }

/** `?movimento=1` força as animações mesmo com "reduzir movimento" ligado (demonstração/QA). */
export const forceMotion =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('movimento') === '1'

if (forceMotion) document.documentElement.classList.add('force-motion')

const REDUCE_QUERY = '(prefers-reduced-motion: reduce)'

/** Query para gsap.matchMedia(): só anima quando movimento é permitido. */
export const MOTION_OK = forceMotion ? '(min-width: 0px)' : '(prefers-reduced-motion: no-preference)'
export const MOTION_OK_DESKTOP = `${MOTION_OK} and (min-width: 1024px)`
export const MOTION_OK_MOBILE = `${MOTION_OK} and (max-width: 1023.98px)`

function subscribeReduce(cb: () => void) {
  const mq = window.matchMedia(REDUCE_QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

export function useMotionAllowed(): boolean {
  return useSyncExternalStore(
    subscribeReduce,
    () => forceMotion || !window.matchMedia(REDUCE_QUERY).matches,
    () => true,
  )
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/**
 * Rolagem nativa. O Lenis foi removido após medição (docs/perf): com ele ~50% dos quadros
 * saíam parciais em todas as seções (CPU 4x); sem ele, 1–6% fora das cenas pesadas.
 * As cenas GSAP continuam suaves com `scrub`.
 */
export function scrollToHash(hash: string) {
  const target = document.querySelector<HTMLElement>(hash)
  if (!target) return
  const smooth = forceMotion || !window.matchMedia(REDUCE_QUERY).matches
  target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
}
