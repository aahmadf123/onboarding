import { env } from 'cloudflare:test';
import { describe, it, expect, beforeAll } from 'vitest';
import {
  applySchema,
  mockResend,
  createUser,
  createUserAndLogin,
  login,
  apiCall,
} from './helpers';
import { hashPassword, verifyPassword, generateToken, sha256Hex } from '../src/services/passwords';
import { PRIMARY_SUPERADMIN_EMAIL } from '../src/constants';

beforeAll(async () => {
  await applySchema();
  mockResend();
});

describe('password hashing', () => {
  it('verifies a correct password and rejects a wrong one', async () => {
    const hash = await hashPassword('hunter2-but-longer');
    expect(await verifyPassword('hunter2-but-longer', hash)).toBe(true);
    expect(await verifyPassword('wrong-password!', hash)).toBe(false);
  });

  it('rejects tampered or malformed stored hashes', async () => {
    const hash = await hashPassword('hunter2-but-longer');
    expect(await verifyPassword('hunter2-but-longer', hash.slice(0, -4) + 'AAAA')).toBe(false);
    expect(await verifyPassword('x', 'not-a-hash')).toBe(false);
    expect(await verifyPassword('x', null)).toBe(false);
  });
});

describe('global auth gate', () => {
  it('rejects unauthenticated API requests', async () => {
    const res = await apiCall('/api/categories');
    expect(res.status).toBe(401);
    expect(res.json.success).toBe(false);
  });

  it('rejects API routes that used to fall through to the SPA', async () => {
    const res = await apiCall('/api/orgchart');
    expect(res.status).toBe(401);
  });

  it('allows authenticated requests through', async () => {
    const user = await createUserAndLogin();
    const res = await apiCall('/api/categories', { token: user.token });
    expect(res.status).toBe(200);
    expect(res.json.success).toBe(true);
  });

  it('returns JSON 404 for an unmatched API path instead of the SPA shell', async () => {
    const user = await createUserAndLogin();
    const res = await apiCall('/api/does-not-exist', { token: user.token });
    // This used to fall through to the SPA catch-all and return 200 + HTML,
    // which made the client's res.json() reject and froze the caller.
    expect(res.status).toBe(404);
    expect(res.json.success).toBe(false);
  });

  it('tags the disabled-account rejection with a machine-readable code', async () => {
    const user = await createUserAndLogin();
    await env.DB.prepare("UPDATE Users SET status = 'disabled' WHERE email = ?")
      .bind(user.email)
      .run();
    const res = await apiCall('/api/categories', { token: user.token });
    expect(res.status).toBe(403);
    // The client keys on the code to sign the user out with an explanation,
    // rather than sitting on a loading state forever.
    expect(res.json.code).toBe('ACCOUNT_DISABLED');
  });
});

describe('login', () => {
  it('returns a working session token', async () => {
    const user = await createUserAndLogin();
    const me = await apiCall('/api/auth/me', { token: user.token });
    expect(me.status).toBe(200);
    expect(me.json.data.user.email).toBe(user.email);
    expect(me.json.data.user.password_hash).toBeUndefined();
  });

  it('rejects a wrong password with a generic error', async () => {
    const user = await createUser();
    const res = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: user.email, password: 'incorrect-password' }),
    });
    expect(res.status).toBe(401);
    expect(res.json.error).toBe('Invalid email or password');
  });

  it('rejects unknown accounts with the same generic error', async () => {
    const res = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'nobody@utoledo.edu', password: 'whatever-12345' }),
    });
    expect(res.status).toBe(401);
    expect(res.json.error).toBe('Invalid email or password');
  });

  it('rejects disabled accounts', async () => {
    const user = await createUser({ status: 'disabled' });
    const res = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: user.email, password: user.password }),
    });
    expect(res.status).toBe(403);
  });

  it('does not reveal that a disabled account exists without the password', async () => {
    // The status check used to run before password verification, so posting any
    // password at a disabled account returned a distinct 403 with the message
    // "This account has been disabled". That enumerates terminated staff with
    // no credential at all. The 403 is only correct once the password proves
    // the caller owns the account.
    const disabled = await createUser({ status: 'disabled' });

    const wrongPassword = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: disabled.email, password: 'not-the-password' }),
    });
    const unknownAccount = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'no.such.person@utoledo.edu', password: 'not-the-password' }),
    });

    expect(wrongPassword.status).toBe(401);
    expect(wrongPassword.status).toBe(unknownAccount.status);
    expect(wrongPassword.json.error).toBe(unknownAccount.json.error);
    expect(wrongPassword.json.error).not.toMatch(/disabled/i);
  });

  // There is deliberately no timing test for the second half of this fix (an
  // unknown email now verifies against DUMMY_PASSWORD_HASH so it pays the same
  // 100k PBKDF2 iterations). Every bound loose enough to be stable in CI also
  // passed against the old early-return, so it would assert nothing. The
  // constant's docstring carries that reasoning instead.


  it('rejects an expired invite passcode', async () => {
    const user = await createUser({
      mustReset: true,
      passwordSetAt: null,
      passcodeExpiresAt: new Date(Date.now() - 1000).toISOString(),
    });
    const res = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: user.email, password: user.password }),
    });
    expect(res.status).toBe(401);
    expect(res.json.error).toContain('expired');
  });

  it('locks an account after repeated failures, regardless of source IP', async () => {
    // rateLimit(10) keys on IP alone, so an attacker rotating addresses had
    // unlimited attempts against a single account. Every request below comes
    // from a different IP (apiCall's default), so only the per-account counter
    // can stop this.
    const user = await createUser();

    for (let i = 0; i < 5; i++) {
      const res = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: user.email, password: 'wrong-password' }),
      });
      expect(res.status).toBe(401);
    }

    // Correct password now, but the account is locked.
    const locked = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: user.email, password: user.password }),
    });
    expect(locked.status).toBe(429);
    expect(locked.json.code).toBe('ACCOUNT_LOCKED');
  });

  it('does not reveal a locked account to someone without the password', async () => {
    // The lockout message names a real account, so it must stay behind the
    // password check — otherwise it re-opens the enumeration hole that the
    // status check had.
    const user = await createUser();
    for (let i = 0; i < 6; i++) {
      await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: user.email, password: 'wrong-password' }),
      });
    }

    const stillWrong = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: user.email, password: 'still-wrong' }),
    });
    const unknown = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'nobody.here@utoledo.edu', password: 'still-wrong' }),
    });

    expect(stillWrong.status).toBe(401);
    expect(stillWrong.status).toBe(unknown.status);
    expect(stillWrong.json.error).toBe(unknown.json.error);
    expect(stillWrong.json.code).toBeUndefined();
  });

  it('clears the failure counter on a successful sign-in', async () => {
    const user = await createUser();
    for (let i = 0; i < 3; i++) {
      await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: user.email, password: 'wrong-password' }),
      });
    }

    const ok = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: user.email, password: user.password }),
    });
    expect(ok.status).toBe(200);

    const row = await env.DB.prepare(
      'SELECT failed_login_attempts, locked_until FROM Users WHERE id = ?'
    )
      .bind(user.id)
      .first<{ failed_login_attempts: number; locked_until: string | null }>();
    expect(row!.failed_login_attempts).toBe(0);
    expect(row!.locked_until).toBeNull();
  });

  it('rate limits repeated attempts from one IP', async () => {
    const ip = 'rate-limit-test-ip';
    let last = 0;
    for (let i = 0; i < 11; i++) {
      const res = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'nobody@utoledo.edu', password: 'bad-password-1' }),
        ip,
      });
      last = res.status;
    }
    expect(last).toBe(429);
  });
});

describe('password reset token lifecycle', () => {
  async function issueResetToken(email: string): Promise<string> {
    await apiCall('/api/auth/forgot', { method: 'POST', body: JSON.stringify({ email }) });
    const row = await env.DB.prepare(
      `SELECT pr.id FROM PasswordResets pr JOIN Users u ON u.id = pr.user_id
       WHERE u.email = ? AND pr.used_at IS NULL ORDER BY pr.id DESC LIMIT 1`
    )
      .bind(email)
      .first<{ id: number }>();
    expect(row).toBeTruthy();
    // The raw token is only ever in the email, so drive the DB directly: swap in
    // a token we know the hash of, which is equivalent for lifecycle purposes.
    const token = generateToken();
    await env.DB.prepare('UPDATE PasswordResets SET token_hash = ? WHERE id = ?')
      .bind(await sha256Hex(token), row!.id)
      .run();
    return token;
  }

  it('invalidates an outstanding token when the password is changed normally', async () => {
    // Request a reset, remember the password, change it the normal way — the
    // emailed link used to stay live for the rest of its hour, so anyone
    // reaching that mailbox could reset the password again and kill every
    // session.
    const user = await createUserAndLogin();
    const token = await issueResetToken(user.email);

    const changed = await apiCall('/api/auth/change-password', {
      method: 'POST',
      token: user.token,
      body: JSON.stringify({
        current_password: user.password,
        new_password: 'a-brand-new-password-1',
      }),
    });
    expect(changed.status).toBe(200);

    const used = await apiCall('/api/auth/reset', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: 'attacker-chosen-password-1' }),
    });
    expect(used.status).toBe(400);
  });

  it('invalidates outstanding tokens on re-invite', async () => {
    const admin = await createUserAndLogin({ role: 'admin' });
    const victim = await createUser();
    const token = await issueResetToken(victim.email);

    const reinvited = await apiCall(`/api/admin/users/${victim.id}/reinvite`, {
      method: 'POST',
      token: admin.token,
    });
    expect(reinvited.status).toBe(200);

    const used = await apiCall('/api/auth/reset', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: 'attacker-chosen-password-1' }),
    });
    expect(used.status).toBe(400);
  });

  it('invalidates an earlier token when a later one is redeemed', async () => {
    const user = await createUser();
    const first = await issueResetToken(user.email);
    const second = await issueResetToken(user.email);

    const ok = await apiCall('/api/auth/reset', {
      method: 'POST',
      body: JSON.stringify({ token: second, new_password: 'chosen-by-the-owner-1' }),
    });
    expect(ok.status).toBe(200);

    const stale = await apiCall('/api/auth/reset', {
      method: 'POST',
      body: JSON.stringify({ token: first, new_password: 'chosen-by-someone-else-1' }),
    });
    expect(stale.status).toBe(400);
  });
});

describe('forced password reset (invite flow)', () => {
  it('blocks the API until the password is changed, then unblocks', async () => {
    const user = await createUser({
      mustReset: true,
      passwordSetAt: null,
      passcodeExpiresAt: new Date(Date.now() + 60_000).toISOString(),
    });
    const token = await login(user.email, user.password);

    const blocked = await apiCall('/api/tasks', { token });
    expect(blocked.status).toBe(403);
    expect(blocked.json.code).toBe('PASSWORD_RESET_REQUIRED');

    const me = await apiCall('/api/auth/me', { token });
    expect(me.status).toBe(200);
    expect(me.json.data.must_reset).toBe(true);

    const change = await apiCall('/api/auth/change-password', {
      method: 'POST',
      token,
      body: JSON.stringify({ current_password: user.password, new_password: 'my-new-password-1' }),
    });
    expect(change.status).toBe(200);
    expect(change.json.data.must_reset).toBe(false);
    expect(change.json.data.user.status).toBe('active');

    const unblocked = await apiCall('/api/tasks', { token });
    expect(unblocked.status).toBe(200);
  });

  it('enforces the password policy', async () => {
    const user = await createUserAndLogin();
    const tooShort = await apiCall('/api/auth/change-password', {
      method: 'POST',
      token: user.token,
      body: JSON.stringify({ current_password: user.password, new_password: 'short' }),
    });
    expect(tooShort.status).toBe(400);
  });

  it('changing the password signs out other sessions', async () => {
    const user = await createUser();
    const tokenA = await login(user.email, user.password);
    const tokenB = await login(user.email, user.password);

    const change = await apiCall('/api/auth/change-password', {
      method: 'POST',
      token: tokenB,
      body: JSON.stringify({ current_password: user.password, new_password: 'rotated-password-9' }),
    });
    expect(change.status).toBe(200);

    expect((await apiCall('/api/auth/me', { token: tokenA })).status).toBe(401);
    expect((await apiCall('/api/auth/me', { token: tokenB })).status).toBe(200);
  });
});

describe('forgot / reset password', () => {
  it('answers 200 whether or not the account exists', async () => {
    const res = await apiCall('/api/auth/forgot', {
      method: 'POST',
      body: JSON.stringify({ email: 'ghost@utoledo.edu' }),
    });
    expect(res.status).toBe(200);
    expect(res.json.success).toBe(true);
  });

  it('sends a reset email and logs it for real accounts', async () => {
    const user = await createUser();
    await apiCall('/api/auth/forgot', { method: 'POST', body: JSON.stringify({ email: user.email }) });
    const log = await env.DB.prepare(
      "SELECT * FROM EmailLog WHERE email_type = 'password_reset' AND to_email = ?"
    )
      .bind(user.email)
      .first();
    expect(log).toBeTruthy();
    const row = await env.DB.prepare('SELECT * FROM PasswordResets WHERE user_id = ?')
      .bind(user.id)
      .first();
    expect(row).toBeTruthy();
  });

  it('resets the password with a valid token, exactly once', async () => {
    const user = await createUser();
    const raw = generateToken();
    await env.DB.prepare(
      'INSERT INTO PasswordResets (user_id, token_hash, expires_at) VALUES (?, ?, ?)'
    )
      .bind(user.id, await sha256Hex(raw), new Date(Date.now() + 60_000).toISOString())
      .run();
    const oldToken = await login(user.email, user.password);

    const reset = await apiCall('/api/auth/reset', {
      method: 'POST',
      body: JSON.stringify({ token: raw, new_password: 'fresh-password-22' }),
    });
    expect(reset.status).toBe(200);

    // All sessions revoked; old password dead; new one works; token single-use.
    expect((await apiCall('/api/auth/me', { token: oldToken })).status).toBe(401);
    await expect(login(user.email, user.password)).rejects.toThrow();
    await login(user.email, 'fresh-password-22');
    const again = await apiCall('/api/auth/reset', {
      method: 'POST',
      body: JSON.stringify({ token: raw, new_password: 'another-password-3' }),
    });
    expect(again.status).toBe(400);
  });

  it('rejects expired tokens', async () => {
    const user = await createUser();
    const raw = generateToken();
    await env.DB.prepare(
      'INSERT INTO PasswordResets (user_id, token_hash, expires_at) VALUES (?, ?, ?)'
    )
      .bind(user.id, await sha256Hex(raw), new Date(Date.now() - 1000).toISOString())
      .run();
    const res = await apiCall('/api/auth/reset', {
      method: 'POST',
      body: JSON.stringify({ token: raw, new_password: 'fresh-password-22' }),
    });
    expect(res.status).toBe(400);
  });
});

describe('bootstrap', () => {
  it('issues the super admin passcode exactly once, guarded by the secret', async () => {
    // The real schema seeds this account (migration 0003), so put it back into
    // the pre-bootstrap state rather than inserting a duplicate. Under the old
    // hand-built schema the table was empty and an INSERT was the only option.
    await env.DB.prepare(
      `INSERT INTO Users (email, role, status) VALUES (?, 'admin', 'invited')
       ON CONFLICT(email) DO UPDATE SET
         role = 'admin', status = 'invited', password_hash = NULL, must_reset = 0`
    )
      .bind(PRIMARY_SUPERADMIN_EMAIL)
      .run();

    const noToken = await apiCall('/api/auth/bootstrap', { method: 'POST' });
    expect(noToken.status).toBe(403);

    const wrong = await apiCall('/api/auth/bootstrap', {
      method: 'POST',
      headers: { 'x-bootstrap-token': 'wrong' },
    });
    expect(wrong.status).toBe(403);

    const ok = await apiCall('/api/auth/bootstrap', {
      method: 'POST',
      headers: { 'x-bootstrap-token': 'test-bootstrap-token' },
    });
    expect(ok.status).toBe(200);
    expect(ok.json.data.email).toBe(PRIMARY_SUPERADMIN_EMAIL);
    const passcode = ok.json.data.passcode as string;
    expect(passcode).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);

    // The passcode logs in and lands in the forced-reset state.
    const token = await login(PRIMARY_SUPERADMIN_EMAIL, passcode);
    const me = await apiCall('/api/auth/me', { token });
    expect(me.json.data.must_reset).toBe(true);

    // Inert once the admin has credentials.
    const again = await apiCall('/api/auth/bootstrap', {
      method: 'POST',
      headers: { 'x-bootstrap-token': 'test-bootstrap-token' },
    });
    expect(again.status).toBe(409);
  });

  it('ignores other credential-less admins and targets the super admin only', async () => {
    // A seeded placeholder admin used to win on `ORDER BY id LIMIT 1`, so the
    // passcode was issued for an account nobody owns while the documented
    // super admin stayed locked out.
    await env.DB.prepare(
      "INSERT INTO Users (email, role, status) VALUES ('placeholder.admin@utoledo.edu', 'admin', 'invited')"
    ).run();

    const res = await apiCall('/api/auth/bootstrap', {
      method: 'POST',
      headers: { 'x-bootstrap-token': 'test-bootstrap-token' },
    });

    // The super admin already has credentials from the test above, so this is
    // a 409 rather than a passcode for the placeholder.
    expect(res.status).toBe(409);

    const placeholder = await env.DB.prepare(
      "SELECT password_hash FROM Users WHERE email = 'placeholder.admin@utoledo.edu'"
    ).first<{ password_hash: string | null }>();
    expect(placeholder?.password_hash).toBeNull();
  });
});

describe('logout', () => {
  it('revokes the session', async () => {
    const user = await createUserAndLogin();
    const out = await apiCall('/api/auth/logout', { method: 'POST', token: user.token });
    expect(out.status).toBe(200);
    expect((await apiCall('/api/auth/me', { token: user.token })).status).toBe(401);
  });
});
