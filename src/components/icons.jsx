/**
 * Inline SVG icons. Bundled locally (no icon font, no CDN, no Cloud Storage)
 * and sized in rem so they scale with the 20px root font size.
 */

export function HeartMark({ className = 'h-16 w-16' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <rect width="100" height="100" rx="22" fill="#0f766e" />
      <g fill="#ffffff" transform="translate(50 52) scale(0.72) translate(-50 -56)">
        <polygon points="50,92 14,56 50,20 86,56" />
        <circle cx="32" cy="38" r="25.5" />
        <circle cx="68" cy="38" r="25.5" />
      </g>
    </svg>
  );
}

export function PlayIcon({ className = 'h-16 w-16' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M8 4.5v15a1 1 0 0 0 1.53.85l11-7.5a1 1 0 0 0 0-1.7l-11-7.5A1 1 0 0 0 8 4.5z" />
    </svg>
  );
}

export function HomeIcon({ className = 'h-10 w-10' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 3 2 12h3v9h6v-6h2v6h6v-9h3z" />
    </svg>
  );
}

export function CheckIcon({ className = 'h-12 w-12' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 13l5 5L20 6" />
    </svg>
  );
}

export function RetryIcon({ className = 'h-12 w-12' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <path d="M20 12a8 8 0 1 1-2.4-5.7" />
      <path d="M20 3v5h-5" />
    </svg>
  );
}

export function ArrowDownIcon({ className = 'h-16 w-16' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 3a1.6 1.6 0 0 1 1.6 1.6v9.6l3.3-3.3a1.6 1.6 0 1 1 2.2 2.3l-6 6a1.6 1.6 0 0 1-2.2 0l-6-6a1.6 1.6 0 1 1 2.2-2.3l3.3 3.3V4.6A1.6 1.6 0 0 1 12 3z" />
    </svg>
  );
}

export function ArrowUpIcon({ className = 'h-16 w-16' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 21a1.6 1.6 0 0 0 1.6-1.6V9.8l3.3 3.3a1.6 1.6 0 1 0 2.2-2.3l-6-6a1.6 1.6 0 0 0-2.2 0l-6 6a1.6 1.6 0 1 0 2.2 2.3l3.3-3.3v9.6A1.6 1.6 0 0 0 12 21z" />
    </svg>
  );
}

export function SpeakerIcon({ className = 'h-10 w-10' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M4 9v6h3.5L13 20V4L7.5 9z" />
      <path d="M16.5 8.2a1.3 1.3 0 0 1 1.8.2 5.6 5.6 0 0 1 0 7.2 1.3 1.3 0 0 1-2-1.6 3 3 0 0 0 0-4 1.3 1.3 0 0 1 .2-1.8z" />
    </svg>
  );
}
