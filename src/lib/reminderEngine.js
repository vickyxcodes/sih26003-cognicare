/**
 * reminderEngine - when a reminder is due, and what it becomes, as pure functions.
 *
 * Like sessionEngine, no React, no storage, no speech and no imports at all: the
 * clock is passed in as `now`, so `node --test` can play a whole day in a few
 * milliseconds and the same day always comes out the same way. The component in
 * `src/components/ReminderOverlay.jsx` is the only thing that keeps time, speaks
 * and writes; every rule below is decided here.
 *
 * A slot is `{ id, type, at: 'HH:MM', days? }` (see `src/data/reminders.js`).
 * `slotsToday` turns one into `{ ...slot, dueAt }` - a real instant in local
 * wall-clock time, which is what a reminder means to the person waiting for it.
 * Nothing here needs the network, so reminders work exactly the same offline.
 *
 * Two numbers the spec left open, both judgment calls recorded in DECISIONS.md:
 *   TIMEOUT_MS      how long a reminder waits on screen before it counts as missed
 *   FIRE_WINDOW_MS  how late a reminder may still be announced at all
 */

/** The two statuses the spec defines. `store.js` validates against its own copy
 *  of this list, and a test pins the two together so they cannot drift. */
export const STATUS = { dismissed: 'dismissed', missed: 'missed' };

/**
 * A reminder waits on screen for 90 seconds, then logs itself as missed.
 *
 * Long enough for someone slow to stand up and reach the device (the spec's
 * audience), short enough that the card is gone before the patient forgets why it
 * appeared and long before a caregiver could mistake a stale card for a live one.
 */
export const TIMEOUT_MS = 90 * 1000;

/** Halfway through the wait the line is spoken once more - once, not on a loop:
 *  a repeating voice reads as nagging, and silence for 90 seconds reads as
 *  nothing happening. */
export const REPEAT_AFTER_MS = 45 * 1000;

/**
 * How late a reminder may still appear. The app is not always open at 08:00, so a
 * reminder is still worth showing shortly afterwards - but a medicine prompt hours
 * late is worse than none, because the patient cannot tell it is late.
 */
export const FIRE_WINDOW_MS = 30 * 60 * 1000;

/** The whole span in which an event for one slot can be written: shown at the
 *  last allowed moment, then timing out. Slots of the same type must be further
 *  apart than this, or one slot's event could resolve another's. */
export const SLOT_SPAN_MS = FIRE_WINDOW_MS + TIMEOUT_MS;

/** How often the overlay looks at the clock. One second is enough for a schedule
 *  written in minutes, and cheap. */
export const CHECK_EVERY_MS = 1000;

/** Midnight before `now`, local time - the window the day's events are read for. */
export function startOfDay(now) {
  const day = new Date(now);
  day.setHours(0, 0, 0, 0);
  return day.getTime();
}

/** Today's instant for a slot's wall-clock time. */
export function slotTime(slot, now) {
  const [hours, minutes] = String(slot.at).split(':');
  const at = new Date(now);
  at.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);
  return at.getTime();
}

/**
 * The slots that belong to the day `now` falls in, each with its `dueAt`, in time
 * order. A slot with no `days` happens every day.
 */
export function slotsToday(schedule, now) {
  const weekday = new Date(now).getDay();
  return (schedule || [])
    .filter((slot) => !slot.days || slot.days.includes(weekday))
    .map((slot) => ({ ...slot, dueAt: slotTime(slot, now) }))
    .sort((a, b) => a.dueAt - b.dueAt);
}

/**
 * Has this slot already been dealt with?
 *
 * The stored event carries only `{type, status, timestamp}` - the schema the spec
 * fixes - so a slot is matched to its event by type and by falling inside the
 * slot's own span. That is what stops a reload, or a second device tab, from
 * announcing a reminder the patient already tapped Done on.
 *
 * Takes a slot from `slotsToday` (it needs `dueAt`).
 */
export function isResolved(slot, events = []) {
  const until = slot.dueAt + SLOT_SPAN_MS;
  return (events || []).some(
    (event) =>
      event && event.type === slot.type && event.timestamp >= slot.dueAt && event.timestamp < until
  );
}

/**
 * The reminder to show right now, or null.
 *
 * Due, still inside its window, and not already dealt with today. If more than
 * one qualifies the earliest is taken first - it is the one closest to expiring,
 * and showing them in the order they were meant to happen is what a patient
 * expects. A slot whose window has closed is never shown and, deliberately, never
 * logged: see DECISIONS.md - the app cannot know what happened while it was
 * closed, and a made-up "missed" row would mislead the caregiver.
 */
export function dueSlot({ schedule, now, events = [] }) {
  const ready = slotsToday(schedule, now).filter(
    (slot) => now >= slot.dueAt && now < slot.dueAt + FIRE_WINDOW_MS && !isResolved(slot, events)
  );
  return ready.length ? ready[0] : null;
}

/** A reminder on screen. `repeated` is set once the line has been said again. */
export function showReminder(slot, now) {
  return { slot, shownAt: now, repeated: false };
}

/** Exactly the row the store accepts: no id, no wording, no schedule. */
export function reminderEvent(slot, status, now) {
  return { type: slot.type, status, timestamp: now };
}

/**
 * One look at the clock while a reminder is on screen.
 *
 * Returns the reminder as it now stands and, when it is over, the event to log.
 * An unchanged reminder is returned by identity, so the caller can tell "nothing
 * happened" from "say the line again" without comparing fields.
 */
export function reminderTick(reminder, now) {
  if (!reminder) return { reminder: null, event: null };
  const waiting = now - reminder.shownAt;
  if (waiting >= TIMEOUT_MS) {
    return { reminder: null, event: reminderEvent(reminder.slot, STATUS.missed, now) };
  }
  if (!reminder.repeated && waiting >= REPEAT_AFTER_MS) {
    return { reminder: { ...reminder, repeated: true }, event: null };
  }
  return { reminder, event: null };
}

/** The Done tap. One event, written immediately by the caller. */
export function dismissReminder(reminder, now) {
  if (!reminder) return { reminder: null, event: null };
  return { reminder: null, event: reminderEvent(reminder.slot, STATUS.dismissed, now) };
}
