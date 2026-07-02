import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// El frontend corre en :5173 y llama a "/api/...".
// Vite reenvía (proxy) esas llamadas al backend en :3001, así no hay
// problemas de CORS ni URLs hardcodeadas.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
