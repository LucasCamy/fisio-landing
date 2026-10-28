import type { Variants } from 'motion/react'

/** Gestos da revelação por etapas: só opacity e transform em string (compositor). */
const ease = [0.22, 1, 0.36, 1] as const
export const inOut = [0.65, 0, 0.35, 1] as const

export type RevealVariant = 'rise' | 'fade' | 'curtain' | 'wipe' | 'mask' | 'pop' | 'slide'

export const presets: Record<RevealVariant, Variants> = {
  // texto e blocos: sobe um pouco e aparece
  rise: {
    hidden: { opacity: 0, transform: 'translateY(28px)' },
    show: { opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.7, ease } },
  },
  fade: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.8, ease } },
  },
  // foto (curtain/wipe): a imagem aproxima de leve enquanto a capa recolhe (ver PhotoReveal)
  curtain: {
    hidden: { transform: 'scale(1.06)' },
    show: { transform: 'scale(1)', transition: { duration: 1.4, ease: inOut } },
  },
  wipe: {
    hidden: { transform: 'scale(1.04)' },
    show: { transform: 'scale(1)', transition: { duration: 1.3, ease: inOut } },
  },
  // título: linha sobe por trás de uma máscara (usar dentro de <MaskTitle>)
  mask: {
    hidden: { transform: 'translateY(105%)' },
    show: { transform: 'translateY(0%)', transition: { duration: 0.9, ease } },
  },
  // selos e etiquetas
  pop: {
    hidden: { opacity: 0, transform: 'scale(0.9)' },
    show: { opacity: 1, transform: 'scale(1)', transition: { duration: 0.5, ease } },
  },
  // itens de lista lateral
  slide: {
    hidden: { opacity: 0, transform: 'translateX(-20px)' },
    show: { opacity: 1, transform: 'translateX(0px)', transition: { duration: 0.6, ease } },
  },
}
