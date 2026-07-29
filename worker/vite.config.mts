import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Must be .mts: the plugin is ESM-only and this package is not "type": "module",
// so a .ts config gets loaded through require and fails to resolve it.
//
// `configPath` is required because the Vite root is `client/`, and the plugin
// otherwise looks for wrangler config relative to that root. Without it the
// build silently succeeds but emits an assets-only output config with no D1,
// AI, or cron bindings, and the Worker is never built.
//
// The plugin overwrites `assets.directory` in the output config to point at the
// client build, so the value in wrangler.jsonc is ignored at build time.
export default defineConfig({
  root: 'client',
  plugins: [
    cloudflare({
      configPath: fileURLToPath(new URL('./wrangler.jsonc', import.meta.url)),
    }),
    react(),
    tailwindcss(),
  ],
  // outDir is resolved against `root`, so this puts the build at worker/dist
  // rather than worker/client/dist. The plugin then creates dist/onboarding
  // (the Worker plus its generated wrangler.json) and dist/client (the static
  // assets) inside it.
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
