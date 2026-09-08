/**
 * demo-plan - prints the history the seeder would write, from the terminal.
 *
 * This is NOT the seeder. It cannot be: the app's history lives in IndexedDB, in
 * the browser, and no Node script can reach it. Seeding happens in the page via
 * `window.cognicare.seedDemo()` or `?demo=seed` (see src/lib/demoConsole.js).
 *
 * What this gives you is a way to check the fabricated numbers - the decline, the
 * day spread, the tiers - before or without running a demo, by calling the exact
 * same `buildDemoHistory` the browser calls. `npm run demo:plan`.
 */
import {
  buildDemoHistory,
  DECLINING_DOMAIN,
  DEMO_DAYS,
  DEMO_SEED,
  MEMORY_DOMAIN,
  ROUTINE_DOMAIN,
  STEADY_DOMAIN,
} from '../src/lib/demoData.js';

const history = buildDemoHistory({ now: Date.now() });
const when = (ts) => new Date(ts).toISOString().replace('T', ' ').slice(0, 16);

const line = (domain) => {
  const rows = history.sessions.filter((s) => s.domain === domain);
  const label = domain === DECLINING_DOMAIN ? 'declining' : 'steady';
  console.log(`\n${domain}  (${rows.length} sessions, ${label})`);
  for (const row of rows) {
    console.log(`  ${when(row.timestamp)}  score ${String(row.score).padStart(3)}  tier ${row.difficultyTierEnd}`);
  }
  console.log(`  scores: ${rows.map((r) => r.score).join(' -> ')}`);
};

console.log(`CogniCare demo plan - seed ${DEMO_SEED}, ${DEMO_DAYS} days back`);
console.log(`declining domain: ${DECLINING_DOMAIN}   steady domain: ${STEADY_DOMAIN}`);
line(MEMORY_DOMAIN);
line(ROUTINE_DOMAIN);

console.log(`\nreminder events (${history.reminderEvents.length})`);
for (const row of history.reminderEvents) {
  console.log(`  ${when(row.timestamp)}  ${row.type.padEnd(11)} ${row.status}`);
}

console.log(
  `\nanswers: ${history.answers.length} rows (local only, never synced)\n` +
    `every row carries demo: 1, so window.cognicare.resetDemo() removes exactly these.\n` +
    `to actually seed, open the app and run window.cognicare.seedDemo() - IndexedDB is browser-only.`
);
