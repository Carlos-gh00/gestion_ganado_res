import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // Permite acceso desde localhost y desde otros dispositivos en tu red local (IP)
    port: 5173,
    open: true, // Abre automáticamente el navegador al iniciar el servidor
    proxy: {
      // Delega las llamadas /api al backend Flask en backend/server
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
