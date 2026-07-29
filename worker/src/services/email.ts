// Resend transactional email via plain fetch (no SDK — the send API is one
// POST and the repo keeps dependencies minimal). Every send is recorded in
// EmailLog. sendEmail never throws: callers' primary operations (invites,
// approvals, …) must succeed even when email delivery fails — e.g. while the
// from-address is the resend.dev sandbox, which only delivers to the Resend
// account owner's inbox.

import { Bindings, EmailType } from '../types';
import { getConfigs } from './config';
import { resolveProvider } from './email-providers';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  type: EmailType;
  userId?: number | null;
}

export interface SendEmailResult {
  ok: boolean;
  providerId?: string;
  error?: string;
}

export async function sendEmail(
  env: Pick<Bindings, 'DB' | 'RESEND_API_KEY'> & Partial<Bindings>,
  opts: SendEmailOptions
): Promise<SendEmailResult> {
  let result: SendEmailResult;
  try {
    if (env.RESEND_API_KEY === 'test-resend-key') {
      // Tests inject this sentinel secret to avoid outbound network calls.
      result = { ok: true, providerId: 'email_mock' };
    } else {
      const provider = resolveProvider(env as Bindings);
      if (!provider) {
        result = { ok: false, error: 'No email provider is configured' };
      } else {
        const cfg = await getConfigs(env.DB, ['email_from_address', 'email_from_name']);
        const from = cfg.email_from_name
          ? `${cfg.email_from_name} <${cfg.email_from_address}>`
          : cfg.email_from_address;

        result = await provider.send({
          from,
          to: opts.to,
          subject: opts.subject,
          html: opts.html,
        });
      }
    }
  } catch (err) {
    result = { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  try {
    await env.DB.prepare(
      `INSERT INTO EmailLog (user_id, to_email, email_type, subject, status, provider_id, error_text)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        opts.userId ?? null,
        opts.to,
        opts.type,
        opts.subject,
        result.ok ? 'sent' : 'error',
        result.providerId ?? null,
        result.error ?? null
      )
      .run();
  } catch (err) {
    console.error('EmailLog write failed:', err instanceof Error ? err.message : err);
  }

  if (!result.ok) {
    console.error(`Email (${opts.type}) to ${opts.to} failed: ${result.error}`);
  }
  return result;
}
