/**
 * Configuração central da página. Troque nome, registro, contato e horários aqui.
 *
 * Campos com "[pendente]" ainda não foram confirmados pela fisioterapeuta e aparecem
 * assim, de propósito, na página. Não publique enquanto existir algum (veja AGENTS.md).
 */

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = domingo

export interface OpeningWindow {
  days: Weekday[]
  /** "HH:MM" no fuso de `timeZone` */
  opens: string
  closes: string
}

export const site = {
  /** Nome exibido no H1, na navbar, no dock e nas mensagens. Troque em uma linha. */
  name: 'Dra. Camila Camy',
  shortName: 'Camila',
  profession: 'Fisioterapeuta',
  specialty: 'Fisioterapia Ortopédica & Coluna',
  crefito: 'CREFITO [pendente]',
  city: '[Cidade pendente]',

  whatsapp: {
    /** Somente dígitos com DDI + DDD. Ex.: 5511999990000 */
    number: '5500000000000',
    display: '(00) 00000-0000 [pendente]',
  },

  address: {
    line1: '[Endereço pendente]',
    line2: '[Bairro, cidade e CEP pendentes]',
  },

  timeZone: 'America/Sao_Paulo',
  /** Confirmar com a fisioterapeuta antes de publicar. */
  hours: [
    { days: [1, 2, 3, 4, 5], opens: '07:00', closes: '20:00' },
    { days: [6], opens: '08:00', closes: '12:00' },
  ] satisfies OpeningWindow[],
  hoursLabel: ['Seg. a sex. · 07h às 20h', 'Sáb. · 08h às 12h'],

  session: {
    minutes: 60,
  },

  /** Endereço publicado (homelab). Troque quando houver domínio próprio. */
  url: 'https://fisio.cloudlane.com.br',
} as const

export type AccentTheme = 'clinical-blue' | 'clinical-sage'

export const accentThemes: { id: AccentTheme; label: string; hex: string }[] = [
  { id: 'clinical-blue', label: 'Azul clínico', hex: '#4F7DF3' },
  { id: 'clinical-sage', label: 'Verde-sálvia', hex: '#2E7D67' },
]

export const navLinks = [
  { href: '#queixas', label: 'Queixas' },
  { href: '#abordagem', label: 'Abordagem' },
  { href: '#atendimento', label: 'Atendimento' },
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#sobre', label: 'Sobre' },
  { href: '#duvidas', label: 'Dúvidas' },
] as const

/** Lista usada no checklist de publicação e no teste de pendências. */
export function pendingFields(): string[] {
  const out: string[] = []
  const visit = (value: unknown, path: string) => {
    if (typeof value === 'string' && value.includes('[')) out.push(path)
    else if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) visit(v, path ? `${path}.${k}` : k)
    }
  }
  visit(site, '')
  if (/^550+$/.test(site.whatsapp.number)) out.push('whatsapp.number')
  return out
}
