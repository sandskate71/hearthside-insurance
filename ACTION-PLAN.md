# Nashville Insurance Advisors — SEO Action Plan
**Date:** 2026-04-30
**Priority order:** Fix Critical first, then Warnings, then optimizations.

---

## CRITICAL — Fix Immediately (impacts indexing, rankings, or user trust)

---

### C1. Placeholder text is live on /services page
**File:** `src/pages/services/index.astro`
**Issue:** The hero paragraph and all 5 service card descriptions contain literal "Placeholder —" text that renders on the live page.
**Current value (hero):** `[Placeholder — intro paragraph explaining the range of coverage Nashville Insurance Advisors can review...]`
**Current value (cards):** `"Placeholder — comprehensive review of your home, auto, and umbrella policies..."` (and 4 more)
**Fix:** Replace hero paragraph with real copy. Replace all 5 card description strings in the `services` array with actual descriptions (without the "Placeholder —" prefix). These descriptions also appear in the page's service card grid — they are visible to users and crawlers.

---

### C2. OG image default file does not exist
**File:** `src/components/SEO.astro` line 15: `ogImage = '/og-default.jpg'`
**File:** `public/` — `/og-default.jpg` is NOT present
**Issue:** Every page that doesn't pass a custom `ogImage` prop (all 11 pages + blog posts) generates `og:image` and `twitter:image` tags pointing to a non-existent file. Social shares will show a broken or blank image sitewide.
**Fix:** Create a 1200×630px OG image and save it to `/public/og-default.jpg`. Alternatively rename the fallback to an existing image temporarily.

---

### C3. Homepage H1 has zero SEO keywords
**File:** `src/pages/index.astro` line 33
**Current H1:** `"We don't shop rates. We review lives."`
**Issue:** The most important H1 on the site contains no keyword signal whatsoever — no "insurance," no "Nashville," no "independent," nothing Google can map to a search query. The brand tagline belongs as a subheading (p or h2), not the H1.
**Fix:** Change H1 to something like: `Nashville Independent Insurance Advisor` or `Independent Insurance Review — Nashville, TN`. Move the brand tagline to the `<p>` below it. The current `<p class="text-gold-400...">` eyebrow line can serve as the brand voice opener.

---

### C4. Advisor's real name appears nowhere on the site
**Multiple files**
**Issue:** E-E-A-T requires a named, verifiable expert. "Enrique Gandara" (inferred from `/enrique-gandara.jpg`) never appears in: schema markup, image alt text, About page copy, blog author credits, or any H-tag. Google cannot establish a person-entity.
**Fix (cascading — do all of these):**
- `about.astro`: State the advisor's full name in the bio copy (currently uses "I" only). Add it in the H2 subheading.
- `src/components/SEO.astro` schema: Change `founder.name` from `"Nashville Insurance Advisors"` to the advisor's real name. Add `"@type": "Person"` with `name`, `jobTitle`, and optionally `sameAs` (LinkedIn URL).
- `src/layouts/BlogLayout.astro` schema: Change `author.name` default from `"Nashville Insurance Advisors"` to the advisor's real name.
- `src/content/blog/coverage-blueprint-why-we-do-it-differently.md`: Add `author: "Enrique Gandara"` (or actual name) to frontmatter.
- Both `img` alt texts for `enrique-gandara.jpg`: Change from `"Nashville Insurance Advisors — your independent advisor"` to `"[Advisor Name], independent insurance advisor at Nashville Insurance Advisors"`.

---

### C5. Blog post title is 116 characters when rendered
**File:** `src/layouts/BlogLayout.astro` line 46
**Current:** `title={`${title} | Nashville Insurance Advisors`}`
**Blog post raw title:** "Why We Built the Coverage Blueprint — And Why Most Insurance Advice Gets It Backwards" (88 chars)
**Rendered title:** 116 characters (88 + 28 for the suffix)
**Issue:** Google truncates titles at ~60 characters in SERPs. A 116-char title will be heavily truncated and the keyword signal is diluted.
**Fix (two-part):**
1. Shorten the blog post raw title to ~35 chars max so the rendered title fits in 60: e.g. `"Why We Built the Coverage Blueprint"` → renders as `"Why We Built the Coverage Blueprint | Nashville Insurance Advisors"` (65 chars — acceptable).
2. Or change the BlogLayout suffix to just `" | NIA"` (saves 22 chars), though this loses brand clarity.
**Recommended fix:** Shorten blog post titles at the source (.md frontmatter). A good target is 32–38 chars for the raw title when using the BlogLayout suffix.

---

## WARNINGS — Fix Within 2–4 Weeks

---

### W1. 8 of 11 page titles are outside the 50–60 char optimal range
**Files:** See FULL-AUDIT-REPORT.md §1 for full table.
**Too long (need trimming):**
- `index.astro` (75): Shorten to `"Nashville Insurance Advisors | Independent Insurance Review"` (60)
- `services/home-auto.astro` (69): `"Home & Auto Insurance Nashville | Nashville Insurance Advisors"` (62 — trim "Review")
- `services/life-annuities.astro` (67): `"Life & Annuities Nashville | Nashville Insurance Advisors"` (57)
- `services/long-term-care.astro` (64): `"Long-Term Care Insurance Nashville | Nashville Insurance Advisors"` — trim to 60: `"Long-Term Care Planning Nashville | NIA"` or rework
- `services/small-business.astro` (65): `"Small Business Insurance Nashville | Nashville IA"` (50)

**Too short (need padding with keyword):**
- `about.astro` (49): `"Independent Insurance Advisor Nashville | NIA"` or `"About Your Nashville Insurance Advisor | NIA"`
- `blog/index.astro` (45): `"Insurance Blog Nashville | Nashville Insurance Advisors"` (55)
- `services/index.astro` (49): `"Insurance Services Nashville TN | Nashville Insurance Advisors"` (61 — acceptable)

---

### W2. 8 of 11 meta descriptions are outside the 150–160 char optimal range
**Too long — will be truncated in SERPs:**
- `index.astro` (179): Trim ~20 chars from the end
- `about.astro` (174): Cut "Learn the approach to comprehensive coverage reviews." — down to 152
- `services/index.astro` (173): Cut the second clause
- `services/home-auto.astro` (184): Trim last clause ("not just your premium")
- `services/life-annuities.astro` (175): Trim last clause

**Too short — missing keyword opportunities:**
- `contact.astro` (143): Add "home, auto, life, Medicare, or small business insurance" to pad to 155
- `process.astro` (129): Add context: "Nashville Insurance Advisors' Coverage Blueprint walks you through..." (target 155)
- `blog/index.astro` (140): Expand — add "Medicare, long-term care, and life insurance" to pad to 155

---

### W3. LocalBusiness schema missing critical fields
**File:** `src/components/SEO.astro`
**Missing fields:**
- `streetAddress` (or "By appointment — no physical office" if truly no address — use service area instead)
- `postalCode` (37201 or service area zip if no fixed address)
- `priceRange` — add `"$$"` or `"Free consultation"` as appropriate
- `image` — add the advisor headshot URL or a business image URL
- `logo` — add the logo URL

**Incorrect field:**
- `founder.name`: Currently `"Nashville Insurance Advisors"` — change to advisor's real name with `"@type": "Person"`

**Recommended additions:**
- `hasMap` — link to Google Maps profile if it exists
- `sameAs` — add Google Business Profile URL, Yelp, LinkedIn

---

### W4. Article schema missing key fields (reduces blog rich result eligibility)
**File:** `src/layouts/BlogLayout.astro`
**Add these fields to `articleSchema`:**
```json
{
  "image": "https://nashvilleinsuranceadvisors.com/og-default.jpg",
  "dateModified": "[same as datePublished until updated]",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "[canonical URL]"
  },
  "author": {
    "@type": "Person",
    "name": "[Advisor real name]",
    "url": "https://nashvilleinsuranceadvisors.com/about"
  }
}
```

---

### W5. BreadcrumbList schema absent despite breadcrumb HTML on all interior pages
**Files:** `about.astro`, `contact.astro`, `process.astro`, `blog/index.astro`, `blog/[slug].astro`, all service pages
**Issue:** Rich breadcrumb results in SERPs require JSON-LD BreadcrumbList schema — the HTML nav alone is not sufficient.
**Fix:** Add BreadcrumbList JSON-LD to `BaseLayout.astro` (or as a component prop) and pass the current page's breadcrumb array. Example for /services/medicare:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://nashvilleinsuranceadvisors.com/"},
    {"@type": "ListItem", "position": 2, "name": "Services", "item": "https://nashvilleinsuranceadvisors.com/services/"},
    {"@type": "ListItem", "position": 3, "name": "Medicare", "item": "https://nashvilleinsuranceadvisors.com/services/medicare/"}
  ]
}
```

---

### W6. Blog post sitemap entry missing (stale build)
**File:** `dist/sitemap-0.xml`
**Issue:** The live blog post `/blog/coverage-blueprint-why-we-do-it-differently/` does not appear in the cached sitemap. The sitemap filter in `astro.config.mjs` only excludes `/blog/placeholder` — so a fresh build should include it.
**Fix:** Run `astro build` before deploying. Verify the rebuilt sitemap includes the blog post URL.

---

### W7. Homepage H1 weak — About page H1 has no Nashville or advisor name
**File:** `src/pages/about.astro` line 18
**Current H1:** `"About Your Advisor"`
**Fix:** `"Independent Insurance Advisor | Nashville, TN"` or include the advisor's actual name once the E-E-A-T fix (C4) is complete. Example: `"Enrique Gandara — Nashville Independent Insurance Advisor"`

---

### W8. Blog index H1 lacks Nashville keyword
**File:** `src/pages/blog/index.astro` line 33
**Current:** `"Insurance Insights"`
**Fix:** `"Nashville Insurance Blog"` or `"Insurance Insights for Nashville Residents"`

---

### W9. Process page and About page have very few contextual outbound links
**Files:** `process.astro`, `about.astro`
**Issue:** /process mentions Medicare, long-term care, life insurance, annuities — but links to none of those service pages. /about has a CTA to /contact only.
**Fix for /process:** In the "Stage 3 — Implementation Meetings" section, add inline links to /services/medicare, /services/long-term-care, /services/life-annuities, /services/life-annuities.
**Fix for /about:** In the advisory philosophy section or at the end of bio copy, add a "What We Review" section with links to /services.

---

### W10. og:image:width and og:image:height missing
**File:** `src/components/SEO.astro`
**Issue:** Without explicit dimensions, some social platforms fall back to scraping the image or show a generic preview.
**Fix:** After creating the OG image (C2), add:
```html
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content={title} />
```

---

### W11. WebSite schema with SearchAction not present
**File:** `src/components/SEO.astro`
**Issue:** Recommended for brand SERPs to trigger sitelinks search box.
**Fix:** Add to SEO.astro (inside the global schema or as a second script block):
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://nashvilleinsuranceadvisors.com/#website",
  "url": "https://nashvilleinsuranceadvisors.com",
  "name": "Nashville Insurance Advisors",
  "publisher": {"@id": "https://nashvilleinsuranceadvisors.com"}
}
```

---

### W12. Blog post has future publishDate
**File:** `src/content/blog/coverage-blueprint-why-we-do-it-differently.md`
**Current publishDate:** 2026-05-01 (tomorrow from audit date)
**Issue:** Minor — if deployed today, the post appears "published tomorrow." Not a crawling/indexing issue but could confuse structured data validators.
**Fix:** Change to 2026-04-30 or the actual intended publish date.

---

### W13. Blog post has no internal links to service pages
**File:** `src/content/blog/coverage-blueprint-why-we-do-it-differently.md`
**Issue:** The post mentions the Coverage Blueprint, Discovery Meeting, Medicare, long-term care, and life insurance — but never links to the corresponding service pages.
**Fix:** Add inline contextual links:
- At first mention of "Medicare" → link to /services/medicare
- At first mention of "long-term care" → link to /services/long-term-care  
- At first mention of "home and auto coverage" → link to /services/home-auto
- The final CTA section → link to /process

---

## PASSING — Meeting Standards

---

- **Canonical tags:** Correctly implemented and auto-generated on all pages
- **One H1 per page:** All 12 pages/templates have exactly one H1
- **All img tags have alt attributes:** No missing alt text (though quality needs improvement per C4)
- **No noindex on live pages:** Correct — only draft:true posts are excluded from build
- **Sitemap integration:** @astrojs/sitemap correctly installed and configured
- **Sitemap declared in robots.txt:** Correct URL pointing to sitemap-index.xml
- **Robots.txt:** No pages incorrectly blocked
- **Open Graph tags:** All 7 OG tags present on every page (blocked only by missing image file)
- **Twitter card:** summary_large_image set correctly
- **lang="en" on html element:** Set in BaseLayout.astro
- **Viewport meta:** Set correctly
- **Charset:** UTF-8 set
- **Service pages content depth:** All 5 individual service pages have 500–800 words of original, non-thin content
- **Internal linking (global nav):** Header and Footer link to all main pages
- **Form accessibility:** Contact form has proper label/for pairings and autocomplete attributes
- **Video accessibility:** Hero video has aria-hidden="true" (decorative)
- **Sitemap URL:** Correct canonical domain used throughout
- **No duplicate page titles:** All 11 page titles are unique
- **Astro @astrojs/sitemap:** v3.7.2 installed — current version
- **placeholder.md correctly filtered:** draft:true AND sitemap filter both exclude it
- **BlogLayout Article schema:** @context, @type, headline, datePublished, publisher present
- **Breadcrumb HTML:** Accessible nav with aria-label="Breadcrumb" on all interior pages

---

## Priority Order Summary

| Priority | Item | File(s) | Effort |
|----------|------|---------|--------|
| C1 | Remove placeholder text from /services | services/index.astro | 30 min |
| C2 | Create og-default.jpg (1200×630px) | /public/ | 1 hour |
| C3 | Fix homepage H1 — add keywords | index.astro | 10 min |
| C4 | Name the advisor everywhere (schema, alt, copy, author) | SEO.astro, about.astro, BlogLayout.astro, .md | 2 hours |
| C5 | Shorten blog post title (116→60 chars) | .md frontmatter | 5 min |
| W1 | Fix 8 page title lengths | 8 .astro files | 30 min |
| W2 | Fix 8 meta description lengths | 8 .astro files | 45 min |
| W3 | Complete LocalBusiness schema fields | SEO.astro | 30 min |
| W4 | Add missing Article schema fields | BlogLayout.astro | 20 min |
| W5 | Add BreadcrumbList JSON-LD | BaseLayout.astro | 1 hour |
| W6 | Rebuild sitemap to include blog post | CLI: astro build | 5 min |
| W7 | Improve /about H1 with advisor name | about.astro | 5 min |
| W8 | Add Nashville to blog index H1 | blog/index.astro | 5 min |
| W9 | Add contextual links on /process and /about | process.astro, about.astro | 30 min |
| W10 | Add og:image dimensions | SEO.astro | 10 min |
| W11 | Add WebSite schema | SEO.astro | 15 min |
| W12 | Fix future publishDate on blog post | .md frontmatter | 2 min |
| W13 | Add internal links within blog post body | .md content | 15 min |

---

*Generated by SEO Skill — Nashville Insurance Advisors — 2026-04-30*
