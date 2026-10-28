import { ArrowLeft, ArrowRight, CheckCircle, WhatsappLogo } from '@phosphor-icons/react'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { useState, type KeyboardEvent } from 'react'
import { cases } from '../../data/content'
import { forceMotion } from '../../lib/scroll'
import { whatsappLinks } from '../../lib/whatsapp'
import { BicolorTitle } from '../ui/BicolorTitle'
import { ButtonLink } from '../ui/Button'
import { Picture } from '../ui/Picture'
import { RevealGroup, RevealItem } from '../ui/Reveal'

const TOTAL = cases.length
const pad = (n: number) => String(n).padStart(2, '0')

/** Distância circular do card ao ativo, de -2 a +2: o leque sempre fica completo. */
function fanOffset(index: number, active: number) {
  return ((index - active + TOTAL + 2) % TOTAL) - 2
}

const SPRING = { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 } as const

export function SymptomsFanSection() {
  const [active, setActive] = useState(0)
  const current = cases[active]!
  const go = (dir: 1 | -1) => setActive((a) => (a + dir + TOTAL) % TOTAL)

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(-1)
    }
  }

  return (
    <MotionConfig reducedMotion={forceMotion ? 'never' : 'user'}>
      <section id="queixas" aria-labelledby="queixas-title" className="scroll-mt-24 px-3 pt-24 sm:px-6 sm:pt-32">
        <div className="mx-auto max-w-[1360px] overflow-hidden rounded-[36px] bg-surface-card px-4 py-12 sm:px-10 sm:py-16 lg:px-14">
          <RevealGroup className="mx-auto max-w-2xl text-center" stagger={0.12}>
            <BicolorTitle id="queixas-title" strong="Com quais dores" soft="me procuram" reveal />
            <RevealItem as="p" className="mt-4 text-[17px] text-ink-body">
              Escolha a queixa mais parecida com a sua para ver por que ela costuma acontecer e o que é avaliado na
              primeira sessão.
            </RevealItem>
          </RevealGroup>

          <div className="mt-8 flex items-center justify-center gap-3" role="group" aria-label="Navegar entre as queixas">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Queixa anterior"
              className="press grid size-11 place-items-center rounded-full border border-line-strong bg-white text-ink [@media(hover:hover)]:hover:border-ink/30"
            >
              <ArrowLeft size={18} weight="bold" />
            </button>
            <p className="min-w-[5.5rem] text-center font-data text-sm text-ink tabular" aria-live="polite">
              <span className="font-semibold">{pad(active + 1)}</span>
              <span className="text-ink-soft"> / {pad(TOTAL)}</span>
              <span className="sr-only">: {current.title}</span>
            </p>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Próxima queixa"
              className="press grid size-11 place-items-center rounded-full border border-line-strong bg-white text-ink [@media(hover:hover)]:hover:border-ink/30"
            >
              <ArrowRight size={18} weight="bold" />
            </button>
          </div>

          {/* Leque em arco: -12°, -6°, 0°, +6°, +12° */}
          <div
            className="relative mx-auto mt-6 h-[clamp(300px,44vw,470px)] w-full max-w-[1100px] [--card-w:clamp(168px,23vw,300px)]"
            onKeyDown={onKey}
          >
            <ul className="contents" aria-label="Queixas atendidas">
              {cases.map((item, i) => {
                const offset = fanOffset(i, active)
                const isActive = offset === 0
                return (
                  <motion.li
                    key={item.id}
                    className="absolute left-1/2 top-2 w-[var(--card-w)] origin-[50%_120%]"
                    style={{ zIndex: 10 - Math.abs(offset), marginLeft: 'calc(var(--card-w) / -2)' }}
                    initial={false}
                    animate={{
                      x: `${offset * 58}%`,
                      y: Math.abs(offset) * Math.abs(offset) * 10 + Math.abs(offset) * 8,
                      rotate: offset * 6,
                      scale: isActive ? 1 : 0.9,
                    }}
                    transition={SPRING}
                  >
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      aria-pressed={isActive}
                      aria-label={`${item.title}: ver detalhes`}
                      className="group block w-full overflow-hidden rounded-[22px] bg-white text-left shadow-lift ring-1 ring-line transition-shadow aria-pressed:ring-2 aria-pressed:ring-accent"
                    >
                      <span className="relative block aspect-[4/5] overflow-hidden">
                        <Picture
                          name={item.image}
                          alt=""
                          width={800}
                          height={1000}
                          sizes="300px"
                          className="block h-full w-full"
                          imgClassName="h-full w-full object-cover transition-transform duration-[560ms] ease-[var(--ease-out)] [@media(hover:hover)]:group-hover:scale-[1.03]"
                        />
                        <span className="absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(to_top,rgb(10_15_29/0.82),transparent)]" />
                        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 font-data text-[11px] font-semibold text-ink tabular">
                          {pad(i + 1)}
                        </span>
                        <span className="absolute inset-x-0 bottom-0 p-4 text-white">
                          <span className="block font-display text-[clamp(15px,1.5vw,19px)] font-semibold leading-tight">
                            {item.title}
                          </span>
                        </span>
                      </span>
                    </button>
                  </motion.li>
                )
              })}
            </ul>
          </div>

          <div className="relative z-20 mx-auto -mt-2 max-w-[1100px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.article
                key={current.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }}
                exit={{ opacity: 0, y: -6, transition: { duration: 0.16 } }}
                className="grid grid-cols-[minmax(0,1fr)] gap-6 rounded-[24px] border border-line bg-surface-elevated p-6 shadow-soft sm:p-8 lg:grid-cols-[1fr_1.15fr_1fr] lg:gap-8"
                aria-live="polite"
              >
                <div>
                  <p className="font-data text-xs font-semibold uppercase tracking-[0.12em] text-accent tabular">
                    Queixa {pad(active + 1)}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-ink">{current.title}</h3>
                  <p className="mt-2 text-[15px] text-ink-body">{current.summary}</p>
                </div>
                <div className="lg:border-l lg:border-line lg:pl-8">
                  <h4 className="text-sm font-bold text-ink">Por que essa dor acontece</h4>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-body">{current.why}</p>
                </div>
                <div className="flex flex-col gap-5 lg:border-l lg:border-line lg:pl-8">
                  <div>
                    <h4 className="text-sm font-bold text-ink">O que avaliamos na 1ª sessão</h4>
                    <ul className="mt-3 space-y-2.5">
                      {current.evaluate.map((e) => (
                        <li key={e} className="flex gap-2.5 text-[15px] text-ink-body">
                          <CheckCircle size={18} weight="fill" className="mt-0.5 shrink-0 text-accent" aria-hidden />
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <ButtonLink
                    href={whatsappLinks.complaint(current.title)}
                    external
                    className="mt-auto w-full whitespace-normal py-2 text-center leading-tight"
                    icon={<WhatsappLogo size={18} weight="fill" aria-hidden />}
                  >
                    Tenho essa queixa: falar no WhatsApp
                  </ButtonLink>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </MotionConfig>
  )
}
