export const MEDIA_VERSION = __MEDIA_VERSION__

export type MediaFormat = 'avif' | 'webp'

export function mediaSrc(name: string, format: MediaFormat): string {
  return `/media/${name}.${format}?v=${MEDIA_VERSION}`
}

export const FRAME_COUNT = 120

/** progresso 0..1 → número do quadro 1..120 (regra do MEDIA_README). */
export function frameForProgress(progress: number): number {
  return 1 + Math.round(Math.max(0, Math.min(1, progress)) * (FRAME_COUNT - 1))
}

export function frameSrc(frame: number, format: MediaFormat): string {
  return mediaSrc(`frames/frame_${String(frame).padStart(4, '0')}`, format)
}

let avifSupport: Promise<boolean> | undefined

/** Confere se o navegador decodifica de fato o frame_0001.avif (não basta o MIME). */
export function supportsAvifFrames(): Promise<boolean> {
  avifSupport ??= new Promise<boolean>((resolve) => {
    const img = new Image()
    img.src = frameSrc(1, 'avif')
    img
      .decode()
      .then(() => resolve(img.naturalWidth > 0))
      .catch(() => resolve(false))
  })
  return avifSupport
}
