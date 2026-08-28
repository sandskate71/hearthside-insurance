/**
 * Cloudflare Pages Function — form handler for /contact and /ask.
 *
 * Delivers through Resend. Requires ONE environment variable, set in the
 * Cloudflare Pages dashboard (Settings → Environment variables) for Production
 * and Preview:
 *
 *   RESEND_API_KEY   — API key from resend.com
 *
 * Optional overrides:
 *   FORM_TO          — recipient (default team@hearthsideinsurance.com)
 *   FORM_FROM        — verified sender (default forms@send.hearthsideinsurance.com)
 *
 * This replaced FormSubmit, which never delivered a single submission from this
 * site. It rejected every Referer-less request — and Workers send no Referer —
 * and once that was fixed it rate-limited Cloudflare's shared egress IPs, which
 * a Worker cannot control. It was also free, account-less and carried prospect
 * PII with no data processing agreement.
 *
 * Delivery failures answer 200, never 5xx. See DELIVERY_FAILED below.
 */

/**
 * The sender lives on a SUBDOMAIN, and that is deliberate.
 *
 * The apex carries `v=spf1 include:_spf.google.com ~all` and MX to
 * smtp.google.com — Google Workspace delivers team@hearthsideinsurance.com,
 * which is the very address this form sends to. Verifying Resend against the
 * apex would mean editing that SPF record, and a mistake there breaks the
 * mailbox the leads land in. Verifying send.hearthsideinsurance.com instead
 * puts Resend's SPF, DKIM and MX records on a name of their own and leaves the
 * apex untouched.
 */
const SEND_SUBDOMAIN = 'send.hearthsideinsurance.com';
const FROM_DEFAULT = `Hearthside Website <forms@${SEND_SUBDOMAIN}>`;

const TO_DEFAULT = 'team@hearthsideinsurance.com';

const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/**
 * Delivery-failure responses answer 200, not 502.
 *
 * Not a cosmetic choice. This site is served through a proxied Cloudflare zone,
 * and the zone replaces 5xx response bodies with its own error page. Measured on
 * hearthsideinsurance.com: the 400 "That didn't come through" page arrives whole
 * at 1521 bytes with the phone number in it, while the 502 relay-failure page is
 * replaced by a 16-byte "error code: 502". On *.pages.dev both arrive intact,
 * which is why this was invisible in preview.
 *
 * The result was that the single most important page on this endpoint — the one
 * telling a real prospect their message did not send and to call instead — was
 * the only one visitors never saw. It has been that way since 370f296 (Aug 25).
 *
 * 200 is also defensible on its own terms: the request to this endpoint did
 * succeed, and the delivery outcome is what the body describes. The machine
 * signal moves to the X-Delivery-Failed header, and console.error still fires.
 *
 * This does NOT make a failure look like a lead. generate_lead is gated on the
 * `lead` argument to page(), which only the genuine-success branch passes, and
 * neither of these two returns passes one.
 */
const DELIVERY_FAILED = { status: 200, failed: true };

function page({ status, heading, body, backHref = '/', failed = false }) {
  const html = `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(heading)} — Hearthside Insurance</title>
<style>
:root{color-scheme:light}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
background:#f0f4fa;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#1f2937;padding:24px}
.card{background:#fff;max-width:34rem;width:100%;padding:2.5rem;border-radius:1rem;
border:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,.06)}
h1{font-family:Lora,Georgia,serif;font-size:1.6rem;color:#0f1e3d;margin:0 0 .75rem}
p{line-height:1.65;margin:0 0 1rem}
a.btn{display:inline-block;margin-top:.5rem;padding:.75rem 1.5rem;background:#0f1e3d;color:#fff;
text-decoration:none;border-radius:.5rem;font-weight:600;font-size:.9rem}
a{color:#0f1e3d}
</style></head><body><div class="card">
<h1>${esc(heading)}</h1>${body}
<a class="btn" href="${backHref}">Back to the site</a>
</div></body></html>`;
  const headers = {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
  };
  // The status code no longer carries the "did it send" signal (see below), so
  // expose it as a header for uptime checks and log searches.
  if (failed) headers['X-Delivery-Failed'] = '1';

  return new Response(html, { status, headers });
}

export async function onRequestPost({ request, env }) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return page({
      status: 400,
      heading: "That didn't come through",
      body: `<p>We couldn't read that submission. Please call <a href="tel:+16153269899">(615) 326-9899</a> or email <a href="mailto:${TO_DEFAULT}">${TO_DEFAULT}</a>.</p>`,
    });
  }

  // Honeypot — bots fill hidden fields; humans don't.
  if (form.get('company_website')) {
    return page({ status: 200, heading: 'Thanks — we got it', body: '<p>We&rsquo;ll be in touch.</p>' });
  }

  const source = form.get('_source') || 'website';
  const fields = [];
  for (const [k, v] of form.entries()) {
    if (k.startsWith('_') || k === 'company_website') continue;
    if (String(v).trim() === '') continue;
    fields.push([k, String(v)]);
  }

  const replyTo = form.get('email') ? String(form.get('email')) : undefined;
  const who = [form.get('first-name') || form.get('first_name'), form.get('last-name')]
    .filter(Boolean)
    .join(' ')
    .trim();

  const subject = `New ${source} submission${who ? ` — ${who}` : ''}`;
  const text = fields.map(([k, v]) => `${k}: ${v}`).join('\n');
  const html =
    `<h2>${esc(subject)}</h2><table cellpadding="6" style="border-collapse:collapse">` +
    fields
      .map(
        ([k, v]) =>
          `<tr><td style="border:1px solid #ddd"><strong>${esc(k)}</strong></td><td style="border:1px solid #ddd">${esc(v).replace(/\n/g, '<br>')}</td></tr>`
      )
      .join('') +
    `</table><p style="color:#888;font-size:12px">Sent from ${esc(source)} at ${new Date().toISOString()}</p>`;

  const key = env.RESEND_API_KEY;
  if (!key) {
    // Answering 200 here too: a 503 body is replaced by the zone's own error
    // page, so the visitor would see nothing at all. The copy differs from the
    // rejected-send case because retrying cannot help.
    console.error('FORM SUBMISSION NOT DELIVERED — RESEND_API_KEY is not set.\n' + text);
    return page({
      ...DELIVERY_FAILED,
      heading: "We couldn't send that just now",
      body: `<p>Our contact form is temporarily unavailable and your message was <strong>not</strong> delivered. Please don't retry — reach us directly instead:</p>
<p>Call <a href="tel:+16153269899">(615) 326-9899</a><br>Email <a href="mailto:${TO_DEFAULT}">${TO_DEFAULT}</a></p>
<p>Sorry about that.</p>`,
    });
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.FORM_FROM || FROM_DEFAULT,
        to: [env.FORM_TO || TO_DEFAULT],
        subject,
        text,
        html,
        // Reply-To is the prospect's own address, so hitting reply in the inbox
        // writes to the person rather than to the sending subdomain. Omitted
        // entirely when they left the email field blank — a Reply-To pointing
        // at forms@send.* would be worse than none.
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('Resend rejected the send:', res.status, detail, '\n', text);
      return page({
        ...DELIVERY_FAILED,
        heading: "We couldn't send that just now",
        body: `<p>Your message was <strong>not</strong> delivered. Please call <a href="tel:+16153269899">(615) 326-9899</a> or email <a href="mailto:${TO_DEFAULT}">${TO_DEFAULT}</a>.</p>`,
      });
    }
  } catch (err) {
    console.error('Form send threw:', err, '\n', text);
    return page({
      ...DELIVERY_FAILED,
      heading: "We couldn't send that just now",
      body: `<p>Your message was <strong>not</strong> delivered. Please call <a href="tel:+16153269899">(615) 326-9899</a> or email <a href="mailto:${TO_DEFAULT}">${TO_DEFAULT}</a>.</p>`,
    });
  }

  return page({
    status: 200,
    heading: 'Thanks — we got it',
    body: `<p>Your message is in. We respond within one business day.</p><p>If it's urgent, call <a href="tel:+16153269899">(615) 326-9899</a>.</p>`,
  });
}

export async function onRequestGet() {
  return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
}
