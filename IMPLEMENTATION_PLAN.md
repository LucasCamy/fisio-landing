# IMPLEMENTATION_PLAN.md

## Arquitetura

SPA estática (Vite) com três entradas HTML: `index.html` (landing), `styleguide.html` (tokens e contraste) e `privacidade.html` (minuta). Sem backend: os contatos são links `wa.me` montados no cliente; nada é armazenado além da preferência de acento no `localStorage`.

```
App
├─ Navbar ─ MobileMenu (portal, fora do header sticky)
├─ main
│  ├─ Hero                        GSAP: revelação + parallax das pílulas
│  ├─ SymptomsFanSection          Motion: leque em arco + painel da queixa
│  ├─ AnatomyAssemblySection      GSAP: pin + scrub de 120 quadros em canvas, Dialog de técnica
│  ├─ SignatureTreatmentSection   trilho com IntersectionObserver + TriageModal (Dialog)
│  ├─ ProcessStickySection        sticky CSS + ScrollTrigger (etapa ativa) + Motion (crossfade)
│  ├─ AboutSpecialistSection
│  ├─ FAQSection                  acordeão
│  └─ ContactDarkSection          status aberto/fechado (Intl, fuso de SP)
├─ Footer                         seletor de acento, avisos éticos e de privacidade
└─ FloatingBottomDock             IntersectionObserver (hero/contato)
```

## Dependências

`gsap`, `@gsap/react` (cenas de scroll) · `motion` (estados de UI) · `@phosphor-icons/react` · Fontsource (fontes locais, sem CDN, por LGPD) · dev: Vitest, Testing Library, jsdom, Playwright, ESLint, typescript-eslint.

## Ordem executada

1. Inspeção do pacote de mídia (`MEDIA_README.md`, `MEDIA_QA.json`, revisões visuais) e cópia para `public/media` sem o MP4.
2. Scaffold Vite + TS strict + Tailwind 4 (`source('../')` limitado a `src`).
3. Tokens, contraste calculado, `site.ts` e `content.ts`.
4. Bibliotecas: WhatsApp, triagem, mídia com `__MEDIA_VERSION__`, scroll (GSAP), diálogo, horários.
5. Primitivos (`Picture`, `Button`, `BicolorTitle`, `Dialog`, `Avatar`) → navbar/dock → 8 seções → rodapé.
6. Testes Vitest, validação Playwright, revisão crítica com screenshots, correções.
7. Figma (captura), documentação, Docker.
8. Fluidez (kit `fluidez-e-revelacao`): medição antes, A/B do Lenis, correções pela causa, revelação por etapas, medição depois (ver AGENTS.md › Desempenho).

## Elemento-assinatura e fallback

| Condição | Comportamento |
|---|---|
| Movimento permitido, ≥ 1024 px | seção fixada `+=170%`, `scrub: 1`, quadros 1→120, halo com pico no 75, linhas e quadrantes acendem em 12/30/48/62% |
| Movimento permitido, < 1024 px | sem pin; scrub enquanto a peça atravessa a tela |
| `prefers-reduced-motion: reduce` | sem canvas e sem download de quadros; `anatomy-assembled` estático, quadrantes e linhas acesos |
| `?movimento=1` | força o modo animado (QA e demonstração) |

Quadros: pré-carga quando a cena está a 2,5 telas (`once`), quadros-chave (1 a cada 8) primeiro, desenho do quadro carregado mais próximo, "cover" manual, DPR ≤ 2. Formato: testa se `frame_0001.avif` decodifica de fato; senão WebP.

## Performance

- Hero com `fetchpriority="high"` e preload AVIF com o mesmo `?v=`; demais imagens `lazy` com dimensões.
- 7,1 MB de mídia no total, mas a página inicial baixa só hero + avatar; quadros (~2,6 MB AVIF) só perto da cena.
- Cache: `/media/*` imutável no Nginx (o `?v=hash` muda quando o arquivo muda); HTML `no-cache`.
- JS principal ~200 kB gzip (React, GSAP, Motion). Próximo passo possível: `React.lazy` nas seções abaixo da dobra.

## Testes

- Vitest (27): links `wa.me`, mensagens por intenção, queixa pré-preenchida, triagem (completude, resumo, mensagem, URL, orientação ética), fluxo do componente de triagem, horários no fuso, mapeamento de quadros, `?v=hash`, contraste dos tokens nos dois acentos, pendências de publicação.
- Playwright `e2e/landing.spec.ts` (3 perfis): ordem das seções, leque, triagem + Esc/foco, diálogo de técnica, FAQ, acento persistente, canvas vs. estático vs. `?movimento=1`, dock, menu móvel, `<picture>` com `?v=`.
- `e2e/validate.mjs`: 360/375/390/768/1024/1280/1440/1920 px × duas preferências de movimento; overflow, âncoras, botões quebrados, erros de console, AVIF; screenshots por seção.

## Pendências explícitas

1. Dados reais em `src/config/site.ts` (CREFITO, WhatsApp, endereço, cidade, domínio, horários).
2. Confirmar resposta da FAQ 06 (particular com recibo) e a formação.
3. Revisão jurídica de `privacidade.html`; revisão ética (CREFITO) do uso de "Dra." e do título "à sua alta sem dor".
4. Fotos reais autorizadas (as atuais são geradas por IA e há aviso no rodapé).
