import { ChartLineUp, ClipboardText, GraduationCap, Handshake, IdentificationBadge } from '@phosphor-icons/react'
import { site } from '../../config/site'
import { aboutHighlights, formation } from '../../data/content'
import { BicolorTitle } from '../ui/BicolorTitle'
import { Picture } from '../ui/Picture'
import { RevealGroup, RevealItem } from '../ui/Reveal'

const HIGHLIGHT_ICONS = [ClipboardText, Handshake, ChartLineUp]

export function AboutSpecialistSection() {
  return (
    <section id="sobre" aria-labelledby="sobre-title" className="scroll-mt-24 px-3 pt-24 sm:px-6 sm:pt-32">
      <RevealGroup
        className="mx-auto grid max-w-[1360px] grid-cols-[minmax(0,1fr)] gap-8 overflow-hidden rounded-[36px] bg-surface-card p-4 sm:p-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14 lg:p-10"
        stagger={0.1}
      >
        <RevealItem variant="wipe" className="rounded-[28px]">
          <Picture
            name="specialist-hands"
            alt={`${site.name} segurando um modelo anatômico de coluna e pelve`}
            width={1000}
            height={1200}
            sizes="(min-width: 1024px) 520px, 92vw"
            className="block h-full"
            imgClassName="h-full w-full object-cover aspect-[5/6] lg:aspect-auto"
          />
        </RevealItem>

        <div className="flex flex-col justify-center px-2 pb-4 sm:px-0 lg:py-4">
          <BicolorTitle id="sobre-title" strong="Quem vai cuidar" soft="da sua reabilitação" reveal />
          <RevealItem as="p" className="mt-5 max-w-[38rem] text-[17px] leading-relaxed text-ink-body">
            Sou {site.name.replace(/^Dra?\.\s*/, '')}, fisioterapeuta com foco em ortopedia, coluna e movimento. Meu
            trabalho é entender como o seu corpo está se movendo hoje, explicar o que encontrei e construir com você um
            plano possível para a sua rotina.
          </RevealItem>

          <RevealItem as="figure" className="mt-8 border-l-2 border-accent pl-5">
            <blockquote className="font-display text-[clamp(1.25rem,2.1vw,1.6rem)] font-medium leading-snug text-ink">
              “Reabilitar não é proibir você de se movimentar. É devolver ao seu corpo a capacidade de se mover sem
              medo.”
            </blockquote>
            <figcaption className="mt-3 flex items-center gap-2 text-sm text-ink-body">
              <IdentificationBadge size={18} weight="bold" className="text-accent" aria-hidden />
              <span>
                {site.name} · <span className="font-data font-semibold text-ink tabular">{site.crefito}</span>
              </span>
            </figcaption>
          </RevealItem>

          <h3 className="sr-only">Formação</h3>
          <ul className="mt-8 flex flex-wrap gap-2">
            {formation.map((f) => (
              <RevealItem
                as="li"
                variant="pop"
                key={f}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-[13.5px] font-semibold text-ink"
              >
                <GraduationCap size={16} weight="bold" className="text-accent" aria-hidden />
                {f}
              </RevealItem>
            ))}
          </ul>

          <ul className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-3">
            {aboutHighlights.map((h, i) => {
              const Icon = HIGHLIGHT_ICONS[i] ?? ClipboardText
              return (
                <RevealItem as="li" key={h.title} className="rounded-[20px] border border-line bg-surface-elevated p-5">
                  <Icon size={22} weight="bold" className="text-accent" aria-hidden />
                  <h4 className="mt-3 font-display text-[17px] font-semibold text-ink">{h.title}</h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-body">{h.text}</p>
                </RevealItem>
              )
            })}
          </ul>
        </div>
      </RevealGroup>
    </section>
  )
}
