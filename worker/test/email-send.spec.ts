// What actually goes out on the wire.
//
// sendEmail used to return before building a message when the test sentinel
// key was set, so none of this was reachable from a test. It now sends through
// a recording provider like any other.

import { env } from 'cloudflare:test';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { applySchema, apiCall, createUserAndLogin } from './helpers';
import { sentMessages } from '../src/services/email-providers';
import { setConfig } from '../src/services/config';

beforeAll(async () => {
  await applySchema();
});

beforeEach(() => {
  sentMessages.length = 0;
});

async function invite(token: string, email: string) {
  return apiCall('/api/admin/users', {
    method: 'POST',
    token,
    body: JSON.stringify({ email, name: 'New Hire', role: 'staff' }),
  });
}

describe('outgoing message', () => {
  it('carries both a html and a plaintext part', async () => {
    const admin = await createUserAndLogin({ role: 'admin' });
    await invite(admin.token, 'parts@utoledo.edu');

    const msg = sentMessages.at(-1)!;
    expect(msg.to).toBe('parts@utoledo.edu');
    expect(msg.html).toContain('<div');
    expect(msg.text.trim()).not.toBe('');
    expect(msg.text).not.toContain('<div');
  });

  it('never puts the passcode on the wire', async () => {
    const admin = await createUserAndLogin({ role: 'admin' });
    const res = await invite(admin.token, 'secret@utoledo.edu');
    const passcode = res.json.data.passcode as string;

    const msg = sentMessages.at(-1)!;
    expect(passcode).toBeTruthy();
    expect(msg.html).not.toContain(passcode);
    expect(msg.text).not.toContain(passcode);
  });

  it('omits reply_to when the setting is blank and sends it when set', async () => {
    const admin = await createUserAndLogin({ role: 'admin' });

    await setConfig(env.DB, 'email_reply_to', '');
    await invite(admin.token, 'noreply@utoledo.edu');
    expect(sentMessages.at(-1)!.replyTo).toBeUndefined();

    await setConfig(env.DB, 'email_reply_to', 'athletics-onboarding@utoledo.edu');
    await invite(admin.token, 'withreply@utoledo.edu');
    expect(sentMessages.at(-1)!.replyTo).toBe('athletics-onboarding@utoledo.edu');

    await setConfig(env.DB, 'email_reply_to', '');
  });
});

describe('from header', () => {
  it('quotes the display name', async () => {
    const admin = await createUserAndLogin({ role: 'admin' });
    await setConfig(env.DB, 'email_from_name', 'Toledo Athletics Onboarding');
    await setConfig(env.DB, 'email_from_address', 'onboarding@mail.example.com');

    await invite(admin.token, 'from1@utoledo.edu');
    expect(sentMessages.at(-1)!.from).toBe(
      '"Toledo Athletics Onboarding" <onboarding@mail.example.com>'
    );
  });

  it('stays a well-formed header when the name contains quotes or brackets', async () => {
    const admin = await createUserAndLogin({ role: 'admin' });
    // validateSetting only strips line breaks from this key, so these reach
    // the header builder. Interpolated bare, they produce a malformed From.
    await setConfig(env.DB, 'email_from_name', 'Toledo "Rockets" <Athletics>, Inc');

    await invite(admin.token, 'from2@utoledo.edu');
    const from = sentMessages.at(-1)!.from;

    // Exactly one address group, and every inner quote escaped.
    expect(from).toBe('"Toledo \\"Rockets\\" <Athletics>, Inc" <onboarding@mail.example.com>');
    expect(from.match(/<[^>]*@[^>]*>/g)).toHaveLength(1);

    await setConfig(env.DB, 'email_from_name', 'Toledo Athletics Onboarding');
  });

  it('sends a bare address when no display name is set', async () => {
    const admin = await createUserAndLogin({ role: 'admin' });
    await setConfig(env.DB, 'email_from_name', '');

    await invite(admin.token, 'from3@utoledo.edu');
    expect(sentMessages.at(-1)!.from).toBe('onboarding@mail.example.com');

    await setConfig(env.DB, 'email_from_name', 'Toledo Athletics Onboarding');
  });
});
