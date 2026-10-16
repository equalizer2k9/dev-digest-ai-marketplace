import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from GitHub Pages at https://<owner>.github.io/dev-digest-ai-marketplace/
export default defineConfig({
  base: '/dev-digest-ai-marketplace/',
  plugins: [react()],
});
