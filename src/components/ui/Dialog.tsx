import { X } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/cn'
import { useDialog } from '../../lib/useDialog'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  className?: string
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const

export function Dialog(props: DialogProps) {
  return createPortal(
    <AnimatePresence>{props.open && <DialogPanel {...props} />}</AnimatePresence>,
    document.body,
  )
}

function DialogPanel({ onClose, title, description, children, className }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descId = useId()
  useDialog(true, onClose, panelRef)

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <motion.div
        className="absolute inset-0 bg-night/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.28 } }}
        exit={{ opacity: 0, transition: { duration: 0.18 } }}
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          'relative max-h-[calc(100dvh-24px)] w-full max-w-xl overflow-y-auto rounded-[28px] bg-surface-elevated p-6 shadow-lift outline-none sm:p-8',
          className,
        )}
        // transform em string: o Motion entrega ao WAAPI e a entrada roda no compositor
        initial={{ opacity: 0, transform: 'translateY(24px) scale(0.98)' }}
        animate={{ opacity: 1, transform: 'translateY(0px) scale(1)', transition: { duration: 0.28, ease: EASE_OUT } }}
        exit={{ opacity: 0, transform: 'translateY(12px) scale(0.98)', transition: { duration: 0.18 } }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="font-display text-2xl font-semibold text-ink">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1.5 text-[15px] text-ink-body">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="press -mr-2 -mt-1 grid size-11 shrink-0 place-items-center rounded-full text-ink-body [@media(hover:hover)]:hover:bg-surface-card"
            aria-label="Fechar"
          >
            <X size={20} weight="bold" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  )
}
