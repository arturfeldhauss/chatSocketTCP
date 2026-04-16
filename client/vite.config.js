import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Configuração do Vite.
 * O cliente React conecta ao bridge WebSocket (porta 8080), não diretamente ao servidor Java.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy opcional: redireciona /ws para o bridge (alternativa ao ws:// direto)
    // proxy: {
    //   '/ws': { target: 'ws://localhost:8080', ws: true }
    // }
  },
});
