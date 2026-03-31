import { defineConfig } from 'vite';

export default defineConfig({
  base: '/maze-generator/',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    open: true
  }
});
