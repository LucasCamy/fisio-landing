import { ArrowUpRight, Plus } from '@phosphor-icons/react'
import { useId, useState } from 'react'
import { site } from '../../config/site'
import { faq } from '../../data/content'
import { cn } from '../../lib/cn'
import { whatsappLinks } from '../../lib/whatsapp'
import { Avatar } from '../ui/Avatar'
import { BicolorTitle } from '../ui/BicolorTitle'
import { ButtonLink } from '../ui/Button'
import { RevealGroup, RevealItem } from '../ui/Reveal'

const pad = (n: number) => String(n).padStart(2, '0')

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0)
  const baseId = useId()

  return (
    <section id="duvidas" aria-labelledby="faq-title" className="scroll-mt-24 bg-bg pt-24 sm:pt-32">
      <div className="mx-auto grid max-w-[1360px] grid-cols-[minmax(0,1fr)] gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <div>
          <RevealGroup className="lg:sticky lg:top-[104px]" stagger={0.14}>
            <BicolorTitle id="faq-title" strong="Perguntas" soft="frequentes" reveal />
            <RevealItem className="mt-8 rounded-[24px] border border-line bg-surface-elevated p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <Avatar size={48} className="size-12" />
                <div>
                  <p className="text-[15px] font-bold text-ink">{site.name}</p>
                  <p className="text-sm text-ink-body">Responde pessoalmente</p>
                </div>
              </div>
              <p className="mt-5 text-[17px] font-semibold leading-snug text-ink">
                Ficou com alguma dúvida? <span className="text-ink-body">Mande uma mensagem no WhatsApp.</span>
              </p>
              <ButtonLink
                href={whatsappLinks.question()}
                external
                variant="dark"
                className="mt-5"
                icon={<ArrowUpRight size={16} weight="bold" aria-hidden />}
              >
                Perguntar no WhatsApp
              </ButtonLink>
            </RevealItem>
          </RevealGroup>
        </div>

        <RevealGroup as="ul" className="divide-y divide-line border-y border-line" at={0.15} stagger={0.06}>
          {faq.map((item, i) => {
            const isOpen = open === i
            const btnId = `${baseId}-q${i}`
            const panelId = `${baseId}-a${i}`
            return (
              <RevealItem as="li" variant="slide" key={item.q}>
                <h3>
                  <button
                    id={btnId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group flex w-full items-start gap-4 py-6 text-left"
                  >
                    <span className="pt-1 font-data text-sm font-semibold text-ink-soft tabular">{pad(i + 1)}</span>
                    <span className="flex-1 font-display text-[clamp(1.05rem,1.6vw,1.3rem)] font-semibold leading-snug text-ink">
                      {item.q}
                    </span>
                    <span
                      className={cn(
                        'grid size-9 shrink-0 place-items-center rounded-full border transition-transform duration-[280ms] ease-[var(--ease-out)]',
                        isOpen ? 'rotate-45 border-ink bg-ink text-white' : 'border-line-strong text-ink',
                      )}
                      aria-hidden
                    >
                      <Plus size={16} weight="bold" />
                    </span>
                  </button>
                </h3>
                <div id={panelId} role="region" aria-labelledby={btnId} hidden={!isOpen}>
                  <p className="max-w-[44rem] pb-7 pl-10 pr-12 text-[16px] leading-relaxed text-ink-body">{item.a}</p>
                </div>
              </RevealItem>
            )
          })}
        </RevealGroup>
      </div>
    </section>
  )
}
