import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Proxy API requests to backend
      '/api': {
        target: 'http://localhost:8006',
        changeOrigin: true,
        secure: false,
      },
      // Proxy auth requests to backend (but not /auth/success which is a frontend route)
      '/auth': {
        target: 'http://localhost:8006',
        changeOrigin: true,
        secure: false,
        bypass: (req) => {
          // Don't proxy /auth/success, /auth/failure - these are frontend routes
          if (req.url === '/auth/success' || req.url === '/auth/failure') {
            return req.url;
          }
          return null; // Proxy other /auth/* routes to backend
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req) => {
            console.log('proxy error', err);
          });
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});

