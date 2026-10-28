import { ArrowRight, ArrowUpRight, Barbell, HandPalm, Path, Target } from '@phosphor-icons/react'
import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react'
import { approaches, type Approach } from '../../data/content'
import { cn } from '../../lib/cn'
import { FRAME_COUNT, frameForProgress, frameSrc, supportsAvifFrames, type MediaFormat } from '../../lib/media'
import { gsap, MOTION_OK_DESKTOP, MOTION_OK_MOBILE, ScrollTrigger, useGSAP, useMotionAllowed } from '../../lib/scroll'
import { whatsappLinks } from '../../lib/whatsapp'
import { BicolorTitle } from '../ui/BicolorTitle'
import { ButtonLink } from '../ui/Button'
import { Dialog } from '../ui/Dialog'
import { Picture } from '../ui/Picture'
import { RevealGroup, RevealItem } from '../ui/Reveal'

const ICONS: Record<string, ComponentType<{ size?: number; weight?: 'bold' | 'fill' | 'regular' }>> = {
  manual: HandPalm,
  estabilizacao: Target,
  biomecanica: Path,
  fortalecimento: Barbell,
}

/** Progresso do scrub (0..1) em que cada quadrante acende, acompanhando o encaixe. */
const LIGHT_AT = [0.12, 0.3, 0.48, 0.62]
const FRAME_W = 1024
const FRAME_H = 576

export function AnatomyAssemblySection() {
  const scope = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frames = useRef<(HTMLImageElement | undefined)[]>([])
  /** Quadros já decodificados: drawImage de imagem só "carregada" decodificava no thread principal */
  const ready = useRef<boolean[]>([])
  const wanted = useRef(1)
  const drawn = useRef(0)
  const barRef = useRef<HTMLSpanElement>(null)
  const motionAllowed = useMotionAllowed()
  const [detail, setDetail] = useState<Approach | null>(null)
  const closeDetail = useCallback(() => setDetail(null), [])

  /** Desenha o quadro pedido ou o decodificado mais próximo antes dele (ou depois, no início). */
  const draw = useCallback((frame: number, force = false) => {
    wanted.current = frame
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    let f = frame
    while (f > 0 && !ready.current[f]) f--
    if (f === 0) {
      f = frame
      while (f <= FRAME_COUNT && !ready.current[f]) f++
    }
    const img = frames.current[f]
    if (!img || !ready.current[f] || (f === drawn.current && !force)) return
    drawn.current = f
    // "cover" manual: recorta as laterais do quadro 16:9 para preencher a moldura
    const target = canvas.width / canvas.height
    const source = FRAME_W / FRAME_H
    const sw = target < source ? FRAME_H * target : FRAME_W
    const sh = target < source ? FRAME_H : FRAME_W / target
    ctx.drawImage(img, (FRAME_W - sw) / 2, (FRAME_H - sh) / 2, sw, sh, 0, 0, canvas.width, canvas.height)
  }, [])

  // Tamanho do canvas em pixels reais (DPR ≤ 2)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(entry.contentRect.width * dpr)
      canvas.height = Math.round(entry.contentRect.height * dpr)
      draw(wanted.current, true)
    })
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [draw, motionAllowed])

  const loadFrames = useCallback(async () => {
    if (frames.current.length) return
    frames.current = new Array(FRAME_COUNT + 1)
    const format: MediaFormat = (await supportsAvifFrames()) ? 'avif' : 'webp'
    scope.current?.setAttribute('data-frame-format', format)
    // Quadros-chave espaçados primeiro (o scrub tem o que mostrar cedo); depois o resto
    const order = [...Array(FRAME_COUNT).keys()].map((i) => i + 1)
    order.sort((a, b) => (a % 8 === 1 ? 0 : 1) - (b % 8 === 1 ? 0 : 1) || a - b)
    const idle = (cb: () => void) =>
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(cb, { timeout: 300 })
        : setTimeout(cb, 16)
    // Lotes de 8, cada um no tempo ocioso, com decode() fora do thread principal
    for (let i = 0; i < order.length; i += 8) {
      await new Promise<void>((resolve) => idle(resolve))
      await Promise.all(
        order.slice(i, i + 8).map(async (n) => {
          const img = new Image()
          img.decoding = 'async'
          img.src = frameSrc(n, format)
          frames.current[n] = img
          try {
            await img.decode()
            ready.current[n] = true
          } catch {
            return
          }
        }),
      )
      draw(wanted.current, true)
    }
  }, [draw])

  useGSAP(
    () => {
      const root = scope.current
      if (!root) return
      const mm = gsap.matchMedia()

      // Pré-carrega quando a cena se aproxima (só com movimento: senão a cena é a imagem estática)
      const preload = () =>
        ScrollTrigger.create({ trigger: root, start: 'top 150%', once: true, onEnter: () => void loadFrames() })

      const buildTimeline = (tl: gsap.core.Timeline) => {
        const state = { p: 0 }
        tl.to(state, {
          p: 1,
          duration: 1,
          ease: 'none',
          onUpdate: () => {
            draw(frameForProgress(state.p))
            // Só a barra muda: uma variável CSS no <section> recalculava o estilo da seção inteira
            if (barRef.current) barRef.current.style.transform = `scaleX(${state.p.toFixed(3)})`
          },
        }, 0)
        // Halo de estabilidade: pico no quadro 75 (≈ 0,62)
        tl.fromTo('[data-halo]', { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.2, ease: 'power2.out' }, 0.5)
        tl.to('[data-halo]', { opacity: 0.55, duration: 0.25, ease: 'power1.inOut' }, 0.72)
        gsap.utils.toArray<HTMLElement>('[data-quadrant]', root).forEach((q, i) => {
          tl.to(q.querySelectorAll('[data-lit]'), { opacity: 1, duration: 0.08, ease: 'power1.out' }, LIGHT_AT[i])
          tl.fromTo(q, { opacity: 0.55 }, { opacity: 1, duration: 0.08 }, LIGHT_AT[i])
        })
        tl.fromTo('[data-connector]', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, ease: 'none', stagger: 0.12 }, 0.05)
        tl.fromTo('[data-cta-card]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.1 }, 0.82)
      }

      mm.add(MOTION_OK_DESKTOP, () => {
        preload()
        draw(1)
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.querySelector('[data-stage-wrap]'),
            start: 'top top',
            end: '+=170%',
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            onEnter: () => void loadFrames(),
          },
        })
        buildTimeline(tl)
      })

      mm.add(MOTION_OK_MOBILE, () => {
        preload()
        draw(1)
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.querySelector('[data-stage]'),
            start: 'top 85%',
            end: 'bottom 30%',
            scrub: 0.8,
            onEnter: () => void loadFrames(),
          },
        })
        buildTimeline(tl)
      })

      return () => mm.revert()
    },
    { scope },
  )

  return (
    <section
      id="abordagem"
      ref={scope}
      aria-labelledby="abordagem-title"
      className="scroll-mt-24 bg-bg pt-24 sm:pt-32"
    >
      <div data-stage-wrap className="mx-auto flex min-h-[100dvh] max-w-[1360px] flex-col justify-center px-4 py-10 sm:px-6 lg:py-8">
        <RevealGroup className="grid grid-cols-[minmax(0,1fr)] items-end gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12" at={0.15}>
          <BicolorTitle id="abordagem-title" strong="Reabilitação precisa para" soft="cada fase da sua dor" breakSoft reveal />
          <RevealItem as="p" className="max-w-[30rem] text-[17px] text-ink-body lg:justify-self-end">
            Cada técnica tem uma função no plano. Role para ver como as quatro frentes se encaixam para devolver
            estabilidade ao movimento.
          </RevealItem>
        </RevealGroup>

        <div className="relative mt-8 grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.55fr)_minmax(0,1fr)] lg:grid-rows-2 lg:gap-x-8 lg:gap-y-5">
          {/* Linhas que ligam cada quadrante à peça central (desktop) */}
          <svg
            className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            {[
              'M26 25 C 29 25, 28 42, 33 46',
              'M74 25 C 71 25, 72 42, 67 46',
              'M26 75 C 29 75, 28 58, 33 54',
              'M74 75 C 71 75, 72 58, 67 54',
            ].map((d) => (
              <path
                key={d}
                d={d}
                data-connector
                pathLength={1}
                fill="none"
                stroke="var(--accent)"
                strokeOpacity={0.7}
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
                strokeDasharray="1"
                strokeDashoffset={motionAllowed ? 1 : 0}
              />
            ))}
          </svg>

          {/* Peça central */}
          <div
            data-stage
            className="relative order-first sm:col-span-2 lg:order-none lg:col-span-1 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center"
          >
            <div
              data-halo
              aria-hidden
              className="absolute inset-[-12%] rounded-[64px] bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--accent-halo)_70%,transparent),transparent)] blur-2xl"
              style={{ opacity: motionAllowed ? 0 : 0.55 }}
            />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] border border-line bg-surface-card shadow-soft lg:aspect-[5/4]">
              {/* Brilho interno no encaixe: acompanha o halo externo */}
              <div
                data-halo
                aria-hidden
                className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(40%_32%_at_50%_58%,color-mix(in_srgb,var(--accent-halo)_22%,transparent),transparent)]"
                style={{ opacity: motionAllowed ? 0 : 0.55 }}
              />
              {motionAllowed ? (
                <canvas
                  ref={canvasRef}
                  className="block h-full w-full"
                  width={FRAME_W}
                  height={FRAME_H}
                  aria-hidden
                  data-testid="assembly-canvas"
                />
              ) : (
                <Picture
                  name="anatomy-assembled"
                  alt=""
                  width={1200}
                  height={1000}
                  className="flex h-full w-full items-center justify-center"
                  imgClassName="h-full w-auto object-contain"
                />
              )}
              <p className="sr-only">
                Ilustração de duas vértebras em cristal: a superior se alinha e se encaixa sobre a inferior, e um halo
                azul indica estabilidade biomecânica.
              </p>
              <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 font-data text-[11px] text-ink-body tabular sm:text-xs">
                <span className="rounded-full bg-white/85 px-2.5 py-1">Alinhamento segmentar</span>
                <span className="flex items-center gap-2 rounded-full bg-white/85 px-2.5 py-1">
                  <span className="relative h-1 w-16 overflow-hidden rounded-full bg-line-strong">
                    <span
                      ref={barRef}
                      className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-accent"
                      style={{ transform: `scaleX(${motionAllowed ? 0 : 1})` }}
                    />
                  </span>
                  estável
                </span>
              </div>
            </div>
          </div>

          {approaches.map((a, i) => {
            const Icon = ICONS[a.id] ?? Target
            const placement = [
              'lg:col-start-1 lg:row-start-1',
              'lg:col-start-3 lg:row-start-1',
              'lg:col-start-1 lg:row-start-2',
              'lg:col-start-3 lg:row-start-2',
            ][i]
            return (
              <article
                key={a.id}
                data-quadrant
                className={cn(
                  'relative flex flex-col rounded-[22px] border border-line bg-surface-elevated p-5 shadow-soft',
                  placement,
                )}
                style={{ opacity: motionAllowed ? undefined : 1 }}
              >
                <span
                  data-lit
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-accent/50"
                  style={{ opacity: motionAllowed ? 0 : 1 }}
                />
                <div className="flex items-center justify-between">
                  <span className="relative grid size-10 place-items-center rounded-full bg-surface-card text-ink">
                    <Icon size={20} weight="bold" />
                    <span
                      data-lit
                      aria-hidden
                      className="absolute inset-0 grid place-items-center rounded-full bg-accent text-white"
                      style={{ opacity: motionAllowed ? 0 : 1 }}
                    >
                      <Icon size={20} weight="bold" />
                    </span>
                  </span>
                  <span className="font-data text-xs text-ink-soft tabular">0{i + 1}</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold leading-snug text-ink">{a.title}</h3>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-body">{a.summary}</p>
                <button
                  type="button"
                  onClick={() => setDetail(a)}
                  className="mt-auto inline-flex min-h-11 items-center gap-1.5 self-start pt-3 text-[14px] font-semibold text-accent-action [@media(hover:hover)]:hover:underline"
                  aria-haspopup="dialog"
                >
                  Saiba mais<span className="sr-only"> sobre {a.title}</span>
                  <ArrowRight size={15} weight="bold" aria-hidden />
                </button>
              </article>
            )
          })}
        </div>

        <div
          data-cta-card
          className="mt-6 flex flex-col items-start gap-4 self-end rounded-[22px] bg-surface-card p-5 sm:flex-row sm:items-center sm:gap-6 lg:max-w-[560px]"
        >
          <p className="text-[15px] font-semibold leading-snug text-ink">
            Qual abordagem o seu caso pede?{' '}
            <span className="font-medium text-ink-body">Isso se define na avaliação funcional.</span>
          </p>
          <ButtonLink
            href={whatsappLinks.myCase()}
            external
            variant="dark"
            className="shrink-0"
            icon={<ArrowUpRight size={16} weight="bold" aria-hidden />}
          >
            Falar sobre o meu caso
          </ButtonLink>
        </div>
      </div>

      <Dialog open={detail !== null} onClose={closeDetail} title={detail?.title ?? ''} description={detail?.summary}>
        {detail && (
          <div>
            <p className="text-[15.5px] leading-relaxed text-ink-body">{detail.detail}</p>
            <h3 className="mt-6 text-sm font-bold text-ink">Recursos usados</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {detail.techniques.map((t) => (
                <li key={t} className="rounded-full bg-surface-card px-3 py-1.5 text-sm font-medium text-ink">
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-2xl bg-accent-soft p-4 text-sm leading-relaxed text-ink">
              A combinação e a dose de cada recurso são definidas na avaliação, de acordo com o seu quadro.
            </p>
            <ButtonLink
              href={whatsappLinks.myCase()}
              external
              className="mt-6 w-full"
              data-autofocus
              icon={<ArrowUpRight size={16} weight="bold" aria-hidden />}
            >
              Falar sobre o meu caso
            </ButtonLink>
          </div>
        )}
      </Dialog>
    </section>
  )
}
