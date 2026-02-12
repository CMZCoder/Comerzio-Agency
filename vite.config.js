import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('three')) return 'vendor-three';
          if (id.includes('gsap')) return 'vendor-gsap';
          if (id.includes('framer-motion')) return 'vendor-framer';
          if (id.includes('swiper')) return 'vendor-swiper';
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
})
