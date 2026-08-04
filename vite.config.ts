import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

const imageOptimizerOptions = {
  png: {
    quality: 80,
  },
  jpg: {
    quality: 80,
  },
  jpeg: {
    quality: 80,
  },
  webp: {
    quality: 80,
  },
  avif: {
    quality: 60,
  },
}

export default defineConfig({
  plugins: [react(), tailwindcss(), ViteImageOptimizer(imageOptimizerOptions)],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom')) return 'vendor-react'
          if (id.includes('node_modules/react')) return 'vendor-react'
          if (id.includes('node_modules/framer-motion')) return 'vendor-framer'
          if (id.includes('node_modules/lucide-react')) return 'vendor-lucide'
          if (id.includes('node_modules/@supabase')) return 'vendor-supabase'
          if (id.includes('node_modules')) return 'vendor-other'
        },
      },
    },
  },
})
