/**
 * Build-time configuration read from Vite env vars (see .env.example).
 *
 * Deliberate design point: the app must be fully usable with none of these set.
 * When Firebase is not configured we run in LOCAL-ONLY MODE - every feature
 * still works, records simply stay queued in IndexedDB.
 */

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export function isFirebaseConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
}

export const IS_DEV = Boolean(import.meta.env.DEV);
