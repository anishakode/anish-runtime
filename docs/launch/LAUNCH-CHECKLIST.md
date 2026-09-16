# Launch checklist (M26)

`pnpm smoke:live <origin>` covers everything a script can honestly assert. This file
covers the rest — the judgements a human has to make on the live site.

Run the smoke first; if it fails, stop and fix the origin configuration.

## Automated (pnpm smoke:live)

- [ ] 38/38 checks pass against the production origin
- [ ] The run was against the **final** origin, not a preview URL

## On a real phone

- [ ] Landing states who Anish is in the first viewport without scrolling
- [ ] Primary nav reaches Work · Experience · About · CV · Contact
- [ ] Tapping a project opens the detail page with evidence badges legible
- [ ] One lab (MLOps) runs and recovers from an incident
- [ ] Nothing overflows horizontally in portrait

## Keyboard and assistive technology

- [ ] Tab from page load reaches "Skip to content" first, and it moves focus to main
- [ ] Focus stays visible under the sticky header while tabbing through Work
- [ ] A screen reader announces evidence states as text, not colour alone
- [ ] Reduced motion (OS setting) settles the landing without staged compilation

## Print

- [ ] `/cv` prints on one to two pages with no site chrome and no clipped content

## Truth, read as a stranger

- [ ] No claim reads stronger than its evidence state
- [ ] Labs are labelled `PORTFOLIO_EXTENSION`, not presented as production systems
- [ ] The Failure Museum's empty state reads as honest, not broken
- [ ] Contact shows only the canonical email; the excluded address appears nowhere
- [ ] The social card preview (paste the URL into Slack, WhatsApp, LinkedIn) shows the
      name, tagline, and graph counts — and resolves at all

## Fallbacks

- [ ] With JavaScript disabled in the browser, Work / Experience / About / CV / Contact
      still render and navigate
- [ ] ASK RUNTIME still returns deterministic results without using INTERPRET WITH SIGNAL
- [ ] A refused or failing Signal call leaves the page usable and shows a gap notice
      rather than an error state

## Performance, live

- [ ] Landing is interactive quickly on a mid-range phone over 4G (Lighthouse mobile, or
      Chrome DevTools throttling)
- [ ] Largest Contentful Paint is text, not a late-loading asset
- [ ] No console errors and no CSP violations on any route

## Indexing, after DNS settles

- [ ] `https://<origin>/robots.txt` and `/sitemap.xml` resolve publicly
- [ ] Search Console (or equivalent) accepts the sitemap
- [ ] `/ending`, `/surface`, `/fork`, `/interview` are reported as excluded by `noindex`
- [ ] The site appears for a search of the exact name once indexed (days, not hours)

## Public presence

- [ ] GitHub profile website field points at the live origin
- [ ] Flagships pinned: MLOps Governance Dashboard · Steward_AI · Explainable PDF Malware
      Detection (+ Boring_AI if a fourth pin is wanted); archive repos unpinned
- [ ] Each pinned repo has a description, topics, homepage, and a real README
- [ ] LinkedIn featured link points at the live origin
- [ ] Nothing in any public profile contradicts the frozen canonical identity

## After launch

- [ ] Monitoring only where it is truthful and privacy-compatible — uptime checks are
      fine; visitor analytics would contradict the zero-tracking claims the site makes
- [ ] Record the live URL in `README.md` and in the M26 report
- [ ] Any copy change made in launch week goes through `pnpm freeze:check`
