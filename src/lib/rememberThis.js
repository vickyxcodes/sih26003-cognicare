/**
 * Rules for the local "Remember This" delayed-recall feature.
 *
 * The due state is always derived from dueAt. Timers are only a convenience for
 * checking while the app is open; reopening the app works from these records.
 */
export const REMEMBER_THIS_DELAYS = [
  { id: '10-seconds', ms: 10 * 1000, labelKey: 'tenSeconds' },
  { id: '30-seconds', ms: 30 * 1000, labelKey: 'thirtySeconds' },
  { id: '1-minute', ms: 60 * 1000, labelKey: 'oneMinute' },
  { id: '5-minutes', ms: 5 * 60 * 1000, labelKey: 'fiveMinutes' },
  { id: '2-hours', ms: 2 * 60 * 60 * 1000, labelKey: 'twoHours' },
];

export const DEFAULT_REMEMBER_DELAY_MS = 2 * 60 * 60 * 1000;
export const REMEMBER_STATUSES = ['pending', 'due', 'completed', 'dismissed'];
export const REMEMBER_OUTCOMES = ['remembered', 'needed_help'];

const delayValues = new Set(REMEMBER_THIS_DELAYS.map((option) => option.ms));
const finiteTime = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export function isRememberDelay(value) {
  return delayValues.has(Number(value));
}

export function makeRememberThis({ fact, delayMs = DEFAULT_REMEMBER_DELAY_MS, createdAt = Date.now() } = {}) {
  const text = String(fact ?? '').trim();
  if (!text) throw new Error('a memory fact is required');
  if (text.length > 120) throw new Error('a memory fact must be 120 characters or fewer');
  const delay = Number(delayMs);
  if (!isRememberDelay(delay)) throw new Error('an allowed memory delay is required');
  const created = finiteTime(createdAt, Date.now());
  return {
    fact: text,
    createdAt: created,
    dueAt: created + delay,
    delayMs: delay,
    status: 'pending',
    recallAttempted: false,
    recallAt: null,
    recallOutcome: null,
    recallText: '',
    completedAt: null,
    dismissedAt: null,
  };
}

export function isRememberThisRecord(row) {
  return Boolean(
    row && typeof row === 'object'
      && typeof row.fact === 'string' && row.fact.trim()
      && Number.isFinite(Number(row.createdAt))
      && Number.isFinite(Number(row.dueAt))
      && isRememberDelay(row.delayMs)
      && REMEMBER_STATUSES.includes(row.status)
  );
}

export function markRememberDue(row, now = Date.now()) {
  if (!isRememberThisRecord(row) || row.status !== 'pending' || Number(row.dueAt) > now) return row;
  return { ...row, status: 'due' };
}

export function dueRememberThis(rows = [], now = Date.now()) {
  return (Array.isArray(rows) ? rows : [])
    .filter(isRememberThisRecord)
    .map((row) => markRememberDue(row, now))
    .filter((row) => (row.status === 'due' || row.status === 'pending') && Number(row.dueAt) <= now)
    .sort((a, b) => Number(a.dueAt) - Number(b.dueAt));
}

export function completeRememberThis(row, { outcome = 'remembered', recallText = '', now = Date.now() } = {}) {
  if (!isRememberThisRecord(row)) throw new Error('a valid memory record is required');
  if (!REMEMBER_OUTCOMES.includes(outcome)) throw new Error('a valid recall outcome is required');
  const text = String(recallText ?? '').trim();
  if (text.length > 120) throw new Error('recall text must be 120 characters or fewer');
  return {
    ...row,
    status: 'completed',
    recallAttempted: true,
    recallAt: finiteTime(now, Date.now()),
    recallOutcome: outcome,
    recallText: text,
    completedAt: finiteTime(now, Date.now()),
    dismissedAt: null,
  };
}

export function dismissRememberThis(row, now = Date.now()) {
  if (!isRememberThisRecord(row)) throw new Error('a valid memory record is required');
  const time = finiteTime(now, Date.now());
  return {
    ...row,
    status: 'dismissed',
    recallAttempted: false,
    dismissedAt: time,
  };
}
