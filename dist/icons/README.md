# Shared site icons

- `catalog.json` is the editable source: each key identifies one SVG drawing.
- `site-icons.svg` is the generated browser asset. Do not edit it directly.
- Preserve each icon's existing outer `<svg>` attributes (viewBox, classes, stroke, fill, accessibility and dimensions). Reference its drawing inside:

```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
  <use href="./icons/site-icons.svg#chevron-down-wide"></use>
</svg>
```

Use an ID that exists in catalog.json; chevron-down-wide above is an existing drawing. Use descriptive names such as `receipt`, `phone`, `document-lines`, and `specialty-body-heart-organ`. Add new drawings to catalog.json under a descriptive kebab-case name before running the sharing command. No hash IDs are generated.

After editing the catalog, run `npm run icons:share` to rebuild the SVG asset. Run `npm run icons:shared:check` to check references and generated output. Serve the site through its HTTP server so external SVG references can load.

The sharing script converts static SVG icons, including single-use icons, in pages, runtime JS, shared templates and page generators. New icons receive readable names based on their page and nearby heading; these may be renamed in the catalog and their references. It leaves graphics with internal IDs, styling, animation, accessibility titles, or individually controlled paths inline to preserve their behavior. Logos and raster images keep their existing assets. Navigation and specialty generator helpers also reference this shared file.

Existing specialty artwork attribution remains in `scripts/specialty-icons-source.md`.
