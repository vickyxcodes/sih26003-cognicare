import { PATTERN_SHAPES } from '../data/patternMatching.js';

/**
 * CardRow - the small row of things a question asks the patient to hold in mind.
 *
 * Three of the five domains memorise a short row rather than a single picture:
 * words, digits, or coloured shapes. They all render through this one component,
 * so the row the patient studies and the row on an answer button are drawn by
 * the same code and cannot end up different sizes or different colours.
 *
 * A card is `{ id, text }` or `{ id, shape }`. Shapes are inline SVG for the
 * same reason the picture set is: no image files to fetch or precache, sharp at
 * any tap size, and a few bytes in the bundle.
 *
 * The row is decorative to a screen reader - `aria-hidden` - because the button
 * around it already carries the whole pattern in words as its accessible name.
 * Reading out four shapes twice would be worse than reading them once.
 */

/** Same 100x100 box as the picture set, so shapes and pictures scale alike. */
const SHAPE_PATH = {
  circle: <circle cx="50" cy="50" r="38" />,
  square: <rect x="14" y="14" width="72" height="72" rx="10" />,
  triangle: <polygon points="50,12 88,84 12,84" />,
  diamond: <polygon points="50,8 92,50 50,92 8,50" />,
};

export function Shape({ shape, className = 'h-16 w-16' }) {
  const art = SHAPE_PATH[shape];
  const spec = PATTERN_SHAPES[shape];
  if (!art || !spec) return null;
  return (
    <svg viewBox="0 0 100 100" className={className} role="presentation" aria-hidden="true">
      <g fill={spec.color} stroke="#14202e" strokeWidth="4" strokeLinejoin="round">
        {art}
      </g>
    </svg>
  );
}

export default function CardRow({ cards, size = 'study' }) {
  if (!cards || !cards.length) return null;
  const big = size === 'study';
  return (
    <div className="flex flex-wrap items-center justify-center gap-3" aria-hidden="true">
      {cards.map((card) => (
        <span
          key={card.id}
          className={`flex items-center justify-center rounded-xl2 border-2 border-ink-soft/15 bg-white ${
            big ? 'h-28 w-28' : 'h-20 w-20'
          }`}
        >
          {card.shape ? (
            <Shape shape={card.shape} className={big ? 'h-20 w-20' : 'h-14 w-14'} />
          ) : (
            <span className={`font-bold text-ink ${big ? 'text-3xl' : 'text-2xl'}`}>{card.text}</span>
          )}
        </span>
      ))}
    </div>
  );
}
