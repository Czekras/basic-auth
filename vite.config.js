import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'

// Exposes package.json's version to the app as the global __APP_VERSION__.
const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf-8'),
)

// `base` must match the repo name for GitHub Pages project sites (or "/" for a user/org site).
export default defineConfig({
  base: '/basic-auth/',
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
})
