import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backend = env.VITE_API_URL || 'https://backend-chiltepin.onrender.com'

  return {
    plugins: [react()],
    server: {
      // Reenvía /api al backend para evitar CORS en desarrollo
      proxy: {
        '/api': { target: backend, changeOrigin: true, secure: true },
      },
    },
  }
})
