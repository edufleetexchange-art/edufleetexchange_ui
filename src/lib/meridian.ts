/**
 * MERIDIAN EXCHANGE — shared design-system className constants.
 *
 * Codifies the design language of src/pages/Landing.tsx so public pages
 * stay visually coherent: ink-navy grounds, paper/ledger surfaces, serif
 * display type, mono utility labels, teal + amber accents, hairline rules,
 * hard-shadow buttons and cartographic grid motifs.
 *
 * The raw CSS utilities (.mx-serif, .mx-mono, .mx-grid-ink, .mx-btn-hard,
 * .mx-drift, .mx-rotate) live in src/index.css.
 */

/** Raw palette values, for arbitrary-value classes and inline styles. */
export const MX_INK = '#081120'; // deepest ink navy — band grounds
export const MX_INK_TEXT = '#0B1626'; // ink text / hairline base
export const MX_PAPER = '#F3F5F7'; // page paper ground
export const MX_TEAL = '#16857B';
export const MX_TEAL_BRIGHT = '#2FB8AA';
export const MX_TEAL_PALE = '#7BE8DB';
export const MX_AMBER = '#F0A62B';
export const MX_AMBER_HOVER = '#FFB63F';
export const MX_AMBER_DEEP = '#A66B00'; // amber that passes contrast on paper

/* ── Type ─────────────────────────────────────────────────────── */

/** Serif display face for page titles / section headers. */
export const mxSerif = 'mx-serif tracking-tight';

/** Mono eyebrow — small uppercase tracked line above/below titles. */
export const mxEyebrow = 'mx-mono text-[11px] font-semibold uppercase tracking-[0.22em]';

/** Mono field label — filter sidebars and forms. */
export const mxLabel = 'mx-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0B1626]/60';

/* ── Surfaces ─────────────────────────────────────────────────── */

/** Ink band — dark page hero / footer ground. Pair with mxInkGridOverlay. */
export const mxInkBand = 'relative overflow-hidden bg-[#081120] text-white';

/** Cartographic grid overlay for ink bands (render with aria-hidden). */
export const mxInkGridOverlay =
  'pointer-events-none absolute inset-0 mx-grid-ink [mask-image:linear-gradient(to_bottom,black_30%,transparent_96%)]';

/** Paper/ledger card — hairline border, soft ink shadow. */
export const mxPaperCard =
  'rounded-md border border-[#0B1626]/15 bg-white shadow-[0_16px_36px_-28px_rgba(3,9,20,0.45)]';

/** Dashed ledger panel — empty states. */
export const mxEmptyPanel =
  'rounded-md border border-dashed border-[#0B1626]/25 bg-white/70 shadow-none';

/** Teal-tinted ledger panel — highlighted info blocks. */
export const mxTealPanel = 'rounded-sm border border-[#16857B]/25 bg-[#16857B]/[0.06]';

/** Amber-tinted ledger panel — notices / gates. */
export const mxAmberPanel = 'rounded-sm border border-[#F0A62B]/45 bg-[#FDF4E1]';

/* ── Rules & headers ──────────────────────────────────────────── */

/** Hairline top rule for serif section headers (Landing pattern). */
export const mxTopRule = 'border-t border-[#0B1626]/15';

/** Amber diamond tick that anchors section headers (render aria-hidden). */
export const mxDiamond = 'inline-block h-2 w-2 shrink-0 rotate-45 bg-[#F0A62B]';

/* ── Buttons & links ──────────────────────────────────────────── */

/** Ink hard-shadow button (the bold Landing CTA treatment). */
export const mxBtnInk =
  'mx-btn-hard rounded-none border border-[#0B1626] bg-[#0B1626] font-semibold text-white hover:bg-[#13233A] hover:text-white';

/** Amber hard-shadow button — the accent moment. */
export const mxBtnAmber =
  'mx-btn-hard rounded-none border border-[#0B1626]/20 bg-[#F0A62B] font-semibold text-[#0B1626] hover:bg-[#FFB63F] hover:text-[#0B1626]';

/** Quiet outline button on paper. */
export const mxBtnOutline =
  'rounded-none border border-[#0B1626]/30 bg-transparent font-semibold text-[#0B1626] shadow-none transition-colors hover:border-[#0B1626] hover:bg-[#0B1626] hover:text-white';

/** Underline link-button (Landing "View All" pattern) — ink on paper. */
export const mxLinkBtn =
  'rounded-none border-0 border-b-2 border-[#0B1626] bg-transparent px-1 pb-2 font-semibold text-[#0B1626] shadow-none transition-colors hover:border-[#F0A62B] hover:bg-transparent hover:text-[#A66B00]';

/** Underline link-button — white on ink. */
export const mxLinkBtnLight =
  'rounded-none border-0 border-b-2 border-white bg-transparent px-1 pb-2 font-semibold text-white shadow-none transition-colors hover:border-[#F0A62B] hover:bg-transparent hover:text-[#F0A62B]';

/* ── Form controls ────────────────────────────────────────────── */

/** Input treatment on paper surfaces. */
export const mxInput =
  'rounded-sm border-[#0B1626]/20 bg-white transition-colors focus:border-[#16857B] focus-visible:ring-[#16857B]/25';
