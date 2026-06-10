// Resend transactional email via plain fetch (no SDK — the send API is one
// POST and the repo keeps dependencies minimal). Every send is recorded in
// EmailLog. sendEmail never throws: callers' primary operations (invites,
// approvals, …) must succeed even when email delivery fails — e.g. while the
// from-address is the resend.dev sandbox, which only delivers to the Resend
// account owner's inbox.

import { Bindings, EmailType } from '../types';
import { getConfigs } from './config';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

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
  env: Pick<Bindings, 'DB' | 'RESEND_API_KEY'>,
  opts: SendEmailOptions
): Promise<SendEmailResult> {
  let result: SendEmailResult;
  try {
    if (!env.RESEND_API_KEY) {
      result = { ok: false, error: 'RESEND_API_KEY is not configured' };
    } else {
      const cfg = await getConfigs(env.DB, ['email_from_address', 'email_from_name']);
      const from = cfg.email_from_name
        ? `${cfg.email_from_name} <${cfg.email_from_address}>`
        : cfg.email_from_address;

      const res = await fetch(RESEND_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [opts.to],
          subject: opts.subject,
          html: opts.html,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as { id?: string };
        result = { ok: true, providerId: data.id };
      } else {
        const body = await res.text();
        result = { ok: false, error: `Resend ${res.status}: ${body.slice(0, 500)}` };
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
