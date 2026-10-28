import { ArrowLeft, ArrowRight, Warning, WhatsappLogo } from '@phosphor-icons/react'
import { useId, useState } from 'react'
import {
  buildTriageSummary,
  buildTriageWhatsAppUrl,
  isTriageComplete,
  triageGuidance,
  triageRedFlags,
  triageSteps,
  type TriageAnswers,
} from '../lib/triage'
import { cn } from '../lib/cn'
import { Button, ButtonLink } from './ui/Button'
import { Dialog } from './ui/Dialog'

interface TriageModalProps {
  open: boolean
  onClose: () => void
}

export function TriageModal({ open, onClose }: TriageModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Triagem rápida da dor"
      description="Três perguntas para montar um resumo e enviar à fisioterapeuta. Não é diagnóstico."
    >
      <TriageFlow />
    </Dialog>
  )
}

/** Fluxo isolado para ser testado sem o diálogo. Reinicia a cada abertura (o diálogo desmonta ao fechar). */
export function TriageFlow() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<TriageAnswers>({})
  const [showError, setShowError] = useState(false)
  const errorId = useId()
  const total = triageSteps.length
  const done = step >= total

  if (done && isTriageComplete(answers)) {
    return (
      <div>
        <p className="font-data text-xs font-semibold uppercase tracking-[0.12em] text-accent">Resumo pronto</p>
        <ul className="mt-3 divide-y divide-line rounded-2xl border border-line" data-testid="triage-summary">
          {buildTriageSummary(answers).map((line) => {
            const [label, value] = line.split(': ')
            return (
              <li key={line} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 px-4 py-3 text-[15px]">
                <span className="text-ink-body">{label}</span>
                <span className="font-semibold text-ink">{value}</span>
              </li>
            )
          })}
        </ul>
        <p className="mt-4 text-[15px] leading-relaxed text-ink">{triageGuidance(answers)}</p>
        <p className="mt-4 flex gap-2.5 rounded-2xl bg-surface-card p-4 text-sm leading-relaxed text-ink-body">
          <Warning size={18} weight="fill" className="mt-0.5 shrink-0 text-warning" aria-hidden />
          <span>
            <span className="font-semibold text-ink">Sinais de alerta. </span>
            {triageRedFlags}
          </span>
        </p>
        <p className="mt-4 text-[13px] leading-relaxed text-ink-body">
          Nada é salvo neste site. Ao tocar no botão, o WhatsApp abre com o resumo escrito, e ele só é enviado se você
          confirmar o envio por lá. Veja a{' '}
          <a href="/privacidade.html" className="font-semibold text-ink underline underline-offset-2">
            política de privacidade
          </a>
          .
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button variant="ghost" onClick={() => setStep(total - 1)} icon={<ArrowLeft size={16} weight="bold" aria-hidden />}>
            Revisar respostas
          </Button>
          <ButtonLink
            href={buildTriageWhatsAppUrl(answers)}
            external
            data-autofocus
            data-testid="triage-whatsapp"
            icon={<WhatsappLogo size={18} weight="fill" aria-hidden />}
          >
            Enviar resumo no WhatsApp
          </ButtonLink>
        </div>
      </div>
    )
  }

  const current = triageSteps[Math.min(step, total - 1)]!
  const selected = answers[current.id]

  const next = () => {
    if (!selected) {
      setShowError(true)
      return
    }
    setShowError(false)
    setStep((s) => s + 1)
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        next()
      }}
    >
      <div className="flex items-center gap-3" aria-hidden>
        {triageSteps.map((s, i) => (
          <span key={s.id} className={cn('h-1 flex-1 rounded-full', i <= step ? 'bg-accent' : 'bg-line-strong')} />
        ))}
      </div>
      <fieldset className="mt-5" aria-describedby={showError ? errorId : undefined}>
        <legend className="w-full">
          <span className="block font-data text-xs font-semibold text-ink-body tabular">
            Passo {step + 1} de {total} · {current.title}
          </span>
          <span className="mt-1 block font-display text-xl font-semibold text-ink">{current.question}</span>
        </legend>
        <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2">
          {current.options.map((opt) => (
            <label
              key={opt.value}
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-line-strong bg-white px-4 py-2.5 text-[15px] font-medium text-ink has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent"
            >
              <input
                type="radio"
                name={current.id}
                value={opt.value}
                checked={selected === opt.value}
                onChange={() => {
                  setAnswers((a) => ({ ...a, [current.id]: opt.value }))
                  setShowError(false)
                }}
                className="size-4 shrink-0 accent-[var(--accent-action)]"
                aria-invalid={showError}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>
      {showError && (
        <p id={errorId} role="alert" className="mt-3 text-sm font-semibold text-warning">
          Escolha uma opção para continuar.
        </p>
      )}
      <div className="mt-6 flex justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="disabled:opacity-40"
          icon={<ArrowLeft size={16} weight="bold" aria-hidden />}
        >
          Voltar
        </Button>
        <Button type="submit" icon={<ArrowRight size={16} weight="bold" aria-hidden />}>
          {step === total - 1 ? 'Ver resumo' : 'Continuar'}
        </Button>
      </div>
    </form>
  )
}
