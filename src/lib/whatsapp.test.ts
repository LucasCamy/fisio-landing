import { describe, expect, it } from 'vitest'
import { site } from '../config/site'
import { buildWhatsAppUrl, complaintMessage, whatsappLinks, whatsappMessages } from './whatsapp'

describe('buildWhatsAppUrl', () => {
  it('usa o domínio oficial wa.me com o número só em dígitos', () => {
    const url = buildWhatsAppUrl('Olá', '+55 (11) 99999-0000')
    expect(url).toBe('https://wa.me/5511999990000?text=Ol%C3%A1')
  })

  it('codifica acentos, aspas, quebras de linha e caracteres especiais', () => {
    const url = new URL(buildWhatsAppUrl('Dor "lombar" & ciático\n• 2ª linha', '5511999990000'))
    expect(url.searchParams.get('text')).toBe('Dor "lombar" & ciático\n• 2ª linha')
    expect(url.href).not.toContain(' ')
  })

  it('omite ?text quando a mensagem é vazia', () => {
    expect(buildWhatsAppUrl('   ', '5511999990000')).toBe('https://wa.me/5511999990000')
  })

  it('recusa número curto demais', () => {
    expect(() => buildWhatsAppUrl('Olá', '1234')).toThrow(/inválido/)
  })

  it('usa o número configurado em site.ts por padrão', () => {
    expect(whatsappLinks.schedule()).toContain(`https://wa.me/${site.whatsapp.number}?text=`)
  })
})

describe('mensagens prontas', () => {
  it('leva a queixa escolhida preenchida na mensagem', () => {
    const url = new URL(whatsappLinks.complaint('Joelho, quadril e ombro'))
    const text = url.searchParams.get('text')!
    expect(text).toBe(complaintMessage('Joelho, quadril e ombro'))
    expect(text).toContain('"Joelho, quadril e ombro"')
    expect(text).toContain(site.shortName)
  })

  it('tem uma mensagem distinta por intenção', () => {
    const values = Object.values(whatsappMessages)
    expect(new Set(values).size).toBe(values.length)
    for (const m of values) expect(m).toMatch(/^Olá, /)
  })
})
