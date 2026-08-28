/**
 * Cloudflare Pages Function — form handler for /contact and /ask.
 *
 * Delivers by email through FormSubmit (formsubmit.co) — free, no account, no
 * API key. The endpoint alias below maps to team@hearthsideinsurance.com and
 * was activated on 2026-08-25. If FormSubmit ever rejects a send, the visitor
 * gets an honest error page telling them to call or email — never a false
 * success. Silently eating a lead is the failure mode this replaced.
 */

const FORMSUBMIT_ENDPOINT = 'https://formsubmit.co/ajax/bbf5827bc511a6596b72ab910422f130';

/**
 * FormSubmit rejects any request without a Referer, and does it dishonestly:
 * the reply is 200 with {"success":"false"} and the message "Make sure you open
 * this page through a web server", which describes a problem this code does not
 * have. Workers send no Referer, so every submission since 2026-08-25 failed
 * this way and the visitor got the "call us" page. Nothing ever reached the
 * inbox from this site.
 *
 * Sent as a constant, not the visitor's own Host. FormSubmit activates per
 * referring domain, and this site answers on seven of them — forwarding the
 * real host would demand a separate activation for each. One canonical value
 * means one activation covers all of them.
 *
 * TEMPORARY. FormSubmit is a free service with no account and no data
 * processing agreement, and this request carries prospect PII. It is the patch
 * that stops the bleeding, not the destination.
 */
const FORMSUBMIT_REFERER = 'https://hearthsideinsurance.com/';

const TO_DEFAULT = 'team@hearthsideinsurance.com';

const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

function page({ status, heading, body, backHref = '/' }) {
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
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export async function onRequestPost({ request }) {
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

  try {
    const payload = { _subject: subject };
    for (const [k, v] of fields) payload[k] = v;
    if (replyTo) payload._replyto = replyTo;
    payload._template = 'table';

    const res = await fetch(FORMSUBMIT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Referer: FORMSUBMIT_REFERER,
      },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));

    if (!res.ok || String(body.success) !== 'true') {
      console.error('FormSubmit rejected the send:', res.status, JSON.stringify(body), '\n', text);
      return page({
        status: 502,
        heading: "We couldn't send that just now",
        body: `<p>Your message was <strong>not</strong> delivered. Please call <a href="tel:+16153269899">(615) 326-9899</a> or email <a href="mailto:${TO_DEFAULT}">${TO_DEFAULT}</a>.</p>`,
      });
    }
  } catch (err) {
    console.error('Form send threw:', err, '\n', text);
    return page({
      status: 502,
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
