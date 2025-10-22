import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Correct configuration for serving with FastAPI
export default defineConfig({
  base: '/static/',
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  build: {
    outDir: '../backend/static',   // ✅ builds your app into FastAPI's static folder
    emptyOutDir: true,     // ✅ cleans old files before building
  },
  server: {
    port: 5173,            // dev server port
    open: true,            // auto-open in browser
  },
})
