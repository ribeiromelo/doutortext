import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: false,
  build: {
    outDir: 'public/static/rich',
    emptyOutDir: true,
    lib: { entry: 'src/browser/editor.ts', name: 'DTRichText', formats: ['iife'], fileName: () => 'editor.js' },
  },
})
