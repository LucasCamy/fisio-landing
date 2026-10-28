import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'accent' | 'dark' | 'ghost' | 'light' | 'outline-night'
type Size = 'md' | 'lg'

const base =
  'press inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap select-none min-h-11'

const variants: Record<Variant, string> = {
  accent: 'bg-accent-action text-on-accent [@media(hover:hover)]:hover:bg-accent-action-hover transition-colors',
  dark: 'bg-ink text-white [@media(hover:hover)]:hover:bg-night-raised transition-colors',
  ghost:
    'bg-surface-elevated text-ink border border-line-strong [@media(hover:hover)]:hover:border-ink/30 transition-colors',
  light: 'bg-white text-ink [@media(hover:hover)]:hover:bg-surface-card transition-colors',
  'outline-night':
    'border border-line-night text-on-night [@media(hover:hover)]:hover:bg-white/10 transition-colors',
}

const sizes: Record<Size, string> = {
  md: 'h-11 px-5 text-[15px]',
  lg: 'h-13 px-6 text-base',
}

interface CommonProps {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export function ButtonLink({
  variant = 'accent',
  size = 'md',
  icon,
  children,
  className,
  external,
  ...rest
}: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { external?: boolean }) {
  return (
    <a
      className={cn(base, variants[variant], sizes[size], className)}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      {children}
      {icon}
      {external && <span className="sr-only"> (abre em nova aba)</span>}
    </a>
  )
}

export function Button({
  variant = 'accent',
  size = 'md',
  icon,
  children,
  className,
  type = 'button',
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
      {icon}
    </button>
  )
}
