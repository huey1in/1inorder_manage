import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/admin': {
        target: 'https://order.yinxh.fun',
        changeOrigin: true,
        secure: true
      },
      '/uploads': {
        target: 'https://order.yinxh.fun',
        changeOrigin: true,
        secure: true
      }
    },
    host: '0.0.0.0'
  }
})
