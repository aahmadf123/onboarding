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
    // The shipped bug had this shape: an insert naming a parent row id that
    // cannot exist. It reached production because the hand-built test schema
    // declared no foreign keys at all, so the violation was invisible in CI.
    // (It was TipFeedback.tip_id = 0 at the time; that table is retired, and
    // Submissions.author_id is the same NOT NULL reference to Users.)
    await expect(
      env.DB.prepare(
        "INSERT INTO Submissions (author_id, proposed_content) VALUES (0, 'body')"
      ).run()
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

  it('has the Submissions columns the ticket insert names', async () => {
    // These eight columns lived only in the old db/schema.sql, which runs on a
    // brand-new database and nothing else, plus a migration that D1 could not
    // execute. Production therefore never got them, and every POST
    // /api/submissions failed there with "no such column" while the suite was
    // green — the tests had them, the deployed database did not. 0013 is what
    // closes that, so this asserts the chain still ends with them present.
    const author = await env.DB.prepare(
      "INSERT INTO Users (email, role) VALUES ('ticket.columns@utoledo.edu', 'staff') RETURNING id"
    ).first<{ id: number }>();

    await expect(
      env.DB.prepare(
        `INSERT INTO Submissions (
           article_id, author_id, proposed_title, proposed_content, request_type, priority,
           topic_area, source_context, assigned_team, assigned_to_name, assigned_to_email, assignment_reason
         ) VALUES (NULL,?,'t','c','content_update','normal',NULL,NULL,'General Review Queue',NULL,NULL,'r')`
      )
        .bind(author!.id)
        .run()
    ).resolves.toBeDefined();
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
