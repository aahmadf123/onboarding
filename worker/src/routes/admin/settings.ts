import { Hono } from 'hono';
import { AppEnv } from '../../types';
import { EDITABLE_CONFIG_KEYS, getConfigs, setConfig } from '../../services/config';
import { sendEmail } from '../../services/email';
import { testEmail } from '../../services/email-templates';

const settings = new Hono<AppEnv>();

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
    await setConfig(c.env.DB, key, value.trim());
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
