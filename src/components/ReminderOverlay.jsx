import { useCallback, useEffect, useState } from 'react';
import Picture from './Picture.jsx';
import { CheckIcon } from './icons.jsx';
import { REMINDER_SCHEDULE, reminderWords } from '../data/reminders.js';
import { readReminderEvents, recordReminderEvent } from '../lib/db.js';
import { speak } from '../lib/voice.js';
import { useLanguage } from './LanguageContext.jsx';
import { localizeReminder } from '../lib/i18n.js';
import {
  CHECK_EVERY_MS,
  dismissReminder,
  dueSlot,
  reminderTick,
  showReminder,
  startOfDay,
} from '../lib/reminderEngine.js';

/**
 * ReminderOverlay - the one thing in the app that watches the clock.
 *
 * Mounted in the patient shell (`App.jsx`), so a reminder can appear over the
 * home screen or over a game, and never over the caregiver screens. All the rules
 * live in `reminderEngine.js`; this file keeps time, speaks the line through the
 * shared `speak()` helper and writes the event the moment it happens.
 *
 * Everything here is local: a bundled schedule, the device clock, IndexedDB. There
 * is no fetch and no push notification, so reminders behave identically with the
 * network off - which is the point of the app.
 *
 * `onShowing` lets the shell tell the game a reminder is covering it, so the game
 * can hold its timers instead of advancing behind the card.
 */
export default function ReminderOverlay({ onShowing, schedule = REMINDER_SCHEDULE }) {
  const { language } = useLanguage();
  // null while today's history is still being read - nothing is announced until
  // then, so a reload cannot re-announce a reminder already dealt with.
  const [events, setEvents] = useState(null);
  const [reminder, setReminder] = useState(null);

  useEffect(() => {
    let live = true;
    readReminderEvents(startOfDay(Date.now())).then((rows) => {
      if (live) setEvents(rows);
    });
    return () => {
      live = false;
    };
  }, []);

  /**
   * A reminder is over. The event is written on the spot and never awaited - a
   * slow or broken database must not leave the card stuck on screen - and it is
   * also added to the in-memory list straight away, so the next tick a second
   * later already knows this slot is done.
   */
  const finish = useCallback((event) => {
    recordReminderEvent(event);
    setEvents((rows) => [...(rows || []), event]);
    setReminder(null);
  }, []);

  useEffect(() => {
    if (!events) return undefined;
    const timer = setInterval(() => {
      const now = Date.now();
      if (reminder) {
        const step = reminderTick(reminder, now);
        if (step.event) finish(step.event);
        else if (step.reminder !== reminder) setReminder(step.reminder);
        return;
      }
      const slot = dueSlot({ schedule, now, events });
      if (slot) setReminder(showReminder(slot, now));
    }, CHECK_EVERY_MS);
    return () => clearInterval(timer);
  }, [events, reminder, schedule, finish]);

  useEffect(() => {
    if (onShowing) onShowing(Boolean(reminder));
  }, [reminder, onShowing]);

  if (!reminder) return null;
  return (
    <ReminderCard
      slot={reminder.slot}
      repeated={reminder.repeated}
      language={language}
      onDone={() => finish(dismissReminder(reminder, Date.now()).event)}
    />
  );
}

/**
 * The card: one picture, one sentence, one enormous Done button, and nothing else
 * on screen. It covers the whole viewport in a colour used nowhere else, so a
 * caregiver across the room can see at a glance that this is a reminder and not
 * the game.
 *
 * Deliberately absent: a countdown, a progress bar, and any second choice. A
 * visible timer would rush someone who is already slow, and "Later" is a decision
 * a dementia patient should not have to make. Doing nothing is always allowed -
 * the card takes itself away and records that honestly.
 *
 * The line is spoken exactly as it is shown, and said once more when the engine
 * says so, through the same `speak()` every other screen uses.
 */
function ReminderCard({ slot, repeated, onDone, language }) {
  const { t } = useLanguage();
  const words = localizeReminder(slot, language) || reminderWords(slot);
  const fallbackWords = reminderWords(slot);
  useEffect(() => {
    if (words) speak(words.line, fallbackWords?.line);
  }, [words, fallbackWords, repeated]);
  if (!words) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('reminder.aria')}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-warn-light px-5 py-8"
    >
      <div className="card animate-pop-in flex flex-col items-center gap-6 px-10 py-10">
        <Picture id={words.pictureId} className="h-40 w-40" />
        <p aria-live="assertive" className="max-w-xl text-center text-4xl font-bold leading-snug">
          {words.line}
        </p>
      </div>
      <button
        type="button"
        onClick={onDone}
        aria-label={t('reminder.done')}
        className="tap-target animate-soft-pulse min-h-tap-xl w-full max-w-lg flex-col gap-3 bg-primary px-10 text-white shadow-tap"
      >
        <CheckIcon className="h-20 w-20" />
        <span className="text-4xl font-bold">{t('reminder.done')}</span>
      </button>
    </div>
  );
}
