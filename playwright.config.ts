import { defineConfig } from '@playwright/test'

const PORT = 5180
// E2E_BASE_URL=http://localhost:8080 testa o container (build de produção + Nginx)
const external = process.env.E2E_BASE_URL

export default defineConfig({
  testDir: 'e2e',
  testMatch: '*.spec.ts',
  timeout: 45_000,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: external ?? `http://localhost:${PORT}`,
    // Usa o navegador instalado (sem download do Playwright). Troque com PW_CHANNEL=chrome
    channel: process.env.PW_CHANNEL ?? 'msedge',
  },
  projects: [
    { name: 'desktop-motion', use: { viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' } },
    { name: 'desktop-reduce', use: { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' } },
    { name: 'mobile-motion', use: { viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference', hasTouch: true } },
  ],
  webServer: external
    ? undefined
    : {
        command: `npx vite --port ${PORT} --strictPort`,
        port: PORT,
        reuseExistingServer: true,
      },
})
