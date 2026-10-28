import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { useRef, useState } from 'react'
import { processSteps } from '../../data/content'
import { cn } from '../../lib/cn'
import { forceMotion, gsap, MOTION_OK, ScrollTrigger, useGSAP } from '../../lib/scroll'
import { BicolorTitle } from '../ui/BicolorTitle'
import { Picture } from '../ui/Picture'
import { RevealGroup, RevealItem } from '../ui/Reveal'

const pad = (n: number) => String(n).padStart(2, '0')
const TOTAL = processSteps.length

export function ProcessStickySection() {
  const scope = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const step = processSteps[active]!

  useGSAP(
    () => {
      // Etapa ativa: sempre calculada (também com movimento reduzido), só troca estado no limiar
      const items = gsap.utils.toArray<HTMLElement>('[data-step]')
      items.forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => {
            if (self.isActive) setActive(i)
          },
        })
      })
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          '[data-axis-fill]',
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: '[data-timeline]', start: 'top 55%', end: 'bottom 55%', scrub: 0.5 },
          },
        )
      })
      return () => mm.revert()
    },
    { scope },
  )

  return (
    <MotionConfig reducedMotion={forceMotion ? 'never' : 'user'}>
      <section id="como-funciona" ref={scope} aria-labelledby="processo-title" className="scroll-mt-24 bg-bg pt-24 sm:pt-32">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6">
          <RevealGroup>
            <BicolorTitle id="processo-title" strong="Da primeira avaliação" soft="à sua alta sem dor" className="max-w-3xl" reveal />
          </RevealGroup>

          <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-10 lg:mt-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
            {/* Moldura fixada (desktop) */}
            <div className="hidden lg:block">
              <div className="sticky top-[96px]">
                <div className="relative aspect-[4/5] max-h-[calc(100dvh-140px)] overflow-hidden rounded-[28px] bg-surface-card">
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={step.id}
                      className="absolute inset-0"
                      initial={{ opacity: 0, scale: 1.03 }}
                      animate={{ opacity: 1, scale: 1, transition: { duration: 0.56, ease: [0.22, 1, 0.36, 1] } }}
                      exit={{ opacity: 0, transition: { duration: 0.4 } }}
                    >
                      <Picture
                        name={step.image}
                        alt={`${step.phase}: ${step.title}`}
                        width={1000}
                        height={1250}
                        sizes="560px"
                        className="block h-full w-full"
                        imgClassName="h-full w-full object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>
                  <p
                    className="glass absolute left-4 top-4 rounded-full px-4 py-2 font-data text-[13px] font-semibold text-ink shadow-soft tabular"
                    aria-live="polite"
                    data-testid="process-badge"
                  >
                    {pad(active + 1)} / {pad(TOTAL)} · {step.badge}
                  </p>
                </div>
              </div>
            </div>

            {/* Linha do tempo */}
            <ol data-timeline className="relative">
              <span aria-hidden className="absolute bottom-6 left-[19px] top-6 w-px bg-line-strong" />
              <span
                aria-hidden
                data-axis-fill
                className="absolute bottom-6 left-[19px] top-6 w-px origin-top bg-accent"
              />
              {processSteps.map((s, i) => {
                const isActive = i === active
                return (
                  <li key={s.id} data-step className="relative pb-14 pl-16 last:pb-0 lg:min-h-[52dvh] lg:pb-0">
                    <span
                      className={cn(
                        'absolute left-0 top-0 grid size-10 place-items-center rounded-full border font-data text-sm font-semibold tabular',
                        isActive ? 'border-accent bg-accent text-white' : 'border-line-strong bg-white text-ink',
                      )}
                      aria-hidden
                    >
                      {pad(i + 1)}
                    </span>
                    <RevealGroup at={0.2} stagger={0.09}>
                    <RevealItem as="p" variant="slide" className="pt-2 font-data text-xs font-semibold uppercase tracking-[0.14em] text-ink-body">
                      {s.phase}
                    </RevealItem>
                    <RevealItem>
                      <h3 className="mt-2 font-display text-[clamp(1.5rem,2.6vw,2.1rem)] font-semibold leading-tight text-ink">
                        {s.title}
                      </h3>
                    </RevealItem>
                    <RevealItem as="p" className="mt-3 max-w-[34rem] text-[16.5px] leading-relaxed text-ink-body">
                      {s.text}
                    </RevealItem>
                    <RevealItem variant="curtain" cover="bg-bg" className="mt-6 rounded-[24px] lg:hidden">
                      <Picture
                        name={s.image}
                        alt={`${s.phase}: ${s.title}`}
                        width={1000}
                        height={1250}
                        sizes="92vw"
                        className="block aspect-[4/5] max-h-[520px]"
                        imgClassName="h-full w-full object-cover"
                      />
                    </RevealItem>
                    </RevealGroup>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </section>
    </MotionConfig>
  )
}
