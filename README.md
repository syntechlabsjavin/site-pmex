# PMEX website

Static marketing site for PMEX. The deployable folder is `dist/` (uploaded to cPanel as it is). Content and design rules: [AGENTS.md](AGENTS.md).

```
npm install
npm run serve     # http://localhost:8001 (serves dist/)
```

## Folder layout

| Path | What lives there |
|---|---|
| `dist/index.html`, `dist/404.html` | Homepage and error page |
| `dist/company/`, `dist/services/`, `dist/specialties/`, `dist/platform/` | Pages by category |
| `dist/css/root.css` | The single stylesheet (see AGENTS.md) |
| `dist/js/` | Page scripts; `site-shell.js` loads the shared header, marquee and footer |
| `dist/partials/` | `header.html`, `marquee.html`, `footer.html` |
| `dist/img/`, `dist/icons/`, `dist/fonts/` | Images, shared SVG sprite, Inter fonts |
| `src/input.css` | Old Tailwind input; its output is frozen in root.css (block `style`) |
| `scripts/build/` | Scripts that change pages |
| `scripts/checks/` | Read-only checks (write JSON to `reports/`) |
| `scripts/lib/pages.js` | Finds pages in the category folders |

All links use root-absolute paths (`/css/root.css`, `/specialties/cardiology.html`), so the site must be served from the domain root over http(s).

## Common commands

```
npm run shell:check      # no page carries an inline header / marquee / footer
npm run shell:sync       # turn an inline header / marquee / footer into loader tags
npm run check:typography # typography + horizontal overflow at 1440, 768, 320
npm run check:buttons    # shared button styles
npm run icons:check      # no decorative emoji
```
