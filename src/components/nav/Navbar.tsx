import { List, Plus } from '@phosphor-icons/react'
import { useCallback, useState } from 'react'
import { navLinks, site } from '../../config/site'
import { whatsappLinks } from '../../lib/whatsapp'
import { Avatar } from '../ui/Avatar'
import { ButtonLink } from '../ui/Button'
import { MobileMenu } from './MobileMenu'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-bg">
        <nav
          aria-label="Principal"
          className="mx-auto flex h-[72px] max-w-[1360px] items-center justify-between gap-4 px-4 sm:px-6"
        >
          <a href="#inicio" className="flex min-w-0 items-center gap-3 rounded-full" aria-label={`${site.name}, início`}>
            <Avatar size={40} className="size-10" />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[15px] font-bold text-ink">{site.name}</span>
              <span className="block truncate text-[12px] text-ink-body">{site.profession}</span>
            </span>
          </a>

          <ul className="hidden items-center gap-0.5 lg:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-full px-3 py-2 text-[14px] font-medium text-ink-body transition-colors xl:px-3.5 xl:text-[15px] [@media(hover:hover)]:hover:bg-surface-card [@media(hover:hover)]:hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <ButtonLink
                href={whatsappLinks.schedule()}
                external
                variant="dark"
                icon={<Plus size={16} weight="bold" aria-hidden />}
              >
                Agendar
              </ButtonLink>
            </div>
            <button
              type="button"
              className="press grid size-11 place-items-center rounded-full border border-line-strong text-ink lg:hidden"
              aria-label="Abrir menu"
              aria-expanded={open}
              aria-controls="menu-movel"
              onClick={() => setOpen(true)}
            >
              <List size={22} weight="bold" />
            </button>
          </div>
        </nav>
      </header>
      <MobileMenu open={open} onClose={close} />
    </>
  )
}
