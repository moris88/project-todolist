import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    react(),
    checker({
      typescript: true,
    }),
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Estrae il nome del pacchetto gestendo anche i @scope (es. @vitejs/plugin-react)
            const directories = id
              .toString()
              .split('node_modules/')[1]
              .split('/')
            if (directories[0].startsWith('@')) {
              return `${directories[0]}/${directories[1]}`
            }
            return directories[0]
          }
        },
      },
    },
  },
})
