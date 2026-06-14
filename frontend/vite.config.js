import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const xff = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
            proxyReq.setHeader('X-Forwarded-For', xff);
            if (req.headers['x-request-id']) {
              proxyReq.setHeader('X-Request-ID', req.headers['x-request-id']);
            }
          });
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
