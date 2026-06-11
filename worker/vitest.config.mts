import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
test: {
poolOptions: {
workers: {
wrangler: { configPath: './wrangler.jsonc' },
// Disable remote bindings so tests run fully local without Cloudflare auth
remoteBindings: false,
// Test-only secrets (real values come from `wrangler secret put`)
miniflare: {
bindings: {
RESEND_API_KEY: 'test-resend-key',
BOOTSTRAP_TOKEN: 'test-bootstrap-token',
},
},
},
},
},
});
