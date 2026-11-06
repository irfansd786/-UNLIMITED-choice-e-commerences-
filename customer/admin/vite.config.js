import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/admin/',
  plugins: [react()],
  server: {
    port: 5174,
    host: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
