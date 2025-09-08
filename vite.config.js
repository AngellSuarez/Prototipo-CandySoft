import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // Listen on all network interfaces
    preview: {
      allowedHosts: ['prototipo-candysoft.onrender.com','prototipo-candysoft.onrender.com'], // Add your Render hostname here
    },
  },
})
