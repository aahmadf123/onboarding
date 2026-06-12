import { defineConfig } from 'vitest/config';
import { cloudflareTest } from '@cloudflare/vitest-pool-workers';

export default defineConfig({
	plugins: [
		cloudflareTest({
			wrangler: { configPath: './wrangler.jsonc' },
			remoteBindings: false,
			miniflare: {
				bindings: {
					RESEND_API_KEY: 'test-resend-key',
					BOOTSTRAP_TOKEN: 'test-bootstrap-token',
				},
			},
		}),
	],
	test: {},
});
