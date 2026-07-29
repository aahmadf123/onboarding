// Browser smoke test for the built SPA.
//
// Runs against a live `wrangler dev`, so it exercises the real asset router:
// not_found_handling for deep links, the CSP from client/public/_headers, and
// run_worker_first keeping /api/* on the Worker. None of that is reachable from
// the vitest pool, which only invokes the Worker itself — SELF calls the Worker
// directly and never touches the asset layer.
//
// Usage:
//   npm run build
//   npx wrangler dev --port 8788
//   npm run smoke
//
// `wrangler dev` needs CLOUDFLARE_API_TOKEN, because the Workers AI binding
// always resolves remotely. Without a token, run it against a copy of
// wrangler.jsonc with the `ai` block removed — everything this script checks is
// asset routing and headers, which that binding does not affect.
//
// SMOKE_BASE overrides the URL (default http://127.0.0.1:8788).
// CHROMIUM_PATH overrides the browser, for environments where playwright's own
// download is unavailable or is a different build than the one installed.

import { chromium } from 'playwright';

const BASE = process.env.SMOKE_BASE || 'http://127.0.0.1:8788';

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const page = await browser.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => {
  const t = m.text();
  // fonts.googleapis.com is blocked by this sandbox's egress, not by the app.
  // check 7 deliberately probes an API route while signed out, which logs a 401
  if (m.type() === 'error' && !t.includes('favicon') && !t.includes('ERR_CONNECTION_RESET') && !t.includes('401'))
    errors.push('console: ' + t);
});

let failed = 0;
function check(name, cond) {
  console.log((cond ? 'PASS  ' : 'FAIL  ') + name);
  if (!cond) failed++;
}

// 1. Sign-in screen renders from the built bundle
const resp = await page.goto(BASE + '/', { waitUntil: 'networkidle' });
check('sign-in renders', (await page.locator('input[type="email"]').count()) === 1);
check(
  'branding image actually loads',
  await page.locator('img[src="/branding/savage-arena.jpg"]').evaluate((el) => el.naturalWidth > 0)
);

// 2. Tailwind v4 theme tokens resolve to the v3 palette
const gold = await page
  .locator('button[type="submit"]')
  .evaluate((el) => getComputedStyle(el).backgroundColor);
check('toledo-gold = #FFCD00 (' + gold + ')', gold === 'rgb(255, 205, 0)');

// 3. CSP comes from _headers and no longer allows eval or CDNs
const csp = resp.headers()['content-security-policy'] || '';
check('CSP present on the SPA document', csp.length > 0);
check("CSP drops 'unsafe-eval'", !csp.includes('unsafe-eval'));
check('CSP drops the three CDN hosts', !/cdnjs|jsdelivr|cdn\.tailwindcss/.test(csp));
check("CSP script-src is 'self' only", /script-src 'self';/.test(csp));

// 4. Forgot-password round trip
await page.getByRole('button', { name: 'Forgot password?' }).click();
check('forgot view', await page.getByRole('button', { name: 'Email Me a Reset Link' }).isVisible());
await page.getByRole('button', { name: '← Back to sign in' }).click();
check('back to sign-in', await page.getByRole('button', { name: 'Sign In', exact: true }).isVisible());

// 5. Deep links boot via not_found_handling rather than a Worker catch-all
for (const path of ['/article/23', '/policies', '/guide']) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  check('deep link ' + path + ' boots', (await page.locator('input[type="email"]').count()) === 1);
}

// 6. Reset-password landing reads its token
await page.goto(BASE + '/reset-password?token=abc123', { waitUntil: 'networkidle' });
check('reset-with-token screen', await page.getByRole('button', { name: 'Reset Password' }).isVisible());

// 7. An unmatched API path stays JSON, so api() never parses HTML
const apiCheck = await page.evaluate(async (b) => {
  const r = await fetch(b + '/api/definitely-not-a-route');
  const ct = r.headers.get('content-type') || '';
  let parsed = false;
  try {
    await r.json();
    parsed = true;
  } catch {}
  return { ct, parsed };
}, BASE);
check(
  'unmatched /api/* is JSON (' + apiCheck.ct + ')',
  apiCheck.ct.includes('application/json') && apiCheck.parsed
);

check('no page errors', errors.length === 0);
if (errors.length) console.log(errors.join('\n'));

await browser.close();
console.log(failed === 0 ? '\nALL PASSED' : '\n' + failed + ' FAILED');
process.exit(failed === 0 ? 0 : 1);
