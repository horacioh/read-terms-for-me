import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const root = new URL('.', import.meta.url).pathname;
const resolve = (path: string) => new URL(path, import.meta.url).pathname;

export default defineConfig({
  root,
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        sidepanel: resolve('sidepanel/sidepanel.html'),
        options: resolve('options/options.html'),
        background: resolve('src/background.ts'),
        content: resolve('src/content.ts'),
      },
      output: {
        entryFileNames: (chunkInfo: { name: string }) => {
          if (chunkInfo.name === 'background') return 'background.js';
          if (chunkInfo.name === 'content') return 'content.js';
          return '[name]/[name].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo: { name?: string }) => {
          const info = assetInfo.name ?? '';
          if (info.endsWith('.css')) return 'assets/[name]-[hash][extname]';
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  publicDir: 'public',
});
