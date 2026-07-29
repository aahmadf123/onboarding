// Outbound email backends.
//
// Resend is the default. Mail it sends from mail.utrockets-onboarding.com is
// accepted by the university's mail servers and then filtered: a newly
// registered domain resembling utrockets.com, carrying passcodes and sign-in
// links, matches what anti-phishing filters are built to stop. Resend reports
// those sends as successful because a 250 accept happened at SMTP time.
//
// The durable fix is to send from inside the university's own tenant, which
// skips inbound filtering entirely. That is what the Graph provider is for.
// It activates on its own once the MS_* secrets are set; until then nothing
// changes.

import { Bindings } from '../types';

export interface OutboundMessage {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export interface SendResult {
  ok: boolean;
  providerId?: string;
  error?: string;
}

export interface EmailProvider {
  readonly name: string;
  send(message: OutboundMessage): Promise<SendResult>;
}

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export function resendProvider(apiKey: string): EmailProvider {
  return {
    name: 'resend',
    async send(message) {
      const res = await fetch(RESEND_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: message.from,
          to: [message.to],
          subject: message.subject,
          html: message.html,
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        return { ok: false, error: `Resend ${res.status}: ${body.slice(0, 500)}` };
      }
      const data = (await res.json()) as { id?: string };
      return { ok: true, providerId: data.id };
    },
  };
}

/**
 * Microsoft Graph, sending as a real mailbox inside the university tenant.
 *
 * Requires an app registration with the application permission
 * `Mail.Send` (admin-consented), and these secrets:
 *
 *   npx wrangler secret put MS_TENANT_ID
 *   npx wrangler secret put MS_CLIENT_ID
 *   npx wrangler secret put MS_CLIENT_SECRET
 *   npx wrangler secret put MS_SENDER_ADDRESS   # e.g. athletics-onboarding@utoledo.edu
 *
 * The `from` address is ignored: Graph sends as MS_SENDER_ADDRESS, which is
 * the whole point, since an internal sender is not subject to the inbound
 * filtering that drops mail from utrockets-onboarding.com.
 */
export function graphProvider(config: {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  senderAddress: string;
}): EmailProvider {
  return {
    name: 'microsoft-graph',
    async send(message) {
      const tokenRes = await fetch(
        `https://login.microsoftonline.com/${encodeURIComponent(config.tenantId)}/oauth2/v2.0/token`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            scope: 'https://graph.microsoft.com/.default',
            grant_type: 'client_credentials',
          }),
        }
      );

      if (!tokenRes.ok) {
        const body = await tokenRes.text();
        return { ok: false, error: `Graph token ${tokenRes.status}: ${body.slice(0, 500)}` };
      }
      const { access_token: accessToken } = (await tokenRes.json()) as { access_token?: string };
      if (!accessToken) {
        return { ok: false, error: 'Graph token response contained no access_token' };
      }

      const sendRes = await fetch(
        `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(config.senderAddress)}/sendMail`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: {
              subject: message.subject,
              body: { contentType: 'HTML', content: message.html },
              toRecipients: [{ emailAddress: { address: message.to } }],
            },
            saveToSentItems: false,
          }),
        }
      );

      // sendMail returns 202 Accepted with an empty body, so there is no
      // provider-side id to record.
      if (sendRes.status !== 202) {
        const body = await sendRes.text();
        return { ok: false, error: `Graph sendMail ${sendRes.status}: ${body.slice(0, 500)}` };
      }
      return { ok: true, providerId: 'graph_accepted' };
    },
  };
}

/**
 * Picks the backend for this environment. Graph wins when fully configured,
 * because it is the only one that reliably reaches utoledo.edu mailboxes.
 * Returns null when nothing is configured, so callers can log the reason
 * rather than throwing.
 */
export function resolveProvider(env: Bindings): EmailProvider | null {
  if (env.MS_TENANT_ID && env.MS_CLIENT_ID && env.MS_CLIENT_SECRET && env.MS_SENDER_ADDRESS) {
    return graphProvider({
      tenantId: env.MS_TENANT_ID,
      clientId: env.MS_CLIENT_ID,
      clientSecret: env.MS_CLIENT_SECRET,
      senderAddress: env.MS_SENDER_ADDRESS,
    });
  }
  if (env.RESEND_API_KEY) return resendProvider(env.RESEND_API_KEY);
  return null;
}
