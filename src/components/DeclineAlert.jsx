import { ALERT_HEADLINE, ALERT_NOT_A_DIAGNOSIS } from '../lib/trends.js';
import { BANKS } from '../data/banks.js';
import { useLanguage } from './LanguageContext.jsx';
import { dashboardText, localizeBank } from '../lib/i18n.js';

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
  const { language } = useLanguage();
  const d = (key) => dashboardText(language, key);
  const list = Array.isArray(alerts) ? alerts : [];
  if (list.length === 0) return null;

  return (
    <section
      role="status"
      aria-live="polite"
      className="mt-5 rounded-xl2 border-4 border-warn bg-warn-light p-6"
    >
      <h2 className="text-2xl font-bold text-ink">{language === 'as' ? d('decline') : ALERT_HEADLINE}</h2>

      <ul className="mt-4 space-y-3">
        {list.map((alert) => (
          <li key={alert.domain} className="border-t border-warn/25 pt-3 first:border-0 first:pt-0">
            <p className="text-lg text-ink">{language === 'as' ? declineDetail(alert) : alert.detail}</p>
            <p className="mt-1 text-ink-soft">{language === 'as' ? 'এই কথাটো ৰোগীৰ পৰৱৰ্তী সাধাৰণ চিকিৎসা সাক্ষাতত জনাব পাৰে। ডিভাইচত একো সলনি কৰাৰ প্ৰয়োজন নাই।' : alert.suggestion}</p>
          </li>
        ))}
      </ul>

      <p className="mt-4 rounded-xl2 bg-card px-5 py-4 text-base text-ink-soft">
        <strong className="font-semibold text-ink">{language === 'as' ? d('notDiagnosis') : 'This is not a diagnosis.'}</strong>{' '}
        {language === 'as' ? 'কম স্ক’ৰ ভাগৰুৱা হোৱা, শব্দ, বাধা বা কেইটামান কঠিন প্ৰশ্নৰ বাবে হ’ব পাৰে। কেৱল চিকিৎসকেহে ইয়াৰ অৰ্থ ক’ব পাৰে।' : ALERT_NOT_A_DIAGNOSIS}
      </p>
    </section>
  );
}

function declineDetail(alert) {
  const bank = BANKS.find((candidate) => candidate.domain === alert.domain);
  const name = bank ? localizeBank(bank, 'as').name : alert.label;
  return `${name}ৰ শেহতীয়া ${alert.run} টা ছেছনত প্ৰতিবাৰ স্ক’ৰ কমিছে—প্ৰায় ${alert.from}%ৰ পৰা ${alert.to}%লৈ।`;
}
