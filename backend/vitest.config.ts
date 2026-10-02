import { defineConfig } from 'vitest/config';

export default defineConfig({
  // tsconfig.json の paths を解決する（Vite 標準機能）
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
  },
});
