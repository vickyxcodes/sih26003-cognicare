/** Caregiver authentication adapter. Firebase stays lazy in local-only mode. */
import { isFirebaseConfigured } from '../config/env.js';

let sdkPromise = null;

function loadSdk() {
  if (!sdkPromise) {
    sdkPromise = import('../config/firebase.js').catch((error) => {
      sdkPromise = null;
      throw error;
    });
  }
  return sdkPromise;
}

export async function currentCaregiver() {
  if (!isFirebaseConfigured()) return null;
  const sdk = await loadSdk();
  const user = await sdk.getCurrentAuthUser();
  return user && !user.isAnonymous ? user : null;
}

export async function signInCaregiver(email, password) {
  const sdk = await loadSdk();
  return sdk.signInCaregiver(email, password);
}

export async function createCaregiverAccount(email, password) {
  const sdk = await loadSdk();
  return sdk.createCaregiverAccount(email, password);
}

export async function signOutCaregiver() {
  if (!isFirebaseConfigured()) return;
  const sdk = await loadSdk();
  return sdk.signOutCaregiver();
}
