import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Optimize for 1 core / 1GB RAM server
    minify: false, // Disable minification to speed up build significantly
    sourcemap: false, // Disable sourcemaps to save time and memory
    chunkSizeWarningLimit: 2000,
    reportCompressedSize: false, // Skip compression report to save time
    cssCodeSplit: false, // Keep CSS in one file to reduce processing
    rollupOptions: {
      output: {
        manualChunks: undefined, // Disable manual chunks to reduce memory
      },
    },
  },
  esbuild: {
    // Optimize esbuild for single core
    logLevel: 'error',
    legalComments: 'none',
    drop: ['console', 'debugger'], // Remove console/debugger in production
  },
});
