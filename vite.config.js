import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'pdfjs-dist'],
  },
  server: {
    proxy: {
      '/api/agnes': {
        target: 'https://apihub.agnes-ai.com',  // ← must be this exact URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/agnes/, ''),
        secure: true,
      },
    },
  },
})
