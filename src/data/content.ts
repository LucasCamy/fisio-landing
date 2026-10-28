/**
 * Conteúdo das seções. Linguagem ética (COFFITO/CREFITO): sem promessa de cura,
 * sem prazo garantido, sempre "a avaliação define".
 */

export interface CaseItem {
  id: string
  image: string
  title: string
  summary: string
  why: string
  evaluate: string[]
}

export const cases: CaseItem[] = [
  {
    id: 'coluna',
    image: 'case-01',
    title: 'Dor na coluna lombar e cervical',
    summary: 'Hérnia de disco, nervo ciático, travamentos e dor ao ficar sentado.',
    why: 'Na maioria das vezes, a dor vem da soma de sobrecarga repetida, pouca mobilidade em segmentos vizinhos e musculatura profunda que não estabiliza bem. Achados de exame, como protrusões, nem sempre explicam sozinhos a intensidade da dor.',
    evaluate: [
      'Mobilidade de cada segmento da coluna e do quadril',
      'Testes neurodinâmicos para o nervo ciático',
      'Postura e posições que pioram ou aliviam a dor',
    ],
  },
  {
    id: 'articulacoes',
    image: 'case-02',
    title: 'Joelho, quadril e ombro',
    summary: 'Condromalácia, tendinites, bursites e dor ao subir escadas ou elevar o braço.',
    why: 'Articulações periféricas costumam pagar a conta de um padrão de movimento ineficiente: um quadril que perde força sobrecarrega o joelho, uma escápula pouco estável sobrecarrega o ombro.',
    evaluate: [
      'Força e controle do quadril, joelho ou ombro',
      'Agachamento, degrau e elevação do braço sob observação',
      'Carga de treino e rotina que antecederam a dor',
    ],
  },
  {
    id: 'pos-operatorio',
    image: 'case-03',
    title: 'Pós-operatório ortopédico',
    summary: 'Reabilitação segura de LCA, menisco, manguito rotador e próteses.',
    why: 'Depois da cirurgia, o tecido precisa de estímulo progressivo no tempo certo. Ir rápido demais ou devagar demais atrasa a recuperação. O plano segue o protocolo da equipe cirúrgica.',
    evaluate: [
      'Relatório cirúrgico e orientações do médico',
      'Amplitude de movimento, edema e cicatrização',
      'Critérios para avançar de fase com segurança',
    ],
  },
  {
    id: 'esporte',
    image: 'case-04',
    title: 'Lesões no esporte e corrida',
    summary: 'Canelite, fascite plantar, estiramentos e retorno seguro ao treino.',
    why: 'Lesões por esforço costumam aparecer quando a carga do treino cresce mais rápido que a capacidade do tecido de se adaptar. Parar totalmente raramente resolve: o caminho é ajustar a carga.',
    evaluate: [
      'Histórico de volume, ritmo e mudanças recentes no treino',
      'Testes de força, salto e controle unipodal',
      'Critérios objetivos para o retorno ao esporte',
    ],
  },
  {
    id: 'cronica',
    image: 'case-05',
    title: 'Dor crônica e tensão miofascial',
    summary: 'Para quem já tomou anti-inflamatório ou fez repouso e a dor sempre volta.',
    why: 'Quando a dor dura meses, o sistema nervoso fica mais sensível e o medo de se mexer reduz o movimento. Tratar só o local da dor costuma não bastar; a reabilitação ativa e gradual ajuda a reconstruir a confiança.',
    evaluate: [
      'Histórico completo da dor e tratamentos já feitos',
      'Sono, estresse e rotina que influenciam a dor',
      'Movimentos evitados por medo e como reintroduzi-los',
    ],
  },
]

export interface Approach {
  id: string
  title: string
  summary: string
  detail: string
  techniques: string[]
}

export const approaches: Approach[] = [
  {
    id: 'manual',
    title: 'Terapia manual & liberação',
    summary: 'Descompressão articular e alívio da dor aguda sem depender só de medicamentos.',
    detail: 'Técnicas manuais aplicadas com objetivo definido: reduzir a dor o suficiente para que o movimento volte a ser possível. A terapia manual abre a janela; o exercício mantém o resultado.',
    techniques: ['Mobilização articular', 'Liberação miofascial', 'Técnicas neurodinâmicas'],
  },
  {
    id: 'estabilizacao',
    title: 'Estabilização & controle motor',
    summary: 'Ativação da musculatura profunda que protege a coluna e as articulações.',
    detail: 'Treino do controle fino dos músculos que estabilizam a coluna, o quadril e a escápula, com exercícios de baixa carga e alta precisão antes de progredir.',
    techniques: ['Ativação do core profundo', 'Controle lombopélvico', 'Estabilidade escapular'],
  },
  {
    id: 'biomecanica',
    title: 'Correção biomecânica',
    summary: 'Ajuste do padrão de movimento para a sobrecarga não voltar.',
    detail: 'Análise de como você agacha, sobe escadas, corre ou levanta peso. Ajustamos o padrão que concentra carga na região dolorida e treinamos a alternativa até ela ficar automática.',
    techniques: ['Análise de movimento', 'Treino de padrão', 'Ajustes de ergonomia'],
  },
  {
    id: 'fortalecimento',
    title: 'Fortalecimento & autonomia',
    summary: 'Progressão segura de carga para você voltar ao treino e à rotina sem medo.',
    detail: 'Exercícios com progressão planejada de carga, volume e complexidade. Você sai com um programa que entende e consegue manter sozinho(a) depois da alta.',
    techniques: ['Progressão de carga', 'Exercício funcional', 'Plano para casa ou academia'],
  },
]

export const indications = [
  'Dor que volta sempre no mesmo lugar',
  'Medo de travar ao agachar ou pegar peso',
  'Pós-cirúrgico que precisa de acompanhamento próximo',
  'Querer evitar cirurgia quando o tratamento conservador é indicado',
  'Voltar a correr ou treinar na academia sem dor',
]

export interface ProcessStep {
  id: string
  image: string
  badge: string
  phase: string
  title: string
  text: string
}

export const processSteps: ProcessStep[] = [
  {
    id: 'avaliacao',
    image: 'step-01-avaliacao',
    badge: 'Avaliação funcional',
    phase: 'Primeira consulta',
    title: 'Avaliação funcional e mapa da dor',
    text: 'Escuta detalhada da sua rotina, histórico e exames, testes práticos de mobilidade, força e controle motor, e uma explicação clara da causa provável da sua dor.',
  },
  {
    id: 'alivio',
    image: 'step-02-planejamento',
    badge: 'Fase de alívio',
    phase: 'Fase de alívio',
    title: 'Terapia manual e ganho de mobilidade',
    text: 'Técnicas manuais específicas, liberação miofascial e mobilização articular para reduzir a dor e devolver o movimento livre.',
  },
  {
    id: 'ativa',
    image: 'step-03-procedimento',
    badge: 'Fase ativa',
    phase: 'Fase ativa',
    title: 'Reabilitação e fortalecimento direcionado',
    text: 'Exercícios terapêuticos progressivos, acompanhados de perto, para estabilizar a região e corrigir compensações.',
  },
  {
    id: 'alta',
    image: 'step-04-acompanhamento',
    badge: 'Alta e prevenção',
    phase: 'Alta e prevenção',
    title: 'Autonomia para a vida e o esporte',
    text: 'Transição segura para sua rotina, academia ou corrida, com orientações práticas para manter o resultado.',
  },
]

export const formation = [
  'Graduação em Fisioterapia',
  'Especialização em Ortopedia, Traumatologia e Coluna',
  'Formação em Terapia Manual e Biomecânica',
]

export const aboutHighlights = [
  { title: 'Avaliação com testes', text: 'Cada plano parte de testes de movimento, força e controle, não de um protocolo pronto.' },
  { title: 'Plano explicado', text: 'Você entende o que está sendo feito, por quê, e o que esperar em cada fase.' },
  { title: 'Acompanhamento até a alta', text: 'A progressão é revista a cada sessão e você sai com um programa para manter.' },
]

export const faq = [
  {
    q: 'Preciso de encaminhamento médico para agendar a avaliação?',
    a: 'Para atendimento particular, não. A fisioterapeuta faz a própria avaliação e o diagnóstico cinético-funcional. Se você tiver exames ou pedido médico, leve: eles ajudam. Alguns planos de saúde exigem pedido médico para reembolso, então confira com o seu.',
  },
  {
    q: 'Como funciona a primeira sessão de avaliação?',
    a: 'Começa com uma conversa sobre a sua dor, rotina e histórico. Depois vêm testes práticos de mobilidade, força e controle motor. No fim, você recebe a explicação da causa provável e a proposta de plano, e em geral já sai com a primeira intervenção.',
  },
  {
    q: 'Quantas sessões vou precisar fazer?',
    a: 'Depende do quadro, do tempo de dor e do seu objetivo, por isso o número só é estimado depois da avaliação. O plano é revisto ao longo do tratamento e a alta acontece quando os critérios combinados são atingidos.',
  },
  {
    q: 'O atendimento é individual ou com vários pacientes no mesmo horário?',
    a: 'Individual. Cada horário é reservado para uma pessoa, com a fisioterapeuta acompanhando a sessão inteira.',
  },
  {
    q: 'Estou na fase de dor aguda ou travado(a). Posso fazer fisioterapia hoje?',
    a: 'Na maioria dos casos, sim: a fase aguda também é tratada, com técnicas e exercícios adaptados à dor. Se houver perda súbita de força, alteração no controle da urina ou das fezes, febre ou dor após queda ou acidente, procure atendimento médico de urgência antes.',
  },
  {
    q: 'Atende convênio ou emite recibo para reembolso?',
    a: 'O atendimento é particular, com emissão de recibo para você solicitar reembolso ao seu plano, conforme as regras do contrato. Confirme por WhatsApp as condições atuais.',
  },
  {
    q: 'Com que roupa devo ir e quanto tempo dura a sessão?',
    a: 'Use roupa confortável que permita movimentar e expor a região tratada, como bermuda ou legging e camiseta ou top. A sessão dura cerca de 60 minutos.',
  },
]
