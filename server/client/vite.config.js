import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const clientPort = Number(process.env.CLIENT_PORT || 5173)
const previewPort = Number(process.env.CLIENT_PREVIEW_PORT || 4173)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: clientPort,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: previewPort,
    strictPort: true,
  },
})
