import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { BASE_PATH, pwaOptions } from './pwa.config.js';

export default defineConfig({
  base: BASE_PATH,
  plugins: [react(), VitePWA(pwaOptions)],
  build: {
    outDir: 'dist',
    sourcemap: false,
    // firebase + chart.js are chunky; keep the warning out of demo-day output.
    chunkSizeWarningLimit: 1200,
  },
  server: {
    host: true,
    port: 5173,
  },
});
