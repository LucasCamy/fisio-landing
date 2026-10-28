import { useState } from 'react'
import { accentThemes, site, type AccentTheme } from '../config/site'
import { applyAccent, initialAccent } from '../lib/accent'
import { cn } from '../lib/cn'

export function Footer() {
  const [accent, setAccent] = useState<AccentTheme>(() => initialAccent())

  return (
    <footer className="mx-auto max-w-[1360px] px-4 pb-32 pt-12 sm:px-6 sm:pb-36">
      <div className="flex flex-col gap-8 border-t border-line pt-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl">
          <p className="text-[15px] font-bold text-ink">{site.name}</p>
          <p className="mt-1 text-sm text-ink-body">
            {site.profession} · <span className="font-data tabular">{site.crefito}</span> · {site.city}
          </p>
          <p className="mt-4 text-[13px] leading-relaxed text-ink-body">
            Conteúdo informativo, que não substitui a avaliação individual. Resultados variam de pessoa para pessoa.
            Imagens ilustrativas criadas por inteligência artificial.
          </p>
          <p className="mt-2 text-[13px] text-ink-body">
            Este site não usa cookies de rastreamento nem coleta dados em formulários.{' '}
            <a href="/privacidade.html" className="font-semibold text-ink underline underline-offset-2">
              Política de privacidade
            </a>
          </p>
        </div>

        <fieldset className="shrink-0">
          <legend className="text-[13px] font-semibold text-ink-body">Cor de destaque</legend>
          <div className="mt-2 inline-flex rounded-full border border-line-strong bg-white p-1">
            {accentThemes.map((t) => (
              <label
                key={t.id}
                className={cn(
                  'flex min-h-10 cursor-pointer items-center gap-2 rounded-full px-3.5 text-[13px] font-semibold text-ink has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent',
                  accent === t.id && 'bg-surface-card',
                )}
              >
                <input
                  type="radio"
                  name="accent"
                  value={t.id}
                  checked={accent === t.id}
                  onChange={() => {
                    setAccent(t.id)
                    applyAccent(t.id)
                  }}
                  className="sr-only"
                />
                <span className="size-3.5 rounded-full" style={{ background: t.hex }} aria-hidden />
                {t.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <p className="mt-8 font-data text-xs text-ink-body tabular">© {new Date().getFullYear()} {site.name}</p>
    </footer>
  )
}
