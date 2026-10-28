import { ArrowRight } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { cn } from '../../lib/cn'
import { whatsappLinks } from '../../lib/whatsapp'
import { Avatar } from '../ui/Avatar'

/**
 * Pílula escura fixa na base. Aparece depois do hero e some quando o bloco de contato
 * (que já tem o mesmo CTA) entra na tela.
 */
export function FloatingBottomDock() {
  const [pastHero, setPastHero] = useState(false)
  const [atContact, setAtContact] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('inicio')
    const contact = document.getElementById('contato')
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === hero) setPastHero(!e.isIntersecting && e.boundingClientRect.top < 0)
        if (e.target === contact) setAtContact(e.isIntersecting)
      }
    })
    if (hero) io.observe(hero)
    if (contact) io.observe(contact)
    return () => io.disconnect()
  }, [])

  const visible = pastHero && !atContact

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center px-3 transition-[opacity,transform] duration-[280ms] ease-[var(--ease-out)] sm:bottom-5',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
      )}
      inert={!visible}
      data-testid="floating-dock"
    >
      <aside
        aria-label="Agendamento rápido"
        className="pointer-events-auto flex w-full max-w-[640px] items-center gap-3 rounded-full bg-dock p-1.5 pl-1.5 text-white shadow-dock sm:w-auto sm:pl-2"
      >
        <Avatar size={40} className="size-10 ring-white/20" />
        <p className="min-w-0 flex-1 text-[13px] leading-snug text-white/85 sm:max-w-[330px] sm:text-sm">
          <span className="font-semibold text-white">Sente dor ao se movimentar?</span>{' '}
          <span className="hidden sm:inline">Descubra como funciona a avaliação</span>
        </p>
        <a
          href={whatsappLinks.schedule()}
          target="_blank"
          rel="noopener noreferrer"
          className="press inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-accent-action px-4 text-[14px] font-semibold text-on-accent transition-colors [@media(hover:hover)]:hover:bg-accent-action-hover sm:px-5"
        >
          <span className="sm:hidden">Agendar</span>
          <span className="hidden sm:inline">Agendar avaliação</span>
          <ArrowRight size={16} weight="bold" aria-hidden />
          <span className="sr-only"> (abre o WhatsApp em nova aba)</span>
        </a>
      </aside>
    </div>
  )
}
