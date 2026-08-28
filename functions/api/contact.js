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

const TO_DEFAULT = 'team@hearthsideinsurance.com';

const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const GA_MEASUREMENT_ID = 'G-F1H924T1E7';

/**
 * GA4 lead event, emitted into the page markup.
 *
 * These responses are hand-built HTML, not Astro pages, so they do not inherit
 * the site's gtag snippet from BaseLayout — the tag has to be bootstrapped here
 * or the call has nothing to call. `send_page_view: false` keeps /api/contact
 * out of the page_view report; the only hit this page makes is the lead itself.
 *
 * This block is emitted ONLY when page() is handed a `lead`, and only the
 * genuine-success branch hands it one. The honeypot reply and the 502 "call us"
 * page pass nothing, so they carry no snippet and cannot fire the event. That
 * is also why this is not a real Astro route: a route would be a public GET URL
 * that fires generate_lead for anyone who loads it.
 */
function leadTag(lead) {
  if (!lead) return '';
  // Values are server-chosen from closed sets, but they still land inside a
  // <script>, so close the tag-break and line-separator holes anyway.
  const params = JSON.stringify(lead)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
if (typeof gtag === 'function') gtag('event', 'generate_lead', ${params});
</script>`;
}

function page({ status, heading, body, backHref = '/', lead = null }) {
  const html = `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(heading)} — Hearthside Insurance</title>
${leadTag(lead)}
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

/**
 * GA4 `generate_lead` parameters, derived from the submission.
 *
 * Both values come from closed sets rather than being passed through: `_source`
 * and `urgency` are hidden fields, so a bot can put anything in them. Mapping
 * them here keeps the GA4 dimensions to values the reports can actually group
 * by, and keeps arbitrary strings out of the event.
 */
const FORM_LOCATION = {
  'contact page': 'contact',
  'ask a question': 'ask',
};

const URGENCY = new Set(['urgent', 'review']);

function leadParams(form, source) {
  const params = { form_location: FORM_LOCATION[String(source)] || 'other' };
  const urgency = String(form.get('urgency') || '');
  if (URGENCY.has(urgency)) params.urgency = urgency;
  return params;
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
    // Bots get the same reassurance a human gets, but deliberately no `lead` —
    // a honeypot hit is not a lead, and counting one would be the exact
    // inflation this event exists to avoid.
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
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
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

  // The only branch that fires generate_lead: FormSubmit accepted the send and
  // the submission cleared the honeypot. A failed relay returns above, from the
  // 502 branch, which passes no `lead` and so carries no tag at all.
  return page({
    status: 200,
    heading: 'Thanks — we got it',
    lead: leadParams(form, source),
    body: `<p>Your message is in. We respond within one business day.</p><p>If it's urgent, call <a href="tel:+16153269899">(615) 326-9899</a>.</p>`,
  });
}

export async function onRequestGet() {
  return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
}
