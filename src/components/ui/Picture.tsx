import { mediaSrc } from '../../lib/media'

interface PictureProps {
  name: string
  alt: string
  width: number
  height: number
  className?: string
  imgClassName?: string
  priority?: boolean
  sizes?: string
}

/** AVIF com WebP de reserva, sempre com dimensões para evitar layout shift. */
export function Picture({ name, alt, width, height, className, imgClassName, priority, sizes }: PictureProps) {
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={mediaSrc(name, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={mediaSrc(name, 'webp')} sizes={sizes} />
      <img
        src={mediaSrc(name, 'webp')}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className={imgClassName}
      />
    </picture>
  )
}
