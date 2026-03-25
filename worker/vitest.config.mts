import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
test: {
poolOptions: {
workers: {
wrangler: { configPath: './wrangler.jsonc' },
// Disable remote bindings so tests run fully local without Cloudflare auth
remoteBindings: false,
},
},
},
});
