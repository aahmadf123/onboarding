import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeAll } from 'vitest';
import worker from '../src/index';

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

// Bootstrap the in-memory D1 database with the schema so API tests work
const SCHEMA_STATEMENTS = [
`CREATE TABLE IF NOT EXISTS Users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
email TEXT UNIQUE NOT NULL,
role TEXT DEFAULT 'staff',
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
)`,
`CREATE TABLE IF NOT EXISTS Submissions (
id INTEGER PRIMARY KEY AUTOINCREMENT,
article_id INTEGER,
author_id INTEGER NOT NULL,
proposed_title TEXT,
proposed_content TEXT NOT NULL,
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
display_order INTEGER DEFAULT 0,
is_active INTEGER DEFAULT 1
)`,
`CREATE TABLE IF NOT EXISTS KeyContacts (
id INTEGER PRIMARY KEY AUTOINCREMENT,
function_area TEXT,
department TEXT,
contact_name TEXT NOT NULL,
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
];

beforeAll(async () => {
for (const sql of SCHEMA_STATEMENTS) {
await env.DB.prepare(sql).run();
}
});

describe('Toledo Athletics Onboarding Worker', () => {
it('serves the SPA shell for the root path (unit style)', async () => {
const request = new IncomingRequest('http://example.com/');
const ctx = createExecutionContext();
const response = await worker.fetch(request, env, ctx);
await waitOnExecutionContext(ctx);
expect(response.status).toBe(200);
const text = await response.text();
expect(text).toContain('Toledo Athletics');
expect(text).toContain('<div id="root">');
});

it('serves the SPA shell for the root path (integration style)', async () => {
const response = await SELF.fetch('https://example.com/');
expect(response.status).toBe(200);
const text = await response.text();
expect(text).toContain('Toledo Athletics');
});

it('returns 400 for /api/search without a query param', async () => {
const request = new IncomingRequest('http://example.com/api/search');
const ctx = createExecutionContext();
const response = await worker.fetch(request, env, ctx);
await waitOnExecutionContext(ctx);
expect(response.status).toBe(400);
const json = await response.json() as { success: boolean; error: string };
expect(json.success).toBe(false);
expect(json.error).toContain('q');
});

it('returns JSON from /api/categories', async () => {
const request = new IncomingRequest('http://example.com/api/categories');
const ctx = createExecutionContext();
const response = await worker.fetch(request, env, ctx);
await waitOnExecutionContext(ctx);
expect(response.status).toBe(200);
const json = await response.json() as { success: boolean; data: unknown[] };
expect(json.success).toBe(true);
expect(Array.isArray(json.data)).toBe(true);
});

it('returns JSON from /api/stats', async () => {
const request = new IncomingRequest('http://example.com/api/stats');
const ctx = createExecutionContext();
const response = await worker.fetch(request, env, ctx);
await waitOnExecutionContext(ctx);
expect(response.status).toBe(200);
const json = await response.json() as { success: boolean };
expect(json.success).toBe(true);
});

it('returns JSON from /api/tips', async () => {
const request = new IncomingRequest('http://example.com/api/tips');
const ctx = createExecutionContext();
const response = await worker.fetch(request, env, ctx);
await waitOnExecutionContext(ctx);
expect(response.status).toBe(200);
const json = await response.json() as { success: boolean; data: unknown[] };
expect(json.success).toBe(true);
expect(Array.isArray(json.data)).toBe(true);
});

it('orgchart API route has been removed (falls to SPA)', async () => {
const request = new IncomingRequest('http://example.com/api/orgchart');
const ctx = createExecutionContext();
const response = await worker.fetch(request, env, ctx);
await waitOnExecutionContext(ctx);
// The route was removed; /api/orgchart now falls through to the SPA shell
const text = await response.text();
expect(text).toContain('<div id="root">');
});

it('returns JSON from /api/quicklinks', async () => {
const request = new IncomingRequest('http://example.com/api/quicklinks');
const ctx = createExecutionContext();
const response = await worker.fetch(request, env, ctx);
await waitOnExecutionContext(ctx);
expect(response.status).toBe(200);
const json = await response.json() as { success: boolean; data: unknown[] };
expect(json.success).toBe(true);
expect(Array.isArray(json.data)).toBe(true);
});

it('returns JSON from /api/contacts', async () => {
const request = new IncomingRequest('http://example.com/api/contacts');
const ctx = createExecutionContext();
const response = await worker.fetch(request, env, ctx);
await waitOnExecutionContext(ctx);
expect(response.status).toBe(200);
const json = await response.json() as { success: boolean; data: unknown[] };
expect(json.success).toBe(true);
expect(Array.isArray(json.data)).toBe(true);
});

it('returns JSON from /api/systems', async () => {
const request = new IncomingRequest('http://example.com/api/systems');
const ctx = createExecutionContext();
const response = await worker.fetch(request, env, ctx);
await waitOnExecutionContext(ctx);
expect(response.status).toBe(200);
const json = await response.json() as { success: boolean; data: unknown[] };
expect(json.success).toBe(true);
expect(Array.isArray(json.data)).toBe(true);
});

it('returns JSON from /api/policies', async () => {
const request = new IncomingRequest('http://example.com/api/policies');
const ctx = createExecutionContext();
const response = await worker.fetch(request, env, ctx);
await waitOnExecutionContext(ctx);
expect(response.status).toBe(200);
const json = await response.json() as { success: boolean; data: unknown[] };
expect(json.success).toBe(true);
expect(Array.isArray(json.data)).toBe(true);
});

it('SPA shell includes new feature components', async () => {
const response = await SELF.fetch('https://example.com/');
const text = await response.text();
expect(text).toContain('OnboardingGuidePage');
expect(text).toContain('AIChatWidget');
expect(text).toContain('ResourcesPage');
expect(text).toContain('ContactsPage');
expect(text).toContain('PoliciesPage');
expect(text).toContain('FeedbackButton');
expect(text).toContain('Footer');
expect(text).toContain('SuperAdminDashboard');
// OrgChartPage has been removed
expect(text).not.toContain('OrgChartPage');
});
});
