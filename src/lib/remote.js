/**
 * remote - the only file in the app that talks to Firestore.
 *
 * Deliberately thin: sign the device in anonymously, create one document at an
 * id the caller chose, ask the server whether that document is already there, or
 * read back the documents carrying one pairing code. Every rule about what may be
 * sent, when to retry, when a local row may be marked synced and which rows a
 * caregiver may see lives in `sync.js` and `caregiverData.js`, which is why those
 * files can be tested in full without a browser or a Firebase project.
 *
 * Firebase is imported dynamically, so a device in local-only mode (no `.env`)
 * never downloads or parses the SDK and the patient bundle stays small. Vite
 * emits it as its own chunk, which the service worker precaches like any other
 * asset, so an installed app that has synced once can still start offline.
 */
import { isFirebaseConfigured } from '../config/env.js';

let loading = null;

function loadSdk() {
  if (!loading) {
    loading = Promise.all([import('../config/firebase.js'), import('firebase/firestore')])
      .then(([firebase, firestore]) => ({ ...firebase, firestore }))
      .catch((error) => {
        loading = null; // a failed chunk load must not poison every later attempt
        throw error;
      });
  }
  return loading;
}

/**
 * Anonymous auth is the device identity and the security rules require it:
 * `request.auth != null` on every create. There is no other sign-in path, and a
 * write is never attempted without a user.
 */
async function connect() {
  const sdk = await loadSdk();
  const user = await sdk.ensureAnonymousAuth();
  if (!user) throw new Error('anonymous sign-in did not complete');
  const fb = sdk.getFirebase();
  if (!fb) throw new Error('Firebase is not configured');
  return { db: fb.db, firestore: sdk.firestore };
}

export function createFirestoreRemote() {
  return {
    name: 'firestore',

    isConfigured: () => isFirebaseConfigured(),

    /**
     * Creates one document at a caller-chosen id: `setDoc`, never `addDoc`.
     * The id is derived from the local row, so however many times this is
     * retried it addresses the same document - and because the rules allow
     * create but not update, a second successful write is impossible rather
     * than merely unlikely. No `merge`, for the same reason.
     *
     * Resolves only once the server has acknowledged the write.
     */
    async put({ collection, docId, payload }) {
      const { db, firestore } = await connect();
      await firestore.setDoc(firestore.doc(db, collection, docId), payload);
    },

    /**
     * Whether the server already holds that document. `getDocFromServer`, not
     * `getDoc`: the SDK's local cache would happily report a write that is
     * still only queued in this tab, and a row must never be marked synced on
     * the strength of a write the server has not taken. If the read cannot
     * reach the server it throws, and the caller keeps the row queued.
     */
    async exists({ collection, docId }) {
      const { db, firestore } = await connect();
      const snap = await firestore.getDocFromServer(firestore.doc(db, collection, docId));
      return snap.exists();
    },

    /**
     * The caregiver dashboard's only read (step 11). One equality filter and a
     * ceiling, and nothing else:
     *
     *   - `where('pairingCode', '==', code)` is what constrains the read to one
     *     patient, on the server, under the published rules. The dashboard
     *     filters the returned rows by the same code again; neither filter is
     *     trusted on its own.
     *   - deliberately NO `orderBy`. An equality filter plus an order on a
     *     different field is the one shape Firestore needs a hand-built
     *     composite index for, and a demo that dies on "the query requires an
     *     index" is not worth the sorting: a few dozen rows are sorted here.
     *   - `getDocs`, not a listener, so the dashboard reads when it is opened
     *     and when the caregiver asks it to, and never holds a socket open.
     *
     * `fromCache` is passed back rather than hidden: the SDK will answer from its
     * own cache when it cannot reach the server, and the dashboard has to be able
     * to say so instead of presenting stale rows as current.
     */
    async list({ collection, pairingCode, max = 300 }) {
      if (typeof pairingCode !== 'string' || !pairingCode) {
        throw new Error('a remote read must be constrained to a pairing code');
      }
      const { db, firestore } = await connect();
      const snap = await firestore.getDocs(
        firestore.query(
          firestore.collection(db, collection),
          firestore.where('pairingCode', '==', pairingCode),
          firestore.limit(max)
        )
      );
      const rows = snap.docs.map((entry) => ({ docId: entry.id, ...entry.data() }));
      return { rows, fromCache: Boolean(snap.metadata && snap.metadata.fromCache) };
    },
  };
}
