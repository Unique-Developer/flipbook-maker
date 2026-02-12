import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { join } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-pdf-worker',
      buildStart() {
        // Copy PDF.js worker file to public folder for local use
        try {
          const workerSrc = join(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs')
          const workerDest = join(__dirname, 'public/pdf.worker.min.mjs')
          copyFileSync(workerSrc, workerDest)
          console.log('PDF.js worker file copied to public folder')
        } catch (error) {
          console.warn('Could not copy PDF worker file:', error)
        }
      }
    }
  ],
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
  server: {
    port: 3000,
  },
})
