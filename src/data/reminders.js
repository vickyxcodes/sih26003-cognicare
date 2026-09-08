/**
 * reminders - the local reminder schedule and its words, as data.
 *
 * Scheduling is entirely local wall-clock time: a slot is a type plus an
 * `HH:MM`, and `reminderEngine.js` turns that into today's instant. Nothing here
 * is fetched and nothing here is stored - the only thing that ever reaches the
 * database is `{type, status, timestamp}`, so no wording, no schedule and nothing
 * about the patient's day leaves the device.
 *
 * The schedule is a fixed, sensible default. Letting a caregiver edit it would
 * need a settings screen, which this prototype's scope rules out (no admin
 * panel), so it is bundled with the app and documented rather than made editable.
 *
 * `days` is optional and follows Date#getDay() (0 = Sunday); omitted means every
 * day. Slots of the same type are deliberately kept well apart - a reminder is
 * matched to its slot by type and time, so see SLOT_SPAN_MS in reminderEngine.js
 * and the test that enforces the gap.
 */
export const REMINDER_SCHEDULE = [
  { id: 'medicine-morning', type: 'medicine', at: '08:00' },
  { id: 'appointment-weekly', type: 'appointment', at: '10:00', days: [2] },
  { id: 'hydration-late-morning', type: 'hydration', at: '11:00' },
  { id: 'medicine-afternoon', type: 'medicine', at: '14:00' },
  { id: 'hydration-afternoon', type: 'hydration', at: '16:00' },
  { id: 'hydration-evening', type: 'hydration', at: '19:00' },
  { id: 'medicine-night', type: 'medicine', at: '20:00' },
];

/**
 * One sentence per type, and one existing drawing to go with it.
 *
 * The card renders `line` and the voice speaks the same string, so - exactly as
 * in the games - a patient can never hear one sentence and read another. Each
 * line is an instruction in plain words, with no clinical detail in it: an
 * appointment reminder says an appointment, never what it is for.
 */
export const REMINDER_WORDING = {
  medicine: { pictureId: 'medicine', line: 'It is time to take your medicine.' },
  hydration: { pictureId: 'glass', line: 'Please have a drink of water.' },
  appointment: {
    pictureId: 'clock',
    line: 'You have an appointment today. Someone will help you get ready.',
  },
};

/** The words for a slot, or null if a slot ever carries an unknown type. */
export function reminderWords(slot) {
  return (slot && REMINDER_WORDING[slot.type]) || null;
}
