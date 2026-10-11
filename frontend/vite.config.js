import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Địa chỉ API Laravel mặc định là cổng 8000; đổi bằng VITE_DEV_API khi chạy cổng khác.
  const api = loadEnv(mode, process.cwd(), '').VITE_DEV_API || 'http://127.0.0.1:8000'
  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      // Chuyển tiếp API và ảnh tải lên (storage) tới Laravel.
      proxy: { '/api': api, '/storage': api },
    },
  }
})
