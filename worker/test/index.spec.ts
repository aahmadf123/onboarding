import { SELF } from 'cloudflare:test';
import { describe, it, expect, beforeAll } from 'vitest';
import { applySchema, mockResend, createUserAndLogin, apiCall, TestUser } from './helpers';

let staff: TestUser & { token: string };

beforeAll(async () => {
  await applySchema();
  mockResend();
  staff = await createUserAndLogin();
});

describe('Toledo Athletics Onboarding Worker', () => {
  // The SPA document, /branding/* and the hashed bundles are all served by
  // Cloudflare's asset router, which this pool does not run — SELF invokes only
  // the Worker. Asset behaviour (SPA fallback for deep links, the CSP from
  // client/public/_headers) is covered by the browser smoke test in
  // scripts/browser-smoke.mjs, run against `wrangler dev`.
  //
  // What is worth asserting here is the inverse: the Worker must NOT claim
  // those paths. A catch-all would shadow not_found_handling and put us back to
  // generating the shell in the Worker.
  it('leaves non-API paths to the asset router', async () => {
    for (const path of ['/', '/article/23', '/reset-password?token=abc', '/branding/logo.png']) {
      const response = await SELF.fetch('https://example.com' + path);
      expect(response.status).toBe(404);
    }
  });

  it('returns 400 for /api/search without a query param (authenticated)', async () => {
    const res = await apiCall('/api/search', { token: staff.token });
    expect(res.status).toBe(400);
    expect(res.json.success).toBe(false);
    expect(res.json.error).toContain('q');
  });

  it('returns JSON from /api/categories (authenticated)', async () => {
    const res = await apiCall('/api/categories', { token: staff.token });
    expect(res.status).toBe(200);
    expect(res.json.success).toBe(true);
    expect(Array.isArray(res.json.data)).toBe(true);
  });

  it('returns JSON from /api/stats (authenticated)', async () => {
    const res = await apiCall('/api/stats', { token: staff.token });
    expect(res.status).toBe(200);
    expect(res.json.success).toBe(true);
  });

  it('returns JSON from /api/quicklinks (authenticated)', async () => {
    const res = await apiCall('/api/quicklinks', { token: staff.token });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.json.data)).toBe(true);
  });

  it('returns JSON from /api/contacts (authenticated)', async () => {
    const res = await apiCall('/api/contacts', { token: staff.token });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.json.data)).toBe(true);
  });

  it('returns JSON from /api/systems (authenticated)', async () => {
    const res = await apiCall('/api/systems', { token: staff.token });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.json.data)).toBe(true);
  });

  it('returns JSON from /api/policies (authenticated)', async () => {
    const res = await apiCall('/api/policies', { token: staff.token });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.json.data)).toBe(true);
  });

  it('returns a JSON 404 for the retired endpoints', async () => {
    // Tips had no browse or submit UI, so its routes were reachable only by
    // typing a URL; orgchart was a complete router app.ts never mounted, which
    // meant an authenticated GET /api/orgchart returned 200 and the SPA shell.
    // The point of asserting it here is that unmounting them leaves a JSON 404
    // rather than putting either back on the asset-router path.
    for (const path of ['/api/tips', '/api/tips/1', '/api/orgchart', '/api/ai/chat']) {
      const res = await apiCall(path, { token: staff.token });
      expect(res.status).toBe(404);
      expect(res.json.success).toBe(false);
    }
  });

  it('sets a locked-down CSP on API responses', async () => {
    // The Worker now only ever returns JSON, so its policy can be far stricter
    // than the SPA's. The document's own CSP lives in client/public/_headers.
    const res = await SELF.fetch('https://example.com/api/categories', {
      headers: { Authorization: `Bearer ${staff.token}` },
    });
    const csp = res.headers.get('content-security-policy') ?? '';
    expect(csp).toContain("default-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'none'");
    // The CDN hosts and unsafe-eval only existed for the in-browser Babel build.
    expect(csp).not.toContain('unsafe-eval');
    expect(csp).not.toContain('cdnjs.cloudflare.com');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('does not reflect a foreign Origin in CORS headers', async () => {
    const res = await SELF.fetch('https://example.com/api/categories', {
      headers: { Origin: 'https://evil.example' },
    });
    // A disallowed origin should get no Access-Control-Allow-Origin header at all.
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });
});
