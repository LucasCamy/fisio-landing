import { expect, test, type Page } from '@playwright/test'

const collectErrors = (page: Page) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  return errors
}

const textParam = (href: string | null) => new URL(href!).searchParams.get('text') ?? ''

test('carrega sem erros, com as 8 seções na ordem e um único h1', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/')
  await expect(page.locator('h1')).toHaveCount(1)
  const ids = await page.locator('main > section').evaluateAll((els) => els.map((e) => e.id))
  expect(ids).toEqual(['inicio', 'queixas', 'abordagem', 'atendimento', 'como-funciona', 'sobre', 'duvidas', 'contato'])
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBe(0)
  expect(errors).toEqual([])
})

test('leque: setas e clique trocam a queixa e o WhatsApp leva a queixa escolhida', async ({ page }) => {
  await page.goto('/#queixas')
  const section = page.locator('#queixas')
  await section.getByRole('button', { name: 'Próxima queixa' }).click()
  await expect(section.getByRole('heading', { level: 3, name: 'Joelho, quadril e ombro' })).toBeVisible()
  await section.getByRole('button', { name: /Pós-operatório ortopédico: ver detalhes/ }).click()
  await expect(section.getByText('Queixa 03')).toBeVisible()
  await expect(section.getByRole('button', { name: /Pós-operatório ortopédico: ver detalhes/ })).toHaveAttribute('aria-pressed', 'true')
  const cta = section.getByRole('link', { name: /Tenho essa queixa/ })
  expect(textParam(await cta.getAttribute('href'))).toContain('"Pós-operatório ortopédico"')
  await expect(cta).toHaveAttribute('target', '_blank')
})

test('triagem rápida em 3 passos gera wa.me com resumo e Esc devolve o foco', async ({ page }) => {
  await page.goto('/#atendimento')
  const opener = page.getByRole('button', { name: 'Descobrir se é indicado para mim' })
  await opener.click()
  const dialog = page.getByRole('dialog', { name: 'Triagem rápida da dor' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Continuar' }).click()
  await expect(dialog.getByRole('alert')).toContainText('Escolha uma opção')
  await dialog.getByText('Coluna lombar').click()
  await dialog.getByRole('button', { name: 'Continuar' }).click()
  await dialog.getByText('Mais de 3 meses').click()
  await dialog.getByRole('button', { name: 'Continuar' }).click()
  await dialog.getByText('Voltar a treinar ou correr').click()
  await dialog.getByRole('button', { name: 'Ver resumo' }).click()
  const send = dialog.getByRole('link', { name: /Enviar resumo no WhatsApp/ })
  const href = await send.getAttribute('href')
  expect(href).toMatch(/^https:\/\/wa\.me\/\d+\?text=/)
  expect(textParam(href)).toContain('• Região da queixa: Coluna lombar')
  expect(textParam(href)).toContain('• Principal objetivo: Voltar a treinar ou correr')
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(opener).toBeFocused()
})

test('"Saiba mais" de um quadrante abre o detalhe da técnica', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Saiba mais sobre Correção biomecânica/ }).click()
  const dialog = page.getByRole('dialog', { name: 'Correção biomecânica' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText('Análise de movimento')).toBeVisible()
  await dialog.getByRole('button', { name: 'Fechar' }).click()
  await expect(dialog).toBeHidden()
})

test('FAQ abre e fecha com aria-expanded', async ({ page }) => {
  await page.goto('/#duvidas')
  const q = page.getByRole('button', { name: /Atende convênio/ })
  await expect(q).toHaveAttribute('aria-expanded', 'false')
  await q.click()
  await expect(q).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByText(/emissão de recibo/)).toBeVisible()
})

test('seletor de acento troca para verde-sálvia e persiste', async ({ page }) => {
  await page.goto('/')
  await page.getByText('Verde-sálvia').click()
  await expect(page.locator('html')).toHaveAttribute('data-accent', 'clinical-sage')
  const accent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim())
  expect(accent.toLowerCase()).toBe('#2e7d67')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-accent', 'clinical-sage')
})

test('cena de montagem: canvas com movimento, imagem estática com movimento reduzido', async ({ page }, info) => {
  await page.goto('/')
  const scene = page.locator('#abordagem')
  if (info.project.name === 'desktop-reduce') {
    await expect(scene.getByTestId('assembly-canvas')).toHaveCount(0)
    await expect(scene.locator('img[src*="anatomy-assembled"]')).toHaveCount(1)
    await expect(page.locator('#abordagem .pin-spacer')).toHaveCount(0)
    // ?movimento=1 força a demonstração mesmo com a preferência reduzida
    await page.goto('/?movimento=1')
    await expect(page.locator('html')).toHaveClass(/force-motion/)
    await expect(page.getByTestId('assembly-canvas')).toHaveCount(1)
  } else {
    await expect(scene.getByTestId('assembly-canvas')).toHaveCount(1)
    await scene.scrollIntoViewIfNeeded()
    await expect(scene).toHaveAttribute('data-frame-format', /avif|webp/)
  }
})

test('dock flutuante aparece depois do hero e some no contato', async ({ page }) => {
  await page.goto('/')
  const dock = page.getByTestId('floating-dock')
  await expect(dock).toHaveCSS('opacity', '0')
  await page.evaluate(() => window.scrollTo({ top: document.getElementById('queixas')!.offsetTop + 300, behavior: 'instant' }))
  await expect(dock).toHaveCSS('opacity', '1')
  await page.evaluate(() => document.getElementById('contato')!.scrollIntoView({ behavior: 'instant' }))
  await expect(dock).toHaveCSS('opacity', '0')
})

test('menu móvel prende o foco, navega e fecha', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile-motion', 'só no celular')
  await page.goto('/')
  const toggle = page.getByRole('button', { name: 'Abrir menu' })
  await toggle.click()
  const menu = page.getByRole('dialog', { name: 'Menu' })
  await expect(menu).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(toggle).toBeFocused()
  await toggle.click()
  await menu.getByRole('link', { name: /Dúvidas/ }).click()
  await expect(menu).toBeHidden()
  await expect(page.locator('#duvidas')).toBeInViewport()
})

test('todas as imagens usam <picture> AVIF + WebP com ?v=hash', async ({ page }) => {
  await page.goto('/')
  const imgs = await page.locator('main img, header img, aside img').evaluateAll((els) =>
    els.map((img) => ({
      parent: img.parentElement?.tagName,
      avif: img.parentElement?.querySelector('source[type="image/avif"]')?.getAttribute('srcset') ?? '',
      src: img.getAttribute('src') ?? '',
    })),
  )
  expect(imgs.length).toBeGreaterThan(10)
  for (const i of imgs) {
    expect(i.parent).toBe('PICTURE')
    expect(i.avif).toMatch(/\.avif\?v=[0-9a-f]{10}$/)
    expect(i.src).toMatch(/\.webp\?v=[0-9a-f]{10}$/)
  }
})
