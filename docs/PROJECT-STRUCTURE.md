# Project structure

PMEX is a static site. `dist/` is exactly what gets uploaded to the web server (cPanel). Run every
command from the repository root.

## dist/ (the deployable site)

All internal links and assets use root-absolute paths (`/css/root.css`, `/img/...`,
`/specialties/cardiology.html`). The site must be served from the domain root.

| Folder | What lives there |
|---|---|
| `index.html` | Homepage |
| `company/` | about, careers, contact, customers, testimonials, pricing, blogs, resources, demo, login |
| `services/` | Services hub (`index.html`) and all 33 service pages: billing / RCM, practice-size solutions (small-practices, large-practices, physician-billing-services, hospital-billing-services) and injury billing (mva, personal-injury, pip-no-fault, workers-comp). These match the Services dropdown. |
| `specialties/` | Specialties hub (`index.html`) and one page per medical specialty |
| `platform/` | PMEX platform and the pmex-* product pages |
| `css/` | `root.css`, the single stylesheet (see AGENTS.md) |
| `js/` | Page scripts |
| `img/`, `icons/`, `fonts/` | Images, the shared SVG sprite (`icons/site-icons.svg`), fonts |

File names are unique across the site, so scripts accept a bare name such as `cardiology.html`.

## Other folders

| Path | Purpose |
|---|---|
| `src/` | Tailwind input (`input.css`) and font/image sources |
| `scripts/build/` | Scripts that change pages: shell sync, button styles, icon sharing, content import, restyle |
| `scripts/checks/` | Read-only checks: typography, buttons, content layout |
| `scripts/lib/pages.js` | Shared helper that finds pages in the category folders |
| `scripts/archive/` | One-off migration scripts kept for reference. Not maintained; do not run them blindly |
| `reports/` | JSON output written by the check scripts |
| `docs/` | Style guides, colour reference, agent prompt |

## Common commands

```
npm run serve            # http-server on http://localhost:8001 (serves dist/)
npm run shell:check      # no page carries an inline header / marquee / footer
npm run shell:sync       # turn an inline header / marquee / footer (new page) into loader tags
npm run check:typography # typography + horizontal overflow at 1440, 768, 320
npm run check:buttons    # shared button styles
npm run icons:check      # no decorative emoji
```

## Header, marquee and footer (single source)

The shared shell lives once in `dist/partials/`: `header.html` (header with the Specialties and Services dropdowns), `marquee.html` and `footer.html`. A page does not contain a copy; it contains a loader tag where the block belongs, for example `<script src="/js/site-shell.js" data-include="header"></script>`. While the page is parsed, `dist/js/site-shell.js` reads `/partials/header.html`, puts it in that spot and removes the tag, so the shell is in the DOM before the other scripts run. To change the header, footer or marquee, edit the partial; no sync is needed. The site must be served over http(s); the loader does not work from `file://`. Up to 1200px wide (where the hamburger shows) `site-shell.js` moves the PMEX Portal button and the phone number into the hamburger menu; on wider screens they stay in the header bar.

Every page has the header include; marquee and footer includes are present where the page has them (demo and login have neither). The footer is the behavioral-health footer. `npm run shell:sync` only matters for a new page that still has an inline header, marquee or footer.

## Shared component classes

Repeated styling is written once as a class in `dist/css/root.css` instead of being copied into every page as an inline `style=""` or a `<style>` block. Classes added for this carry the `pmex-` prefix. The header uses `pmex-nav-*` (for example `pmex-nav-link`, `pmex-nav-panel`); their rules live in the `navbar-d90c332f` block next to the other header rules. Do not add `<style>` blocks or inline `style` attributes to `dist/partials/*`.

Classes used on more than one element of a page live in the `pmex-common` block of `root.css`; a page that uses them lists `pmex-common` in its `<html data-css>`.

No page or partial carries a `style=""` attribute any more. Every former inline style is a class in the `pmex-common` block at the end of `root.css`:

- `pmex-st-<hash>`: one class per distinct inline style; a style used on several pages is one class shared by all of them.
- `pmex-hero-<page>` (or `pmex-hero-shared-<hash>`): the hero image variables (`--hero-bg-*`, `--bh-hero-image`) of a page.
- hand-named classes such as `pmex-accent-bar`, `pmex-res-card-body`.

A page that uses these lists `pmex-common` in its `<html data-css>`. Each rule is preceded by a comment with the page(s) that use it.

Things to know when you touch this:

- About 40 rules in `root.css` used to select elements by the text of their inline style (`[style*="font-size:12px"]` and so on). They are written as `:is([style*="..."], .pmex-hook-N)` now; `.pmex-hook-N` are empty marker classes that sit on the elements whose inline style used to match. The comment at the top of the block lists the needle for each N. Do not delete a marker class from an element.
- A class loses to a more specific rule where an inline style used to win. Where that happened the class declaration is `!important`. One class (`pmex-st-eed732`) came from an inline `!important`, which beats `!important` rules inside `@layer`; it lives in the first layer, `pmex-inline`, declared at the top of `root.css`.
- Do not add `style=""` attributes to pages. Add a class to the matching block of `root.css`.

## Icons

Repeated SVG artwork is stored once in `dist/icons/site-icons.svg` and used as `<svg ...><use href="/icons/site-icons.svg#name"></use></svg>`. `npm run icons:share` converts simple inline SVGs and rebuilds the sprite; `npm run icons:shared:check` verifies it. SVGs with `<text>`, `<defs>`, gradients, ids or classes inside stay inline.

## Adding a page

1. Put the file in the matching category folder under `dist/`.
2. Use root-absolute paths for the stylesheet, scripts, images and links.
3. Copy `data-css` from a sibling page of the same family.
4. Run `npm run shell:sync` (converts an inline header, marquee or footer to loader tags) and the checks above.
