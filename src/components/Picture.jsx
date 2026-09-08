import { itemLabel } from '../data/catalog.js';

/**
 * Picture.
 *
 * Every game illustration is an inline SVG drawn on a 100x100 grid. They are
 * components rather than image files on purpose: nothing extra has to be
 * fetched or precached, they stay sharp at any tap-target size, and the whole
 * set is a few kB inside the JS bundle - which matters when the app has to work
 * with no network at all.
 *
 * Shapes are deliberately plain and high-contrast: a dementia patient should
 * recognise the object in under a second.
 */
const STROKE = '#14202e';

function Frame({ children, className }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke={STROKE}
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const ART = {
  cup: (
    <>
      <path d="M24 36h42v24a18 18 0 0 1-18 18H42A18 18 0 0 1 24 60V36z" fill="#ffffff" />
      <path d="M24 54h42v8H24z" fill="#cfe8e4" stroke="none" />
      <path d="M24 36h42v24a18 18 0 0 1-18 18H42A18 18 0 0 1 24 60V36z" />
      <path d="M66 44h6a10 10 0 0 1 0 20h-6" />
      <path d="M38 28c0-5 6-5 6-10M54 28c0-5 6-5 6-10" stroke="#0f766e" />
    </>
  ),
  glass: (
    <>
      <path d="M32 24h36l-5 54H37z" fill="#ffffff" />
      <path d="M35 46h30l-2 32H37z" fill="#a8d8ea" stroke="none" />
      <path d="M32 24h36l-5 54H37z" />
    </>
  ),
  kettle: (
    <>
      <path d="M28 44h40a6 6 0 0 1 6 6v16a12 12 0 0 1-12 12H34a12 12 0 0 1-12-12V50a6 6 0 0 1 6-6z" fill="#cfe8e4" />
      <path d="M74 50l10-6v22l-10-8" fill="#cfe8e4" />
      <path d="M34 44c0-9 6-14 14-14s14 5 14 14" />
      <circle cx="48" cy="26" r="4" fill="#0f766e" stroke="none" />
    </>
  ),
  spoon: (
    <>
      <ellipse cx="50" cy="34" rx="16" ry="20" fill="#ffffff" />
      <path d="M50 54v30" strokeWidth="8" />
    </>
  ),
  plate: (
    <>
      <circle cx="50" cy="50" r="34" fill="#ffffff" />
      <circle cx="50" cy="50" r="22" stroke="#cfe8e4" strokeWidth="6" />
    </>
  ),
  apple: (
    <>
      <path d="M50 30c14-8 32 0 32 22 0 20-14 32-32 32S18 72 18 52c0-22 18-30 32-22z" fill="#cf4b3a" />
      <path d="M50 30V16" />
      <path d="M50 22c6-8 16-8 18-2-2 8-12 10-18 2z" fill="#4c9a6a" />
    </>
  ),
  banana: (
    <>
      <path d="M18 40c4 28 32 40 56 28 8-4 6-14-2-11-16 6-32-2-40-22-3-8-16-4-14 5z" fill="#f5d76e" />
      <path d="M24 40c6 22 28 32 48 25" stroke="#e9a23b" />
    </>
  ),
  shoe: (
    <>
      <path d="M14 68c0-8 4-14 12-16l14-4 8 8h22a14 14 0 0 1 14 14v6H14v-8z" fill="#0f766e" />
      <path d="M40 48l10 8M48 44l10 10" stroke="#ffffff" />
      <path d="M14 76h70" strokeWidth="5" />
    </>
  ),
  spectacles: (
    <>
      <circle cx="30" cy="52" r="16" fill="#ffffff" />
      <circle cx="70" cy="52" r="16" fill="#ffffff" />
      <path d="M46 52h8M14 46l-6-8M86 46l6-8" />
    </>
  ),
  comb: (
    <>
      <rect x="18" y="34" width="64" height="16" rx="6" fill="#0f766e" />
      <path d="M26 50v18M38 50v18M50 50v18M62 50v18M74 50v18" />
    </>
  ),
  toothbrush: (
    <>
      <path d="M50 88V44" strokeWidth="9" />
      <rect x="36" y="30" width="28" height="14" rx="4" fill="#0f766e" />
      <path
        d="M39 30V20M45 30V20M51 30V20M57 30V20M62 30V20"
        stroke="#0f766e"
        strokeWidth="4"
      />
    </>
  ),
  soap: (
    <>
      <rect x="20" y="52" width="52" height="26" rx="12" fill="#cfe8e4" />
      <circle cx="72" cy="34" r="9" fill="#ffffff" />
      <circle cx="54" cy="26" r="6" fill="#ffffff" />
      <path d="M30 64h20" stroke="#0f766e" />
    </>
  ),
  towel: (
    <>
      <path d="M14 24h72" strokeWidth="5" />
      <path d="M28 24h44v54a4 4 0 0 1-4 4H32a4 4 0 0 1-4-4z" fill="#a8d8ea" />
      <path d="M28 36h44" stroke="#ffffff" strokeWidth="5" />
      <path d="M36 50h28M36 62h28" stroke="#ffffff" />
    </>
  ),
  clock: (
    <>
      <circle cx="50" cy="52" r="32" fill="#ffffff" />
      <path d="M50 52V30M50 52l16 10" stroke="#0f766e" />
      <circle cx="50" cy="52" r="3" fill="#14202e" stroke="none" />
      <path d="M50 24v5M50 80v-5M24 52h5M76 52h-5" />
    </>
  ),
  lamp: (
    <>
      <path d="M30 46l10-22h20l10 22z" fill="#f6e7c1" />
      <path d="M50 46v26" />
      <path d="M34 80h32l-4-8H38z" fill="#0f766e" />
      <path d="M26 30l-9-4M74 30l9-4M50 22V12" stroke="#e9a23b" />
    </>
  ),
  key: (
    <>
      <circle cx="34" cy="50" r="16" fill="#e9a23b" />
      <circle cx="34" cy="50" r="6" fill="#fbf9f4" />
      <path d="M50 50h34" strokeWidth="8" />
      <path d="M62 50v10M72 50v12" />
    </>
  ),
  umbrella: (
    <>
      <path d="M14 52a36 36 0 0 1 72 0z" fill="#cf4b3a" />
      <path d="M50 52V16" />
      <path d="M50 52L26 34M50 52l24-18" stroke="#ffffff" />
      <path d="M50 52v26a10 10 0 0 0 16 6" />
    </>
  ),
  telephone: (
    <>
      <path d="M20 58h60a8 8 0 0 1 8 8v14H12V66a8 8 0 0 1 8-8z" fill="#cfe8e4" />
      <circle cx="50" cy="68" r="9" fill="#ffffff" />
      <path d="M18 28h16v10h32V28h16v22H66v-6H34v6H18z" fill="#0f766e" />
    </>
  ),
  envelope: (
    <>
      <rect x="16" y="30" width="68" height="44" rx="6" fill="#ffffff" />
      <path d="M16 34l34 24 34-24" />
      <path d="M16 74l26-22M84 74L58 52" stroke="#cbd5e1" />
    </>
  ),
  book: (
    <>
      <path d="M50 32c-8-6-20-8-30-6v42c10-2 22 0 30 6z" fill="#ffffff" />
      <path d="M50 32c8-6 20-8 30-6v42c-10-2-22 0-30 6z" fill="#ffffff" />
      <path d="M50 32v42" stroke="#0f766e" />
      <path d="M30 42h12M30 52h12M58 42h12M58 52h12" stroke="#cbd5e1" />
    </>
  ),
  ball: (
    <>
      <circle cx="50" cy="50" r="32" fill="#e9a23b" />
      <path d="M50 18c14 10 14 54 0 64M18 50c10-14 54-14 64 0" />
    </>
  ),
  flower: (
    <>
      <path d="M50 44v40" stroke="#4c9a6a" />
      <path d="M50 66c-10 0-16-6-16-12 8-2 16 4 16 12z" fill="#4c9a6a" />
      <circle cx="50" cy="26" r="10" fill="#cf4b3a" />
      <circle cx="34" cy="36" r="10" fill="#cf4b3a" />
      <circle cx="66" cy="36" r="10" fill="#cf4b3a" />
      <circle cx="40" cy="52" r="10" fill="#cf4b3a" />
      <circle cx="60" cy="52" r="10" fill="#cf4b3a" />
      <circle cx="50" cy="39" r="9" fill="#f5d76e" />
    </>
  ),
  sun: (
    <>
      <circle cx="50" cy="50" r="20" fill="#e9a23b" />
      <path
        d="M50 20V8M50 92V80M20 50H8M92 50H80M28 28l-9-9M72 72l9 9M72 28l9-9M28 72l-9 9"
        stroke="#e9a23b"
      />
    </>
  ),
  moon: (
    <>
      <path d="M62 18a34 34 0 1 0 0 64 40 40 0 0 1 0-64z" fill="#f6e7c1" />
      <path d="M78 24l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#e9a23b" />
    </>
  ),
  chair: (
    <>
      <rect x="30" y="16" width="40" height="34" rx="6" fill="#0f766e" />
      <rect x="24" y="50" width="52" height="12" rx="4" fill="#cfe8e4" />
      <path d="M30 62v22M70 62v22" />
    </>
  ),
  bed: (
    <>
      <path d="M14 44h8v34h-8z" fill="#0f766e" />
      <path d="M22 56h64a6 6 0 0 1 6 6v10H22z" fill="#cfe8e4" />
      <path d="M28 44h22v12H28z" fill="#ffffff" />
      <path d="M24 72v8M90 72v8" />
    </>
  ),
  medicine: (
    <>
      <rect x="30" y="34" width="40" height="46" rx="8" fill="#ffffff" />
      <rect x="38" y="20" width="24" height="14" rx="4" fill="#0f766e" />
      <path d="M50 46v20M40 56h20" stroke="#cf4b3a" strokeWidth="6" />
    </>
  ),
};

export default function Picture({ id, className = 'h-32 w-32' }) {
  const art = ART[id];
  if (!art) {
    // Never break a session over a missing drawing: fall back to the word.
    return (
      <span className={`flex items-center justify-center text-center font-bold ${className}`}>
        {itemLabel(id)}
      </span>
    );
  }
  return <Frame className={className}>{art}</Frame>;
}

export const PICTURE_IDS = Object.keys(ART);
