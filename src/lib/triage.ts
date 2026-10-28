import { site } from '../config/site'
import { buildWhatsAppUrl } from './whatsapp'

export type TriageStepId = 'region' | 'duration' | 'goal'

export interface TriageOption {
  value: string
  label: string
}

export interface TriageStep {
  id: TriageStepId
  title: string
  question: string
  options: TriageOption[]
}

export const triageSteps: TriageStep[] = [
  {
    id: 'region',
    title: 'Região da queixa',
    question: 'Onde está a dor ou a limitação principal?',
    options: [
      { value: 'lombar', label: 'Coluna lombar' },
      { value: 'cervical', label: 'Pescoço / coluna cervical' },
      { value: 'ombro', label: 'Ombro' },
      { value: 'joelho', label: 'Joelho' },
      { value: 'quadril', label: 'Quadril' },
      { value: 'tornozelo-pe', label: 'Tornozelo ou pé' },
      { value: 'outra', label: 'Outra região' },
    ],
  },
  {
    id: 'duration',
    title: 'Tempo de duração',
    question: 'Há quanto tempo isso acontece?',
    options: [
      { value: 'aguda', label: 'Menos de 2 semanas' },
      { value: 'subaguda', label: 'De 2 semanas a 3 meses' },
      { value: 'cronica', label: 'Mais de 3 meses' },
      { value: 'pos-operatorio', label: 'Estou em pós-operatório' },
    ],
  },
  {
    id: 'goal',
    title: 'Principal objetivo',
    question: 'O que você mais quer recuperar?',
    options: [
      { value: 'aliviar', label: 'Aliviar a dor no dia a dia' },
      { value: 'rotina', label: 'Voltar a fazer tarefas sem medo' },
      { value: 'esporte', label: 'Voltar a treinar ou correr' },
      { value: 'cirurgia', label: 'Recuperar bem após a cirurgia' },
      { value: 'prevenir', label: 'Evitar que a dor volte' },
    ],
  },
]

export type TriageAnswers = Partial<Record<TriageStepId, string>>

export function findOption(stepId: TriageStepId, value: string | undefined): TriageOption | undefined {
  return triageSteps.find((s) => s.id === stepId)?.options.find((o) => o.value === value)
}

export function isTriageComplete(answers: TriageAnswers): answers is Required<TriageAnswers> {
  return triageSteps.every((step) => findOption(step.id, answers[step.id]) !== undefined)
}

/** Orientação geral, nunca diagnóstico. */
export function triageGuidance(answers: Required<TriageAnswers>): string {
  if (answers.duration === 'pos-operatorio') {
    return 'No pós-operatório, a fisioterapia segue as orientações da equipe cirúrgica. Leve o relatório da cirurgia para a avaliação.'
  }
  if (answers.duration === 'aguda') {
    return 'Dor recente também pode ser avaliada. A primeira sessão define o que é seguro fazer agora e o que esperar.'
  }
  if (answers.duration === 'cronica') {
    return 'Dor que dura meses costuma envolver padrão de movimento e sobrecarga. A avaliação funcional ajuda a encontrar o que mantém o quadro.'
  }
  return 'Com a avaliação funcional dá para entender a causa da sobrecarga e montar um plano para a sua rotina.'
}

export const triageRedFlags =
  'Procure atendimento médico de urgência se houver perda súbita de força, formigamento que se espalha, alteração no controle da urina ou das fezes, febre com dor nas costas ou dor após queda ou acidente.'

export function buildTriageSummary(answers: Required<TriageAnswers>): string[] {
  return triageSteps.map((step) => `${step.title}: ${findOption(step.id, answers[step.id])?.label ?? '-'}`)
}

export function buildTriageMessage(answers: Required<TriageAnswers>): string {
  const lines = buildTriageSummary(answers).map((line) => `• ${line}`)
  return [
    `Olá, ${site.shortName}! Fiz a triagem rápida no site:`,
    ...lines,
    'Gostaria de saber se a avaliação é indicada para o meu caso.',
  ].join('\n')
}

export function buildTriageWhatsAppUrl(answers: TriageAnswers): string {
  if (!isTriageComplete(answers)) throw new Error('Triagem incompleta.')
  return buildWhatsAppUrl(buildTriageMessage(answers))
}
