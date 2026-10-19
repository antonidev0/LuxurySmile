import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // three.js (escena 3D) pesa ~900 kB sin comprimir, pero se carga aparte y solo en la portada
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Librerías grandes en archivos propios para que el navegador las guarde en caché
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'],
          charts: ['recharts'],
        },
      },
    },
  },
})
