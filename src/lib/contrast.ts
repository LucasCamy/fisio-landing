export type RGB = [number, number, number]

/** Aceita #rgb, #rrggbb e rgb(r g b) / rgb(r, g, b). Transparência é ignorada. */
export function parseColor(input: string): RGB {
  const value = input.trim()
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (hex) {
    const h = hex[1]!.length === 3 ? [...hex[1]!].map((c) => c + c).join('') : hex[1]!
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB
  }
  const rgb = value.match(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i)
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])]
  throw new Error(`Cor não suportada: ${input}`)
}

function luminance([r, g, b]: RGB): number {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

export function contrastRatio(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}
