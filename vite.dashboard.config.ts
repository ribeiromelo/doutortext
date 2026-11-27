import { defineConfig } from 'vite'
export default defineConfig({ publicDir: false, build: { outDir: 'public/static/dashboard-app', emptyOutDir: true,
  lib: { entry: 'src/browser/dashboard.ts', name: 'DTDashboard', formats: ['iife'], fileName: () => 'dashboard.js' } } })
