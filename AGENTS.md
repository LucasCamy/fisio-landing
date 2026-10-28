# AGENTS.md · fisio-landing

Landing page de uma fisioterapeuta especialista em reabilitação ortopédica, coluna e movimento (arquétipo ARQ-E: Precisão Clínica & Cuidado Humano). Página única em pt-BR, sem backend: todos os contatos saem por links `https://wa.me/`.

## Stack

Vite 8 · React 19 · TypeScript 6 (strict) · Tailwind CSS 4 (`@tailwindcss/vite`) · GSAP 3.15 + ScrollTrigger + `@gsap/react` · Motion 14 · Phosphor Icons · Fontsource (Bricolage Grotesque, Manrope, JetBrains Mono) · Vitest + Testing Library · Playwright.

TypeScript está fixado em 6.0 porque o `typescript-eslint` 8.x ainda não aceita o 7.

## Organização

```
public/media/          AVIF + WebP (sem o MP4); frames/frame_0001..0120
src/config/site.ts     nome, CREFITO, WhatsApp, endereço, horários (troque aqui)
src/data/content.ts    textos das seções (queixas, abordagens, etapas, FAQ)
src/lib/               whatsapp, triage, media (?v=hash), scroll (GSAP, preferência de movimento), useDialog, openingHours, contrast
src/styles/tokens.css  único lugar com cor/raio/sombra/motion; exposto ao Tailwind via @theme inline
src/components/        ui/ (primitivos), nav/ (Navbar, MobileMenu, FloatingBottomDock), sections/ (8 seções)
styleguide.html        tokens e contraste calculado ao vivo (/styleguide.html)
privacidade.html       minuta de política de privacidade (revisão jurídica pendente)
e2e/                   Playwright: landing.spec.ts (interações) e validate.mjs (larguras + screenshots)
media/, scripts/, _media_work/   pacote de mídia de origem (não é servido)
```

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento (Vite) |
| `npm run typecheck` | `tsc -b --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest (triagem, WhatsApp, horários, mídia, contraste dos tokens) |
| `npm run build` | `tsc -b && vite build` (gera `index`, `styleguide` e `privacidade`) |
| `npm run e2e` | Playwright em 3 perfis (desktop com/sem movimento, celular). Usa o Edge instalado; `PW_CHANNEL=chrome` troca |
| `node e2e/validate.mjs http://localhost:5173` | overflow 360–1920 px, h1, botões quebrados, AVIF, screenshots em `e2e/screenshots` |
| `docker compose up --build` | build + Nginx em http://localhost:8080 (CSP restrita: só `self` + `data:` em fontes/imagens) |
| `E2E_BASE_URL=http://localhost:8080 npm run e2e` | mesma suíte contra o container de produção |

## Convenções

- Nada de hex solto em componente: use tokens (`bg-surface-card`, `text-ink-soft`, `bg-accent-action`...). Acento alternativo via `data-accent="clinical-sage"` no `<html>`.
- Títulos bicolores com `BicolorTitle` (`--ink` + `--ink-soft`). Números com `tabular`.
- Imagens sempre com `Picture` (AVIF + WebP + `?v=__MEDIA_VERSION__`). O hash é calculado sobre `public/media` em `vite.config.ts`; trocar uma imagem muda o hash sozinho.
- Cenas ligadas ao scroll em GSAP (`useGSAP` + `gsap.matchMedia` com `MOTION_OK*`); estados de UI em Motion. Não misturar os dois no mesmo elemento.
- Todo diálogo usa `useDialog` (foco preso, Esc, trava o scroll no quadro seguinte e devolve o foco).
- Revelação por etapas com `src/components/ui/Reveal.tsx` (`RevealGroup`/`RevealItem`, gatilho por posição `at`, nunca por fração visível). Gestos: título com máscara (`BicolorTitle reveal`), texto `rise`, foto `curtain`/`wipe` com capa da cor do fundo, listas `slide`, selos `pop`.
- `prefers-reduced-motion: reduce`: sem pin, sem scrub, revelações já no estado final; a cena de montagem vira imagem estática. `?movimento=1` força a demonstração.
- Copy ética (COFFITO/CREFITO): sem promessa de cura, sem prazo garantido, sem antes/depois. "A avaliação define."
- Sem travessão longo (—) em texto visível.

## Desempenho

Medido com o kit de fluidez (`perf-scroll`, `perf-frames`, `perf-modal`; CPU 4x, Edge com janela real, 1440 e 390 px). Relatórios brutos em `docs/perf/` (`antes-*`, `ab-sem-lenis-*`, `depois-*`).

| Medida | Antes | Depois |
|---|---|---|
| Quadros ruins por seção, 1440 px | 47–50% | 2–12% |
| Quadros ruins por seção, 390 px | 44–52% | 2–16% |
| Abrir triagem (pior quadro) | 67 ms, script 35 ms + layout forçado 14 ms | 33 ms, sem Long Animation Frame |
| Abrir menu móvel | 83 ms, script 46 ms + layout forçado 26 ms | 17 ms |

Decisões (cada uma pela causa medida):

- **Sem Lenis.** O A/B (`?lenis=0` no build anterior) mostrou que ele causava ~50% de quadros parciais em todas as seções. Rolagem nativa + `scroll-behavior: smooth`; as cenas GSAP seguem suaves com `scrub`. Só reintroduzir com medição em aparelho modesto que aprove.
- **Sem `backdrop-filter`** no header, no dock, no overlay dos diálogos e nas pílulas de vidro: fundo sólido.
- **Diálogos:** `transform` em string no Motion (roda no compositor via WAAPI); travar o scroll e focar só no `requestAnimationFrame` seguinte ao clique.
- **Canvas da montagem:** quadros com `img.decode()` antes do `drawImage`, criados em lotes de 8 no `requestIdleCallback`, pré-carga a 1,5 tela; a barra de progresso recebe o `transform` direto (antes uma variável CSS no `<section>` recalculava o estilo da seção a cada quadro).
- Restante conhecido: 1 quadro longo só de pintura (70–110 ms) no primeiro gesto de rolagem no hero, provavelmente rasterização do retrato 1200×1400 exibido menor. Próximo passo: versões de 640 px com `srcset`.

## Antes de publicar (bloqueante)

1. `pendingFields()` em `src/config/site.ts` precisa voltar vazio: CREFITO, WhatsApp, endereço, cidade e domínio reais. O teste em `src/lib/misc.test.ts` lista as pendências.
2. Confirmar horários, forma de pagamento/reembolso (FAQ 06) e a formação da fisioterapeuta.
3. Revisar `privacidade.html` com advogado(a) e preencher a identificação da controladora.
4. As fotos são geradas por IA e mostram pessoas fictícias: substituir por fotos reais autorizadas ou manter o aviso do rodapé.
5. Confirmar com o CREFITO regional o uso de "Dra." e as regras de publicidade.

## Deploy (Cloudlane Homelab)

- Push na `main` → `.github/workflows/deploy.yml` roda lint, typecheck e testes e publica `ghcr.io/lucascamy/fisio-landing:latest` + `:<sha>` (linux/amd64).
- Keel no k3s detecta o novo digest em até 1 min (`k8s/deploy.yaml`, namespace `landingpages`, Service na porta **8217**).
- Container: `nginx-unprivileged` (usuário 101, porta 8080, raiz somente leitura, `/tmp` em memória), healthcheck `/healthz`.
- Público: `https://fisio.cloudlane.com.br` → `http://192.168.15.19:8217` (Cloudlane Tunnel). Registro em `homelab-docs` (catálogo 04 e matriz DNS 09).

## Figma

Arquivo: https://www.figma.com/design/mZwDWSuwsMVbgH6YT2ubbA (captura do styleguide e da página). Mudanças de UI: atualizar o frame correspondente e conferir com Playwright.
