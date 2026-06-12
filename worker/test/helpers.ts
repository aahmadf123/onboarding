import { env, SELF, fetchMock } from 'cloudflare:test';
import { hashPassword } from '../src/services/passwords';

// Bootstrap the in-memory D1 database with the post-migration-0003 schema.
// Tests create tables fresh, so new columns are inlined rather than ALTERed.
export const SCHEMA_STATEMENTS = [
`CREATE TABLE IF NOT EXISTS Users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
email TEXT UNIQUE NOT NULL,
role TEXT DEFAULT 'staff',
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
name TEXT,
password_hash TEXT,
status TEXT DEFAULT 'invited',
must_reset INTEGER DEFAULT 0,
passcode_expires_at DATETIME,
invited_at DATETIME,
password_set_at DATETIME,
last_login_at DATETIME,
localstorage_migrated_at DATETIME
)`,
`CREATE TABLE IF NOT EXISTS Categories (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
description TEXT
)`,
`CREATE TABLE IF NOT EXISTS Articles (
id INTEGER PRIMARY KEY AUTOINCREMENT,
category_id INTEGER,
title TEXT NOT NULL,
current_content TEXT,
last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
is_active INTEGER DEFAULT 1
)`,
`CREATE TABLE IF NOT EXISTS Submissions (
id INTEGER PRIMARY KEY AUTOINCREMENT,
article_id INTEGER,
author_id INTEGER NOT NULL,
proposed_title TEXT,
proposed_content TEXT NOT NULL,
request_type TEXT DEFAULT 'content_update',
priority TEXT DEFAULT 'normal',
topic_area TEXT,
source_context TEXT,
assigned_team TEXT,
assigned_to_name TEXT,
assigned_to_email TEXT,
assignment_reason TEXT,
status TEXT DEFAULT 'pending',
submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
reviewed_by INTEGER,
review_notes TEXT
)`,
`CREATE TABLE IF NOT EXISTS Tips (
id INTEGER PRIMARY KEY AUTOINCREMENT,
author_id INTEGER NOT NULL,
category_id INTEGER,
title TEXT NOT NULL,
content TEXT NOT NULL,
tags TEXT,
status TEXT DEFAULT 'pending',
reviewed_by INTEGER,
review_notes TEXT,
submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
approved_at DATETIME,
last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
)`,
`CREATE TABLE IF NOT EXISTS TipFeedback (
id INTEGER PRIMARY KEY AUTOINCREMENT,
tip_id INTEGER NOT NULL,
reporter_id INTEGER NOT NULL,
reason TEXT NOT NULL,
details TEXT,
status TEXT DEFAULT 'open',
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`,
`CREATE TABLE IF NOT EXISTS OrgChart (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
title TEXT NOT NULL,
department TEXT,
email TEXT,
phone TEXT,
parent_id INTEGER,
display_order INTEGER DEFAULT 0,
photo_url TEXT,
is_active INTEGER DEFAULT 1
)`,
`CREATE TABLE IF NOT EXISTS SiteContentIndex (
id INTEGER PRIMARY KEY AUTOINCREMENT,
source_type TEXT NOT NULL,
source_id INTEGER,
source_title TEXT NOT NULL,
content_text TEXT NOT NULL,
section_path TEXT,
last_indexed DATETIME DEFAULT CURRENT_TIMESTAMP
)`,
`CREATE TABLE IF NOT EXISTS AppConfig (
key TEXT PRIMARY KEY,
value TEXT NOT NULL,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`,
`CREATE TABLE IF NOT EXISTS QuickLinks (
id INTEGER PRIMARY KEY AUTOINCREMENT,
title TEXT NOT NULL,
description TEXT,
url TEXT NOT NULL,
category TEXT,
audience TEXT,
display_order INTEGER DEFAULT 0,
is_active INTEGER DEFAULT 1
)`,
`CREATE TABLE IF NOT EXISTS KeyContacts (
id INTEGER PRIMARY KEY AUTOINCREMENT,
function_area TEXT,
department TEXT,
contact_name TEXT,
title TEXT,
email TEXT,
phone TEXT,
url TEXT,
notes TEXT,
is_active INTEGER DEFAULT 1,
display_order INTEGER DEFAULT 0
)`,
`CREATE TABLE IF NOT EXISTS SystemsDirectory (
id INTEGER PRIMARY KEY AUTOINCREMENT,
system_name TEXT NOT NULL,
category TEXT,
access_url TEXT,
login_notes TEXT,
owner_department TEXT,
support_contact TEXT,
description TEXT,
is_active INTEGER DEFAULT 1,
display_order INTEGER DEFAULT 0
)`,
`CREATE TABLE IF NOT EXISTS PolicyResources (
id INTEGER PRIMARY KEY AUTOINCREMENT,
policy_code TEXT,
title TEXT NOT NULL,
category TEXT,
applies_to TEXT,
url TEXT,
summary TEXT,
is_active INTEGER DEFAULT 1,
display_order INTEGER DEFAULT 0
)`,
`CREATE TABLE IF NOT EXISTS Sessions (
id INTEGER PRIMARY KEY AUTOINCREMENT,
user_id INTEGER NOT NULL,
token_hash TEXT NOT NULL,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
expires_at DATETIME NOT NULL,
last_used_at DATETIME,
user_agent TEXT,
ip TEXT
)`,
`CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_token ON Sessions(token_hash)`,
`CREATE TABLE IF NOT EXISTS PasswordResets (
id INTEGER PRIMARY KEY AUTOINCREMENT,
user_id INTEGER NOT NULL,
token_hash TEXT NOT NULL,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
expires_at DATETIME NOT NULL,
used_at DATETIME
)`,
`CREATE TABLE IF NOT EXISTS Tasks (
id INTEGER PRIMARY KEY AUTOINCREMENT,
slug TEXT NOT NULL,
phase TEXT NOT NULL,
title TEXT NOT NULL,
description TEXT,
priority TEXT DEFAULT 'recommended',
display_order INTEGER DEFAULT 0,
requires_approval INTEGER DEFAULT 0,
audience TEXT DEFAULT 'all',
link_view TEXT,
link_param TEXT,
is_active INTEGER DEFAULT 1,
created_by INTEGER,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`,
`CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_slug ON Tasks(slug)`,
`CREATE TABLE IF NOT EXISTS UserTasks (
id INTEGER PRIMARY KEY AUTOINCREMENT,
user_id INTEGER NOT NULL,
task_id INTEGER NOT NULL,
status TEXT DEFAULT 'open',
completed_at DATETIME,
assigned_by INTEGER,
assigned_at DATETIME,
reviewed_by INTEGER,
review_notes TEXT,
reviewed_at DATETIME,
updated_at DATETIME
)`,
`CREATE UNIQUE INDEX IF NOT EXISTS idx_usertasks_user_task ON UserTasks(user_id, task_id)`,
`CREATE TABLE IF NOT EXISTS EmailLog (
id INTEGER PRIMARY KEY AUTOINCREMENT,
user_id INTEGER,
to_email TEXT NOT NULL,
email_type TEXT NOT NULL,
subject TEXT,
status TEXT DEFAULT 'sent',
provider_id TEXT,
error_text TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`,
];

export async function applySchema(): Promise<void> {
  for (const sql of SCHEMA_STATEMENTS) {
    await env.DB.prepare(sql).run();
  }
}

/** Intercepts Resend so no test ever sends a real email. */
export function mockResend(): void {
  fetchMock.activate();
  fetchMock.disableNetConnect();
  fetchMock
    .get('https://api.resend.com')
    .intercept({ path: '/emails', method: 'POST' })
    .reply(200, { id: 'email_mock' })
    .persist();
}

// Hash computation is expensive (100k PBKDF2 iterations) — reuse per password.
const hashCache = new Map<string, string>();
async function cachedHash(password: string): Promise<string> {
  let hash = hashCache.get(password);
  if (!hash) {
    hash = await hashPassword(password);
    hashCache.set(password, hash);
  }
  return hash;
}

let userCounter = 0;
let ipCounter = 0;

export interface TestUser {
  id: number;
  email: string;
  password: string;
}

export async function createUser(opts: {
  email?: string;
  role?: 'staff' | 'moderator' | 'admin';
  password?: string;
  status?: 'invited' | 'active' | 'disabled';
  mustReset?: boolean;
  passcodeExpiresAt?: string | null;
  passwordSetAt?: string | null;
} = {}): Promise<TestUser> {
  userCounter++;
  const email = opts.email ?? `user${userCounter}@utoledo.edu`;
  const password = opts.password ?? 'test-password-123';
  const info = await env.DB.prepare(
    `INSERT INTO Users (email, role, status, password_hash, must_reset, passcode_expires_at, password_set_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      email,
      opts.role ?? 'staff',
      opts.status ?? 'active',
      await cachedHash(password),
      opts.mustReset ? 1 : 0,
      opts.passcodeExpiresAt ?? null,
      opts.passwordSetAt !== undefined ? opts.passwordSetAt : opts.mustReset ? null : new Date().toISOString()
    )
    .run();
  return { id: info.meta.last_row_id as number, email, password };
}

/**
 * App-level fetch with optional bearer token. Every request gets a unique
 * client IP unless one is provided, so the in-memory login rate limiter
 * never bleeds between tests.
 */
export function appFetch(
  path: string,
  init: RequestInit & { token?: string; ip?: string } = {}
): Promise<Response> {
  const { token, ip, ...rest } = init;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((rest.headers as Record<string, string>) ?? {}),
  };
  const clientIp = ip ?? `10.0.0.${++ipCounter % 250}-${ipCounter}`;
  headers['cf-connecting-ip'] = clientIp;
  headers['x-forwarded-for'] = clientIp;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return SELF.fetch(`https://example.com${path}`, { ...rest, headers });
}

export async function login(email: string, password: string, ip?: string): Promise<string> {
  const res = await appFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    ip,
  });
  const json = (await res.json()) as { success: boolean; error?: string; data?: { token: string } };
  if (!json.success || !json.data) {
    throw new Error(`login failed (${res.status}): ${json.error}`);
  }
  return json.data.token;
}

export async function createUserAndLogin(
  opts: Parameters<typeof createUser>[0] = {}
): Promise<TestUser & { token: string }> {
  const user = await createUser(opts);
  const token = await login(user.email, user.password);
  return { ...user, token };
}

export interface ApiResult {
  status: number;
  json: { success: boolean; error?: string; message?: string; data?: any; code?: string };
}

export async function apiCall(
  path: string,
  init: RequestInit & { token?: string; ip?: string } = {}
): Promise<ApiResult> {
  const res = await appFetch(path, init);
  return { status: res.status, json: (await res.json()) as ApiResult['json'] };
}
