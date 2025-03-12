import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // Backend API
        target: "https://coe-ens-application-backend.onrender.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/orc-api': {
        // Orchestrator API
        target: "https://coe-ens-analysis-orchestration.onrender.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/orc-api/, ''),
      },
      '/dummy': {
        // Sample Express dummy API
        target: 'http://127.0.0.1:4001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dummy/, ''),
      },
    },
  },
});
