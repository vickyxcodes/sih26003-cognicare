/**
 * caregiverData - what the caregiver screens are allowed to know, and how they
 * find it out.
 *
 * Pure logic over an injected `remote` and the existing record store, for the
 * same reason `sync.js` is: the rules that matter here are privacy rules, and a
 * privacy rule that can only be checked by opening a browser is a rule nobody
 * checks. Nothing in this file imports Firebase or `config/env.js` - the page
 * composes the real Firestore remote and passes it in.
 *
 * Three rules run through everything below.
 *
 * 1. A row is only ever shown if it carries the pairing code that was typed in.
 *    The Firestore query filters on the server, and `onlyForCode` filters again
 *    here, so a query mistake cannot put one patient's sessions on another
 *    caregiver's screen.
 * 2. The caregiver's typed code is stored under its own settings key. The
 *    device's own `pairingCode` is a different thing (the sync layer mints one on
 *    every device, including a caregiver's), and conflating the two would show a
 *    caregiver their own empty device instead of the patient's records.
 * 3. Local records may only be read when the typed code IS this device's own
 *    code. Local rows carry no pairing code - they are simply "this device's" -
 *    so any other code means they are not the rows being asked for.
 */
import { REMINDER_TYPES, REMINDER_STATUSES, STORES } from './store.js';
import { isPairingCode, PAIRING_CODE_LENGTH } from './privacy.js';
import { SETTINGS, isPermissionDenied } from './sync.js';
import { AGE, describeAge, formatWhen, isStamp } from './timeWords.js';

/** Where the caregiver's typed code is kept - never `SETTINGS.pairingCode`. */
export const CAREGIVER_CODE_KEY = 'caregiverCode';

/** An upper bound on a read, so one long-lived demo cannot fetch thousands of rows. */
export const REMOTE_MAX = 300;

/** How many reminder events the log shows. */
export const LOG_LIMIT = 12;

export const SOURCE = { remote: 'remote', local: 'local', none: 'none' };

export const READ_ERROR = { unreachable: 'unreachable', denied: 'denied', none: null };

/** Caregiver-facing words for the three reminder types. */
export const REMINDER_LABELS = {
  medicine: 'Medicine',
  hydration: 'Water',
  appointment: 'Appointment',
};

/** The two statuses the reminder card can write, in caregiver language. */
export const STATUS_LABELS = {
  dismissed: { words: 'Marked done', tone: 'good' },
  missed: { words: 'No answer', tone: 'warn' },
};

/**
 * Codes are typed by a person, so a lower-case code, a stray space or the dash
 * someone adds in the middle all have to work. Nothing else is accepted.
 */
export function normaliseCode(raw) {
  return String(raw == null ? '' : raw).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function validateCode(raw) {
  const code = normaliseCode(raw);
  if (!code) return { ok: false, code, reason: 'Enter the code shown on the patient’s device.' };
  if (code.length !== PAIRING_CODE_LENGTH) {
    return {
      ok: false,
      code,
      reason: `A pairing code is ${PAIRING_CODE_LENGTH} characters long - this one has ${code.length}.`,
    };
  }
  if (!isPairingCode(code)) {
    return {
      ok: false,
      code,
      reason: 'That is not a pairing code. They never contain the letters I or O, or the digits 0 and 1.',
    };
  }
  return { ok: true, code, reason: '' };
}

export async function readStoredCode(store) {
  const stored = await store.getSetting(CAREGIVER_CODE_KEY, null);
  return isPairingCode(stored) ? stored : null;
}

export async function saveCode(store, raw) {
  const check = validateCode(raw);
  if (!check.ok) throw new Error(check.reason);
  await store.setSetting(CAREGIVER_CODE_KEY, check.code);
  return check.code;
}

export async function forgetCode(store) {
  await store.setSetting(CAREGIVER_CODE_KEY, '');
  return null;
}

/**
 * Rows are rebuilt field by field rather than spread, which is what makes the
 * privacy promise structural: if a document in Firestore ever grew a field it
 * should not have, the dashboard could not display it even by accident. It also
 * makes the two sources identical - a Firestore session document holds only
 * these fields, so the local copy is narrowed to the same shape.
 */
export function normaliseSession(row, fallbackId = '') {
  if (!row) return null;
  return {
    id: String(row.docId || row.id || fallbackId),
    pairingCode: typeof row.pairingCode === 'string' ? row.pairingCode : '',
    domain: String(row.domain || ''),
    score: Number(row.score),
    difficultyTierEnd: Number(row.difficultyTierEnd) || 1,
    timestamp: Number(row.timestamp) || 0,
  };
}

export function normaliseReminder(row, fallbackId = '') {
  if (!row) return null;
  return {
    id: String(row.docId || row.id || fallbackId),
    pairingCode: typeof row.pairingCode === 'string' ? row.pairingCode : '',
    type: String(row.type || ''),
    status: String(row.status || ''),
    timestamp: Number(row.timestamp) || 0,
  };
}

/**
 * The second filter. The Firestore query is the first; neither is trusted alone.
 *
 * The empty-code guard is not theoretical. Without it, an empty `code` would
 * match every row whose `pairingCode` is also empty - and an empty string is
 * exactly what a partially-written document, or a row narrowed by
 * `normaliseSession` from something unexpected, ends up carrying. A filter that
 * silently means "everything unattributed" is the wrong failure for this screen,
 * so an unusable code matches nothing at all.
 */
export function onlyForCode(rows, code) {
  if (typeof code !== 'string' || !code) return [];
  return (Array.isArray(rows) ? rows : []).filter((row) => row && row.pairingCode === code);
}

const byTime = (rows) => [...rows].sort((a, b) => a.timestamp - b.timestamp);

/** A remote may answer with an array or with `{rows, fromCache}`; both are fine. */
const rowsOf = (result) => {
  if (Array.isArray(result)) return result;
  if (result && Array.isArray(result.rows)) return result.rows;
  return [];
};
const cacheFlag = (result) => Boolean(result && !Array.isArray(result) && result.fromCache);

export function newestTimestamp(snapshot) {
  const stamps = [...(snapshot.sessions || []), ...(snapshot.reminderEvents || [])]
    .map((row) => Number(row.timestamp) || 0)
    .filter((n) => n > 0);
  return stamps.length ? Math.max(...stamps) : null;
}

/**
 * Everything the dashboard renders, read once.
 *
 * Firestore is asked first whenever it is configured, because on a caregiver's
 * own device it is the only place the patient's sessions exist. If that read
 * fails - offline, denied, no project - the device's own records are used
 * instead, but ONLY when the typed code is this device's code (rule 3 at the top
 * of this file). Otherwise the snapshot comes back empty with the reason
 * attached, and the dashboard says so rather than showing a blank chart that
 * looks like "no sessions".
 *
 * Nothing here writes, updates or deletes anything remote. The only mutation the
 * caregiver screens ever make is storing the typed code in local settings.
 */
export async function loadCaregiverData({ store, remote, code, now = Date.now, limit = REMOTE_MAX }) {
  const check = validateCode(code);
  if (!check.ok) throw new Error(`loadCaregiverData needs a valid pairing code: ${check.reason}`);
  const wanted = check.code;

  const [rawDeviceCode, rawLastSync] = await Promise.all([
    store.getSetting(SETTINGS.pairingCode, null),
    store.getSetting(SETTINGS.lastSyncAt, null),
  ]);
  const deviceCode = isPairingCode(rawDeviceCode) ? rawDeviceCode : null;
  const isOwnDevice = Boolean(deviceCode) && deviceCode === wanted;

  const base = {
    code: wanted,
    deviceCode,
    isOwnDevice,
    lastSyncAt: isStamp(Number(rawLastSync)) ? Number(rawLastSync) : null,
    remoteConfigured: Boolean(remote && remote.isConfigured && remote.isConfigured()),
    source: SOURCE.none,
    sessions: [],
    reminderEvents: [],
    readAt: null,
    fromCache: false,
    pending: null,
    error: null,
  };

  if (isOwnDevice) {
    const queued = await store.pendingSync();
    base.pending = {
      sessions: queued.sessions.length,
      reminderEvents: queued.reminderEvents.length,
    };
  }

  /** This device's own history, narrowed to the shape a remote read returns. */
  const fromLocal = async (extra) => {
    if (!isOwnDevice) return { ...base, ...extra, source: SOURCE.none };
    const [sessions, reminderEvents] = await Promise.all([
      store.sessions({ limit }),
      store.reminderEvents({ limit }),
    ]);
    /* Tagging is legitimate precisely because `isOwnDevice` is true: these rows
     * were written by this device, whose code is the code being asked for. */
    return {
      ...base,
      ...extra,
      source: SOURCE.local,
      readAt: now(),
      sessions: onlyForCode(
        sessions.map((row) => normaliseSession({ ...row, pairingCode: wanted }, `local-${row.id}`)),
        wanted
      ),
      reminderEvents: onlyForCode(
        reminderEvents.map((row) => normaliseReminder({ ...row, pairingCode: wanted }, `local-${row.id}`)),
        wanted
      ),
    };
  };

  if (!base.remoteConfigured) return fromLocal({});

  try {
    const [sessions, reminderEvents] = await Promise.all([
      remote.list({ collection: STORES.sessions, pairingCode: wanted, max: limit }),
      remote.list({ collection: STORES.reminderEvents, pairingCode: wanted, max: limit }),
    ]);
    return {
      ...base,
      source: SOURCE.remote,
      readAt: now(),
      fromCache: cacheFlag(sessions) || cacheFlag(reminderEvents),
      sessions: byTime(onlyForCode(rowsOf(sessions).map((row) => normaliseSession(row)), wanted)),
      reminderEvents: byTime(onlyForCode(rowsOf(reminderEvents).map((row) => normaliseReminder(row)), wanted)),
    };
  } catch (error) {
    const kind = isPermissionDenied(error) ? READ_ERROR.denied : READ_ERROR.unreachable;
    return fromLocal({ error: { kind, message: String((error && error.message) || error) } });
  }
}

/**
 * The reminder log: newest first, because that is the order someone checking on
 * a relative reads it in. Rows whose type or status is not one the app itself
 * writes are dropped - the log is a record of what happened, so an unrecognised
 * row is better left out than guessed at.
 */
export function buildReminderLog(events, { limit = LOG_LIMIT, now = Date.now(), ...options } = {}) {
  const usable = (Array.isArray(events) ? events : []).filter(
    (row) => row
      && REMINDER_TYPES.includes(row.type)
      && REMINDER_STATUSES.includes(row.status)
      && isStamp(Number(row.timestamp))
  );
  const newestFirst = [...usable].sort((a, b) => b.timestamp - a.timestamp);
  const rows = newestFirst.slice(0, limit).map((row) => ({
    id: row.id,
    type: row.type,
    typeLabel: REMINDER_LABELS[row.type],
    status: row.status,
    statusLabel: STATUS_LABELS[row.status].words,
    tone: STATUS_LABELS[row.status].tone,
    timestamp: row.timestamp,
    when: formatWhen(row.timestamp, now, options),
  }));

  const done = rows.filter((row) => row.status === 'dismissed').length;
  const missed = rows.length - done;
  const totalDone = usable.filter((row) => row.status === 'dismissed').length;
  const totalMissed = usable.length - totalDone;
  let summary;
  if (rows.length === 0) {
    summary = 'No reminders have been recorded yet.';
  } else if (missed === 0) {
    summary = rows.length === 1
      ? 'The one reminder recorded so far was marked done.'
      : `Every one of the last ${rows.length} reminders was marked done.`;
  } else if (done === 0) {
    summary = `None of the last ${rows.length} reminders were marked done.`;
  } else {
    summary = `Of the last ${rows.length} reminders, ${done} were marked done and `
      + `${missed} went unanswered.`;
  }

  return {
    rows,
    shown: rows.length,
    total: usable.length,
    done,
    missed,
    totalDone,
    totalMissed,
    completionRate: usable.length ? Math.round((totalDone / usable.length) * 100) : null,
    summary,
  };
}

/**
 * The honest version of "Last synced".
 *
 * Three different times could be meant by that phrase and only one of them is
 * true on any given screen, so the value is always paired with a note saying
 * which it is. When nothing has been read there is no time to show and the value
 * says so - a dashboard that prints the current clock as its sync time is worse
 * than one that admits it does not know.
 */
export function describeFreshness(snapshot, now = Date.now(), options = {}) {
  const newest = newestTimestamp(snapshot);
  const age = describeAge(newest, now, options);
  const rows = (snapshot.sessions || []).length + (snapshot.reminderEvents || []).length;

  let syncValue = 'Unavailable';
  let syncNote = '';
  let sourceWords = '';

  if (snapshot.source === SOURCE.remote) {
    syncValue = formatWhen(snapshot.readAt, now, options);
    sourceWords = 'Read from the patient’s synced records.';
    syncNote = snapshot.fromCache
      ? 'This is when the dashboard last looked - the answer came from the app’s own cache, '
        + 'not from the server, so newer sessions may exist.'
      : 'This is when the dashboard last read the records from the server.';
  } else if (snapshot.source === SOURCE.local) {
    sourceWords = 'Read from this device’s own records.';
    if (snapshot.lastSyncAt) {
      syncValue = formatWhen(snapshot.lastSyncAt, now, options);
      syncNote = 'This is when this device last uploaded its records. The dashboard is showing the '
        + 'device’s own copy, which is the more complete one.';
    } else {
      syncValue = 'Not yet';
      syncNote = 'Nothing has been uploaded from this device yet, so there is no sync time to show. '
        + 'The records below are the device’s own and are complete.';
    }
  } else if (snapshot.error && snapshot.error.kind === READ_ERROR.denied) {
    syncNote = 'The server refused the read. Check that anonymous sign-in is enabled and that the '
      + 'published rules are the ones in firestore.rules.';
  } else if (snapshot.error) {
    syncNote = 'The dashboard could not reach the server, and this device holds no records for '
      + 'this code, so there is nothing to show yet.';
  } else if (!snapshot.remoteConfigured) {
    syncNote = 'This device has no Firebase configuration, so it can only show records it wrote '
      + 'itself - and this code is not this device’s code.';
  } else {
    syncNote = 'No records have been read for this code yet.';
  }

  let warning = '';
  if (snapshot.source === SOURCE.none) {
    warning = 'No records could be read for this pairing code.';
  } else if (snapshot.fromCache) {
    warning = 'Showing cached records - the server could not be reached just now.';
  } else if (rows === 0) {
    warning = '';
  } else if (age.level === AGE.stale) {
    warning = `Nothing new has been recorded for a while: the most recent entry is ${age.words}.`;
  }

  return {
    syncValue,
    syncNote,
    sourceWords,
    activityValue: newest ? formatWhen(newest, now, options) : 'Nothing recorded yet',
    activityNote: newest ? `The most recent entry is ${age.words}.` : '',
    level: age.level,
    warning,
  };
}
