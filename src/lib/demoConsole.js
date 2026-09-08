/**
 * demoConsole - how a demonstrator actually triggers the seed.
 *
 * The mechanism question was the one real design decision in step 13, because the
 * obvious answer does not work: IndexedDB is a browser API, so `node
 * scripts/seed-demo.mjs` has no database to write to. The seed has to run inside
 * the page that owns the data.
 *
 * Of the ways to do that from inside the page, this file uses the two cheapest:
 *
 *   1. `window.cognicare.seedDemo()` in DevTools - the primary mechanism.
 *   2. `?demo=seed` / `?demo=reset` on any app URL - the same two functions, for
 *      when a projector is showing the tablet and nobody wants to open DevTools.
 *
 * What was rejected, and why:
 *   - A settings screen or hidden admin page. The spec forbids an admin panel
 *     outright, and it would also be a new route, a new screen for a patient to
 *     wander into, and a fourth entry in `ROUTES` in `scripts/check-static.mjs`.
 *   - A button on the caregiver dashboard. Less bad, but it is still demo
 *     machinery living in the product, visible to a real caregiver, one mis-tap
 *     away from fabricating history on a real patient's device.
 *   - Seeding automatically on first run. It would make the app lie to its first
 *     real user, which is worse than any amount of demo inconvenience.
 *
 * A console helper is the one option that adds nothing a patient or caregiver can
 * see or reach by accident: no route, no screen, no button, and no effect at all
 * unless somebody types it. The query-string form is the same code path with a
 * different trigger, and it strips itself out of the URL afterwards so a reload
 * does not silently re-seed.
 *
 * This module is exposed in every build rather than dev-only. That is deliberate:
 * the demo is given from the deployed GitHub Pages URL, and a build flag that
 * removed the helper there would leave the judges' copy unable to show the very
 * thing this step exists for. It writes nothing on import.
 */
import {
  buildDemoHistory,
  clearDemoHistory,
  DECLINING_DOMAIN,
  DEMO_DAYS,
  demoHistoryCounts,
  seedDemoHistory,
  STEADY_DOMAIN,
} from './demoData.js';

/** The global the helper hangs off. */
export const DEMO_GLOBAL = 'cognicare';

/** The query parameter, and the two values it understands. */
export const DEMO_PARAM = 'demo';
export const DEMO_ACTIONS = { seed: 'seed', reset: 'reset' };

const LINE = '[CogniCare demo]';

/**
 * The helper object, built over an injected store and console so a test can call
 * every branch without a browser.
 *
 * Each function returns its result as well as printing it: printing is for the
 * human at the console, returning is for the query-string path and the tests.
 */
export function createDemoConsole({ store, now = Date.now, log = console } = {}) {
  if (!store) throw new Error('createDemoConsole needs a store');

  const say = (...args) => {
    if (log && typeof log.info === 'function') log.info(LINE, ...args);
  };

  return {
    /**
     * Fabricates the history and reports what it wrote. Safe to run repeatedly -
     * the previous seed is removed first, and the new one is deterministic, so a
     * second run leaves the database exactly as the first did.
     */
    async seedDemo() {
      const result = await seedDemoHistory(store, { now: now() });
      say(
        `seeded ${result.seeded.sessions} sessions and ${result.seeded.reminderEvents} reminder events across ${result.days} days`
      );
      say(`${DECLINING_DOMAIN} declines, ${STEADY_DOMAIN} stays steady`);
      say('open /caregiver, tap "Use this device\'s code", and the dashboard will show it');
      return result;
    },

    /** Removes the fabricated rows and nothing else - pairing survives. */
    async resetDemo() {
      const removed = await clearDemoHistory(store);
      const total = Object.values(removed).reduce((sum, n) => sum + n, 0);
      say(`removed ${total} demo rows; real history, pairing code and device id untouched`);
      return removed;
    },

    /** What is in storage right now, demo versus real. */
    async demoStatus() {
      const counts = await demoHistoryCounts(store);
      say('demo rows:', counts.demo, 'real rows:', counts.real);
      return counts;
    },

    /**
     * The history the next seed *would* write, without writing it. Useful when
     * someone wants to check the numbers before touching the database, and it is
     * the same function `npm run demo:plan` prints from Node.
     */
    demoPlan() {
      return buildDemoHistory({ now: now() });
    },

    /** Printed on install, so the commands are discoverable without the README. */
    help() {
      say(`${DEMO_GLOBAL}.seedDemo()   fabricate ${DEMO_DAYS} days of history`);
      say(`${DEMO_GLOBAL}.resetDemo()  remove it again`);
      say(`${DEMO_GLOBAL}.demoStatus() count demo vs real rows`);
      return true;
    },
  };
}

/**
 * Runs the action a URL asked for, if it asked for one, and returns what it did.
 *
 * The parameter is removed from the address bar with `replaceState` once handled:
 * leaving `?demo=seed` in the URL would mean every reload re-seeds, and worse,
 * that a demonstrator who bookmarked the page re-seeds on every future visit. The
 * seed is idempotent so that would be harmless, but silent repeated writes are
 * still the wrong behaviour.
 */
export async function runDemoFromUrl(helper, { location, history } = {}) {
  const search = location && location.search;
  if (!search) return null;
  const wanted = new URLSearchParams(search).get(DEMO_PARAM);
  if (wanted !== DEMO_ACTIONS.seed && wanted !== DEMO_ACTIONS.reset) return null;

  if (history && typeof history.replaceState === 'function') {
    const url = new URL(location.href);
    url.searchParams.delete(DEMO_PARAM);
    history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }

  const result =
    wanted === DEMO_ACTIONS.seed ? await helper.seedDemo() : await helper.resetDemo();
  return { action: wanted, result };
}

/**
 * Attaches the helper to `window` and honours a `?demo=` parameter.
 *
 * Called once from `main.jsx`. Every failure is caught and logged: a broken demo
 * helper must not stop the patient's app from rendering, which is the same rule
 * every other write path in this app follows.
 */
export function installDemoConsole({ store, scope, now = Date.now, log = console } = {}) {
  const target = scope || (typeof window === 'undefined' ? null : window);
  if (!target || !store) return null;

  const helper = createDemoConsole({ store, now, log });
  target[DEMO_GLOBAL] = { ...(target[DEMO_GLOBAL] || {}), ...helper };
  helper.help();

  Promise.resolve()
    .then(() => runDemoFromUrl(helper, { location: target.location, history: target.history }))
    .catch((error) => {
      if (log && typeof log.warn === 'function') log.warn(LINE, 'could not run', error);
    });

  return helper;
}
