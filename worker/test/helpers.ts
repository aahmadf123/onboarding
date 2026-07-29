import { env, SELF } from 'cloudflare:test';
import { hashPassword } from '../src/services/passwords';

/**
 * The real production schema, not a hand-written approximation.
 *
 * This block used to declare 19 tables inline. Every one of them dropped the
 * foreign keys, dropped UNIQUE on SystemsDirectory.system_name and relaxed
 * several NOT NULL columns, so CI validated a schema that is never deployed.
 * That is what let the /tips/0/feedback foreign-key violation ship: no test
 * could see the constraint it broke.
 *
 * It then listed six files by hand, which drifted the moment a migration was
 * added — one was added and left out of the list, and the suite stayed green
 * because nothing noticed. The glob is the fix: every file in db/migrations is
 * loaded, in the same order wrangler applies them, and a new migration is
 * picked up with no edit here. Opting one out now takes a deliberate entry in
 * CONTENT_ONLY below.
 */
const MIGRATIONS = import.meta.glob<string>('../../db/migrations/*.sql', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/**
 * Migrations that only move content around: seeds and one-off data repairs.
 *
 * Tests need the deployed *structure* — constraints are what they assert
 * against. Loading roughly 90KB of seeded articles, contacts and org chart on
 * top would make every test share a large fixture nobody asked for, and slow
 * each suite's beforeAll for no gain. Structure is never skipped.
 */
const CONTENT_ONLY = [
  '0002_seed_core_content.sql',
  '0003_seed_reference_data.sql',
  '0005_content_refresh.sql',
  '0006_directory_refresh.sql',
  '0007_content_expansion.sql',
  '0009_repair_seed_data.sql',
  '0012_content_placeholders.sql',
];

const SCHEMA_FILES = Object.entries(MIGRATIONS)
  .filter(([path]) => !CONTENT_ONLY.some((name) => path.endsWith('/' + name)))
  // Object key order from import.meta.glob is not guaranteed to be the apply
  // order, and later migrations ALTER tables the earlier ones create.
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, sql]) => sql);

/**
 * Splits a SQL file into statements.
 *
 * D1's exec() wants one statement per line, which multi-line CREATE TABLE
 * breaks, so we split on semicolons ourselves — tracking single-quoted strings
 * and line comments so a semicolon inside either is not treated as a boundary.
 */
export function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = '';
  let inString = false;
  let inLineComment = false;

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const next = sql[i + 1];

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      current += ch;
      continue;
    }
    if (!inString && ch === '-' && next === '-') {
      inLineComment = true;
      current += ch;
      continue;
    }
    if (ch === "'") {
      // '' inside a string is an escaped quote, not a terminator.
      if (inString && next === "'") {
        current += "''";
        i++;
        continue;
      }
      inString = !inString;
      current += ch;
      continue;
    }
    if (ch === ';' && !inString) {
      statements.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  statements.push(current);

  return statements
    .map((s) => s.replace(/^\s*(--.*\n)*/, '').trim())
    .filter((s) => s.length > 0);
}

export async function applySchema(): Promise<void> {
  for (const file of SCHEMA_FILES) {
    for (const statement of splitSqlStatements(file)) {
      try {
        await env.DB.prepare(statement).run();
      } catch (err) {
        throw new Error(
          `Schema statement failed: ${statement.slice(0, 120)}\n${(err as Error).message}`
        );
      }
    }
  }
}

/** Intercepts Resend so no test ever sends a real email. */
export function mockResend(): void {
  // Intentionally empty: sendEmail short-circuits when RESEND_API_KEY is the
  // test sentinel key, so tests avoid outbound network calls.
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
  // ON CONFLICT rather than a bare INSERT: the real schema seeds rows of its
  // own (migration 0003 creates utdata@utoledo.edu), so a test that wants to
  // control a seeded account has to update it rather than duplicate it. With
  // the old hand-built schema the table was always empty and this never came up.
  const info = await env.DB.prepare(
    `INSERT INTO Users (email, role, status, password_hash, must_reset, passcode_expires_at, password_set_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET
       role = excluded.role,
       status = excluded.status,
       password_hash = excluded.password_hash,
       must_reset = excluded.must_reset,
       passcode_expires_at = excluded.passcode_expires_at,
       password_set_at = excluded.password_set_at
     RETURNING id`
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
    .first<{ id: number }>();
  return { id: info!.id, email, password };
}

/**
 * Marks every task that would keep a user on the "behind" list as done.
 *
 * The real schema seeds a baseline checklist (migration 0003), so completing a
 * single task no longer makes anyone caught up — which is exactly what the
 * hand-built test schema hid, because its Tasks table was always empty.
 */
export async function completeAllRequiredTasks(userId: number): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO UserTasks (user_id, task_id, status, completed_at)
     SELECT ?, id, 'done', CURRENT_TIMESTAMP FROM Tasks
     WHERE is_active = 1 AND priority = 'required'
     ON CONFLICT(user_id, task_id) DO UPDATE SET
       status = 'done', completed_at = CURRENT_TIMESTAMP`
  )
    .bind(userId)
    .run();
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
