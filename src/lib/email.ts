import 'server-only';

import { Resend } from 'resend';

// Configurable via env; sensible fallbacks for local dev. RESEND_FROM must be a
// verified sender in Resend for real delivery.
const FROM =
  process.env.RESEND_FROM ?? "Women's Speaker Bureau <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.BUREAU_ADMIN_EMAIL ?? 'anjali@waterbridge.vc';
const ADMIN_NAME = process.env.BUREAU_ADMIN_NAME ?? 'Anjali';

export type SendResult = { ok: boolean; skipped?: boolean; error?: string };

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function textToHtml(text: string): string {
  const paras = text
    .split('\n\n')
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`)
    .join('');
  return `<div style="font-family:system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.5;color:#111">${paras}</div>`;
}

// ---------------------------------------------------------------------------
// Pure template builders (no side effects — unit-testable)
// ---------------------------------------------------------------------------
export function buildWarmIntroEmail(p: {
  requesterName: string;
  requesterOrg: string | null;
  requesterEmail: string;
  reason: string;
  speakerName: string;
  speakerDesignation: string;
}): { subject: string; text: string; html: string } {
  const org = p.requesterOrg?.trim() || 'independent';
  const subject = `Introduction: ${p.requesterName} <> ${p.speakerName}`;
  const text =
    `Hi ${p.requesterName} and ${p.speakerName},\n\n` +
    `Happy to make this introduction. ${p.requesterName} (${org}) would ` +
    `like to connect with ${p.speakerName} (${p.speakerDesignation}):\n\n` +
    `${p.reason}\n\n` +
    `${p.speakerName}, you can reach ${p.requesterName} directly at ` +
    `${p.requesterEmail} — replying to this email will go straight to them.\n\n` +
    `I'll let you two take it from here!\n\n` +
    `Best,\n${ADMIN_NAME}, Women's Speaker Bureau`;
  return { subject, text, html: textToHtml(text) };
}

export function buildNominationApprovedEmail(p: {
  name: string;
}): { subject: string; text: string; html: string } {
  const subject = 'You’re now listed in the Women’s Speaker Bureau';
  const text =
    `Hi ${p.name},\n\n` +
    `Great news — your nomination to the Women's Speaker Bureau has been ` +
    `approved, and your profile is now live in the public directory.\n\n` +
    `Thank you for being part of this initiative.\n\n` +
    `Best,\n${ADMIN_NAME}, Women's Speaker Bureau`;
  return { subject, text, html: textToHtml(text) };
}

// ---------------------------------------------------------------------------
// Senders
// ---------------------------------------------------------------------------

/**
 * Warm introduction to both parties. When the speaker's email is unknown, the
 * bureau admin is CC'd in their place to forward the intro on.
 */
export async function sendWarmIntro(p: {
  requesterName: string;
  requesterOrg: string | null;
  requesterEmail: string;
  reason: string;
  speakerName: string;
  speakerDesignation: string;
  speakerEmail: string | null;
}): Promise<SendResult> {
  const resend = getResend();
  if (!resend) return { ok: false, error: 'RESEND_API_KEY is not configured.' };

  const { subject, text, html } = buildWarmIntroEmail(p);
  const to = p.speakerEmail
    ? [p.requesterEmail, p.speakerEmail]
    : [p.requesterEmail, ADMIN_EMAIL];

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    // Reply-to the requester so the speaker's reply reaches them directly.
    replyTo: p.requesterEmail,
    subject,
    text,
    html,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Nomination-approval confirmation to the nominee. If we have no email on file
 * (e.g. legacy rows), we skip rather than send to the wrong person.
 */
export async function sendNominationApproved(p: {
  name: string;
  email: string | null;
}): Promise<SendResult> {
  if (!p.email) return { ok: true, skipped: true };

  const resend = getResend();
  if (!resend) return { ok: false, error: 'RESEND_API_KEY is not configured.' };

  const { subject, text, html } = buildNominationApprovedEmail({ name: p.name });
  const { error } = await resend.emails.send({
    from: FROM,
    to: p.email,
    replyTo: ADMIN_EMAIL,
    subject,
    text,
    html,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
