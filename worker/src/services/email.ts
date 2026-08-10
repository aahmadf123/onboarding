// Transactional email. Every send is recorded in EmailLog.
//
// sendEmail never throws: callers' primary operations (invites, approvals, …)
// must succeed even when delivery fails. Mail to utoledo.edu addresses is
// accepted by Microsoft 365 and quarantined afterwards, so a successful send
// here is not evidence that anyone received anything.

import { Bindings, EmailType } from '../types';
import { getConfigs } from './config';
import { resolveProvider } from './email-providers';
import { EmailContent } from './email-templates';

export interface SendEmailOptions {
  to: string;
  /**
   * The rendered message. Taken whole rather than as loose subject/html/text
   * fields so a new template cannot ship without its plaintext part.
   */
  content: EmailContent;
  type: EmailType;
  userId?: number | null;
}

export interface SendEmailResult {
  ok: boolean;
  providerId?: string;
  error?: string;
}

/**
 * Builds the From header.
 *
 * The display name is quoted rather than interpolated bare: a name containing
 * a comma, quote or angle bracket produces a malformed header otherwise, and
 * validateSetting only strips line breaks from that setting.
 */
function formatFrom(name: string, address: string): string {
  if (!name) return address;
  return `"${name.replace(/[\\"]/g, '\\$&')}" <${address}>`;
}

export async function sendEmail(
  env: Pick<Bindings, 'DB' | 'RESEND_API_KEY'> & Partial<Bindings>,
  opts: SendEmailOptions
): Promise<SendEmailResult> {
  let result: SendEmailResult;
  try {
    const provider = resolveProvider(env as Bindings);
    if (!provider) {
      result = { ok: false, error: 'No email provider is configured' };
    } else {
      const cfg = await getConfigs(env.DB, [
        'email_from_address',
        'email_from_name',
        'email_reply_to',
      ]);

      result = await provider.send({
        from: formatFrom(cfg.email_from_name, cfg.email_from_address),
        to: opts.to,
        subject: opts.content.subject,
        html: opts.content.html,
        text: opts.content.text,
        ...(cfg.email_reply_to ? { replyTo: cfg.email_reply_to } : {}),
      });
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
        opts.content.subject,
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
