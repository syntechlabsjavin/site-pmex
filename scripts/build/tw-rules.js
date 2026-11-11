// Rules that turn a Tailwind utility list into design-system classes (see the ds layer at the end of root.css).
// rules(utils) returns the new class string, or null when the list is not covered by a rule.
// Covered today: text-only lists (size, color, weight, line height, letter spacing, case, alignment, margins).
// Sizes, spacing and colors snap to the design-system scale; small visual shifts are accepted (see
// docs/DESIGN-SYSTEM-PLAN.md).

// ---- scales ----
// font size of the list at mobile width -> t-* class
function sizeClass(utils) {
  const px = u => { const m = u.match(/^text-\[(\d+(?:\.\d+)?)px\]$/); if (m) return +m[1]; return { 'text-xs': 12, 'text-sm': 14, 'text-base': 16, 'text-lg': 18, 'text-xl': 20, 'text-2xl': 24, 'text-3xl': 30, 'text-4xl': 36 }[u]; };
  const base = utils.filter(u => !u.includes(':')).map(px).find(v => v !== undefined);
  const lg = utils.filter(u => /^(md|lg|xl):/.test(u)).map(u => px(u.replace(/^\w+:/, ''))).find(v => v !== undefined);
  if (base === undefined) return '';
  if (base >= 20 && base <= 24 && lg >= 34) return 't-h2';
  if (base <= 10) return 't-2xs';
  if (base < 12) return 't-xs';
  if (base < 13) return 't-sm';
  if (base < 14) return 't-base';
  if (base < 16) return 't-md';
  if (base < 18) return 't-lg';
  if (base < 22) return 't-xl';
  if (base < 26) return 't-2xl';
  if (base < 34) return 't-3xl';
  return 't-4xl';
}
const COLORS = {
  '505050': 't-text', '676767': 't-muted', '3F9A4B': 't-accent', '2E4A25': 't-strong', 'FFFFFF': 't-white',
  '959085': 't-subtle', '888888': 't-subtle', '1B3316': 't-ink', '2A3828': 't-ink', 'AAD39C': 't-light',
  'E85D3F': 't-orange', 'D9713C': 't-orange', 'E9B62C': 't-warning', 'DC2626': 't-danger', 'EF4444': 't-danger',
};
function colorClass(hex) {
  if (COLORS[hex]) return COLORS[hex];
  // other greys and greens: nearest role by lightness and hue
  const [r, g, b] = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
  const l = (Math.max(r, g, b) + Math.min(r, g, b)) / 2, sat = Math.max(r, g, b) - Math.min(r, g, b);
  if (l > 225) return 't-white';
  if (sat > 40 && g >= r && g >= b) return l < 90 ? 't-strong' : 't-accent';
  if (l < 75) return 't-ink';
  if (l < 105) return 't-text';
  if (l < 130) return 't-muted';
  return 't-subtle';
}
const WEIGHT = { 'font-normal': 'fw-normal', 'font-medium': 'fw-medium', 'font-semibold': 'fw-semibold', 'font-bold': 'fw-bold', 'font-extrabold': 'fw-extrabold' };
function leadingClass(u) {
  const named = { 'leading-none': 'lh-tight', 'leading-tight': 'lh-tight', 'leading-snug': 'lh-snug', 'leading-normal': 'lh-normal', 'leading-relaxed': 'lh-relaxed', 'leading-loose': 'lh-loose', 'leading-[relaxed]': 'lh-relaxed' }[u];
  if (named) return named;
  const v = +((u.match(/^leading-\[([\d.]+)\]$/) || [])[1]);
  if (!v) return '';
  return v <= 1.25 ? 'lh-tight' : v < 1.45 ? 'lh-snug' : v < 1.58 ? 'lh-normal' : v < 1.75 ? 'lh-relaxed' : 'lh-loose';
}
// margin steps: spacing units (1 = 4px) -> 2xs .125rem, xs .25, sm .5, md .75, lg 1, xl 1.5, 2xl 2
function spaceStep(n) { return n <= 0.5 ? '2xs' : n <= 1 ? 'xs' : n <= 2.5 ? 'sm' : n <= 3.5 ? 'md' : n <= 5 ? 'lg' : n <= 7 ? 'xl' : '2xl'; }

const TEXT_ONLY = /^((sm|md|lg|xl):)?(text-\[\d+(\.\d+)?px\]|text-(xs|sm|base|lg|xl|2xl|3xl|4xl)|text-\[var\(--c-[0-9A-F]{6}\)\]|text-(left|center|right)|font-(normal|medium|semibold|bold|extrabold)|leading-[\w.\[\]-]+|tracking-[\w.\[\]-]+|uppercase|italic|m[tb]-[\d.]+|first:mt-0|block|inline-block)$/;

function textRule(utils) {
  if (!utils.every(u => TEXT_ONLY.test(u))) return null;
  // responsive variants other than font size (sm:mb-8, md:text-left) are not covered yet
  if (utils.some(u => /^(sm|md|lg|xl):/.test(u) && !/^(sm|md|lg|xl):text-\[\d/.test(u) && !/^(sm|md|lg|xl):text-(xs|sm|base|lg|xl|2xl|3xl|4xl)$/.test(u))) return null;
  const out = [sizeClass(utils)];
  for (const u of utils.filter(x => !x.includes(':'))) {
    let m;
    if ((m = u.match(/^text-\[var\(--c-([0-9A-F]{6})\)\]$/))) out.push(colorClass(m[1]));
    else if (WEIGHT[u]) out.push(WEIGHT[u]);
    else if (u.startsWith('leading-')) out.push(leadingClass(u));
    else if (u === 'uppercase') out.push('t-caps');
    else if (u.startsWith('tracking-')) out.push(/tight|-0\.0|\[-/.test(u) ? 'ls-tight' : utils.includes('uppercase') ? '' : 'ls-wide');
    else if ((m = u.match(/^text-(left|center|right)$/))) out.push('ta-' + m[1]);
    else if ((m = u.match(/^m([tb])-([\d.]+)$/))) out.push(`m${m[1]}-${spaceStep(+m[2])}`);
    else if (u === 'italic') out.push('t-italic');
    else if (u === 'block') out.push('d-block');
    else if (u === 'inline-block') out.push('d-inline-block');
  }
  if (utils.includes('first:mt-0')) out.push('first-mt-0');
  return [...new Set(out.filter(Boolean))].join(' ');
}

// The design-system class that replaced one utility of a migrated list ('' when none), used to rewrite CSS
// selectors that still point at the utility (e.g. [class*="uppercase"] -> also .t-caps).
function classFor(u, utils) {
  let m;
  if (/^(sm|md|lg|xl):text-/.test(u) || /^text-\[\d|^text-(xs|sm|base|lg|xl|2xl|3xl|4xl)$/.test(u)) return sizeClass(utils);
  if ((m = u.match(/^text-\[var\(--c-([0-9A-F]{6})\)\]$/))) return colorClass(m[1]);
  if (WEIGHT[u]) return WEIGHT[u];
  if (u.startsWith('leading-')) return leadingClass(u);
  if (u === 'uppercase') return 't-caps';
  if (u.startsWith('tracking-')) return /tight|-0\.0|\[-/.test(u) ? 'ls-tight' : utils.includes('uppercase') ? 't-caps' : 'ls-wide';
  if ((m = u.match(/^text-(left|center|right)$/))) return 'ta-' + m[1];
  if ((m = u.match(/^m([tb])-([\d.]+)$/))) return `m${m[1]}-${spaceStep(+m[2])}`;
  return { italic: 't-italic', block: 'd-block', 'inline-block': 'd-inline-block', 'first:mt-0': 'first-mt-0' }[u] || '';
}

module.exports = function rules(utils) {
  return textRule(utils);
};
module.exports.classFor = classFor;
