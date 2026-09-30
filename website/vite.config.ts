import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serve il sito del repo sotto https://giolendius.github.io/CorporeSano/
export default defineConfig({
  base: '/CorporeSano/',
  plugins: [react()],
})
