/**
 * Service-worker registration.
 *
 * `virtual:pwa-register` is provided by vite-plugin-pwa at build time, which is
 * why this thin file is kept separate from the testable swStatus store.
 */
import { registerSW } from 'virtual:pwa-register';
import { setSwStatus } from './swStatus.js';

export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.info('[CogniCare] service workers unavailable - offline mode disabled');
    return null;
  }

  return registerSW({
    immediate: true,
    onOfflineReady() {
      setSwStatus({ offlineReady: true });
      console.info('[CogniCare] app cached - ready to use with no internet');
    },
    onNeedRefresh() {
      // registerType is 'autoUpdate', so this is informational only.
      setSwStatus({ needRefresh: true });
    },
    onRegisteredSW(url) {
      setSwStatus({ registered: true });
      console.info('[CogniCare] service worker registered:', url);
    },
    onRegisterError(error) {
      setSwStatus({ error: String(error) });
      console.warn('[CogniCare] service worker registration failed', error);
    },
  });
}
