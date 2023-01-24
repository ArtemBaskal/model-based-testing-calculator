import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import lucy from '@lucy/rollup-plugin'

export default defineConfig({
  base: '/model-based-testing-calculator/',
  plugins: [
    react(),
    vue(),
    lucy(),
  ],
})

