import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const repoBase = '/plate-tectonics-deep-time-visualizer/';

export default defineConfig({
  base: repoBase,
  plugins: [react()],
  publicDir: 'public',
  build: {
    outDir: 'docs',
    emptyOutDir: false,
    sourcemap: true,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/react')) return 'react';
          if (id.includes('node_modules/@tanstack')) return 'query';
          return undefined;
        },
      },
    },
  },
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.ts',
  },
});
