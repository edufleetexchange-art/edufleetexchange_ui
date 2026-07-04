import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// ── Per-environment backend URL ──────────────────────────────────────────────
// Each git branch deploys to its own Vercel environment and must talk to its
// OWN backend. Vercel injects the branch name as VERCEL_GIT_COMMIT_REF at build
// time, so we resolve the API base URL from the branch. This replaces the old
// single hardcoded `/api → Render` rewrite in vercel.json, which was shared
// across all branches and caused dev/stage/prod to share one backend (demo data
// leaked into production).
//
// The REAL wiring is a per-environment `VITE_API_BASE_URL` Vercel env var (set
// to each backend's own URL) — that always wins over the map below. The map is
// only a fallback default so a build still targets the right backend if the env
// var is ever missing. Backend + frontend both run on Vercel now (Render
// retired). We use each backend project's DEFAULT vercel.app domain — no custom
// DNS records required.
const BACKEND_BY_BRANCH: Record<string, string> = {
  dev: 'https://edufleetexchange-server-dev.vercel.app/api',
  stage: 'https://edufleetexchange-server-stage.vercel.app/api',
  prod: 'https://edufleetexchange-server-prod.vercel.app/api',
};

if (!process.env.VITE_API_BASE_URL) {
  const branch = process.env.VERCEL_GIT_COMMIT_REF || '';
  process.env.VITE_API_BASE_URL =
    BACKEND_BY_BRANCH[branch] || 'http://localhost:5000/api';
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // 🔥 Fix for Vercel build error:
  optimizeDeps: {
    include: ['@rolldown/pluginutils'],
  },

  server: {
    port: 3000,
    host: true,
    allowedHosts: true,
    hmr: { overlay: false },
  },

  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },

  base: '/',
});
