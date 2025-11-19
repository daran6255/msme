// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // listen on all network interfaces
    port: 5173,  // your dev server port
    allowedHosts: [
      'msme.winvinayafoundation.org',
      'www.msme.winvinayafoundation.org'
    ]
  }
})
