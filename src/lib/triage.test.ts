import { describe, expect, it } from 'vitest'
import {
  buildTriageMessage,
  buildTriageSummary,
  buildTriageWhatsAppUrl,
  isTriageComplete,
  triageGuidance,
  triageSteps,
} from './triage'

const full = { region: 'lombar', duration: 'cronica', goal: 'esporte' } as const

describe('triagem rápida da dor', () => {
  it('tem exatamente 3 passos na ordem região, duração e objetivo', () => {
    expect(triageSteps.map((s) => s.id)).toEqual(['region', 'duration', 'goal'])
    expect(triageSteps.map((s) => s.title)).toEqual(['Região da queixa', 'Tempo de duração', 'Principal objetivo'])
  })

  it('só fica completa com os 3 passos respondidos com opções válidas', () => {
    expect(isTriageComplete({})).toBe(false)
    expect(isTriageComplete({ region: 'lombar', duration: 'cronica' })).toBe(false)
    expect(isTriageComplete({ ...full, goal: 'inexistente' })).toBe(false)
    expect(isTriageComplete(full)).toBe(true)
  })

  it('resume com os rótulos legíveis, não com os valores internos', () => {
    expect(buildTriageSummary(full)).toEqual([
      'Região da queixa: Coluna lombar',
      'Tempo de duração: Mais de 3 meses',
      'Principal objetivo: Voltar a treinar ou correr',
    ])
  })

  it('gera a mensagem clínica com uma linha por resposta', () => {
    const message = buildTriageMessage(full)
    expect(message.split('\n')).toHaveLength(5)
    expect(message).toContain('• Região da queixa: Coluna lombar')
    expect(message).toMatch(/avaliação é indicada/)
  })

  it('gera link wa.me com o resumo completo decodificável', () => {
    const url = new URL(buildTriageWhatsAppUrl(full))
    expect(url.origin).toBe('https://wa.me')
    expect(url.searchParams.get('text')).toBe(buildTriageMessage(full))
  })

  it('não gera link com triagem incompleta', () => {
    expect(() => buildTriageWhatsAppUrl({ region: 'joelho' })).toThrow(/incompleta/)
  })

  it('orienta o pós-operatório a seguir a equipe cirúrgica e nunca promete cura', () => {
    expect(triageGuidance({ ...full, duration: 'pos-operatorio' })).toMatch(/equipe cirúrgica/)
    for (const duration of ['aguda', 'subaguda', 'cronica', 'pos-operatorio']) {
      expect(triageGuidance({ ...full, duration })).not.toMatch(/cura|garant/i)
    }
  })
})
