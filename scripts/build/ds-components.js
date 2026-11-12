// Components that replace groups of u-* utility classes (input of scripts/build/ds-compose.js).
// Each entry: group (section of @layer ds), name (classes the element gets), from (u-* combinations it replaces).
// The CSS is generated once from the first combination (or `cssFrom`), or written in `css`; `define` names the class
// whose CSS the entry owns when `name` lists several. After the first run the CSS lives in root.css: edit it there.
const S = [];
const c = (group, name, from, opt = {}) => S.push({ group, name, from, ...opt });

// ---------------------------------------------------------------- layout: existing primitives
const L = 'layout';
c(L, 'page-shell', 'u-min-h-screen u-bg-FFFFFF u-relative u-flex u-flex-col u-w-full');
c(L, 'section-rule bg-white clip', ['u-border-b u-border-AAD39C u-relative u-bg-FFFFFF u-overflow-hidden']);
c(L, 'section-rule clip', ['u-relative u-border-b u-border-AAD39C u-overflow-hidden']);
c(L, 'section-rule', ['u-relative u-border-b u-border-b-AAD39C']);
c(L, 'section-rule bg-tint', ['u-border-b u-border-AAD39C u-relative u-bg-EEF0E8', 'u-bg-EEF0E8 u-border-b u-border-AAD39C'],
  { define: 'bg-tint', cssFrom: 'u-bg-EEF0E8' });
c(L, 'section-rule bg-tint-soft', ['u-border-b u-border-AAD39C u-relative u-bg-EEF0E8-a40'], { define: 'bg-tint-soft', cssFrom: 'u-bg-EEF0E8-a40' });
c(L, 'row gap-md', 'u-flex u-items-center u-gap-3');
c(L, 'row gap-sm t-accent', 'u-flex u-items-center u-gap-2 u-text-3F9A4B');
c(L, 'row-top gap-sm t-accent', 'u-flex u-items-start u-gap-2 u-text-3F9A4B');
c(L, 'stack', 'u-flex u-flex-col');
c(L, 'stack gap-md', 'u-flex u-flex-col u-gap-3');
c(L, 'stack gap-lg', 'u-flex u-flex-col u-gap-4');
c(L, 'fluid stack between', 'u-flex-1 u-flex u-flex-col u-justify-between');
c(L, 'mobile-only', 'u-block u-sm-hidden', { cssFrom: 'u-block u-sm-hidden' });
c(L, 'sr-only', 'u-sr-only');
c(L, 'wrap-row', 'u-relative u-flex u-flex-wrap u-gap-3');
c(L, 'container-narrow', 'u-max-w-860px u-mx-auto u-px-5 u-sm-px-6 u-lg-px-10');
c(L, 'wide-wrap', 'u-max-w-1260px u-mx-auto');
c(L, 'meta-row', 'u-flex u-flex-wrap u-items-center u-gap-4 u-sm-gap-6 u-text-sm');
// two columns that stack below 1024px (text + media)
c(L, 'split-row', ['u-flex u-flex-col u-lg-flex-row u-gap-10 u-lg-gap-14 u-items-center', 'u-flex u-flex-col u-lg-flex-row u-gap-10 u-lg-gap-16 u-items-center']);
c(L, 'split-col', 'u-w-full u-lg-w-50pct');
c(L, 'split-col rel', 'u-relative u-w-full u-lg-w-50pct');
c(L, 'split-col stack split-col--center', 'u-w-full u-lg-w-50pct u-flex u-flex-col u-justify-center', { define: 'split-col--center', css: `
.split-col--center { justify-content: center; }` });
c(L, 'split-grid', 'u-grid u-grid-cols-1 u-lg-grid-cols-1-1fr-0-9fr u-gap-6 u-items-start');
c(L, 'split-grid split-grid--stretch', 'u-grid u-grid-cols-1 u-lg-grid-cols-1-1fr-0-9fr u-gap-6 u-items-stretch', { define: 'split-grid--stretch', css: `
.split-grid--stretch { align-items: stretch; }` });
c(L, 'split-grid-rev', 'u-grid u-grid-cols-1 u-lg-grid-cols-0-85fr-1-15fr u-gap-6 u-items-stretch');
c(L, 'grid-2up', ['u-grid u-grid-cols-1 u-md-grid-cols-2 u-gap-6 u-lg-gap-8', 'u-grid u-grid-cols-1 u-md-grid-cols-2 u-gap-5 u-lg-gap-6']);
c(L, 'grid-2up-sm', 'u-grid u-grid-cols-1 u-sm-grid-cols-2 u-gap-3');
c(L, 'grid-3up', ['u-grid u-grid-cols-1 u-md-grid-cols-3 u-gap-5', 'u-grid u-grid-cols-1 u-md-grid-cols-3 u-gap-6 u-pt-3']);
c(L, 'grid-3up grid-3up--tight mt-xl', 'u-grid u-grid-cols-1 u-md-grid-cols-3 u-gap-4 u-mt-6', { define: 'grid-3up--tight', css: `
.grid-3up--tight { gap: 1rem; }` });
c(L, 'grid-sm-3', 'u-grid u-grid-cols-1 u-sm-grid-cols-3');
c(L, 'grid-sm-3 stat-grid', 'u-grid u-grid-cols-1 u-sm-grid-cols-3 u-mb-10 u-sm-mb-12', { define: 'stat-grid', cssFrom: 'u-mb-10 u-sm-mb-12' });
c(L, 'faq-columns', 'u-grid u-grid-cols-1 u-lg-grid-cols-2 u-gap-x-6 u-items-start');
c(L, 'faq-column', 'u-space-y-2 u-mt-2 u-lg-mt-0');
c(L, 'mobile-stack', 'u-flex u-flex-col u-gap-6 u-sm-hidden');
c(L, 'divided', 'u-divide-y u-divide-gray-100');
c(L, 'divided-green', 'u-divide-y u-divide-AAD39C-a30');

// ---------------------------------------------------------------- text roles
const T = 'text roles';
c(T, 't-md t-muted', 'u-text-14px u-sm-text-16px u-text-676767 u-xl-leading-2');
c(T, 'lead-text', 'u-text-14px u-md-text-16px u-text-676767 u-leading-1-5 u-mb-8 u-max-w-540px');
c(T, 'section-lead', 'u-text-14px u-sm-text-16px u-text-676767 u-leading-relaxed u-max-w-820px u-mx-auto');
c(T, 'section-lead mb-xl', 'u-text-14px u-sm-text-16px u-text-676767 u-leading-relaxed u-max-w-760px u-mx-auto u-mb-6');
c(T, 'section-title', 'u-max-w-650px u-mx-auto u-text-22px u-sm-text-30px u-lg-text-36px u-font-normal u-text-505050 u-leading-1-2 u-mb-3');
c(T, 'section-title section-title--wide', 'u-max-w-780px u-mx-auto u-text-22px u-sm-text-30px u-lg-text-36px u-font-normal u-text-505050 u-leading-1-2 u-mb-3',
  { define: 'section-title--wide', css: `
.section-title--wide { max-width: 780px; }` });
c(T, 'section-head section-head--md', 'u-max-w-780px u-mx-auto u-text-center', { define: 'section-head--md', css: `
.section-head--md { max-width: 780px; }` });
c(T, 'section-head section-head--narrow', 'u-max-w-700px u-mx-auto u-text-center', { define: 'section-head--narrow', css: `
.section-head--narrow { max-width: 700px; }` });
c(T, 'section-head section-head--lg', 'u-max-w-850px u-mx-auto u-text-center', { define: 'section-head--lg', css: `
.section-head--lg { max-width: 850px; }` });
c(T, 'prose', 'u-text-14px u-sm-text-15px u-text-676767 u-leading-1-65 u-space-y-4');
c(T, 'prose prose--strong', 'u-space-y-4 u-text-505050 u-text-14px u-md-text-15px u-leading-1-65', { define: 'prose--strong', css: `
.prose--strong { color: var(--theme-text); }` });
c(T, 'quote-text', 'u-relative u-my-auto u-text-18px u-sm-text-20px u-text-505050 u-leading-1-5');
c(T, 'hero-link', 'u-inline-flex u-items-center u-text-3F9A4B u-text-14px u-lg-text-16px u-font-normal u-hov-underline');
c(T, 'read-more', 'u-inline-flex u-items-center u-gap-1-5 u-mt-3 u-text-13px u-font-semibold u-text-3F9A4B u-hov-underline');
c(T, 'inline-link', 'u-font-medium u-text-505050 u-hov-text-3F9A4B u-transition-colors u-inline-flex u-items-center u-gap-1-5');
c(T, 'check-list', 'u-space-y-3 u-sm-mb-8');
c(T, 'step-list', 'u-flex u-flex-col u-space-y-8 u-mt-6');
c(T, 'list-row', 'u-flex u-items-start u-gap-3 u-pt-3 u-p-2');
c(T, 'list-row list-row--flush', 'u-flex u-items-start u-gap-3 u-pt-3 u-first-pt-0 u-p-2', { define: 'list-row--flush', css: `
.list-row--flush:first-child { padding-top: 0; }` });
c(T, 'star-row', 'u-flex u-items-center u-justify-center u-gap-0-5 u-text-2E4A25 u-mt-0-5');

// ---------------------------------------------------------------- icons
const I = 'icons';
c(I, 'icon-md', 'u-w-4 u-h-4');
c(I, 'icon-md icon-fill', 'u-w-4 u-h-4 u-fill-current');
c(I, 'icon-md t-accent', 'u-w-4 u-h-4 u-text-3F9A4B');
c(I, 'icon-lg t-text', 'u-h-5 u-w-5 u-text-505050', { define: 'icon-lg', css: `
.icon-lg { width: 1.25rem; height: 1.25rem; }` });
c(I, 'icon-xl t-text', 'u-h-6 u-w-6 u-text-505050', { define: 'icon-xl', css: `
.icon-xl { width: 1.5rem; height: 1.5rem; }` });
c(I, 'chev-icon', 'u-w-5 u-h-5 u-stroke-3F9A4B u-shrink-0 u-ml-2 u-gh-scale-110 u-transition-transform');
c(I, 'arrow-nudge', 'u-w-4 u-h-4 u-gh-translate-x-1 u-transition-transform');
c(I, 'icon-square', 'u-relative u-w-14 u-h-14 u-rounded-2xl u-bg-AAD39C-a30 u-border u-border-AAD39C u-flex u-items-center u-justify-center u-text-2E4A25', { drop: ['pmex-color-background'] });
c(I, 'icon-tile', 'u-flex u-h-12 u-w-12 u-shrink-0 u-items-center u-justify-center u-rounded-lg u-bg-EEF0E8');
c(I, 'icon-tile icon-tile--white', 'u-flex u-h-10 u-w-10 u-shrink-0 u-items-center u-justify-center u-rounded-lg u-bg-FFFFFF u-shadow-xs', { define: 'icon-tile--white', css: `
.icon-tile--white { width: 2.5rem; height: 2.5rem; background-color: var(--theme-white); box-shadow: var(--shadow-xs); }` });
c(I, 'dot-marker', 'u-relative u-z-10 u-w-2-5 u-h-2-5 u-rounded-full u-bg-3F9A4B u-shrink-0');
c(I, 'mark-x', 'u-w-5 u-h-5 u-rounded-full u-bg-red-100 u-text-red-500 u-flex u-items-center u-justify-center u-shrink-0 u-mt-0-5');
c(I, 'mark-check', 'u-w-5 u-h-5 u-rounded-full u-bg-AAD39C-a35 u-text-2E4A25 u-flex u-items-center u-justify-center u-shrink-0 u-mt-0-5', { drop: ['pmex-color-background'] });
c(I, 'avatar-circle', ['u-w-11 u-h-11 u-rounded-full u-bg-EDEAE0 u-text-505050 u-text-14px u-font-semibold u-flex u-items-center u-justify-center u-flex-shrink-0',
  'u-w-11 u-h-11 u-rounded-full u-bg-EDEAE0 u-text-505050 u-flex u-items-center u-justify-center u-flex-shrink-0']);

// ---------------------------------------------------------------- tags, chips, pills
const P = 'tags and pills';
c(P, 'tag-pill', ['u-inline-block u-text-10px u-sm-text-11px u-font-bold u-uppercase u-tracking-wider u-text-3F9A4B u-bg-F8FBF0 u-border u-border-AAD39C u-px-3 u-py-1 u-rounded-full',
  'u-text-10px u-sm-text-11px u-font-bold u-uppercase u-tracking-wider u-text-3F9A4B u-bg-F8FBF0 u-border u-border-AAD39C u-px-3 u-py-1 u-rounded-full',
  'u-text-10px u-font-bold u-uppercase u-tracking-wider u-text-3F9A4B u-bg-F8FBF0 u-border u-border-AAD39C u-px-3 u-py-1 u-rounded-full']);
c(P, 'tag-box', 'u-shrink-0 u-whitespace-nowrap u-text-center u-text-10px u-font-bold u-uppercase u-tracking-wider u-leading-tight u-text-3F9A4B u-bg-F8FBF0 u-border u-border-AAD39C u-px-2-5 u-py-1-5 u-rounded-lg');
c(P, 'badge-solid', 'u-inline-block u-text-10px u-font-bold u-uppercase u-tracking-wider u-text-FFFFFF u-bg-3F9A4B u-px-2-5 u-py-1 u-rounded-full u-mb-2');
c(P, 'pill-btn', ['u-inline-flex u-items-center u-justify-center u-bg-AAD39C u-text-2E4A25 u-px-6 u-py-2-5 u-rounded-full u-font-normal u-text-sm u-transition-colors u-duration-200 u-hov-bg-9ED08D',
  'u-inline-flex u-items-center u-bg-AAD39C u-text-2E4A25 u-px-6 u-py-2-5 u-rounded-full u-font-normal u-text-sm u-transition-colors u-duration-200 u-hov-bg-9ED08D'], { drop: ['pmex-color-background'] });
c(P, 'pill-cloud', 'u-flex u-flex-wrap u-justify-center u-gap-3-5 u-sm-gap-4 u-max-w-1200px u-mx-auto');
c(P, 'pill-cloud pill-cloud--narrow', ['u-flex u-flex-wrap u-justify-center u-gap-3-5 u-sm-gap-4 u-max-w-1000px u-mx-auto u-items-center',
  'u-flex u-flex-wrap u-justify-center u-gap-3 u-max-w-1000px u-mx-auto'], { define: 'pill-cloud--narrow', css: `
.pill-cloud--narrow { max-width: 1000px; align-items: center; }` });
c(P, 'chip-row', 'u-flex u-flex-wrap u-gap-2-5 u-max-w-540px');
c(P, 'logo-pill', 'u-relative u-overflow-hidden u-bg-FFFFFF u-border u-border-AAD39C-a60 u-hov-border-AAD39C u-rounded-full u-px-5 u-py-3 u-flex u-items-center u-justify-center u-shadow-xs u-transition-all u-duration-300 u-h-74px u-sm-h-82px u-lg-h-88px');
c(P, 'logo-pill logo-pill--tint', 'u-relative u-overflow-hidden u-bg-gradient-to-r u-from-EDEFE7 u-to-D8DCE3 u-border u-border-AAD39C u-hov-border-3F9A4B u-rounded-full u-px-5 u-py-3 u-flex u-items-center u-justify-center u-gap-2-5 u-shadow-xs u-transition-all u-duration-300 u-h-74px u-sm-h-82px u-lg-h-88px',
  { define: 'logo-pill--tint', cssFrom: 'u-bg-gradient-to-r u-from-EDEFE7 u-to-D8DCE3 u-border-AAD39C u-hov-border-3F9A4B u-gap-2-5' });
c(P, 'logo-pill__img', 'u-relative u-z-10 u-h-6 u-sm-h-7 u-lg-h-8 u-max-w-130px u-sm-max-w-140px u-w-auto u-object-contain');
// CPT code chips
c(P, 'rel clip', 'u-relative u-overflow-hidden');
c(P, 'code-cell', 'u-relative u-overflow-hidden u-w-calc-50pct-7px u-sm-w-calc-33-333pct-11px u-md-w-calc-25pct-12px u-lg-w-calc-20pct-13px');
c(P, 'code-grid', 'u-grid u-grid-cols-2 u-sm-grid-cols-3 u-gap-2 u-sm-gap-2-5 u-xl-gap-3-5');
c(P, 'code-chip__bg', 'u-absolute u-inset-0 u-bg-AAD39C u-p-3 u-sm-p-3-5 u-rounded-2xl u-rounded-br-60pct-90pct u-flex u-items-center u-gap-2-5 u-sm-gap-3 u-pr-10 u-shadow-xs', { drop: ['pmex-color-background'] });
c(P, 'code-chip__num', 'u-absolute u-bottom-1 u-right-2 u-font-extrabold u-text-12px u-md-text-14px u-lg-text-16px u-text-2E4A25 u-tracking-tight u-z-20');
c(P, 'code-chip__label', 'u-relative u-z-10 u-text-14px u-sm-text-15px u-font-semibold u-text-2E4A25');
c(P, 'code-chip__label code-chip__label--lg', 'u-relative u-z-10 u-text-16px u-sm-text-18px u-font-semibold u-text-2E4A25', { define: 'code-chip__label--lg', css: `
.code-chip__label--lg { font-size: 16px; @media (min-width: 640px) { font-size: 18px; } }` });
c(P, 'code-chip', 'u-relative u-overflow-hidden u-px-4 u-py-2 u-cursor-default');
c(P, 'code-chip__text', 'u-relative u-z-10 u-text-505050 u-text-13-5px u-font-medium u-gh-text-505050 u-transition-colors');
c(P, 'overhang-pin', 'u-absolute u-ntop-2 u-left-50pct u-ntranslate-x-50pct u-w-16 u-h-3-5 u-rounded-full u-shadow-xs');
c(P, 'code-card', 'u-relative u-bg-FFFFFF u-rounded-2xl u-shadow-sm u-hov-shadow-md u-hov-ntranslate-y-1 u-transition-all u-duration-300 u-border u-border-AAD39C-a50 u-overflow-hidden u-h-104px');

// ---------------------------------------------------------------- hero
const H = 'hero';
c(H, 'hero-band', 'u-relative u-w-full u-border-b u-border-AAD39C u-flex u-items-center');
c(H, 'hero-body', 'u-relative u-z-10 u-w-full');

// ---------------------------------------------------------------- showcase: image with a tilted backdrop
const SH = 'showcase';
c(SH, 'showcase-blob', 'u-absolute u-ninset-4 u-sm-ninset-6 u-rounded-32px u-bg-gradient-to-br u-from-EDEFE7 u-via-E8EAED u-to-D8DCE3 u-nz-10 u-rotate-2');
c(SH, 'showcase-media', 'u-relative u-rounded-3xl u-overflow-hidden u-h-340px u-sm-h-420px u-md-h-480px u-shadow-0-20px-45px-b71eb6 u-ring-1 u-ring-000000-a5');
c(SH, 'showcase-img', 'u-w-full u-h-full u-object-cover u-transition-transform u-duration-500 u-ease-out u-gh-scale-105');
c(SH, 'glow-blob', 'u-absolute u-top-50pct u-right-10 u-ntranslate-y-50pct u-w-96 u-h-96 u-rounded-full u-bg-AAD39C-a15 u-blur-3xl', { drop: ['pmex-color-background'] });
c(SH, 'glow-blob glow-blob--top', 'u-absolute u-top-10 u-right-0 u-w-80 u-h-80 u-rounded-full u-bg-AAD39C-a15 u-blur-3xl', { drop: ['pmex-color-background'], define: 'glow-blob--top', css: `
.glow-blob--top { top: 2.5rem; right: 0; width: 20rem; height: 20rem; translate: none; }` });
c(SH, 'glow-white', 'u-pointer-events-none u-absolute u-ntop-12 u-nright-12 u-w-48 u-h-48 u-rounded-full u-bg-FFFFFF-a30 u-blur-3xl');

// ---------------------------------------------------------------- orbit: "works with your systems" visual
const O = 'orbit';
c(O, 'orbit-stage', 'u-w-full u-lg-w-50pct u-relative u-min-h-480px u-sm-min-h-520px u-flex u-items-center u-justify-center u-py-6');
c(O, 'orbit-lines', 'u-absolute u-inset-0 u-w-full u-h-full u-pointer-events-none');
c(O, 'orbit-center', 'u-relative u-z-10 u-flex u-items-center u-justify-center u-mb-6');
c(O, 'orbit-pulse', 'u-w-32 u-h-32 u-sm-w-40 u-sm-h-40 u-rounded-full u-bg-AAD39C-a20 u-border u-border-AAD39C-a40 u-flex u-items-center u-justify-center u-animate-pulse', { drop: ['pmex-color-background'] });
c(O, 'orbit-core', 'u-w-24 u-h-24 u-sm-w-28 u-sm-h-28 u-rounded-full u-bg-FFFFFF u-border u-border-AAD39C-a60 u-shadow-0-8px-30px-AAD39C-a40 u-flex u-items-center u-justify-center');
c(O, 'orbit-label', 'u-px-3-5 u-py-1-5 u-sm-px-4 u-sm-py-2 u-rounded-xl u-bg-3F9A4B u-text-FFFFFF u-font-extrabold u-text-15px u-sm-text-17px u-tracking-wider u-shadow-sm');
c(O, 'orbit-card', 'u-absolute u-top-5pct u-left-2pct u-sm-top-6pct u-sm-left-6pct u-z-20 u-bg-FFFFFF u-rounded-xl u-border u-border-gray-200-a90 u-border-t-3-5px u-border-t-AAD39C u-shadow-md u-px-3-5 u-py-2-5 u-sm-px-4 u-sm-py-3 u-text-center u-min-w-135px u-sm-min-w-155px u-transition-transform u-duration-300 u-hov-scale-105');
c(O, 'orbit-card orbit-card--tr', 'u-absolute u-top-5pct u-right-2pct u-sm-top-6pct u-sm-right-6pct u-z-20 u-bg-FFFFFF u-rounded-xl u-border u-border-gray-200-a90 u-border-t-3-5px u-border-t-AAD39C u-shadow-md u-px-3-5 u-py-2-5 u-sm-px-4 u-sm-py-3 u-text-center u-min-w-135px u-sm-min-w-155px u-transition-transform u-duration-300 u-hov-scale-105',
  { define: 'orbit-card--tr', css: `
.orbit-card--tr { left: auto; right: 2%; @media (min-width: 640px) { right: 6%; } }` });
c(O, 'orbit-card orbit-card--bl', 'u-absolute u-bottom-24pct u-left-2pct u-sm-bottom-25pct u-sm-left-6pct u-z-20 u-bg-FFFFFF u-rounded-xl u-border u-border-gray-200-a90 u-border-t-3-5px u-border-t-AAD39C u-shadow-md u-px-3-5 u-py-2-5 u-sm-px-4 u-sm-py-3 u-text-center u-min-w-135px u-sm-min-w-155px u-transition-transform u-duration-300 u-hov-scale-105',
  { define: 'orbit-card--bl', css: `
.orbit-card--bl { top: auto; bottom: 24%; @media (min-width: 640px) { bottom: 25%; } }` });
c(O, 'orbit-card orbit-card--br', 'u-absolute u-bottom-24pct u-right-2pct u-sm-bottom-25pct u-sm-right-6pct u-z-20 u-bg-FFFFFF u-rounded-xl u-border u-border-gray-200-a90 u-border-t-3-5px u-border-t-AAD39C u-shadow-md u-px-3-5 u-py-2-5 u-sm-px-4 u-sm-py-3 u-text-center u-min-w-135px u-sm-min-w-155px u-transition-transform u-duration-300 u-hov-scale-105',
  { define: 'orbit-card--br', css: `
.orbit-card--br { top: auto; left: auto; right: 2%; bottom: 24%; @media (min-width: 640px) { right: 6%; bottom: 25%; } }` });
c(O, 'orbit-card orbit-card--b', 'u-absolute u-bottom-4pct u-left-50pct u-ntranslate-x-50pct u-z-20 u-bg-FFFFFF u-rounded-xl u-border u-border-gray-200-a90 u-border-t-3-5px u-border-t-AAD39C u-shadow-md u-px-3-5 u-py-2-5 u-sm-px-4 u-sm-py-3 u-text-center u-min-w-145px u-sm-min-w-165px u-transition-transform u-duration-300 u-hov-scale-105',
  { define: 'orbit-card--b', css: `
.orbit-card--b { top: auto; bottom: 4%; left: 50%; translate: -50% 0; min-width: 145px; @media (min-width: 640px) { min-width: 165px; } }` });

// ---------------------------------------------------------------- metric tiles (key outcomes)
const M = 'metric tiles';
c(M, 'metric-grid', ['u-grid u-grid-cols-1 u-md-grid-cols-2 u-gap-6 u-relative u-max-w-960px u-mx-auto',
  'u-grid u-grid-cols-1 u-md-grid-cols-2 u-gap-6 u-md-gap-6 u-lg-gap-6 u-relative u-max-w-960px u-mx-auto']);
c(M, 'metric-tile', 'u-relative u-bg-FFFFFF u-rounded-24px u-sm-rounded-28px u-p-6 u-sm-p-7 u-shadow-0-10px-30px-000000-a5 u-border u-border-gray-100 u-flex u-flex-col u-items-center u-text-center u-overflow-hidden u-min-h-165px u-justify-center');
c(M, 'metric-tile__icon', 'u-w-12 u-h-12 u-sm-w-14 u-sm-h-14 u-rounded-2xl u-bg-AAD39C-a20 u-flex u-items-center u-justify-center u-mb-3 u-text-2E4A25', { drop: ['pmex-color-background'] });
// the green layer behind a tile: it moves away from the grid centre (modifier = which corner)
c(M, 'tile-shadow', 'u-absolute u-inset-0 u-bg-AAD39C u-rounded-24px u-sm-rounded-28px u-translate-x-2 u-translate-y-2 u-md-translate-x-3 u-md-translate-y-3 u-transition-transform u-duration-300 u-gh-translate-x-3 u-gh-translate-y-3 u-md-gh-translate-x-4 u-md-gh-translate-y-4', { drop: ['pmex-color-background'] });
c(M, 'tile-shadow tile-shadow--tl', 'u-absolute u-inset-0 u-bg-AAD39C u-rounded-24px u-sm-rounded-28px u-translate-x-2 u-translate-y-2 u-md-ntranslate-x-3 u-md-ntranslate-y-3 u-transition-transform u-duration-300 u-gh-translate-x-3 u-gh-translate-y-3 u-md-gh-ntranslate-x-4 u-md-gh-ntranslate-y-4',
  { drop: ['pmex-color-background'], define: 'tile-shadow--tl', css: `
.tile-shadow--tl { @media (min-width: 768px) { translate: -0.75rem -0.75rem; @media (hover: hover) { &:is(:where(.group):hover *) { translate: -1rem -1rem; } } } }` });
c(M, 'tile-shadow tile-shadow--tr', 'u-absolute u-inset-0 u-bg-AAD39C u-rounded-24px u-sm-rounded-28px u-translate-x-2 u-translate-y-2 u-md-translate-x-3 u-md-ntranslate-y-3 u-transition-transform u-duration-300 u-gh-translate-x-3 u-gh-translate-y-3 u-md-gh-translate-x-4 u-md-gh-ntranslate-y-4',
  { drop: ['pmex-color-background'], define: 'tile-shadow--tr', css: `
.tile-shadow--tr { @media (min-width: 768px) { translate: 0.75rem -0.75rem; @media (hover: hover) { &:is(:where(.group):hover *) { translate: 1rem -1rem; } } } }` });
c(M, 'tile-shadow tile-shadow--bl', 'u-absolute u-inset-0 u-bg-AAD39C u-rounded-24px u-sm-rounded-28px u-translate-x-2 u-translate-y-2 u-md-ntranslate-x-3 u-md-translate-y-3 u-transition-transform u-duration-300 u-gh-translate-x-3 u-gh-translate-y-3 u-md-gh-ntranslate-x-4 u-md-gh-translate-y-4',
  { drop: ['pmex-color-background'], define: 'tile-shadow--bl', css: `
.tile-shadow--bl { @media (min-width: 768px) { translate: -0.75rem 0.75rem; @media (hover: hover) { &:is(:where(.group):hover *) { translate: -1rem 1rem; } } } }` });
// numbered corner badge of a tile (modifier = corner from 768px)
c(M, 'tile-num', 'u-absolute u-bottom-0 u-right-0 u-bg-AAD39C u-text-FFFFFF u-px-4 u-py-2-5 u-sm-px-5 u-sm-py-3 u-rounded-tl-24px u-sm-rounded-tl-32px u-font-bold u-flex u-flex-col u-items-center u-justify-center u-leading-none u-min-w-65px u-sm-min-w-75px u-shadow-sm', { drop: ['pmex-color-background'] });
c(M, 'tile-num tile-num--bl', 'u-absolute u-bottom-0 u-right-0 u-md-right-auto u-md-left-0 u-bg-AAD39C u-text-FFFFFF u-px-4 u-py-2-5 u-sm-px-5 u-sm-py-3 u-rounded-tl-24px u-md-rounded-tl-none u-md-rounded-tr-32px u-font-bold u-flex u-flex-col u-items-center u-justify-center u-leading-none u-min-w-65px u-sm-min-w-75px u-shadow-sm',
  { drop: ['pmex-color-background'], define: 'tile-num--bl', css: `
.tile-num--bl { @media (min-width: 768px) { right: auto; left: 0; border-top-left-radius: 0; border-top-right-radius: 32px; } }` });
c(M, 'tile-num tile-num--tr', 'u-absolute u-bottom-0 u-right-0 u-md-bottom-auto u-md-top-0 u-bg-AAD39C u-text-FFFFFF u-px-4 u-py-2-5 u-sm-px-5 u-sm-py-3 u-rounded-tl-24px u-md-rounded-tl-none u-md-rounded-bl-32px u-font-bold u-flex u-flex-col u-items-center u-justify-center u-leading-none u-min-w-65px u-sm-min-w-75px u-shadow-sm',
  { drop: ['pmex-color-background'], define: 'tile-num--tr', css: `
.tile-num--tr { @media (min-width: 768px) { top: 0; bottom: auto; border-top-left-radius: 0; border-bottom-left-radius: 32px; } }` });
c(M, 'tile-num tile-num--tl', 'u-absolute u-bottom-0 u-right-0 u-md-bottom-auto u-md-top-0 u-md-right-auto u-md-left-0 u-bg-AAD39C u-text-FFFFFF u-px-4 u-py-2-5 u-sm-px-5 u-sm-py-3 u-rounded-tl-24px u-md-rounded-tl-none u-md-rounded-br-32px u-font-bold u-flex u-flex-col u-items-center u-justify-center u-leading-none u-min-w-65px u-sm-min-w-75px u-shadow-sm',
  { drop: ['pmex-color-background'], define: 'tile-num--tl', css: `
.tile-num--tl { @media (min-width: 768px) { top: 0; bottom: auto; right: auto; left: 0; border-top-left-radius: 0; border-bottom-right-radius: 32px; } }` });
// metric cards with a big number
c(M, 'metric-box bh-metric-card', 'u-bh-metric-card u-bg-EEF0E8-a40 u-border u-border-AAD39C u-hov-border-3F9A4B u-rounded-2xl u-p-4 u-sm-p-5 u-text-center u-shadow-xs');
c(M, 'metric-box bh-metric-card metric-box--danger', 'u-bh-metric-card u-bg-EEF0E8-a40 u-border u-border-AAD39C u-hov-border-DC2626-a60 u-rounded-2xl u-p-4 u-sm-p-5 u-text-center u-shadow-xs',
  { define: 'metric-box--danger', cssFrom: 'u-hov-border-DC2626-a60' });
c(M, 'metric-num', 'u-text-26px u-sm-text-32px u-lg-text-36px u-font-extrabold u-text-505050 u-leading-tight u-mb-1 u-transition-colors');
c(M, 'metric-num metric-num--accent', 'u-text-26px u-sm-text-32px u-lg-text-36px u-font-extrabold u-text-3F9A4B u-gh-text-3F9A4B u-leading-tight u-mb-1 u-transition-colors',
  { define: 'metric-num--accent', cssFrom: 'u-text-3F9A4B' });
c(M, 'metric-num metric-num--danger', 'u-text-26px u-sm-text-32px u-lg-text-36px u-font-extrabold u-text-DC2626 u-leading-tight u-mb-1 u-transition-colors',
  { define: 'metric-num--danger', cssFrom: 'u-text-DC2626' });
c(M, 'stat-strip', 'u-flex-1 u-flex u-items-center u-gap-4 u-bg-gradient-to-r u-from-EEF0E8 u-to-3F9A4B-a30 u-border u-border-AAD39C-a60 u-rounded-2xl u-p-4 u-sm-p-5 u-shadow-sm u-hov-border-3F9A4B u-hov-shadow-md u-hov-ntranslate-y-0-5 u-transition-all u-duration-300');
c(M, 'stat-strip__num', 'u-shrink-0 u-min-w-84px u-sm-min-w-96px u-text-22px u-sm-text-26px u-font-bold u-text-1B3316 u-leading-none');
c(M, 'stat-pair', 'u-relative u-bg-FFFFFF u-rounded-2xl u-sm-rounded-3xl u-p-2 u-sm-p-2-5 u-flex u-items-stretch u-gap-2-5 u-shadow-sm u-hov-shadow-md u-transition-all u-duration-300');
c(M, 'stat-pair__body', 'u-flex-1 u-bg-AAD39C-a12 u-border u-border-AAD39C-a30 u-rounded-xl u-sm-rounded-2xl u-p-3 u-sm-p-3 u-relative u-z-10 u-flex u-items-center', { drop: ['pmex-color-background'] });
c(M, 'stat-badge', 'u-relative u-text-2E4A25 u-rounded-xl u-sm-rounded-2xl u-px-3 u-py-3 u-sm-px-4 u-sm-py-3 u-flex u-flex-col u-items-center u-justify-center u-min-w-95px u-sm-min-w-115px u-flex-shrink-0 u-text-center u-shadow-sm');
c(M, 'stat-badge__label', 'u-text-9px u-sm-text-10px u-font-bold u-uppercase u-tracking-widest u-text-2E4A25-a80');
c(M, 'stat-badge__pointer', 'u-absolute u-nright-2 u-top-50pct u-ntranslate-y-50pct u-w-0 u-h-0 u-border-y-7px u-border-y-transparent u-border-l-8px u-z-20');

// ---------------------------------------------------------------- trust badges (round seals)
const TB = 'trust badges';
c(TB, 'trust-row', 'u-mt-14 u-lg-mt-12 u-pt-10 u-border-t u-border-AAD39C-a40');
c(TB, 'trust-grid', 'u-grid u-grid-cols-2 u-sm-grid-cols-4 u-max-w-860px u-gap-5 u-sm-gap-6 u-justify-items-center u-mx-auto');
c(TB, 'trust-grid trust-grid--5', 'u-grid u-grid-cols-2 u-sm-grid-cols-3 u-lg-grid-cols-5 u-gap-5 u-sm-gap-6 u-lg-gap-6 u-justify-items-center u-max-w-1000px u-mx-auto',
  { define: 'trust-grid--5', css: `
.trust-grid--5 { max-width: 1000px; @media (min-width: 640px) { grid-template-columns: repeat(3, minmax(0, 1fr)); } @media (min-width: 1024px) { grid-template-columns: repeat(5, minmax(0, 1fr)); } }` });
c(TB, 'trust-badge', 'u-relative u-w-130px u-h-130px u-sm-w-150px u-sm-h-150px u-flex u-items-center u-justify-center');
c(TB, 'trust-badge trust-badge--wide', 'u-relative u-w-130px u-h-130px u-sm-w-150px u-sm-h-150px u-flex u-items-center u-justify-center u-col-span-2 u-sm-col-span-1',
  { define: 'trust-badge--wide', css: `
.trust-badge--wide { grid-column: span 2 / span 2; @media (min-width: 640px) { grid-column: span 1 / span 1; } }` });
c(TB, 'trust-badge__bg', 'u-absolute u-inset-0 u-bg-AAD39C u-rounded-full u-rounded-tl-none u-shadow-md u-transition-transform u-duration-300 u-gh-scale-105', { drop: ['pmex-color-background'] });
c(TB, 'trust-badge__pin', 'u-absolute u-top-2-5 u-left-2-5 u-z-20 u-text-2E4A25');
c(TB, 'trust-badge__face', 'u-relative u-z-10 u-w-82pct u-h-82pct u-bg-FFFFFF u-rounded-full u-shadow-0-4px-16px-000000-a8 u-flex u-flex-col u-items-center u-justify-center u-py-6 u-px-3-5 u-text-center');
c(TB, 'trust-badge__face trust-badge__face--tall', 'u-relative u-z-10 u-w-82pct u-h-82pct u-bg-FFFFFF u-rounded-full u-shadow-0-4px-16px-000000-a8 u-flex u-flex-col u-items-center u-justify-center u-py-8 u-px-3-5 u-text-center',
  { define: 'trust-badge__face--tall', css: `
.trust-badge__face--tall { padding-block: 2rem; }` });
c(TB, 'trust-badge__icon', 'u-flex u-items-center u-justify-center u-text-2E4A25');

// ---------------------------------------------------------------- cards
const C = 'cards';
c(C, 'step-card', 'u-bg-gradient-to-b u-from-EDEFE8 u-to-D3D7DF u-border u-border-E0E0DA u-hov-border-AAD39C u-rounded-2xl u-p-6 u-flex u-flex-col u-justify-between u-shadow-sm u-hov-shadow-xl u-hov-ntranslate-y-1 u-transition-all u-duration-300');
c(C, 'gradient-card', ['u-relative u-overflow-hidden u-bg-gradient-to-b u-from-EDEFE8 u-to-D3D7DF u-border u-border-E0E0DA u-hov-border-AAD39C u-rounded-2xl u-sm-rounded-3xl u-p-6 u-sm-p-8 u-flex u-flex-col u-justify-between u-shadow-sm u-hov-shadow-xl u-hov-ntranslate-y-1 u-transition-all u-duration-300',
  'u-relative u-overflow-hidden u-bg-gradient-to-b u-from-EDEFE8 u-to-D3D7DF u-border u-border-E0E0DA u-hov-border-AAD39C u-rounded-2xl u-sm-rounded-3xl u-p-6 u-sm-p-8 u-flex u-flex-col u-justify-between u-shadow-sm u-hov-shadow-xl u-transition-all u-duration-300']);
c(C, 'gradient-card gradient-card--accent', 'u-relative u-overflow-hidden u-bg-gradient-to-b u-from-EDEFE8 u-to-AAD39C u-border u-border-E0E0DA u-hov-border-AAD39C u-rounded-2xl u-sm-rounded-3xl u-p-6 u-sm-p-8 u-flex u-flex-col u-justify-between u-shadow-sm u-hov-shadow-xl u-hov-ntranslate-y-1 u-transition-all u-duration-300',
  { define: 'gradient-card--accent', cssFrom: 'u-bg-gradient-to-b u-from-EDEFE8 u-to-AAD39C' });
c(C, 'note-box', 'u-mt-6 u-bg-F8FBF0 u-border u-border-AAD39C u-rounded-2xl u-p-4 u-sm-p-5 u-gh-border-3F9A4B u-transition-colors');
c(C, 'note-box note-box--sm', 'u-mt-5 u-bg-F8FBF0 u-border u-border-AAD39C u-rounded-xl u-p-4 u-gh-border-3F9A4B u-transition-colors', { define: 'note-box--sm', css: `
.note-box--sm { margin-top: 1.25rem; border-radius: 0.75rem; @media (min-width: 640px) { padding: 1rem; } }` });
c(C, 'note-box note-box--list', 'u-mt-6 u-bg-F8FBF0 u-border u-border-AAD39C u-rounded-2xl u-p-4 u-sm-p-5 u-space-y-2 u-gh-border-3F9A4B u-transition-colors',
  { define: 'note-box--list', cssFrom: 'u-space-y-2' });
c(C, 'card-head-row', 'u-flex u-items-center u-justify-between u-pb-3 u-mb-3 u-border-b u-border-E0E0DA u-gh-border-AAD39C-a60 u-transition-colors');
c(C, 'card-title-row', 'u-mb-4 u-flex u-items-center u-gap-3-5');
c(C, 'card-title-band', 'u-mb-4 u-flex u-items-center u-gap-3-5 u-bg-gradient-to-r u-from-D8DCE3 u-via-EDEFE7 u-to-FFFFFF u-p-3 u-rounded-xl u-shadow-xs');
c(C, 'case-card', 'u-bg-FFFFFF u-border u-border-EDEAE0 u-rounded-2xl u-overflow-hidden u-shadow-sm u-hov-border-AAD39C u-hov-shadow-xl u-hov-ntranslate-y-1 u-transition-all u-duration-300');
c(C, 'case-card__head', 'u-p-5 u-sm-p-6 u-bg-gradient-to-br u-from-EEF0E8 u-to-FFFFFF');
c(C, 'case-card__body', 'u-p-5 u-sm-p-6');
c(C, 'case-card__stats', 'u-grid u-grid-cols-3 u-gap-2 u-mt-5 u-pt-4 u-border-t u-border-EDEAE0');
c(C, 'resource-card', 'u-flex u-flex-col u-gap-3 u-items-start u-bg-FFFFFF u-border u-border-EDEAE0 u-rounded-2xl u-p-5 u-shadow-sm u-hov-border-AAD39C u-hov-shadow-md u-hov-ntranslate-y-0-5 u-transition-all u-duration-300');
c(C, 'blog-card', 'u-relative u-bg-FFFFFF u-rounded-2xl u-border u-border-E0E0DA u-pt-7 u-px-6 u-pb-6 u-shadow-md u-hov-border-AAD39C u-hov-shadow-xl u-hov-ntranslate-y-1 u-transition-all u-duration-200 u-flex u-flex-col');
c(C, 'blog-card__thumb', 'u-rounded-xl u-overflow-hidden u-mb-4');
c(C, 'panel-col', 'u-flex-1 u-flex u-flex-col u-bg-FFFFFF u-border u-border-AAD39C-a60 u-rounded-2xl u-p-5 u-shadow-sm');
c(C, 'state-tile', 'u-bg-FFFFFF u-hov-bg-gradient-to-t u-hov-from-AAD39C-a40 u-hov-to-EDEFE8-a20 u-border u-border-AAD39C-a60 u-rounded-xl u-p-4 u-text-center u-shadow-xs u-transition-all u-duration-300 u-hov-shadow-md u-hov-border-AAD39C');
c(C, 'state-tile state-tile--compact', 'u-bg-FFFFFF u-hov-bg-gradient-to-t u-hov-from-AAD39C-a40 u-hov-to-EDEFE8-a20 u-border u-border-AAD39C-a60 u-rounded-xl u-p-3 u-sm-p-4 u-text-center u-shadow-xs u-transition-all u-duration-300 u-hov-shadow-md u-hov-border-AAD39C',
  { define: 'state-tile--compact', css: `
.state-tile--compact { padding: 0.75rem; @media (min-width: 640px) { padding: 1rem; } }` });
c(C, 'state-tile state-tile--lg', 'u-flex u-flex-col u-items-center u-justify-center u-h-full u-bg-FFFFFF u-hov-bg-gradient-to-t u-hov-from-AAD39C-a40 u-hov-to-EDEFE8-a20 u-border u-border-AAD39C-a60 u-rounded-2xl u-p-5 u-sm-p-6 u-text-center u-shadow-xs u-transition-all u-duration-300 u-hov-shadow-md u-hov-border-AAD39C',
  { define: 'state-tile--lg', cssFrom: 'u-flex u-flex-col u-items-center u-justify-center u-h-full u-rounded-2xl u-p-5 u-sm-p-6' });
c(C, 'spotlight', 'u-relative u-overflow-hidden u-bg-gradient-to-br u-from-EDEFE7 u-via-E8EAED u-to-D8DCE3 u-border u-border-AAD39C-a60 u-rounded-3xl u-p-6 u-sm-p-8 u-shadow-xl');
c(C, 'spotlight stack between gap-xl', 'u-relative u-overflow-hidden u-flex u-flex-col u-justify-between u-gap-6 u-bg-gradient-to-br u-from-EDEFE7 u-via-E8EAED u-to-D8DCE3 u-border u-border-AAD39C-a60 u-rounded-3xl u-p-6 u-sm-p-8 u-shadow-xl',
  { define: 'gap-xl', css: `
.gap-xl { gap: 1.5rem; }` });
c(C, 'cta-panel', 'u-max-w-900px u-mx-auto u-text-center u-bg-gradient-to-br u-from-EDEFE7 u-via-E8EAED u-to-D8DCE3 u-border u-border-AAD39C u-rounded-3xl u-p-6 u-sm-p-10 u-shadow-sm');
c(C, 'cta-panel__actions', 'u-flex u-flex-wrap u-gap-3 u-justify-center u-mb-4');
c(C, 'cta-band__inner', 'u-relative u-z-10 u-flex u-flex-col u-lg-flex-row u-lg-items-center u-lg-justify-between u-gap-10');
c(C, 'link-row', 'u-flex u-items-center u-gap-3 u-sm-gap-4');
c(C, 'link-row__arrow', 'u-hidden u-sm-flex u-items-center u-text-3F9A4B u-shrink-0');

// ---------------------------------------------------------------- audit form (approved horizontal form card)
const A = 'audit form';
c(A, 'audit-card', 'u-bg-gradient-to-br u-from-EDEFE7 u-via-E8EAED u-to-D8DCE3 u-rounded-2xl u-sm-rounded-3xl u-p-6 u-sm-p-8 u-lg-p-10 u-text-FFFFFF u-transition-all u-duration-300 u-border u-border-000000-a0 u-hov-border-AAD39C u-shadow-0-0-35px-000000-a25 u-hov-shadow-0-0-45px-AAD39C-a75');
c(A, 'audit-fields', 'u-flex u-flex-col u-md-flex-row u-items-center u-justify-center u-gap-3 u-sm-gap-4 u-max-w-1100px u-mx-auto u-mb-5');
c(A, 'audit-input', 'u-w-full u-md-flex-1 u-bg-FFFFFF u-text-505050 u-placeholder-959085 u-text-14px u-rounded-xl u-px-4 u-py-3-5 u-border u-border-000000-a0 u-foc-outline-none u-foc-ring-2 u-foc-ring-AAD39C u-transition-all u-shadow-xs');
c(A, 'audit-submit', 'u-w-full u-md-w-auto u-bg-AAD39C u-hov-bg-96C488 u-text-2E4A25 u-font-semibold u-text-13px u-tracking-wider u-uppercase u-rounded-xl u-px-8 u-py-3-5 u-transition-all u-shadow-md u-shrink-0 u-cursor-pointer', { drop: ['pmex-color-background'] });
c(A, 'audit-phone', 'u-text-center u-text-13px u-sm-text-14px u-text-505050 u-font-normal u-flex u-items-center u-justify-center u-gap-2 u-flex-wrap');

// ---------------------------------------------------------------- testimonial slider
const TS = 'testimonial slider';
c(TS, 'slider-viewport', 'u-overflow-hidden u-py-5');
c(TS, 'quote-card', 'u-relative u-flex u-flex-col u-h-full u-bg-FFFFFF u-rounded-2xl u-border u-border-EDEAE0 u-shadow-0-8px-24px--e0feec u-p-7');
c(TS, 'quote-card__mark', 'u-absolute u-ntop-4 u-left-7 u-w-9 u-h-9 u-rounded-full u-bg-2A3828 u-flex u-items-center u-justify-center');
c(TS, 'quote-card__stars', 'u-flex u-items-center u-gap-1 u-mb-4 u-mt-2');
c(TS, 'quote-card__foot', 'u-mt-auto u-flex u-items-center u-gap-3 u-pt-5 u-border-t u-border-EDEAE0');
c(TS, 'slider-btn', 'u-w-11 u-h-11 u-rounded-full u-bg-FFFFFF u-border u-border-AAD39C u-shadow-0-8px-24px--45128e u-flex u-items-center u-justify-center');
c(TS, 'slider-arrow', 'u-hidden u-sm-flex u-absolute u-left-n14px u-lg-left-n22px u-top-50pct u-ntranslate-y-50pct u-z-20 u-w-11 u-h-11 u-rounded-full u-bg-FFFFFF u-border u-border-AAD39C u-shadow-0-8px-24px--45128e u-items-center u-justify-center u-hov-bg-2A3828 u-transition-colors');
c(TS, 'slider-arrow slider-arrow--next', 'u-hidden u-sm-flex u-absolute u-right-n14px u-lg-right-n22px u-top-50pct u-ntranslate-y-50pct u-z-20 u-w-11 u-h-11 u-rounded-full u-bg-FFFFFF u-border u-border-AAD39C u-shadow-0-8px-24px--45128e u-items-center u-justify-center u-hov-bg-2A3828 u-transition-colors',
  { define: 'slider-arrow--next', css: `
.slider-arrow--next { left: auto; right: -14px; @media (min-width: 1024px) { right: -22px; } }` });
c(TS, 'slider-nav-mobile', 'u-flex u-sm-hidden u-items-center u-justify-center u-gap-4 u-mt-4');

// ---------------------------------------------------------------- before / after comparison
const CP = 'comparison';
c(CP, 'compare-bad', 'u-bg-FFFFFF u-rounded-2xl u-border u-border-red-200 u-shadow-sm u-overflow-hidden');
c(CP, 'compare-bad__head', 'u-bg-red-50-a70 u-border-b u-border-red-200 u-py-3-5 u-px-4 u-text-center');
c(CP, 'compare-bad__title', 'u-text-15px u-font-bold u-text-red-500 u-uppercase u-tracking-wider');
c(CP, 'compare-bad__list', 'u-p-4 u-flex u-flex-col u-gap-4 u-divide-y u-divide-red-100');
c(CP, 'compare-good', 'u-bg-FFFFFF u-rounded-2xl u-border u-border-AAD39C u-shadow-md u-shadow-AAD39C-a10 u-overflow-hidden');
c(CP, 'compare-good__head', 'u-bg-AAD39C-a20 u-border-b u-border-AAD39C-a40 u-py-3-5 u-px-4 u-text-center', { drop: ['pmex-color-background'] });
c(CP, 'compare-good__list', 'u-p-4 u-flex u-flex-col u-gap-4 u-divide-y u-divide-AAD39C-a30 u-bg-F7FCF5-a30');
c(CP, 'compare-table', 'u-hidden u-sm-block u-bg-FFFFFF u-rounded-3xl u-border u-border-AAD39C-a60 u-shadow-lg u-shadow-AAD39C-a10 u-overflow-hidden');
c(CP, 'compare-cell', 'u-w-50pct u-p-3 u-sm-p-4 u-lg-p-5 u-border-r u-border-AAD39C-a40 u-text-center');
c(CP, 'compare-cell compare-cell--good', 'u-w-50pct u-p-3 u-sm-p-4 u-lg-p-5 u-bg-AAD39C-a10 u-text-center',
  { define: 'compare-cell--good', css: `
.compare-cell--good { border-right: 0; background-color: rgb(from var(--theme-primary-light) r g b / 10%); }` });
c(CP, 'cmp-table', 'u-w-full u-text-left u-border-collapse');
c(CP, 'table-head-row', 'u-border-b u-border-AAD39C-a40 u-bg-gradient-to-r u-from-red-50-a50 u-via-FFFFFF u-to-AAD39C-a10');

// ---------------------------------------------------------------- data tables and key/value lists
const D = 'data lists';
c(D, 'data-table', 'u-bg-FFFFFF u-border u-border-AAD39C-a60 u-rounded-2xl u-overflow-hidden u-shadow-sm');
c(D, 'data-head', 'u-grid u-grid-cols-3 u-gap-2 u-px-4 u-sm-px-5 u-py-3 u-bg-EEF0E8 u-border-b u-border-AAD39C-a60');
c(D, 'data-row', 'u-grid u-grid-cols-3 u-gap-2 u-px-4 u-sm-px-5 u-py-3-5 u-border-b u-border-EDEAE0 u-last-border-b-0 u-items-center u-hov-bg-F8FBF0 u-transition-colors');
c(D, 'kv-row', 'u-flex u-items-center u-justify-between u-gap-3 u-py-2-5 u-border-b u-border-EDEAE0 u-last-border-b-0');
c(D, 'kv-row__label', 'u-text-12px u-sm-text-13px u-text-505050 u-min-w-0');
c(D, 'kv-row__tag', 'u-shrink-0 u-text-10-5px u-font-semibold u-text-3F9A4B u-bg-F8FBF0 u-border u-border-AAD39C u-px-2-5 u-py-0-5 u-rounded-full');
c(D, 'kv-row__value', 'u-shrink-0 u-text-12px u-sm-text-13px u-font-semibold u-text-2E4A25 u-text-right u-min-w-64px');

// ---------------------------------------------------------------- logo marquee (partials/marquee.html)
const MQ = 'logo marquee';
c(MQ, 'marquee-logo', 'u-h-5 u-sm-h-6 u-max-w-120px u-w-auto u-shrink-0 u-object-contain u-grayscale u-opacity-60 u-transition-all u-duration-300 u-ease-out u-hov-scale-105 u-hov-grayscale-0 u-hov-opacity-100');
c(MQ, 'marquee-logo marquee-logo--w110', 'u-h-5 u-sm-h-6 u-max-w-110px u-w-auto u-shrink-0 u-object-contain u-grayscale u-opacity-60 u-transition-all u-duration-300 u-ease-out u-hov-scale-105 u-hov-grayscale-0 u-hov-opacity-100', { define: 'marquee-logo--w110', css: `
.marquee-logo--w110 { max-width: 110px; }` });
c(MQ, 'marquee-logo marquee-logo--md marquee-logo--w130', 'u-h-6 u-sm-h-7 u-max-w-130px u-w-auto u-shrink-0 u-object-contain u-grayscale u-opacity-60 u-transition-all u-duration-300 u-ease-out u-hov-scale-105 u-hov-grayscale-0 u-hov-opacity-100', { define: 'marquee-logo--md', css: `
.marquee-logo--md { height: 1.5rem; @media (min-width: 640px) { height: 1.75rem; } }` });
c(MQ, 'marquee-logo--w130', [], { css: `
.marquee-logo--w130 { max-width: 130px; }` });
c(MQ, 'marquee-logo marquee-logo--w130', 'u-h-5 u-sm-h-6 u-max-w-130px u-w-auto u-shrink-0 u-object-contain u-grayscale u-opacity-60 u-transition-all u-duration-300 u-ease-out u-hov-scale-105 u-hov-grayscale-0 u-hov-opacity-100');
c(MQ, 'marquee-logo marquee-logo--lg marquee-logo--w140', 'u-h-7 u-sm-h-8 u-max-w-140px u-w-auto u-shrink-0 u-object-contain u-grayscale u-opacity-60 u-transition-all u-duration-300 u-ease-out u-hov-scale-105 u-hov-grayscale-0 u-hov-opacity-100', { define: 'marquee-logo--lg', css: `
.marquee-logo--lg { height: 1.75rem; @media (min-width: 640px) { height: 2rem; } }` });
c(MQ, 'marquee-logo--w140', [], { css: `
.marquee-logo--w140 { max-width: 140px; }` });
c(MQ, 'marquee-logo marquee-logo--w100', 'u-h-5 u-sm-h-6 u-max-w-100px u-w-auto u-shrink-0 u-object-contain u-grayscale u-opacity-60 u-transition-all u-duration-300 u-ease-out u-hov-scale-105 u-hov-grayscale-0 u-hov-opacity-100', { define: 'marquee-logo--w100', css: `
.marquee-logo--w100 { max-width: 100px; }` });
c(MQ, 'marquee-logo marquee-logo--lg marquee-logo--w150', 'u-h-7 u-sm-h-8 u-max-w-150px u-w-auto u-shrink-0 u-object-contain u-grayscale u-opacity-60 u-transition-all u-duration-300 u-ease-out u-hov-scale-105 u-hov-grayscale-0 u-hov-opacity-100', { define: 'marquee-logo--w150', css: `
.marquee-logo--w150 { max-width: 150px; }` });
c(MQ, 'marquee-logo marquee-logo--lg marquee-logo--w130', 'u-h-7 u-sm-h-8 u-max-w-130px u-w-auto u-shrink-0 u-object-contain u-grayscale u-opacity-60 u-transition-all u-duration-300 u-ease-out u-hov-scale-105 u-hov-grayscale-0 u-hov-opacity-100');
c(MQ, 'marquee-logo marquee-logo--md', 'u-h-6 u-sm-h-7 u-max-w-120px u-w-auto u-shrink-0 u-object-contain u-grayscale u-opacity-60 u-transition-all u-duration-300 u-ease-out u-hov-scale-105 u-hov-grayscale-0 u-hov-opacity-100');
c(MQ, 'marquee-row', 'u-flex u-shrink-0 u-items-center u-gap-16 u-pr-16');
c(MQ, 'logo-band', 'u-border-y u-border-AAD39C u-bg-FFFFFF u-py-6');
c(MQ, 'marquee-viewport', 'u-w-full u-overflow-hidden');
c(MQ, 'marquee-track', 'u-flex u-w-max u-whitespace-nowrap');

// ---------------------------------------------------------------- service template (imported service and platform pages)
const ST = 'service template';
c(ST, 'hero-text', [], { css: `
.hero-text { max-width: 600px; }` });
c(ST, 'hero-actions-row', [], { css: `
.hero-actions-row { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 2rem; }` });

module.exports = S;
