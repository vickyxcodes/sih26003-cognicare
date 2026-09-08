/**
 * Tiny observable for service-worker state.
 * Dependency-free so it can be unit tested without a bundler or browser.
 */

const state = {
  offlineReady: false,
  needRefresh: false,
  registered: false,
  error: null,
};

const listeners = new Set();

export function getSwStatus() {
  return { ...state };
}

export function setSwStatus(patch) {
  Object.assign(state, patch);
  const snapshot = getSwStatus();
  listeners.forEach((fn) => {
    try {
      fn(snapshot);
    } catch (err) {
      console.warn('[CogniCare] sw status listener failed', err);
    }
  });
  return snapshot;
}

export function subscribeSwStatus(fn) {
  listeners.add(fn);
  fn(getSwStatus());
  return () => listeners.delete(fn);
}

/** Test helper: drop all listeners and reset flags. */
export function resetSwStatus() {
  listeners.clear();
  Object.assign(state, { offlineReady: false, needRefresh: false, registered: false, error: null });
}
