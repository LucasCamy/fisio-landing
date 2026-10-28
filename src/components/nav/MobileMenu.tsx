import { ArrowRight, X } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { navLinks, site } from '../../config/site'
import { scrollToHash } from '../../lib/scroll'
import { useDialog } from '../../lib/useDialog'
import { whatsappLinks } from '../../lib/whatsapp'
import { ButtonLink } from '../ui/Button'

/** Painel em portal, fora do header sticky: fica acima de tudo e não herda o contexto dele. */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  // A rolagem até a seção espera a saída do painel: só então o scroll é destravado
  const pendingHash = useRef<string | null>(null)

  return createPortal(
    <AnimatePresence
      onExitComplete={() => {
        if (pendingHash.current) scrollToHash(pendingHash.current)
        pendingHash.current = null
      }}
    >
      {open && (
        <Panel
          onClose={onClose}
          onNavigate={(href) => {
            pendingHash.current = href
            onClose()
          }}
        />
      )}
    </AnimatePresence>,
    document.body,
  )
}

function Panel({ onClose, onNavigate }: { onClose: () => void; onNavigate: (href: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useDialog(true, onClose, ref)

  return (
    <motion.div
      ref={ref}
      id="menu-movel"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="fixed inset-0 z-[90] flex flex-col bg-white px-4 pb-6 sm:px-6 lg:hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.24 } }}
      exit={{ opacity: 0, transition: { duration: 0.16 } }}
    >
      <div className="flex h-[72px] items-center justify-between">
        <span className="text-[15px] font-bold text-ink">{site.name}</span>
        <button
          type="button"
          onClick={onClose}
          className="press grid size-11 place-items-center rounded-full border border-line-strong"
          aria-label="Fechar menu"
        >
          <X size={20} weight="bold" />
        </button>
      </div>
      <nav aria-label="Menu móvel" className="mt-4 flex-1">
        <ul className="divide-y divide-line">
          {navLinks.map((link, i) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => {
                  e.preventDefault()
                  onNavigate(link.href)
                }}
                className="flex min-h-14 items-center justify-between py-3 font-display text-2xl font-semibold text-ink"
              >
                {link.label}
                <span className="font-data text-sm text-ink-soft tabular">0{i + 1}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <ButtonLink
        href={whatsappLinks.schedule()}
        external
        size="lg"
        className="w-full"
        icon={<ArrowRight size={18} weight="bold" aria-hidden />}
      >
        Agendar avaliação
      </ButtonLink>
    </motion.div>
  )
}
