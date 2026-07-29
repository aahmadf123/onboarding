import { env } from 'cloudflare:test';
import { describe, it, expect, beforeAll } from 'vitest';
import { applySchema, splitSqlStatements } from './helpers';

beforeAll(async () => {
  await applySchema();
});

/**
 * Guards the property that makes every other data-integrity test meaningful:
 * tests run the schema we actually deploy.
 *
 * helpers.ts used to declare the tables by hand, dropping every foreign key and
 * several NOT NULL and UNIQUE constraints. CI could not observe a constraint
 * violation, which is why the /tips/0/feedback bug — an insert against a tip id
 * that cannot exist — shipped and failed silently in production.
 */
describe('test database matches the deployed schema', () => {
  it('enforces foreign keys', async () => {
    // The exact shape of the shipped bug: TipFeedback.tip_id references Tips(id)
    // and no tip has id 0.
    await expect(
      env.DB.prepare('INSERT INTO TipFeedback (tip_id, is_helpful) VALUES (0, 1)').run()
    ).rejects.toThrow();
  });

  it('enforces UNIQUE on SystemsDirectory.system_name', async () => {
    await env.DB.prepare(
      "INSERT INTO SystemsDirectory (system_name, category) VALUES ('Teamworks', 'Athletics')"
    ).run();
    await expect(
      env.DB.prepare(
        "INSERT INTO SystemsDirectory (system_name, category) VALUES ('Teamworks', 'Athletics')"
      ).run()
    ).rejects.toThrow();
  });

  it('treats email addresses as case-insensitive for uniqueness', async () => {
    // Users.email is UNIQUE with binary collation while every lookup uses
    // COLLATE NOCASE. That meant the index could not serve the query AND both
    // A@x.com and a@x.com could be stored — one person, two accounts, and an
    // ambiguous answer to "which one did the admin disable?".
    await env.DB.prepare("INSERT INTO Users (email, role) VALUES ('Case.Test@utoledo.edu', 'staff')").run();
    await expect(
      env.DB.prepare("INSERT INTO Users (email, role) VALUES ('case.test@utoledo.edu', 'staff')").run()
    ).rejects.toThrow();
  });

  it('seeds the super admin and the baseline checklist', async () => {
    const admin = await env.DB.prepare(
      "SELECT role FROM Users WHERE email = 'utdata@utoledo.edu'"
    ).first<{ role: string }>();
    expect(admin?.role).toBe('admin');

    const tasks = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM Tasks WHERE is_active = 1 AND priority = 'required'"
    ).first<{ n: number }>();
    expect(tasks!.n).toBeGreaterThan(0);
  });

  it('splits statements without breaking on semicolons inside strings', () => {
    const sql = `
      -- a comment with a ; semicolon
      CREATE TABLE T (a TEXT);
      INSERT INTO T (a) VALUES ('one; two');
      INSERT INTO T (a) VALUES ('it''s fine');
    `;
    const statements = splitSqlStatements(sql);
    expect(statements).toHaveLength(3);
    expect(statements[1]).toContain("'one; two'");
    expect(statements[2]).toContain("'it''s fine'");
  });
});
