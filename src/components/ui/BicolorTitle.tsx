import { motion } from 'motion/react'
import { cn } from '../../lib/cn'
import { presets } from './revealPresets'

interface BicolorTitleProps {
  as?: 'h1' | 'h2'
  strong: string
  soft: string
  id?: string
  className?: string
  /** Quebra o complemento para a linha seguinte. */
  breakSoft?: boolean
  /** Sobe por trás de uma máscara, seguindo o RevealGroup em que está */
  reveal?: boolean
}

/** Assinatura tipográfica: palavras principais em --ink, complemento em --ink-soft. */
export function BicolorTitle({ as: Tag = 'h2', strong, soft, id, className, breakSoft, reveal }: BicolorTitleProps) {
  const content = (
    <>
      {strong} {breakSoft && <br className="hidden sm:block" />}
      <span className="text-ink-soft">{soft}</span>
    </>
  )
  return (
    <Tag
      id={id}
      className={cn(
        'font-display font-semibold text-ink',
        Tag === 'h2' && 'text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.02]',
        className,
      )}
    >
      {reveal ? (
        <span className="block overflow-hidden pb-[0.08em]">
          <motion.span className="block" variants={presets.mask}>
            {content}
          </motion.span>
        </span>
      ) : (
        content
      )}
    </Tag>
  )
}
