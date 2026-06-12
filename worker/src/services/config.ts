// Small helpers for the AppConfig key-value table.

export const CONFIG_DEFAULTS: Record<string, string> = {
  email_from_address: 'onboarding@resend.dev',
  email_from_name: 'Toledo Athletics Onboarding',
  weekly_reminder_enabled: '1',
  app_base_url: 'https://onboarding.utdata.workers.dev',
};

/** Keys exposed through the admin Settings UI. */
export const EDITABLE_CONFIG_KEYS = Object.keys(CONFIG_DEFAULTS);

export async function getConfig(
  db: D1Database,
  key: string,
  fallback?: string
): Promise<string> {
  const row = await db
    .prepare('SELECT value FROM AppConfig WHERE key = ?')
    .bind(key)
    .first<{ value: string }>();
  return row?.value ?? fallback ?? CONFIG_DEFAULTS[key] ?? '';
}

export async function getConfigs(
  db: D1Database,
  keys: string[]
): Promise<Record<string, string>> {
  const placeholders = keys.map(() => '?').join(',');
  const { results } = await db
    .prepare(`SELECT key, value FROM AppConfig WHERE key IN (${placeholders})`)
    .bind(...keys)
    .all<{ key: string; value: string }>();
  const out: Record<string, string> = {};
  for (const key of keys) out[key] = CONFIG_DEFAULTS[key] ?? '';
  for (const row of results) out[row.key] = row.value;
  return out;
}

export async function setConfig(db: D1Database, key: string, value: string): Promise<void> {
  await db
    .prepare(
      `INSERT INTO AppConfig (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
    )
    .bind(key, value)
    .run();
}
