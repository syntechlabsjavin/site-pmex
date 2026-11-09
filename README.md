# PMEX website

## Layout and spacing standards

Every page uses the same container, section spacing and gaps. The values live once, as CSS variables and classes in the `layout` block of `dist/css/root.css`. A page that uses them lists `layout` in `<html data-css="...">` (after `pmex-common`).

### Breakpoints

| Name | Width |
|---|---|
| Mobile | below 640px |
| Tablet | 640px to 1023px |
| Laptop and desktop | 1024px and up |

### Values

| What | Class | Mobile | Tablet | Laptop / desktop |
|---|---|---|---|---|
| Container max width | `pmex-container` | 1260px | 1260px | 1260px |
| Container side padding | `pmex-container` | 20px | 24px | 40px |
| Section top and bottom padding | `pmex-section` | 32px | 32px | 40px |
| Hero top and bottom padding | `pmex-hero` | 40px | 48px | 56px |
| Section heading to content | `pmex-section-head` | 32px | 32px | 40px |
| Gap between cards in a grid | `pmex-card-grid` | 16px | 16px | 16px |
| Gap between the two columns of a split layout | `pmex-split` | 32px | 40px (from 768px) | 48px |

### How to use them

```html
<section class="pmex-section ...">
  <div class="pmex-container">
    <div class="pmex-section-head text-center ...">
      <p>Eyebrow</p>
      <h2>Section heading</h2>
      <p>Intro text</p>
    </div>
    <div class="pmex-card-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      ...cards...
    </div>
  </div>
</section>
```

- Put `pmex-section` on the `<section>` and `pmex-container` on its inner wrapper. Do not add Tailwind `py-*` / `px-*` / `max-w-[1260px]` / `mx-auto` classes next to them.
- `pmex-section-head` goes on the block that holds the eyebrow, heading and intro. The element right after it gets no top margin, so do not add `mt-*` to it.
- `pmex-card-grid` and `pmex-split` set only the gap. Keep the grid columns (`grid-cols-*`) on the element.
- Sections touch each other directly; spacing comes from the section padding, never from margins between sections.
- Sticky scroll scenes (the claims lifecycle and the platform tabs on the home page) keep a smaller top padding on tablet and up so the scene fits the screen: 24px top / 20px bottom for the platform scene.
- Page-specific fixes go in their own block (for example `home-responsive` for `index.html`), not in `layout`.

### Not part of this system

- **Trusted companies logo marquee** (`dist/partials/marquee.html`): keeps its own padding (24px top and bottom) and layout. Do not add section padding, margins or `pmex-*` layout classes around or inside it.
- Footer (`dist/partials/footer.html`).

### Header

The header (`dist/partials/header.html`, styles in the `navbar-d90c332f` block) uses the same max width (1260px) and side padding (20px / 24px / 40px) as `pmex-container`, so the logo and the phone number line up with the page content on every screen. The open hamburger menu (up to 1200px) uses the same side padding. The PMEX mark in the Portal button takes the button's dark green text colour.

### Checking a page

Check every page at 1440, 1280, 1024, 768, 390 and 360px wide: no horizontal scroll, content edges that line up from section to section, the same section padding everywhere, and text that does not overlap images.

### Pages converted

| Page | Blocks added to `data-css` |
|---|---|
| `dist/index.html` | `layout home-responsive` |
