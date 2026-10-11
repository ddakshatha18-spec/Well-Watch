import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Dev-only proxy: set VITE_API_BASE_URL=/api in .env.local to call the AWS API
// through the dev server (avoids CORS while Person 3 is still configuring it).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_PROXY_TARGET || 'https://e95a0mqwd6.execute-api.ap-south-1.amazonaws.com/Prod';
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': { target, changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, '') },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.js'],
      css: false,
    },
  };
});
