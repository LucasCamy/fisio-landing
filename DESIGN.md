# DESIGN.md · ARQ-E Precisão Clínica & Cuidado Humano

## Missão visual

Fazer a pessoa com dor sentir, em segundos, que vai ser **avaliada com precisão** e **tratada por alguém atento**. Precisão vem da tipografia firme, dos números tabulares e da peça vertebral que se encaixa; cuidado vem das superfícies claras e arredondadas, das fotos de atendimento real e da linguagem direta, sem promessas.

- **Personalidade:** calma, exata, acolhedora. Nunca alarmista, nunca "milagrosa".
- **Público:** adultos com dor na coluna ou articulações, pós-operatório e esportistas amadores; chegam pelo celular, em geral pelo Instagram ou Google.
- **Elemento-assinatura:** montagem vertebral em cristal (120 quadros) que se alinha com o scroll e acende quatro frentes de tratamento. Representa o produto: devolver estabilidade ao movimento.

## Princípios

1. A próxima ação (agendar pelo WhatsApp) está sempre a um toque: navbar, dock flutuante, cada seção.
2. Toda interação leva a uma mensagem já escrita: queixa escolhida, triagem, dúvida.
3. Linguagem baseada em evidência: "a avaliação define", sem prazo nem cura garantida.
4. Uma cor de acento. Verde/âmbar só como estado, com forma e texto.

## Paleta (src/styles/tokens.css)

| Token | Hex | Uso |
|---|---|---|
| `--bg` | #FFFFFF | fundo da página |
| `--surface-card` | #F2F5F9 | módulos `rounded-[36px]` (gelo clínico) |
| `--surface-elevated` | #FFFFFF + borda `rgba(15,23,42,.07)` | cartões internos |
| `--surface-sunken` | #E8EDF4 | fundo de mídia, avatar |
| `--night-clinical` | #0A0F1D | bloco final de contato |
| `--dock` | rgb(17 24 39 / .96) | dock flutuante (sólido, sem blur) |
| `--ink` | #0F172A | títulos e texto forte |
| `--ink-body` | #475467 | parágrafos |
| `--ink-soft` | #7C8699 | complemento dos títulos bicolores |
| `--accent` | #4F7DF3 | marca: pontos, progresso, foco, halo, ícones |
| `--accent-action` | #3A6BE8 | preenchimento de botão (texto branco) |
| `--accent-halo` | #5B8DEF | halo de estabilidade da cena |
| `--warning` | #9A5B00 | aviso de sinais de alerta |
| `--success-night` | #4ADE80 | ponto "Aberto agora" (com texto) |

**Acento alternativo** `data-accent="clinical-sage"`: `--accent` = `--accent-action` = #2E7D67, halo #4FAE92. Seletor no rodapé ("Cor de destaque") e `?acento=sage`; a escolha fica no `localStorage`.

### Decisões de contraste (ajustes sobre a referência)

- **#8A94A6 → #7C8699** no complemento dos títulos: #8A94A6 dá 3,06:1 sobre branco mas **2,80:1 sobre #F2F5F9** (reprova AA texto grande). #7C8699 dá 3,67:1 / 3,37:1, visualmente quase idêntico.
- **#4F7DF3 continua a cor da marca**, mas texto branco sobre ele dá só 3,78:1. O botão usa **#3A6BE8** (4,72:1), a 1 passo de luminosidade. Em sálvia, #2E7D67 já passa (4,95:1) e é usado direto.

### Tabela calculada (WCAG 2.2; o styleguide recalcula ao vivo)

| Texto | Superfície | Razão | Mín. | |
|---|---|---|---|---|
| ink #0F172A | bg / surface-card | 17,9 / 16,3 | 4,5 | ● |
| ink-body #475467 | bg / surface-card | 7,7 / 7,0 | 4,5 | ● |
| ink-soft #7C8699 (≥ 32 px) | bg / surface-card | 3,7 / 3,4 | 3 | ● |
| branco | accent-action #3A6BE8 | 4,7 | 4,5 | ● |
| branco | sálvia #2E7D67 | 4,9 | 4,5 | ● |
| accent #4F7DF3 (gráfico) | bg / surface-card | 3,78 / 3,45 | 3 | ● |
| sálvia #2E7D67 (gráfico) | surface-card | 4,52 | 3 | ● |
| ink-on-night-muted #A9B3C6 | night #0A0F1D | 9,05 | 4,5 | ● |
| warning #9A5B00 | surface-card | 4,96 | 4,5 | ● |

Os valores acima são cobertos por teste (`src/lib/misc.test.ts`).

## Tipografia

- **Display:** Bricolage Grotesque Variable 600, tracking −0,025 a −0,035 em. Acentos (é ã ç õ) conferidos no styleguide.
- **Texto:** Manrope Variable 400–700, 15–18 px, `text-wrap: pretty`.
- **Dados:** JetBrains Mono 500/600 com `tabular-nums` (contadores 01 / 05, 60 min, 1:1, horários).
- Escala fluida: H1 `clamp(2.45rem, 6.2vw, 5rem)` com complemento a 0,56 em; H2 `clamp(2rem, 4.2vw, 3.5rem)`; H3 18–34 px.
- **Título bicolor** (`BicolorTitle`): parte principal em `--ink`, complemento em `--ink-soft`.

## Espaço, raio, sombra

- Container 1360 px, gutter 12–24 px; seções separadas por 96–128 px.
- Raios: 10 chips · 16 cartões pequenos · 20–24 cartões · 28 molduras de foto · 36 módulos · pílula.
- Sombras tingidas com `--ink`: `--shadow-soft` (cartões), `--shadow-lift` (pílulas de vidro, leque), `--shadow-dock`.
- "Vidro" (`.glass`) só nas pílulas sobre foto e no badge da etapa: branco 94% sólido, sem `backdrop-filter` (custo de GPU medido).

## Componentes

- **Botões** (pílula, ≥ 44 px): `accent` (Agendar avaliação), `dark` (Falar sobre o meu caso, Perguntar no WhatsApp), `ghost` (Ver como funciona), `outline-night` (contato). `scale(.97)` ao pressionar; cor muda só no hover de ponteiro fino.
- **Pílulas:** origem (ponto azul + especialidade + CREFITO), vidro com ícone, formação.
- **Cartões:** queixa (4:5, gradiente de legibilidade), quadrante de abordagem (acende com `--accent`), indicação (número + frase), info escura (contato).
- **Diálogos:** painel 28 px, entra em 280 ms, sai em 180 ms; folha inferior no celular.

## Seções e mecânicas

| # | Seção | Layout | Interação / motion |
|---|---|---|---|
| 1 | Navbar + dock | barra sticky sólida; pílula escura fixa na base | dock aparece após o hero e some no contato |
| 2 | Hero | split 1,08/0,92 em módulo gelo | revelação por máscara (uma vez); parallax discreto das 2 pílulas |
| 3 | Com quais dores me procuram | leque em arco −12°…+12° | setas/teclado/clique centralizam; painel com WhatsApp pré-preenchido |
| 4 | Reabilitação precisa | 4 quadrantes + peça central | pin + scrub de 120 quadros, halo, linhas e quadrantes acendem |
| 5 | Quando o tratamento individual | split + trilho horizontal | contador 01–04 / 05 por IntersectionObserver; triagem em 3 passos |
| 6 | Da primeira avaliação à alta | moldura sticky + timeline | crossfade da foto por etapa; eixo preenche no scroll |
| 7 | Quem vai cuidar | split foto/texto | estático (pausa visual) |
| 8 | FAQ + Contato | coluna sticky + acordeão; bloco noturno | acordeão `aria-expanded`; "Aberto agora" calculado no fuso de SP |

## Motion

- `--ease-out` cubic-bezier(.22,1,.36,1), `--ease-in-out` cubic-bezier(.65,0,.35,1); 120 / 180 / 280 / 560 / 900 ms.
- Só `transform`, `opacity`, `stroke-dashoffset` e canvas. Rolagem nativa (Lenis removido após medição, ver AGENTS.md › Desempenho).
- Revelação por etapas: o bloco abre quando o topo chega a ~78% da tela, em sequência (título com máscara → texto → foto com capa → listas → selos).
- **Movimento reduzido:** sem pin, scrub ou revelação; cena 4 vira `anatomy-assembled` com quadrantes já acesos; leque e diálogos trocam sem animação. `?movimento=1` força o modo animado.

## Estados

Hover (ponteiro fino), foco visível global (anel `--accent`, 2 px, offset 3), ativo (`scale .97`), selecionado (anel 2 px no card do leque; `aria-pressed`), erro de triagem (`role="alert"`, texto âmbar), status aberto/fechado (círculo verde vs. quadrado vazado + texto).

## Responsividade

Recompor, não encolher: hero empilha; leque reduz o cartão (`clamp(168px, 23vw, 300px)`) e mantém o arco; cena 4 vira peça + grade 2×2 sem pin, ainda com scrub; trilho vira scroll com snap; moldura sticky da etapa vira uma foto por etapa; FAQ sem sticky. Validado de 360 a 1920 px sem overflow horizontal.

## Acessibilidade

Um `h1`, skip link, `aria-live` no contador do leque, no painel da queixa e no badge da etapa, diálogos com foco preso e retorno, canvas `aria-hidden` com descrição `sr-only`, alvos ≥ 44 px, `lang="pt-BR"`.

## Do / Don't

- ✅ Mensagens prontas e específicas por intenção. ✅ Números com unidade. ✅ Aviso de sinais de alerta na triagem.
- ❌ Antes/depois, depoimentos inventados, "cura", "sem dor garantido", gradiente roxo, blobs, emoji como ícone, hex solto.

## Checklist final

- [x] Tokens únicos e contraste testado nos dois acentos
- [x] AVIF + WebP com `?v=hash` em todas as imagens; `frame_0001.avif` decodifica
- [x] Pin/scrub com versão estática equivalente
- [x] Zero overflow 360–1920 px, zero erro de console
- [ ] Dados reais da fisioterapeuta em `site.ts` (bloqueante)
- [ ] Fotos reais autorizadas ou aviso de IA mantido
