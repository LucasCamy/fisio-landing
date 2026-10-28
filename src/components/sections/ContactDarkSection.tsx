import { ArrowRight, ArrowUpRight, Clock, MapPin, WhatsappLogo } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { useEffect, useState, type ReactNode } from 'react'
import { site } from '../../config/site'
import { isOpenAt } from '../../lib/openingHours'
import { whatsappLinks } from '../../lib/whatsapp'
import { ButtonLink } from '../ui/Button'
import { Picture } from '../ui/Picture'
import { RevealGroup, RevealItem } from '../ui/Reveal'
import { presets } from '../ui/revealPresets'

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${site.address.line1}, ${site.address.line2}`,
)}`

function useOpenNow() {
  const [open, setOpen] = useState(() => isOpenAt(new Date(), site.hours, site.timeZone))
  useEffect(() => {
    const id = window.setInterval(() => setOpen(isOpenAt(new Date(), site.hours, site.timeZone)), 60_000)
    return () => window.clearInterval(id)
  }, [])
  return open
}

function InfoCard({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <RevealItem variant="slide" className="flex flex-col gap-4 rounded-[22px] border border-line-night bg-white/[0.04] p-5 sm:p-6">
      <p className="flex items-center gap-2 font-data text-xs font-semibold uppercase tracking-[0.14em] text-on-night-muted">
        {icon}
        {label}
      </p>
      {children}
    </RevealItem>
  )
}

const linkClass =
  'press inline-flex min-h-11 items-center gap-1.5 self-start rounded-full border border-line-night px-4 text-sm font-semibold text-on-night transition-colors [@media(hover:hover)]:hover:bg-white/10'

export function ContactDarkSection() {
  const openNow = useOpenNow()

  return (
    <section id="contato" aria-labelledby="contato-title" className="scroll-mt-24 px-3 pt-24 sm:px-6 sm:pt-32">
      <div className="mx-auto max-w-[1360px] overflow-hidden rounded-[36px] bg-night px-4 py-10 text-on-night sm:px-10 sm:py-14 lg:px-14">
        <RevealGroup className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end" stagger={0.18}>
          <h2
            id="contato-title"
            className="max-w-3xl font-display text-[clamp(2rem,4.4vw,3.6rem)] font-semibold leading-[1.02] text-on-night"
          >
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span className="block" variants={presets.mask}>
                Sua recuperação começa <span className="text-on-night-muted">com uma boa avaliação.</span>
              </motion.span>
            </span>
          </h2>
          <RevealItem variant="pop">
          <ButtonLink
            href={whatsappLinks.schedule()}
            external
            size="lg"
            icon={<ArrowRight size={18} weight="bold" aria-hidden />}
          >
            Agendar avaliação
          </ButtonLink>
          </RevealItem>
        </RevealGroup>

        <RevealGroup className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]" stagger={0.1}>
          <RevealItem variant="curtain" cover="bg-night" className="rounded-[28px]">
            <Picture
              name="clinic-reception"
              alt="Recepção do consultório, com balcão de madeira clara, poltronas e luz natural"
              width={1600}
              height={1000}
              sizes="(min-width: 1024px) 720px, 92vw"
              className="block h-full"
              imgClassName="h-full min-h-[260px] w-full object-cover"
            />
          </RevealItem>
          <div className="grid gap-4">
            <InfoCard icon={<MapPin size={16} weight="bold" aria-hidden />} label="Endereço">
              <address className="not-italic">
                <span className="block text-[17px] font-semibold">{site.address.line1}</span>
                <span className="block text-[15px] text-on-night-muted">{site.address.line2}</span>
              </address>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                Como chegar <ArrowUpRight size={15} weight="bold" aria-hidden />
                <span className="sr-only"> (abre o Google Maps em nova aba)</span>
              </a>
            </InfoCard>
            <InfoCard icon={<Clock size={16} weight="bold" aria-hidden />} label="Horários">
              <ul className="space-y-1 text-[16px] font-semibold tabular">
                {site.hoursLabel.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <p className="inline-flex items-center gap-2 self-start rounded-full bg-white/[0.06] px-3 py-1.5 text-sm font-semibold" data-testid="open-status">
                {openNow ? (
                  <>
                    <span className="size-2.5 rounded-full bg-success-night" aria-hidden />
                    Aberto agora
                  </>
                ) : (
                  <>
                    <span className="size-2.5 rounded-[2px] border-2 border-on-night-muted" aria-hidden />
                    Fechado agora
                  </>
                )}
              </p>
            </InfoCard>
            <InfoCard icon={<WhatsappLogo size={16} weight="bold" aria-hidden />} label="WhatsApp">
              <p className="text-[17px] font-semibold tabular">{site.whatsapp.display}</p>
              <a href={whatsappLinks.general()} target="_blank" rel="noopener noreferrer" className={linkClass}>
                Enviar mensagem <ArrowUpRight size={15} weight="bold" aria-hidden />
                <span className="sr-only"> (abre o WhatsApp em nova aba)</span>
              </a>
            </InfoCard>
          </div>
        </RevealGroup>
      </div>
    </section>
  )
}
