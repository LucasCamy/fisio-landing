import tokensCss from '../styles/tokens.css?raw'
import { describe, expect, it } from 'vitest'
import { pendingFields, site } from '../config/site'
import { contrastRatio, parseColor } from './contrast'
import { frameForProgress, frameSrc, mediaSrc } from './media'
import { isOpenAt } from './openingHours'

describe('mídia', () => {
  it('aplica cache busting ?v=<hash> em todas as URLs', () => {
    expect(mediaSrc('case-01', 'avif')).toMatch(/^\/media\/case-01\.avif\?v=[0-9a-f]{10}$/)
    expect(frameSrc(7, 'webp')).toMatch(/^\/media\/frames\/frame_0007\.webp\?v=/)
  })

  it('mapeia progresso 0..1 para os quadros 1..120 com limites', () => {
    expect(frameForProgress(-1)).toBe(1)
    expect(frameForProgress(0)).toBe(1)
    expect(frameForProgress(0.5)).toBe(61)
    expect(frameForProgress(1)).toBe(120)
    expect(frameForProgress(3)).toBe(120)
  })
})

describe('horário de funcionamento (America/Sao_Paulo)', () => {
  // 2026-10-28 é quarta-feira; São Paulo está em UTC-3
  it('aberto numa quarta às 10h e fechado às 21h', () => {
    expect(isOpenAt(new Date('2026-10-28T13:00:00Z'), site.hours, site.timeZone)).toBe(true)
    expect(isOpenAt(new Date('2026-10-29T00:00:00Z'), site.hours, site.timeZone)).toBe(false)
  })

  it('fecha no horário exato e abre no sábado só de manhã', () => {
    expect(isOpenAt(new Date('2026-10-28T23:00:00Z'), site.hours, site.timeZone)).toBe(false) // 20:00
    expect(isOpenAt(new Date('2026-10-31T12:00:00Z'), site.hours, site.timeZone)).toBe(true) // sáb 09:00
    expect(isOpenAt(new Date('2026-10-31T16:00:00Z'), site.hours, site.timeZone)).toBe(false) // sáb 13:00
    expect(isOpenAt(new Date('2026-11-01T13:00:00Z'), site.hours, site.timeZone)).toBe(false) // domingo
  })
})

describe('tokens de cor (contraste AA)', () => {
  const css = tokensCss
  const block = (selector: string) => css.slice(css.indexOf(selector), css.indexOf('}', css.indexOf(selector)))
  const read = (src: string, name: string) => src.match(new RegExp(`--${name}:\\s*([^;]+);`))![1]!

  for (const accent of [':root {', ":root[data-accent='clinical-sage']"]) {
    const root = block(':root {')
    const scope = block(accent)
    const t = (name: string) => parseColor(scope.includes(`--${name}:`) ? read(scope, name) : read(root, name))

    it(`${accent}: texto do botão passa 4,5:1`, () => {
      expect(contrastRatio(t('on-accent'), t('accent-action'))).toBeGreaterThanOrEqual(4.5)
    })
    it(`${accent}: acento como marca gráfica passa 3:1 nas duas superfícies`, () => {
      expect(contrastRatio(t('accent'), t('bg'))).toBeGreaterThanOrEqual(3)
      expect(contrastRatio(t('accent'), t('surface-card'))).toBeGreaterThanOrEqual(3)
    })
  }

  it('texto de corpo passa 4,5:1 e complemento de título passa 3:1 no gelo', () => {
    const root = block(':root {')
    const t = (name: string) => parseColor(read(root, name))
    expect(contrastRatio(t('ink-body'), t('surface-card'))).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(t('ink-soft'), t('surface-card'))).toBeGreaterThanOrEqual(3)
    expect(contrastRatio(t('ink-on-night-muted'), t('night-clinical'))).toBeGreaterThanOrEqual(4.5)
  })
})

describe('checklist de publicação', () => {
  it('lista os campos ainda pendentes em site.ts', () => {
    // Enquanto houver pendências, a página não deve ser publicada (ver AGENTS.md)
    expect(pendingFields()).toEqual(expect.arrayContaining(['crefito', 'whatsapp.number']))
  })
})
