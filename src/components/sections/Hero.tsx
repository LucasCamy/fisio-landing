import { ArrowDown, ArrowRight, Pulse, ShieldCheck } from '@phosphor-icons/react'
import { useRef } from 'react'
import { site } from '../../config/site'
import { gsap, MOTION_OK, useGSAP } from '../../lib/scroll'
import { whatsappLinks } from '../../lib/whatsapp'
import { ButtonLink } from '../ui/Button'
import { Picture } from '../ui/Picture'

export function Hero() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.from('[data-reveal]', {
          yPercent: 105,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.08,
        })
        gsap.from('[data-fade]', { opacity: 0, y: 14, duration: 0.7, ease: 'power3.out', stagger: 0.06, delay: 0.25 })
        // Parallax discreto das pílulas: profundidade, não deslocamento grande
        gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
          gsap.to(el, {
            yPercent: Number(el.dataset.parallax),
            ease: 'none',
            scrollTrigger: { trigger: scope.current, start: 'top top', end: 'bottom top', scrub: 0.6 },
          })
        })
      })
      return () => mm.revert()
    },
    { scope },
  )

  return (
    <section id="inicio" ref={scope} aria-labelledby="hero-title" className="px-3 pt-2 sm:px-6">
      <div className="mx-auto grid max-w-[1360px] grid-cols-[minmax(0,1fr)] gap-8 overflow-hidden rounded-[36px] bg-surface-card p-5 pt-8 sm:p-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-6 lg:p-12 xl:p-14">
        <div className="flex flex-col justify-between gap-10">
          <div>
            <p
              data-fade
              className="inline-flex max-w-full items-center gap-2 rounded-[18px] border border-line bg-white px-3.5 py-1.5 text-[13px] font-semibold leading-snug text-ink sm:rounded-full"
            >
              <span className="size-2 shrink-0 rounded-full bg-accent" aria-hidden />
              <span>
                {site.specialty} · {site.crefito}
              </span>
            </p>

            <h1
              id="hero-title"
              className="mt-6 font-display text-[clamp(2.45rem,6.2vw,5rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-ink"
            >
              <span className="block overflow-hidden pb-[0.06em]">
                <span data-reveal className="block">
                  {site.name}
                </span>
              </span>
              <span className="mt-2 block overflow-hidden pb-[0.1em] text-[0.56em] leading-[1.04] tracking-[-0.03em] text-ink-soft">
                <span data-reveal className="block">
                  Fisioterapia ortopédica e de coluna
                </span>
              </span>
            </h1>

            <p data-fade className="mt-6 max-w-[34rem] text-[17px] leading-relaxed text-ink-body sm:text-lg">
              Fisioterapia individualizada com avaliação biomecânica, terapia manual e reabilitação ativa. Tratamos a
              causa da sobrecarga para você voltar a se movimentar com confiança.
            </p>

            <div data-fade className="mt-8 flex flex-wrap gap-3">
              <ButtonLink
                href={whatsappLinks.schedule()}
                external
                size="lg"
                icon={<ArrowRight size={18} weight="bold" aria-hidden />}
              >
                Agendar avaliação
              </ButtonLink>
              <ButtonLink
                href="#como-funciona"
                variant="ghost"
                size="lg"
                icon={<ArrowDown size={18} weight="bold" aria-hidden />}
              >
                Ver como funciona
              </ButtonLink>
            </div>
          </div>

          <dl data-fade className="grid max-w-[30rem] grid-cols-2 gap-4 border-t border-line-strong pt-6">
            <div>
              <dt className="sr-only">Duração da sessão</dt>
              <dd className="font-display text-[2.4rem] font-semibold leading-none tracking-tight text-ink tabular">
                {site.session.minutes}
                <span className="ml-1 text-xl text-ink-soft">min</span>
              </dd>
              <dd className="mt-2 text-sm text-ink-body">de sessão 100% individual</dd>
            </div>
            <div className="border-l border-line-strong pl-4">
              <dt className="sr-only">Pacientes por horário</dt>
              <dd className="font-display text-[2.4rem] font-semibold leading-none tracking-tight text-ink tabular">1:1</dd>
              <dd className="mt-2 text-sm text-ink-body">uma pessoa por horário</dd>
            </div>
          </dl>
        </div>

        <div className="relative min-h-[420px] sm:min-h-[560px] lg:min-h-[640px]">
          <div className="absolute inset-0 overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,var(--surface-sunken),var(--surface-card))]">
            <Picture
              name="hero-specialist"
              alt={`${site.name}, fisioterapeuta, de jaleco branco, sorrindo com as mãos juntas`}
              width={1200}
              height={1400}
              priority
              sizes="(min-width: 1024px) 560px, 92vw"
              className="block h-full w-full"
              imgClassName="h-full w-full object-cover object-[50%_18%]"
            />
          </div>

          <div data-parallax="-40" className="absolute left-3 top-[50%] sm:-left-4 lg:-left-8">
            <p className="glass flex items-center gap-2.5 rounded-full py-2 pl-2 pr-4 text-[13px] font-semibold text-ink shadow-lift sm:text-sm">
              <span className="grid size-8 place-items-center rounded-full bg-accent-soft text-accent">
                <ShieldCheck size={18} weight="fill" aria-hidden />
              </span>
              Especialista em Coluna e Ortopedia
            </p>
          </div>
          <div data-parallax="-90" className="absolute bottom-[12%] right-3 sm:-right-3 lg:right-4">
            <p className="glass flex items-center gap-2.5 rounded-full py-2 pl-2 pr-4 text-[13px] font-semibold text-ink shadow-lift sm:text-sm">
              <span className="grid size-8 place-items-center rounded-full bg-accent-soft text-accent">
                <Pulse size={18} weight="bold" aria-hidden />
              </span>
              Reabilitação Baseada em Evidência
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
