/// <reference types="vitest/config" />
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const root = fileURLToPath(new URL('.', import.meta.url))
const mediaDir = join(root, 'public', 'media')

/** Hash curto do conteúdo de public/media: muda sempre que qualquer arquivo de mídia muda. */
function mediaVersion(): string {
  const hash = createHash('sha256')
  const walk = (dir: string) => {
    for (const name of readdirSync(dir).sort()) {
      const path = join(dir, name)
      if (statSync(path).isDirectory()) walk(path)
      else hash.update(relative(mediaDir, path)).update(readFileSync(path))
    }
  }
  walk(mediaDir)
  return hash.digest('hex').slice(0, 10)
}

const MEDIA_VERSION = mediaVersion()
// Exposto também ao HTML como %VITE_MEDIA_VERSION%
process.env.VITE_MEDIA_VERSION = MEDIA_VERSION

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __MEDIA_VERSION__: JSON.stringify(MEDIA_VERSION),
  },
  build: {
    rollupOptions: {
      input: {
        main: join(root, 'index.html'),
        styleguide: join(root, 'styleguide.html'),
        privacidade: join(root, 'privacidade.html'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: { include: [/tokens.css/] },
  },
})
