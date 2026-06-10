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
    // Removed surfaces
    expect(text).not.toContain('SuperAdminDashboard');
    expect(text).not.toContain('OrgChartPage');
    expect(text).not.toContain('mailchannels');
  });
});
