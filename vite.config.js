import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Firebase modular SDK は元から大きいためしきい値を引き上げる
    chunkSizeWarningLimit: 1000,
  },
})
