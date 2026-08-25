import type { APIRoute } from 'astro';
import { BRAND } from '../consts';

const body = `# ${BRAND.name}

> Independent insurance advisory firm serving the Nashville, Tennessee metro area. We review home, auto, life, long-term care, Medicare, small business, and retirement income coverage — by appointment only, no walk-ins.

${BRAND.name} is an independent advisory practice, not a captive agent for any single carrier. We work with multiple carriers and our recommendations are based on each client's specific situation. Our process — the Coverage Roadmap — is a structured four-stage review: Coverage Check, Quote & Bind, Coverage Roadmap Review, and an Annual Life Review scheduled in each client's onboarding anniversary month.

Licensed in Tennessee: Property & Casualty.
Phone: ${BRAND.phone}
Email: ${BRAND.email}

## Core Pages

- [Home](${BRAND.url}/): Overview of the independent advisory approach and the Coverage Roadmap process.
- [About](${BRAND.url}/about): Background on the advisory practice and its approach to coverage reviews.
- [Our Process](${BRAND.url}/process): Full explanation of the Coverage Roadmap — Coverage Check, Quote & Bind, Coverage Roadmap Review, and the Annual Life Review. Two entry points: Fast Track and Roadmap First.
- [Contact](${BRAND.url}/contact): Schedule a Coverage Check or send a message.

## Services

- [Home & Auto Insurance](${BRAND.url}/services/home-auto): Dwelling coverage, wind/hail deductibles, umbrella, and auto review for Nashville homeowners.
- [Life Insurance](${BRAND.url}/services/life-insurance): Term and permanent life insurance review for individuals and families.
- [Long-Term Care Insurance](${BRAND.url}/services/long-term-care): Traditional and hybrid long-term care coverage planning.
- [Medicare Planning](${BRAND.url}/services/medicare): Medicare Supplement (Medigap) vs. Medicare Advantage comparison and enrollment guidance.
- [Retirement Income Planning](${BRAND.url}/services/retirement-income): Guaranteed income strategies, Social Security timing, and retirement income gap analysis.
- [Small Business Insurance](${BRAND.url}/services/small-business): Business Owners Policy, workers' comp, professional liability, and commercial auto for Tennessee small businesses.

## Resources

- [Ask the Advisors](${BRAND.url}/ask): Plain-language answers to common insurance questions across all coverage lines.
- [Blog](${BRAND.url}/blog): Articles on home insurance, Medicare, life insurance, retirement income, and small business coverage in Nashville.
- [Areas We Serve](${BRAND.url}/neighborhoods/): Neighborhood-specific coverage context for Brentwood, Franklin, Nolensville, Hendersonville, Green Hills, Bellevue, Mount Juliet, Spring Hill, Murfreesboro, and Hermitage.

## Service Area

Nashville metro area, Tennessee. Communities served include Brentwood, Franklin, Nolensville, Hendersonville, Green Hills, Bellevue, Mount Juliet, Spring Hill, Murfreesboro, and Hermitage. By appointment only — no physical office.
`;

export const GET: APIRoute = () =>
  new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
