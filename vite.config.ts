import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import lucy from '@lucy/rollup-plugin';

export default defineConfig({
  plugins: [
    react(),
    lucy(),
  ],
  base: 'model-based-testing-calculator'
})

