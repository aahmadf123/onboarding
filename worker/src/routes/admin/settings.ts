import { Hono } from 'hono';
import { AppEnv } from '../../types';
import { EDITABLE_CONFIG_KEYS, getConfigs, setConfig } from '../../services/config';
import { sendEmail } from '../../services/email';
import { testEmail } from '../../services/email-templates';

const settings = new Hono<AppEnv>();

/**
 * Two of these values end up inside emails, so "is a string" is not enough.
 *
 * app_base_url is interpolated into every password-reset link. Left
 * unvalidated, an admin (or anyone who reaches an admin session) could point it
 * at a host they control and every subsequent reset would deliver a live token
 * there. A `javascript:` value would land straight in an email href, and
 * escapeHtml does not filter schemes.
 */
function validateSetting(key: string, value: string): string | null {
  if (key === 'app_base_url') {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      return 'Portal base URL must be an absolute URL, e.g. https://utrockets-onboarding.com';
    }
    if (url.protocol !== 'https:') {
      return 'Portal base URL must use https.';
    }
    if (url.search || url.hash) {
      return 'Portal base URL must not contain a query string or fragment.';
    }
    return null;
  }

  if (key === 'email_from_address') {
    // Deliberately loose: the goal is to reject obvious breakage (a bare word,
    // a display name, an embedded newline that could inject a header), not to
    // out-clever RFC 5322.
    if (!/^[^\s@<>,;:"]+@[^\s@<>,;:"]+\.[^\s@<>,;:"]+$/.test(value)) {
      return 'Sender must be a bare email address, e.g. noreply@mail.example.com';
    }
    return null;
  }

  if (/[\r\n]/.test(value)) {
    return `${key} must not contain line breaks.`;
  }
  return null;
}

/** Trailing slashes would produce links like https://host//reset-password. */
function normalizeSetting(key: string, value: string): string {
  if (key === 'app_base_url') return value.replace(/\/+$/, '');
  return value;
}

// GET /api/admin/settings — the whitelisted AppConfig keys
settings.get('/', async (c) => {
  const values = await getConfigs(c.env.DB, EDITABLE_CONFIG_KEYS);
  return c.json({ success: true, data: values });
});

// PUT /api/admin/settings — { key: value, … } (whitelisted keys only)
settings.put('/', async (c) => {
  const body = await c.req.json<Record<string, unknown>>().catch(() => ({}));
  const updates = Object.entries(body).filter(([key]) => EDITABLE_CONFIG_KEYS.includes(key));
  if (updates.length === 0) {
    return c.json({ success: false, error: 'No editable settings provided' }, 400);
  }
  for (const [key, value] of updates) {
    if (typeof value !== 'string') {
      return c.json({ success: false, error: `${key} must be a string` }, 400);
    }
    const problem = validateSetting(key, value.trim());
    if (problem) return c.json({ success: false, error: problem }, 400);
    await setConfig(c.env.DB, key, normalizeSetting(key, value.trim()));
  }
  const values = await getConfigs(c.env.DB, EDITABLE_CONFIG_KEYS);
  return c.json({ success: true, data: values });
});

// POST /api/admin/settings/test-email — send a test message to the caller
settings.post('/test-email', async (c) => {
  const me = c.get('currentUser');
  const cfg = await getConfigs(c.env.DB, ['email_from_address']);
  const content = testEmail({ email: me.email, fromAddress: cfg.email_from_address });
  const result = await sendEmail(c.env, {
    to: me.email,
    subject: content.subject,
    html: content.html,
    type: 'test',
    userId: me.id,
  });
  if (!result.ok) {
    return c.json({ success: false, error: result.error ?? 'Send failed — check the email log.' }, 502);
  }
  return c.json({ success: true, message: `Test email sent to ${me.email}.` });
});

export default settings;
