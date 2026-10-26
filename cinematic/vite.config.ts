import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base + output beside the classic site: GitHub Pages serves it as /Me4chi/journey/
// with no workflow changes, and links like ../demos/ resolve to the existing pages.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { target: 'es2022', outDir: '../journey', emptyOutDir: true, chunkSizeWarningLimit: 900 },
});
