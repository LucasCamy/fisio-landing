import { cn } from '../../lib/cn'
import { Picture } from './Picture'

/** Recorte do retrato do hero, usado na navbar, no dock e no FAQ. */
export function Avatar({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <Picture
      name="hero-specialist"
      alt=""
      width={1200}
      height={1400}
      className={cn('block shrink-0 overflow-hidden rounded-full bg-surface-sunken ring-2 ring-white', className)}
      imgClassName="h-full w-full object-cover object-[50%_8%] scale-[1.9] origin-[50%_12%]"
      sizes={`${size}px`}
      priority
    />
  )
}
