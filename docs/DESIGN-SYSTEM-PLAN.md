# PMEX design system plan

Goal: one centralized, reusable stylesheet (`dist/css/root.css`), 100% plain CSS, no Tailwind classes in any page,
target 3,000-5,000 lines. Small visual changes during the migration are accepted; structure and reuse come first.

## Resume here (state on 2026-11-13, branch `ds-phase-4`, pushed to `main` at d98b66c)

Phase 4 is done for every family: specialties, services + platform template, company, and the homepage (its CSS moved
to `css/legacy-home.css` because the homepage will be rebuilt; do not refactor the old homepage, do not touch that file).
root.css: 8,863 lines, 46.6% central (`node scripts/checks/css-report.js`).

Radius: the owner tried one 6px radius for everything (commit 5e93768) and asked for the previous corners back
(reverted in d337f1e). Keep the corner radii as they are; do not apply a single radius unless asked again. Deep regression is not needed for
intentional design changes (the owner redesigns every page one by one afterwards); refactors that should not change
the look still get a quick regression against HEAD on the pages they touch.

Next: phase 6, the final cleanup:
1. Restyle layers -> components: `injury-billing-bh` (18 service pages), `pmex-platform-bh` / `pmex-platform` /
   `pmex-platform-family` (7 platform pages), `service-pages-bh` + `service-detail` (8 pages). They override the
   template markup with structural selectors and `:is(... .u-x)` hooks. Give the elements named components with the
   final look (find it with the computed style), then delete the rules and the u-* classes they made redundant.
2. u-* utilities (~1,525 lines at the end of root.css): replace the remaining groups with components (`ds-compose.js`),
   drop the ones no page uses (`remove-dead-css.js` after `css-coverage.js`). Keep the ones scripts toggle.
3. Hooks: `:is()` lists and `[class*=...]` selectors that point at utilities (`prune-hooks.js`, then by hand).
4. `!important`: remove where the @layer order already decides.
5. Losing rules: `css-noop.js --blocks=all` then `--remove-only` (leave navbar, booking-modal, site-footer, services-mega).
6. Update this file, AGENTS.md if a rule changes, and report lines, KB and central share.

Tools: `scripts/build/` ds-compose.js (+ ds-components.js), class-noop.js, compact-css.js, prune-hooks.js,
merge-duplicate-rules.js, convert-service-template.js, remove-dead-css.js; `scripts/checks/` css-noop.js, css-report.js,
css-coverage.js, check-regression.js, check-css.js. Checks before a commit: `npm run check:css`, `gradients:check`,
`shell:check`, and `node scripts/checks/check-regression.js --ref=HEAD --widths=1440,390 <pages>`.

## Where we started (tag `css-baseline`, commit cf542c9)

| Problem | Size |
|---|---|
| Frozen Tailwind output (block `style`) | 10,313 lines, 2,233 utility classes |
| Tailwind classes in the HTML | 45,198 elements, 2,160 distinct class combinations, 120 pages |
| Duplicate page blocks (FAQ x5, motion x4, service pages x8) | ~2,500 lines |
| `!important` | 3,209 |
| `@media` blocks (one per rule) | 1,467 |
| Colors | 228 hex values named after their value (`--c-3F9A4B`) |

## Target structure of root.css

```
@layer tokens, base, layout, components, pages, utilities;

tokens      THEME colors (--theme-*), type scale, spacing, radius, shadows, transitions
base        reset, body, h1-h4, p, a, img, lists
layout      .container, .section (+ sizes), .grid-2/3/4, .stack, .split
components  button, card, section-head, hero, form, faq, tabs, chip, stats, check-list,
            logo-strip, testimonial slider, pricing, comparison table, header + mega menu,
            footer, booking modal
pages       only what is unique to one page
utilities   a few helpers used everywhere (text-center, visually-hidden)
```

Rules:
- Colors only through `var(--theme-*)` (legacy `var(--c-HEX)` still resolves, generated from THEME).
- Responsive rules live inside the component they change, mobile first.
- No `!important` outside utilities; the layer order decides.
- One class per role (`.card`, `.card-title`), modifiers with `--` (`.btn--link`, `.section--tint`).
- Every gradient names its color space (`in srgb`).

## Phases

| # | Phase | Status |
|---|---|---|
| 0 | Safety net: `npm run check:regression` (pixel + computed-style diff vs `css-baseline`) | done |
| 1 | THEME tokens: 18 `--theme-*` colors, every `--c-HEX` generated (`npm run theme:build`) | done (a5d50be) |
| 1b | Remove duplicate blocks (`scripts/build/dedupe-css-blocks.js`, `scripts/build/merge-css-blocks.js`) | done |
| 2 | Scale tokens + base layer | tokens done; base layer comes with step 5 (replaces Tailwind preflight) |
| 3 | Components library + migration of the pages (`@layer ds`) | done: 0 Tailwind classes in pages and scripts |
| 4 | Replace groups of `u-*` classes with components, family by family: specialties (template, ~70 pages) -> services -> platform -> company -> homepage | specialties done; services + platform template in progress (see Resume here) |
| 5 | Delete the Tailwind block and the tailwindcss packages | done |
| 6 | Remove `!important`, hacks and dead selectors; settle `@layer` order | |
| 7 | `npm run check:css` guard (no Tailwind classes, no color literals, size limit) + docs | |

## Tools

| Command | Purpose |
|---|---|
| `npm run theme:build` | regenerate legacy colors after editing the THEME block |
| `npm run gradients:check` | every gradient names its color space |
| `npm run check:regression [pages]` | visual and computed-style diff against `css-baseline` (`--cur=<dir>` tests a snapshot) |
| `node scripts/build/merge-css-blocks.js --name=<block> <blocks...>` | split near-identical blocks into shared + page-only blocks |
| `node scripts/build/dedupe-css-blocks.js` | drop exact duplicate and empty blocks |
| `node scripts/build/ds-compose.js` | apply `scripts/build/ds-components.js`: u-* combinations -> named components (CSS generated once, nested media/states), markup rewritten, unused u-* rules pruned. `--todo <scope>` lists what is left, `--css <classes>` previews |
| `node scripts/checks/css-report.js [--blocks]` | share of root.css that is central / family / page-only / utilities |

## Progress log

| Date | Step | root.css lines |
|---|---|---|
| 2026-11-11 | start | 23,596 |
| 2026-11-11 | THEME tokens | 23,636 |
| 2026-11-11 | duplicate blocks removed | 22,834 |
| 2026-11-11 | service pages merged (8 blocks -> service-detail, service-rcm, service-analytics) | 21,563 |
| 2026-11-11 | FAQ blocks merged (site-faq + site-faq-extra) | 21,244 |
| 2026-11-11 | 83 pages load the marquee partial instead of an inline copy (HTML -26,375 lines) | 21,244 |
| 2026-11-11 | scale tokens; `style` block split into `tailwind` (generated) + `style` (custom); `ds` layer | 21,290 |
| 2026-11-11 | Tailwind -> design system: FAQ (3,368 el.), text roles (11,397 el.), components (6,150 el.); Tailwind elements 40,379 -> 17,586 | 21,447 |
| 2026-11-11 | remaining 17,586 elements and 22 scripts -> `u-*` classes (1,691, generated, one line each); Tailwind block, `src/input.css` and the tailwindcss packages removed; Tailwind reset kept as `[data-css]` reset | 14,217 |
| 2026-11-11 | `npm run check:css` guard; css-coverage.js (120 pages x 4 widths): 879 of 7,062 rules never used; the 324 that cannot match any markup removed (incl. the unused `.c-HEX` color classes) | 13,910 |
| 2026-11-12 | phase 4, specialties: 204 components (hero, showcase, orbit, metric tiles, trust badges, cards, audit form, testimonial slider, comparison, data lists); u-* elements on specialty pages 13,427 -> 3,731; brand fill rule; 6 invalid rules that never applied dropped; commented-out markup removed; central 36.6% -> 40.8% | 14,639 |

Phase 4 notes:
- Shared blocks (style, reference-typography ...) hook on utilities through `:is(..., .u-x)` lists. What such a rule gave an
  element is written into the component (example: the `brand fill` rule for green surfaces), never by adding the component
  to the shared list. Page blocks used by up to 10 pages get the component added to their lists (ds-compose does it).
- Variants that look alike are kept apart when merging them moves content (padding, margin, gap, max-width): the
  regression check against `main` shows it as a shift of everything below.
- The spec replays: `git checkout main -- <pages>`, strip commented-out markup, `node scripts/build/ds-compose.js`.
- The line count rises during this family (new components, while the u-* rules stay used by other families); it
  falls when services, platform and company reuse the components and their page blocks go.

Remaining unused rules (555) belong to hidden elements (modal, menus) or script states, or to page structures that
changed; they are reviewed by hand while consolidating the page blocks (phase 4/6).

## Design-system layer (`@layer ds`, end of root.css)

The `ds` layer comes right after Tailwind's `utilities` layer, so a design-system class has the same priority as the
utilities it replaces. Classes (no Tailwind names, no color literals):

| Group | Classes |
|---|---|
| Text size (grows one step from 640px) | `t-2xs t-xs t-sm t-base t-md t-lg t-xl t-2xl t-h2 t-3xl t-4xl` |
| Text color | `t-text t-muted t-subtle t-strong t-ink t-accent t-light t-white t-orange t-warning t-danger` |
| Weight, line height, case, align | `fw-normal..fw-extrabold`, `lh-tight lh-snug lh-normal lh-relaxed lh-loose`, `t-caps ls-wide ls-tight t-italic`, `ta-left ta-center ta-right` |
| Spacing steps (2/4/8/12/16/24/32px) | `mt-* mb-* gap-*` with `2xs xs sm md lg xl 2xl` |
| Layout | `row row-top row-stretch stack row-wrap between fluid grid-3 rel raise clip fill-h deco-layer` |
| Components | `chip check-dot icon icon-xs/sm/md icon-fill icon-stroke card card--lift card-foot panel input section-rule section-head bg-white` |

Migration tools: `node scripts/build/tw-migrate.js --todo` lists the most used Tailwind combinations left;
`scripts/build/tw-map.json` maps an exact combination to classes; `scripts/build/tw-rules.js` maps whole families
(text-only lists today). CSS selectors in older blocks that still point at a migrated utility are rewritten to also
match the new class (`[class*="uppercase"]` -> `:is([class*="uppercase"], .t-caps)`).
