import { ALERT_HEADLINE, ALERT_NOT_A_DIAGNOSIS } from '../lib/trends.js';

/**
 * DeclineAlert - the one card on the dashboard that asks the caregiver to do
 * something, so it is deliberately the only thing on the page that looks like
 * this: at the top, outlined, with the two charts and their readings below it.
 *
 * Whether it appears at all, and every word of its per-domain sentence, is
 * decided by `describeDecline()` in `trends.js` - which is what makes the "three
 * consecutive falling sessions" rule testable in `node --test`. This file only
 * renders what it is handed, and renders nothing when handed nothing.
 *
 * Two rules about the wording are structural rather than editorial. The headline
 * is `ALERT_HEADLINE`, not a copy of the string, so the sentence the spec
 * requires cannot drift. And `ALERT_NOT_A_DIAGNOSIS` is rendered directly
 * beneath it in the same card, because a caregiver who reads "consider a
 * check-in with a doctor" and then has to scroll to find out it is not a
 * diagnosis has already had the fright.
 *
 * Warn colours, not `bad`: this is "worth mentioning at the next appointment",
 * and red would say "emergency" to someone reading it on a phone in a hurry.
 */
export default function DeclineAlert({ alerts }) {
  const list = Array.isArray(alerts) ? alerts : [];
  if (list.length === 0) return null;

  return (
    <section
      role="status"
      aria-live="polite"
      className="mt-5 rounded-xl2 border-4 border-warn bg-warn-light p-6"
    >
      <h2 className="text-2xl font-bold text-ink">{ALERT_HEADLINE}</h2>

      <ul className="mt-4 space-y-3">
        {list.map((alert) => (
          <li key={alert.domain} className="border-t border-warn/25 pt-3 first:border-0 first:pt-0">
            <p className="text-lg text-ink">{alert.detail}</p>
            <p className="mt-1 text-ink-soft">{alert.suggestion}</p>
          </li>
        ))}
      </ul>

      <p className="mt-4 rounded-xl2 bg-card px-5 py-4 text-base text-ink-soft">
        <strong className="font-semibold text-ink">This is not a diagnosis.</strong>{' '}
        {ALERT_NOT_A_DIAGNOSIS}
      </p>
    </section>
  );
}
