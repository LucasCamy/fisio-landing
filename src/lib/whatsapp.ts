import { site } from '../config/site'

/** Monta o link oficial `https://wa.me/<número>?text=<mensagem>`. */
export function buildWhatsAppUrl(message: string, phone: string = site.whatsapp.number): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 10) throw new Error('Número de WhatsApp inválido: informe DDI + DDD + número.')
  const text = message.trim()
  return text ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : `https://wa.me/${digits}`
}

export const whatsappMessages = {
  schedule: `Olá, ${site.shortName}! Vim pelo site e gostaria de agendar uma avaliação de fisioterapia.`,
  question: `Olá, ${site.shortName}! Vim pelo site e tenho uma dúvida sobre o atendimento.`,
  myCase: `Olá, ${site.shortName}! Vim pelo site e gostaria de conversar sobre o meu caso para entender qual abordagem faz sentido.`,
  general: `Olá, ${site.shortName}! Vim pelo site e gostaria de mais informações.`,
} as const

/** Mensagem pronta quando a pessoa escolhe uma queixa no leque de casos. */
export function complaintMessage(complaint: string): string {
  return `Olá, ${site.shortName}! Vim pelo site. Tenho uma queixa de "${complaint}" e gostaria de entender como funciona a avaliação.`
}

export const whatsappLinks = {
  schedule: () => buildWhatsAppUrl(whatsappMessages.schedule),
  question: () => buildWhatsAppUrl(whatsappMessages.question),
  myCase: () => buildWhatsAppUrl(whatsappMessages.myCase),
  general: () => buildWhatsAppUrl(whatsappMessages.general),
  complaint: (complaint: string) => buildWhatsAppUrl(complaintMessage(complaint)),
}
