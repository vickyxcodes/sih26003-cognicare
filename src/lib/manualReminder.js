/** Pure rules for one-time, locally stored manual reminders. */
export const MANUAL_REMINDER_TYPES = ['medicine', 'hydration', 'appointment', 'exercise', 'custom'];
export const MANUAL_REMINDER_STATUSES = ['scheduled', 'completed'];

const timeOf = (value, fallback = Date.now()) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export function makeManualReminder({ title, reminderAt, type = 'custom', note = '', createdAt = Date.now() } = {}) {
  const words = String(title ?? '').trim();
  if (!words) throw new Error('a reminder title is required');
  if (words.length > 120) throw new Error('a reminder title must be 120 characters or fewer');
  if (!MANUAL_REMINDER_TYPES.includes(type)) throw new Error('a valid reminder type is required');
  const detail = String(note ?? '').trim();
  if (detail.length > 120) throw new Error('a reminder note must be 120 characters or fewer');
  const at = Number(reminderAt);
  if (!Number.isFinite(at) || at < 0) throw new Error('a valid reminder time is required');
  return {
    title: words,
    reminderAt: at,
    type,
    note: detail,
    createdAt: timeOf(createdAt),
    status: 'scheduled',
    completedAt: null,
  };
}

export function isManualReminderRecord(row) {
  return Boolean(
    row && typeof row === 'object'
      && typeof row.title === 'string' && row.title.trim()
      && Number.isFinite(Number(row.reminderAt))
      && MANUAL_REMINDER_TYPES.includes(row.type)
      && MANUAL_REMINDER_STATUSES.includes(row.status)
  );
}

export function dueManualReminders(rows = [], now = Date.now()) {
  return (Array.isArray(rows) ? rows : [])
    .filter((row) => isManualReminderRecord(row) && row.status === 'scheduled' && Number(row.reminderAt) <= now)
    .sort((a, b) => Number(a.reminderAt) - Number(b.reminderAt));
}

export function completeManualReminder(row, now = Date.now()) {
  if (!isManualReminderRecord(row)) throw new Error('a valid manual reminder is required');
  return { ...row, status: 'completed', completedAt: timeOf(now) };
}
