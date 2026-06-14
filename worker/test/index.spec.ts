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
  it('serves the SPA shell for the root path without auth', async () => {
    const response = await SELF.fetch('https://example.com/');
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('Toledo Athletics');
    expect(text).toContain('<div id="root">');
  });

  it('serves the SPA shell for the reset-password route', async () => {
    const response = await SELF.fetch('https://example.com/reset-password?token=abc');
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('<div id="root">');
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

  it('returns JSON from /api/tips (authenticated)', async () => {
    const res = await apiCall('/api/tips', { token: staff.token });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.json.data)).toBe(true);
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

  it('SPA shell includes the current feature components', async () => {
    const response = await SELF.fetch('https://example.com/');
    const text = await response.text();
    expect(text).toContain('OnboardingGuidePage');
    expect(text).toContain('AIChatWidget');
    expect(text).toContain('ResourcesPage');
    expect(text).toContain('ContactsPage');
    expect(text).toContain('PoliciesPage');
    expect(text).toContain('FeedbackButton');
    expect(text).toContain('Footer');
    // New auth + admin surfaces
    expect(text).toContain('LoginScreen');
    expect(text).toContain('ForceResetScreen');
    expect(text).toContain('ResetWithTokenScreen');
    expect(text).toContain('AdminDashboard');
    expect(text).toContain('AdminContent');
    expect(text).toContain('renderMapDirectives');
    // AI chat streaming fetch must carry the bearer token (gated endpoint)
    expect(text).toContain('streamHeaders');
    // Removed surfaces
    expect(text).not.toContain('SuperAdminDashboard');
    expect(text).not.toContain('OrgChartPage');
    expect(text).not.toContain('mailchannels');
  });

  it('sets a Content-Security-Policy and security headers on the SPA shell', async () => {
    const response = await SELF.fetch('https://example.com/');
    const csp = response.headers.get('content-security-policy') ?? '';
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).toContain("base-uri 'self'");
    // Google Maps embeds are the only allowed frames.
    expect(csp).toContain('https://www.google.com');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('loads DOMPurify and routes markdown through sanitizeHtml', async () => {
    const response = await SELF.fetch('https://example.com/');
    const text = await response.text();
    expect(text).toContain('dompurify');
    expect(text).toContain('function sanitizeHtml');
    // Every marked.parse() sink is wrapped in sanitizeHtml(...).
    expect(text).not.toMatch(/__html:\s*marked\.parse/);
  });

  it('does not reflect a foreign Origin in CORS headers', async () => {
    const res = await SELF.fetch('https://example.com/api/categories', {
      headers: { Origin: 'https://evil.example' },
    });
    expect(res.headers.get('access-control-allow-origin')).not.toBe('https://evil.example');
  });
});
