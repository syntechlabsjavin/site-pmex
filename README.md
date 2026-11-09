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
| Section top and bottom padding (the hero too) | `pmex-section` | 32px | 32px | 40px |
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
- Home page platform section (`pmex-plat-*`, script `js/platform-stack.js`): four cards, no tabs. On screens 1024px+ wide where a card fits under the header the script adds `is-stacking`: every card is sticky, 24px lower than the previous one, gets the height of the tallest card and slides up over the previous one while scrolling; a covered card scales down slightly. Elsewhere the cards simply follow each other. The cards carry `data-typography-own`, which tells `js/reference-typography.js` not to give their text the card roles.
- The hero uses `pmex-section` like every other section; there is no separate hero padding. On the home page the floating hero cards (1024px and up) always stay at least 24px to the right of the hero text.
- Cards with an offset backing plate (the home page "Medical billing results" cards): the plate points outwards, and the card is pulled in by the same amount (12px from 768px, 8px on mobile) so the outer edge of the plate sits on the content line.
- Home page "Claims lifecycle" (`pmex-flow-*`, script `js/claims-flow.js`): a step track (five numbered dots) above one detail panel. On screens 1024px+ wide where the stage fits under the header it sticks there and every 360px of scrolling opens the next step; the track line fills with the scroll and a click scrolls to that step. Elsewhere the steps are click tabs. The panels share one grid cell, so the box keeps the tallest step height.
- Home page colour (`home-neutral` block, listed last in `index.html` data-css): green is only a minimal accent. It stays on section eyebrows, icons, checkmarks, primary buttons, the hero emphasis and live/status dots. Pale and near-white green fills become #F4F5F3 / #FAFAFA, green-tinted borders #E0E0DA, other green text #505050, and secondary pills become neutral outline buttons. Remove `home-neutral` from the data-css to switch the re-skin off.
- Page-specific fixes go in their own block (for example `home-responsive` for `index.html`), not in `layout`.

### Not part of this system

- **Trusted companies logo marquee** (`dist/partials/marquee.html`): keeps its own padding (24px top and bottom) and layout. Do not add section padding, margins or `pmex-*` layout classes around or inside it.
- Footer (`dist/partials/footer.html`).

### Header

The header (`dist/partials/header.html`, styles in the `navbar-d90c332f` block) uses the same max width (1260px) and side padding (20px / 24px / 40px) as `pmex-container`, so the logo and the phone number line up with the page content on every screen. The open hamburger menu (up to 1200px) uses the same side padding.

- Logo: the same file as the footer logo, `img/logo/grey-logo.svg`, 48px tall (44px up to 1200px). The file has empty space on the left, so the image is pulled left (`margin-left`) and the mark itself starts on the content line.
- PMEX Portal button: a user icon and the label "PMEX Portal" on the site pill gradient (`--grad-pill`, `--grad-a` on hover), dark green text.

### Checking a page

Check every page at 1440, 1280, 1024, 768, 390 and 360px wide: no horizontal scroll, content edges that line up from section to section, the same section padding everywhere, and text that does not overlap images.

### Pages converted

| Page | Blocks added to `data-css` |
|---|---|
| `dist/index.html` | `layout home-responsive` |
