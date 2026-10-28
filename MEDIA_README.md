# Pacote de mídia — Fisioterapia ARQ-E

Mídia para a landing page de reabilitação ortopédica, coluna e movimento. Os arquivos finais estão em `media/`. O manifesto registra dimensões, tamanhos, hashes SHA-256, parâmetros de codificação e resultados de verificação.

## Conteúdo

| Grupo | Arquivos | Dimensões |
| --- | --- | --- |
| Retrato | `hero-specialist.avif` e `.webp` | 1200 × 1400 |
| Segmentos anatômicos | `anatomy-top` e `anatomy-base`, em AVIF e WebP | 900 × 900 |
| Anatomia montada | `anatomy-assembled.avif` e `.webp` | 1200 × 1000 |
| Mãos da especialista | `specialist-hands.avif` e `.webp` | 1000 × 1200 |
| Clínica | `clinic-reception.avif` e `.webp` | 1600 × 1000 |
| Cinco cards | `case-01` até `case-05`, em AVIF e WebP | 800 × 1000 |
| Quatro etapas | `step-01-avaliacao`, `step-02-planejamento`, `step-03-procedimento`, `step-04-acompanhamento`, em AVIF e WebP | 1000 × 1250 |
| Sequência para canvas | `frames/frame_0001` até `frames/frame_0120`, em AVIF e WebP | 1024 × 576 |
| Vídeo ambiente | `hero-ambient.mp4` | 1280 × 720 |

São **271 arquivos de mídia**: 135 AVIFs, 135 WebPs e um MP4. Em `specialist-hands`, foi priorizada a dimensão explícita 1000 × 1200 do briefing, que corresponde a 5:6; as demais fotos dos cards e da timeline seguem 4:5.

## Direção visual e origem

Fotografias e peças anatômicas geradas com a ferramenta integrada `image_gen`. Pessoas e clínica são fictícias. Paleta: gelo `#F2F5F9`, azul `#5B8DEF`, azul-noturno `#0A0F1D` e branco. Não foram utilizados bancos de vídeo. As imagens finais não contêm textos sobrepostos ou marcas-d'água visuais.

O conjunto completo de prompts finais está em `scripts/media-prompts.json`. Os originais usados para produzir os arquivos ficam em `_media_work/sources/` no projeto local; não fazem parte do ZIP otimizado.

As peças de cristal são visualizações ilustrativas criadas por IA. A sequência usa composição procedural dessas renderizações 3D, com transformação dos segmentos, eixos articulares, linhas de força e brilho. Não é uma simulação física de uma malha anatômica. O vídeo usa a cena de estúdio gerada para o projeto, com movimento procedural sutil de câmera, luz e brilho do cristal.

## Sequência e vídeo

Os 120 quadros correspondem a 5 segundos a 24 fps. O alinhamento converge até o quadro 74; o pulso azul atinge intensidade máxima exatamente no 75; a oscilação residual se encerra no 120. O manifesto inclui os parâmetros de cada quadro.

Para mapear o progresso normalizado do scroll aos arquivos: `frame = 1 + Math.round(Math.max(0, Math.min(1, progresso)) * 119)`. Complete o número com quatro dígitos. Escolha AVIF quando suportado e use WebP como alternativa; carregue apenas o formato escolhido. Cada par representa o mesmo quadro.

O MP4 usa H.264, 24 fps, 108 quadros, 4,5 segundos, CRF 24, `yuv420p`, `+faststart` e nenhuma faixa de áudio. O filtro aplicado é exatamente `xfade=transition=fade:duration=0.5:offset=4.5`. Uma fonte de 5 segundos é combinada com seus primeiros 0,5 segundo; depois, o trecho duplicado inicial é removido (`trim=start=0.5:end=5`) para entregar o loop de 4,5 segundos. Na página, use `muted loop playsinline` e respeite a preferência de movimento reduzido.

## Codificação e verificação

Cada AVIF foi codificado em uma chamada independente do FFmpeg, com `-frames:v 1`, `-still-picture 1`, `libaom-av1` e `yuv420p`. Não foi utilizada saída AVIF em lote com `image2`. CRF: 29 para fotos e peças; 31 para quadros. WebP: qualidade 83, método 6.

Verificações realizadas: decodificação de todas as 270 imagens, todas as dimensões, integridade dos 135 registros `av1C`, leitura e decodificação de todos os 108 quadros do MP4, ausência de áudio e posição de `moov` antes de `mdat`. Os 270 arquivos de imagem também foram decodificados e desenhados em canvas no Chrome, e o vídeo passou por leitura, busca e reprodução no navegador.

Os quadros 0010, 0060 e 0110 foram inspecionados visualmente; o quadro 0075 foi incluído na revisão do pulso. `MEDIA_REVIEW.jpg` mostra as imagens principais e `FRAMES_REVIEW.jpg` mostra os quadros revisados. Os detalhes estão em `MEDIA_QA.json`.

## Reprodução local

Requisitos: Python 3, Pillow, NumPy, FFmpeg com `libaom-av1`, `libwebp` e `libx264`, e ffprobe. Os arquivos originais devem estar em `_media_work/sources/` ou nos caminhos locais registrados no índice de prompts.

Execute `python scripts/build_media.py all`. Também estão disponíveis as etapas `stills`, `frames`, `video`, `verify` e `reviews`. A verificação deixa o manifesto em `encoded`; a promoção para `ready` é feita por `python scripts/finalize_media.py`, que exige os registros de revisão e do navegador, confere os hashes e cria o ZIP. Após alterar uma imagem ou a animação, refaça a revisão correspondente antes da finalização.
