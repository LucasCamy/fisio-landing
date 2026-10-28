import { ArrowLeft, ArrowRight, ClipboardText } from '@phosphor-icons/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { indications } from '../../data/content'
import { BicolorTitle } from '../ui/BicolorTitle'
import { Button } from '../ui/Button'
import { Picture } from '../ui/Picture'
import { Reveal, RevealGroup, RevealItem } from '../ui/Reveal'
import { TriageModal } from '../TriageModal'

const pad = (n: number) => String(n).padStart(2, '0')

export function SignatureTreatmentSection() {
  const [triageOpen, setTriageOpen] = useState(false)
  const closeTriage = useCallback(() => setTriageOpen(false), [])
  const railRef = useRef<HTMLOListElement>(null)
  const [visible, setVisible] = useState<[number, number]>([1, 4])

  // Faixa visível do trilho (ex.: 01–04 / 05), medida por IntersectionObserver, sem listener de scroll
  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const seen = new Set<number>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = Number((e.target as HTMLElement).dataset.index)
          if (e.intersectionRatio >= 0.6) seen.add(i)
          else seen.delete(i)
        }
        if (seen.size) setVisible([Math.min(...seen), Math.max(...seen)])
      },
      { root: rail, threshold: [0, 0.6, 1] },
    )
    rail.querySelectorAll('[data-index]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  const scrollRail = (dir: 1 | -1) => {
    const rail = railRef.current
    const card = rail?.querySelector<HTMLElement>('[data-index]')
    if (!rail || !card) return
    rail.scrollBy({ left: dir * (card.offsetWidth + 16), behavior: 'smooth' })
  }

  const total = indications.length
  const progressStart = (visible[0] - 1) / total
  const progressSize = (visible[1] - visible[0] + 1) / total

  return (
    <section id="atendimento" aria-labelledby="atendimento-title" className="scroll-mt-24 px-3 pt-24 sm:px-6 sm:pt-32">
      <div className="relative mx-auto max-w-[1360px] overflow-hidden rounded-[36px] bg-surface-card px-4 py-10 sm:px-10 sm:py-14 lg:px-14">
        <p
          aria-hidden
          className="pointer-events-none absolute -bottom-[0.18em] left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[clamp(6rem,21vw,19rem)] font-bold leading-none tracking-[-0.05em] text-white/80"
        >
          Movimento
        </p>

        <RevealGroup
          className="relative grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14"
          stagger={0.12}
        >
          <RevealItem variant="curtain" className="rounded-[28px] border border-line bg-white">
            <Picture
              name="anatomy-assembled"
              alt="Duas vértebras em cristal alinhadas sobre uma base, com o disco destacado em azul"
              width={1200}
              height={1000}
              sizes="(min-width: 1024px) 600px, 92vw"
              className="block"
              imgClassName="h-full w-full object-cover"
            />
            <p className="glass absolute bottom-4 left-4 right-4 flex items-start gap-2.5 rounded-2xl px-4 py-3 text-[13.5px] font-semibold leading-snug text-ink shadow-soft sm:right-auto sm:max-w-[330px]">
              <ClipboardText size={18} weight="bold" className="mt-0.5 shrink-0 text-accent" aria-hidden />
              Plano de tratamento desenhado após testes específicos de movimento
            </p>
          </RevealItem>

          <div className="flex flex-col justify-center">
            <BicolorTitle id="atendimento-title" strong="Quando o tratamento individual" soft="é a solução indicada" breakSoft reveal />
            <RevealItem as="p" className="mt-5 text-[17px] leading-relaxed text-ink-body">
              Em sessões padronizadas, várias pessoas dividem o mesmo horário e seguem uma sequência parecida de
              aparelhos. Na fisioterapia individualizada 1:1, a sessão inteira é sua: a técnica, a carga e a progressão
              mudam conforme a sua resposta, com a fisioterapeuta ao seu lado do início ao fim.
            </RevealItem>
            <dl className="mt-8 grid grid-cols-2 gap-4">
              <RevealItem variant="pop" className="rounded-[20px] border border-line bg-surface-elevated p-5">
                <dt className="sr-only">Pacientes por horário</dt>
                <dd className="font-display text-5xl font-semibold leading-none tracking-tight text-ink tabular">1</dd>
                <dd className="mt-2 text-sm text-ink-body">paciente por horário</dd>
              </RevealItem>
              <RevealItem variant="pop" className="rounded-[20px] border border-line bg-surface-elevated p-5">
                <dt className="sr-only">Etapas do tratamento</dt>
                <dd className="font-display text-5xl font-semibold leading-none tracking-tight text-ink tabular">4</dd>
                <dd className="mt-2 text-sm text-ink-body">etapas até a alta</dd>
              </RevealItem>
            </dl>
          </div>
        </RevealGroup>

        <div className="relative mt-12 sm:mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h3 className="font-display text-xl font-semibold text-ink">
              Indicações mais comuns <span className="font-data text-base text-ink-soft tabular">({total})</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollRail(-1)}
                aria-label="Indicações anteriores"
                className="press grid size-11 place-items-center rounded-full border border-line-strong bg-white text-ink"
              >
                <ArrowLeft size={18} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => scrollRail(1)}
                aria-label="Próximas indicações"
                className="press grid size-11 place-items-center rounded-full border border-line-strong bg-white text-ink"
              >
                <ArrowRight size={18} weight="bold" />
              </button>
            </div>
          </div>

          <ol
            ref={railRef}
            className="no-scrollbar mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-2"
            aria-label="Indicações mais comuns"
            tabIndex={0}
          >
            {indications.map((text, i) => (
              <li
                key={text}
                data-index={i + 1}
                className="w-[min(78vw,290px)] shrink-0 snap-start lg:w-[calc((100%-48px)/4)]"
              >
                <Reveal
                  variant="slide"
                  at={0.12}
                  delay={i * 0.07}
                  className="flex h-full min-h-[188px] flex-col justify-between rounded-[22px] border border-line bg-surface-elevated p-5 shadow-soft"
                >
                  <span className="font-data text-sm font-semibold text-accent tabular">{pad(i + 1)}</span>
                  <p className="font-display text-[19px] font-semibold leading-snug text-ink">{text}</p>
                </Reveal>
              </li>
            ))}
          </ol>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-5">
            <div className="flex min-w-[220px] flex-1 items-center gap-4">
              <span className="font-data text-sm text-ink tabular" aria-live="polite">
                {pad(visible[0])}–{pad(visible[1])} <span className="text-ink-soft">/ {pad(total)}</span>
              </span>
              <span className="relative h-1 max-w-[320px] flex-1 overflow-hidden rounded-full bg-line-strong" aria-hidden>
                <span
                  className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-accent transition-transform duration-[280ms] ease-[var(--ease-out)]"
                  style={{ transform: `translateX(${progressStart * 100}%) scaleX(${progressSize})` }}
                />
              </span>
            </div>
            <Button
              size="lg"
              onClick={() => setTriageOpen(true)}
              aria-haspopup="dialog"
              icon={<ArrowRight size={18} weight="bold" aria-hidden />}
            >
              Descobrir se é indicado para mim
            </Button>
          </div>
        </div>
      </div>
      <TriageModal open={triageOpen} onClose={closeTriage} />
    </section>
  )
}
