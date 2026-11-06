# Specialty pages: colors, fonts and styling

Applies to the six pages imported from the `Pmex_content` repo:
`physical-therapy.html`, `cardiology.html`, `orthopedic.html`, `chiropractic.html`, `behavioral-health.html`, `mental-health-billing.html`.

These pages are styled with Tailwind utility classes and inline values written directly in the HTML. They load only `./style.css` (compiled from `src/input.css`) and the shared scripts in `./js/`. They do not use `reference-typography.css`, `specialty-site-palette.css` or the per-specialty CSS files.

## Color palette

Source for this inventory: `dist/specialties/behavioral-health.html` (page body plus shared site shell on that page).

| Role | Hex | Where it is used |
| --- | --- | --- |
| Primary green | `#3F9A4B` | Links, icons, check marks, emphasis text, outlines on hover |
| Dark green | `#2E4A25` | Strong headings and labels on light cards; button text on light green fills |
| Button text green | `#464A25` | Primary button text on `#AAD39C` fills (nav demo and shared CTA wording) |
| Deepest green | `#1B3316` | Darkest text on green fills and process card titles |
| Light green | `#AAD39C` | Main accent: button fills, highlight chips, borders, dividers, icon strokes |
| Soft green | `#9ED08D` | Secondary light accent; nav demo gradient; step number gradients |
| Mid soft green | `#A1D190` | Checklist / list icon hover fill |
| Form submit hover | `#96C488` | Free audit form submit button hover |
| Nav demo hover | `#8FC47C` | Schedule a Demo nav button hover gradient |
| Footer social hover | `#7FB35C` | Footer social icon hover |
| Eyebrow green | `#3F9A4B` | Small uppercase eyebrow labels |
| Scrollbar green | `#C2D8B9` | Specialties dropdown scrollbar |
| Heading and body text | `#505050` | Headings and main body text |
| Secondary text | `#676767` | Descriptions, captions; specialties panel links |
| Muted text | `#959085` | Placeholders, quiet labels |
| Dark text (alt) | `#2A3828` | Testimonial slider controls and quote marks |
| Nav dropdown text | `#374151` | Shared header dropdown link text |
| Nav promo text | `#1F2937` | Shared header Resources promo card titles |
| Page tint | `#F8FBF0` | Light card and section backgrounds |
| Section background | `#EEF0E8` | Alternate section bands, pill backgrounds |
| Soft grey section | `#FAFAFA` | Light alternate section band |
| Soft grey arc | `#F4F5F3` | Decorative arc background in a lower section |
| Soft green wash | `#F7FCF5` | Table row / panel hover wash |
| Soft green mid | `#F5F7F0` | Soft green gradient mid stop |
| Soft green mid 2 | `#E4E9DC` | Soft green gradient end stop |
| Soft sage border wash | `#E0E5D5` | Positive outcome card gradient |
| Soft green-grey card | `#EDEFE7` | Audit form and card gradient start |
| Soft green-grey card 2 | `#EDEFE8` | Card hover gradients and process card tops |
| Warm card border | `#EDEAE0` | Card borders |
| Border | `#E0E0DA` | General borders and dividers |
| Cool borders | `#D8DCE3`, `#D3D7DF`, `#E8EAED` | Form fields, table lines, cool card gradients |
| White | `#FFFFFF` | Cards |
| Hero emphasis orange | `#E85D3F` | One emphasized word in the hero H1 only |
| Accent orange | `#D9713C` | Small figures and labels in data rows |
| Loss red | `#DC2626` | Negative metric figures and “Watch” labels |
| Loss coral | `#F87171` | Loss card top border and progress bar start |
| Loss wash | `#FFF5F5`, `#FFF0F0`, `#FFE8E8` | Loss / leakage card background gradient |
| Nav blog badge | `#1D4ED8` on `#DBEAFE` | Shared header Resources “Blog” chip |
| Nav testimonials badge | `#15803D` on `#DCFCE7` | Shared header Resources “Testimonials” chip |

Rule of thumb: green for action and emphasis, grey (`#505050` / `#676767`) for text, pale tints for backgrounds, orange for the hero emphasis word and a few data labels, red only for loss / leakage figures.

## Fonts

- **Family:** Inter everywhere. Loaded locally from `dist/fonts/static/` (Inter 18pt Regular, Medium, SemiBold and others declared in `src/input.css`). There is no Google Fonts link.
- **Weights in use:** mostly 400 (Regular). Medium (500) for small labels and buttons, SemiBold (600) and Bold (700) for card titles and strong text.

### Measured sizes (rendered in the browser)

| Element | Desktop (1440px) | Mobile (390px) | Weight | Color |
| --- | --- | --- | --- | --- |
| H1 (hero) | 36px, line-height 1.2 | 22px | 400 | `#505050` |
| H2 (section) | 36px, line-height 1.2 | 22px | 400 | `#505050` |
| Eyebrow label | about 13px, uppercase, wide letter spacing | 11px | 500 | `#3F9A4B` |
| Body text | about 16px (estimated from the render, not measured) | about 14 to 16px (estimated) | 400 | `#505050` / `#676767` |
| Buttons and nav | 13 to 14px | 13px | 400 to 500 | `#464A25` on `#AAD39C` |
| Small card text | 11 to 14px | 11 to 14px | 400 to 500 | `#505050` |

## Shapes and effects

- Cards: white, 1px border `#EDEAE0` or `#E0E0DA`, rounded corners (`rounded-2xl`, 16px), soft shadow.
- Buttons: fully rounded pills. Primary button fill `#AAD39C` with dark text `#464A25`. Login or secondary buttons use `#EEF0E8`.
- Highlight chips in headings (the green band behind "Each Procedure Coded Right"): `#AAD39C` at low opacity with `#3F9A4B` text and a small green icon.
- Hero: full-width photo with a white-to-transparent gradient on the left so text stays readable.
- Logo marquee under the hero: logos in grayscale at low opacity, turning to full color on hover.

## Known gaps in the imported pages

These files are referenced by the new pages but do not exist in the site (they are also missing in the `Pmex_content` repo):

- `js/testimonial-slider.js` (all six pages)
- `img/logo/logo.png` (all six pages)
- `img/Dedicated-Support.svg` (cardiology only)

The pages render without them, but the testimonial slider will not animate until the script is added.
