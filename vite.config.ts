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
// An explicit VITE_API_BASE_URL (e.g. a Vercel env var) always wins, so any
// environment can be overridden from the dashboard without a code change.
const BACKEND_BY_BRANCH: Record<string, string> = {
  dev: 'https://edufleetexchange.onrender.com/api',
  stage: 'https://edufleetexchange.onrender.com/api',
  // TODO(prod): replace with the real production backend URL. Intentionally a
  // placeholder for now so production does NOT proxy to the dev/demo backend.
  prod: 'https://api.edufleetexchange.com/api',
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
  },

  base: '/',
});
