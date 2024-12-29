
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [
    react({
      fastRefresh: process.env.NODE_ENV !== 'production',
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000
  }
})
