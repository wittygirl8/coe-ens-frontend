import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // Backend API
        target: process.env.APPLICATION_BACKEND,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/orc-api': {
        // Orchestrator API
        target: process.env.ANALYSIS_ORCHESTRATION,
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
