import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy /api to your Spring Boot server
      '/api': {
        target: 'http://localhost:8082', // your backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
    },
  },
});
