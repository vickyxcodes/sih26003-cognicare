/**
 * Firebase connection (Firestore + Anonymous Auth only).
 *
 * Everything here is lazy and optional: if .env has no credentials we return
 * null and the whole app keeps working in local-only mode.
 */
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from './env.js';

let instance = null;
let authPromise = null;

export function getFirebase() {
  if (!isFirebaseConfigured()) return null;
  if (!instance) {
    const app = initializeApp(firebaseConfig);
    instance = { app, auth: getAuth(app), db: getFirestore(app) };
  }
  return instance;
}

/**
 * Signs the device in anonymously (no login screen, ever) and resolves with the
 * user. Resolves to null when Firebase is not configured.
 */
export function ensureAnonymousAuth() {
  const fb = getFirebase();
  if (!fb) return Promise.resolve(null);
  if (fb.auth.currentUser) return Promise.resolve(fb.auth.currentUser);

  if (!authPromise) {
    authPromise = new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        fb.auth,
        (user) => {
          if (user) {
            unsubscribe();
            resolve(user);
          }
        },
        (error) => {
          unsubscribe();
          authPromise = null;
          reject(error);
        }
      );

      signInAnonymously(fb.auth).catch((error) => {
        unsubscribe();
        authPromise = null;
        reject(error);
      });
    });
  }

  return authPromise;
}
