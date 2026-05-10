# Nashville Insurance Advisors — Full SEO Audit Report
**Date:** 2026-04-30
**Type:** Local file-based audit (source code)
**Site:** https://nashvilleinsuranceadvisors.com
**Framework:** Astro 6.1 + Tailwind CSS v4
**Auditor:** SEO Skill (LLM-first, file-based)

---

## Audit Scope

| Area | Files Read |
|------|-----------|
| Pages | 11 .astro pages |
| Layouts | BaseLayout.astro, BlogLayout.astro |
| Components | SEO.astro, Header.astro, Footer.astro |
| Blog | 2 .md posts (1 live, 1 draft) |
| Config | astro.config.mjs, package.json, content.config.ts |
| Public | robots.txt, dist/sitemap-0.xml, dist/sitemap-index.xml |

---

## 1. Title Tags

Target: 50–60 characters, include target keyword + "Nashville", unique per page.

| Page | Title | Length | Status |
|------|-------|--------|--------|
| index.astro | Nashville Insurance Advisors \| Independent Insurance Review — Nashville, TN | 75 | TOO LONG |
| about.astro | About Your Advisor \| Nashville Insurance Advisors | 49 | TOO SHORT |
| contact.astro | Schedule a Coverage Review \| Nashville Insurance Advisors | 57 | OK |
| process.astro | The Coverage Blueprint \| Nashville Insurance Advisors | 53 | OK |
| blog/index.astro | Insurance Blog \| Nashville Insurance Advisors | 45 | TOO SHORT |
| services/index.astro | Insurance Services \| Nashville Insurance Advisors | 49 | TOO SHORT |
| services/home-auto.astro | Home & Auto Insurance Review Nashville \| Nashville Insurance Advisors | 69 | TOO LONG |
| services/medicare.astro | Medicare Advisor Nashville TN \| Nashville Insurance Advisors | 60 | OK |
| services/life-annuities.astro | Life Insurance & Annuities Nashville \| Nashville Insurance Advisors | 67 | TOO LONG |
| services/long-term-care.astro | Long-Term Care Planning Nashville \| Nashville Insurance Advisors | 64 | TOO LONG |
| services/small-business.astro | Small Business Insurance Nashville \| Nashville Insurance Advisors | 65 | TOO LONG |
| blog post (rendered) | Why We Built the Coverage Blueprint — And Why Most Insurance Advice Gets It Backwards \| Nashville Insurance Advisors | 116 | MASSIVELY LONG |

**Summary:** 2 OK on length, 3 too short, 5 too long, 1 extreme (blog). All titles are unique.

---

## 2. Meta Descriptions

Target: 150–160 characters, unique, compelling, keyword-rich.

| Page | Length | Status |
|------|--------|--------|
| index.astro | 179 | TOO LONG |
| about.astro | 174 | TOO LONG |
| contact.astro | 143 | TOO SHORT |
| process.astro | 129 | TOO SHORT |
| blog/index.astro | 140 | TOO SHORT |
| services/index.astro | 173 | TOO LONG |
| services/home-auto.astro | 184 | TOO LONG |
| services/medicare.astro | 150 | OK |
| services/life-annuities.astro | 175 | TOO LONG |
| services/long-term-care.astro | 159 | OK |
| services/small-business.astro | 157 | OK |
| blog post | 162 | SLIGHTLY LONG |

**Summary:** 3 OK, 4 too long, 4 too short, 1 marginally over. Only 3 of 12 are in the optimal window.

---

## 3. H1 Tags

Target: Exactly one per page, keyword-rich with Nashville or service type.

| Page | H1 Text | Count | Status |
|------|---------|-------|--------|
| index.astro | "We don't shop rates. We review lives." | 1 | WEAK — zero keywords |
| about.astro | "About Your Advisor" | 1 | WEAK — no name, no Nashville |
| contact.astro | "Schedule Your Coverage Review" | 1 | OK |
| process.astro | "The Coverage Blueprint" | 1 | OK (branded term) |
| blog/index.astro | "Insurance Insights" | 1 | WEAK — no Nashville |
| services/index.astro | "Coverage We Review" | 1 | WEAK — no Nashville |
| services/home-auto.astro | "Home & Auto Insurance" | 1 | OK |
| services/medicare.astro | "Medicare Planning" | 1 | OK |
| services/life-annuities.astro | "Life Insurance & Annuities" | 1 | OK |
| services/long-term-care.astro | "Long-Term Care Planning" | 1 | OK |
| services/small-business.astro | "Small Business Insurance" | 1 | OK |
| blog/[slug].astro | Dynamic (post.data.title) | 1 | OK |

**No duplicate H1s anywhere. One-per-page is correct throughout.**
Key issue: Homepage H1 is brand voice, not SEO signal. Zero keyword value.

---

## 4. Image Alt Text

| File | Image | Alt Text | Status |
|------|-------|----------|--------|
| index.astro | hero video | aria-hidden="true" | OK (decorative) |
| index.astro | /enrique-gandara.jpg | "Nashville Insurance Advisors — your independent advisor" | WEAK — company name, not person name |
| about.astro | /enrique-gandara.jpg | "Nashville Insurance Advisors — your independent advisor" | WEAK — critical E-E-A-T page |
| Header.astro | /images/logo-dark.svg | "Nashville Insurance Advisors" | OK |

**No missing alt attributes found.** All img tags have alt text. However, both uses of the advisor photo use the company name as alt text, which prevents Google from establishing a person-entity connection (E-E-A-T signal) and also fails accessibility standards (the image depicts a specific named person, not a logo).

---

## 5. Internal Linking

### Link Map
| Page | Outbound Links To | Missing Contextual Links |
|------|-------------------|--------------------------|
| / | /contact, /process, 5 service pages, /about | /blog (body only — nav handles it) |
| /about | /contact, tel: | /process, /services, /blog |
| /contact | / (breadcrumb), tel:, mailto: | Nothing contextual |
| /process | /contact | No service pages linked |
| /services | All 5 service pages, /contact | /about, /blog |
| /services/home-auto | /contact, 3 related services | Missing /services/medicare |
| /services/medicare | /contact, 3 related services | Missing /services/small-business |
| /services/life-annuities | /contact, 3 related services | Missing /services/small-business |
| /services/long-term-care | /contact, 3 related services | OK |
| /services/small-business | /contact, 3 related services | Missing /services/medicare |
| /blog/index | /contact | No service pages linked from blog body |

### Orphan Pages
No true orphans — every page is reachable via global nav. However:
- Blog posts are only discoverable through /blog (no cross-links from service pages)
- /process is not linked from service pages (relevant link opportunity missed)

---

## 6. Schema Markup

### LocalBusiness / ProfessionalService Schema (SEO.astro)

| Field | Value | Status |
|-------|-------|--------|
| @type | ProfessionalService | OK (valid LocalBusiness subtype) |
| @id | https://nashvilleinsuranceadvisors.com | OK |
| name | Nashville Insurance Advisors, LLC | OK |
| telephone | +16153269899 | OK |
| email | team@nashvilleia.com | OK |
| address.addressLocality | Nashville | OK |
| address.addressRegion | TN | OK |
| address.addressCountry | US | OK |
| address.streetAddress | MISSING | WARNING |
| address.postalCode | MISSING | WARNING |
| geo coordinates | lat 36.1627, lon -86.7816 | OK |
| openingHoursSpecification | description only — no dayOfWeek/opens/closes | INCOMPLETE |
| priceRange | MISSING | WARNING |
| image | MISSING | WARNING |
| logo | MISSING | WARNING |
| founder.name | "Nashville Insurance Advisors" (company name used, not person name) | ERROR |
| sameAs | ["https://nashvilleia.com"] only | INCOMPLETE |

**Critical schema error:** The `founder` field uses the company name, not the founder's personal name. This actively contradicts E-E-A-T signals.

### Article Schema (BlogLayout.astro)

| Field | Value | Status |
|-------|-------|--------|
| @type | Article | OK |
| headline | post title | OK |
| description | post description | OK |
| datePublished | ISO date | OK |
| author.@type | Person | OK |
| author.name | "Nashville Insurance Advisors" (org, not person) | ERROR — should be advisor's name |
| publisher.name | Nashville Insurance Advisors, LLC | OK |
| publisher.url | https://nashvilleinsuranceadvisors.com | OK |
| image | MISSING | WARNING |
| dateModified | MISSING | WARNING |
| mainEntityOfPage | MISSING | WARNING |

### Missing Schema Types
- **WebSite** schema with SearchAction (brand SERP sitelinks box)
- **BreadcrumbList** JSON-LD (breadcrumb HTML exists on all interior pages but no structured data equivalent)

---

## 7. Broken Links & Placeholder Content

| File | Issue | Severity |
|------|-------|----------|
| services/index.astro (hero) | Literal "[Placeholder — intro paragraph...]" text renders on live page in hero subheading | CRITICAL |
| services/index.astro (card data) | All 5 service card descriptions begin with "Placeholder — ..." | CRITICAL |
| SEO.astro (ogImage default) | References /og-default.jpg which does not exist in /public | CRITICAL |
| blog/[slug].astro | Blog post URL is /blog/coverage-blueprint-why-we-do-it-differently (matches .md filename with ID) — OK |
| All internal hrefs | All checked — no 404-prone /services/, /about/, /contact/, /process/ hrefs — OK |

---

## 8. Sitemap

**Location:** Built to /dist/sitemap-0.xml + sitemap-index.xml  
**Declared in robots.txt:** https://nashvilleinsuranceadvisors.com/sitemap-index.xml ✓  
**Integration:** @astrojs/sitemap v3.7.2 installed and configured ✓  
**Site URL in astro.config.mjs:** https://nashvilleinsuranceadvisors.com ✓

**Sitemap URLs (11):**
- / ✓
- /about/ ✓
- /blog/ ✓
- /contact/ ✓
- /process/ ✓
- /services/ ✓
- /services/home-auto/ ✓
- /services/life-annuities/ ✓
- /services/long-term-care/ ✓
- /services/medicare/ ✓
- /services/small-business/ ✓

**Missing from sitemap (cached build):**  
- /blog/coverage-blueprint-why-we-do-it-differently/ — the only live (non-draft) blog post is absent. The filter in astro.config.mjs only excludes /blog/placeholder, so this is likely a stale build. A fresh `astro build` should add it.

**No lastmod, changefreq, or priority attributes** — acceptable for basic sitemap, but adding lastmod helps Google understand freshness.

---

## 9. Robots.txt

```
User-agent: *
Allow: /
Sitemap: https://nashvilleinsuranceadvisors.com/sitemap-index.xml
```

**Status:** Functional. No pages blocked. Sitemap declared correctly.  
**Gap:** No AI crawler-specific directives (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended, Bytespider, CCBot). This is an active GEO/AEO strategy gap, not a ranking issue.

---

## 10. Open Graph / Social Meta

Generated dynamically in SEO.astro for all pages.

| Tag | Value | Status |
|-----|-------|--------|
| og:type | website | OK |
| og:url | canonical URL | OK |
| og:title | page title | OK |
| og:description | meta description | OK |
| og:image | /og-default.jpg | FILE MISSING |
| og:site_name | Nashville Insurance Advisors | OK |
| og:locale | en_US | OK |
| og:image:width | Not set | WARNING |
| og:image:height | Not set | WARNING |
| twitter:card | summary_large_image | OK |
| twitter:title | page title | OK |
| twitter:description | meta description | OK |
| twitter:image | /og-default.jpg | FILE MISSING |

**All pages will display a broken/missing image when shared on social media.**

---

## 11. Canonical Tags

**Implementation:** Auto-generated in SEO.astro using `Astro.url.pathname + siteUrl`.  
**siteUrl:** Hardcoded as `https://nashvilleinsuranceadvisors.com` — matches `astro.config.mjs` site config.  
**Status:** Correct and consistent across all pages. No self-referential canonical issues found.

---

## 12. Blog Post SEO

### coverage-blueprint-why-we-do-it-differently.md (LIVE — draft: false)

| Element | Value | Status |
|---------|-------|--------|
| title (raw) | "Why We Built the Coverage Blueprint — And Why Most Insurance Advice Gets It Backwards" | 88 chars |
| title (rendered with suffix) | "Why We Built the Coverage Blueprint... \| Nashville Insurance Advisors" | 116 chars — FAR TOO LONG |
| description | "Most insurance agents start with a quote. Nashville Insurance Advisors starts with questions. Here's why we built a different process — and what it means for you." | 162 chars — slightly long |
| publishDate | 2026-05-01 (future — audit date is 2026-04-30) | NOTE |
| category | Insurance Basics | OK |
| author | Not set in frontmatter — defaults to "Nashville Insurance Advisors" | E-E-A-T issue |
| Content quality | ~950 words, original, no placeholder text | OK |
| Internal links in body | One CTA at end to /contact | Weak — no links to service pages |
| Image | None | Missing — no og:image set for this post |
| BlogLayout appends " \| Nashville Insurance Advisors" to title | Adds 28 chars — makes long titles extreme | STRUCTURAL ISSUE |

### placeholder.md (draft: true)
- Filtered from sitemap and build output correctly ✓
- Sitemap filter in astro.config.mjs: `!page.includes('/blog/placeholder')` — correct

---

## 13. Additional Observations

### E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
The advisor's actual name (Enrique Gandara, inferred from the photo filename) appears nowhere in:
- Schema markup (founder field uses company name)
- Image alt text (uses company name)
- About page copy (written in first person "I" but advisor never named)
- Blog author field (defaults to company name)
- Any page title or H1

This is a significant E-E-A-T gap. Google cannot establish a named expert entity for this business.

### Content Depth
All 5 individual service pages have substantial, original content (500–800 words each). No thin content issues on built-out pages.

### Mobile / Technical
- `lang="en"` on html element: OK
- `meta viewport` set: OK
- Charset UTF-8: OK
- No `noindex` flags on any live page (correct)
- Sitemap integration correctly configured

---

*Generated by SEO Skill — LLM-first, file-based audit. No live crawl performed.*
