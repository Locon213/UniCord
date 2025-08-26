import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm', 'iife'],
  globalName: 'UniCord',
  dts: true,
  outDir: 'dist',
  sourcemap: true,
  clean: true,
  outExtension({ format }) {
    if (format === 'cjs') return { js: '.cjs' };
    if (format === 'esm') return { js: '.mjs' };
    if (format === 'iife') return { js: '.iife.js' };
    return { js: '.js' };
  },
});
