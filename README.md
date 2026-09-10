# CogniCare

An offline-first cognitive care PWA for elderly dementia patients, plus a caregiver
trend dashboard. Built for SIH26003 as a working prototype.

The patient side is designed to run with **no network at all**: the games, the
adaptive difficulty, the voice prompts and the reminders all work from the device.
Firestore is only ever a place to push already-recorded results so a caregiver can
see them on another device.

## Quick start

```bash
npm install
npm run gen:icons        # only needed if you change the app mark
npm run dev              # http://localhost:5173/sih26003-cognicare/
```

The app is fully usable with **no Firebase configuration** (local-only mode): games,
logging, adaptive difficulty, voice and reminders all work, and the caregiver
dashboard reads from the local database. Adding Firebase only enables cross-device
sync.

```bash
npm run verify           # static checks + unit tests (no browser needed)
npm run check            # static checks only
npm test                 # unit tests only
npm run build            # production build + precache/manifest/404 verification
npm run preview          # serve the production build (use this for offline testing)
npm run demo:plan        # print the seeded demo scores, tiers and reminders (read-only)
npm run gen:icons        # regenerate the app icons from the app mark
npm run preview:pictures # rasterise the game artwork into one contact-sheet PNG
```

## Firebase setup (optional)

1. Create a Firebase project, add a **Web app**, and copy the config values.
2. Paste them into `.env` (see `.env.example` — six `VITE_FIREBASE_*` keys).
3. Firestore Database → **Create database** (production mode is fine).
4. Authentication → Sign-in method → enable **Anonymous**.
5. Firestore → Rules → paste `firestore.rules` and **Publish**.
6. Rules Playground → simulate an unauthenticated `get` on `sessions/abc`; it must be
   **denied**. Then simulate the same request authenticated; it must be **allowed**.

The web config is public by design — it identifies the project, it does not grant
access. Access is controlled by the rules in `firestore.rules`.

No patient name, address, contact detail, diagnosis or any other medical data is
written to Firestore. The only identifier that leaves the device is the pairing code.

## Deploy to GitHub Pages

The base path is `/sih26003-cognicare/` (set once in `pwa.config.js`). If your repo
has a different name, change `BASE_PATH` there and the icon links in `index.html`.

```bash
npm run deploy           # runs verify + build, then publishes dist/ to gh-pages
```

Then in the repo: Settings → Pages → Source **Deploy from a branch**, branch
`gh-pages`, folder `/ (root)`. The app appears at
`https://<user>.github.io/sih26003-cognicare/`.

`npm run build` also writes `dist/404.html` (a copy of the shell) so that deep links
like `/caregiver/dashboard` survive a hard refresh, and `dist/.nojekyll` so Pages
serves every file untouched.

## Manual verification checklist

`npm run verify` covers everything that can be checked without a browser. These are
the checks that need a real browser — run them before a demo.

**Install as an app**

1. `npm run build && npm run preview`, open the printed URL in Chrome.
2. DevTools → Application → Manifest: name, `standalone`, and three icons load with
   no errors.
3. Address bar shows an install icon; install it and confirm it opens without browser
   chrome.

**Works offline** (the important one)

1. With the preview server running, load the app once and play one question so the
   service worker installs. DevTools → Application → Service Workers shows
   "activated and is running".
2. Application → Cache Storage → `workbox-precache-*` lists the HTML, JS, CSS and
   icon files.
3. Tick DevTools → Network → **Offline**.
4. Hard-reload. The app must still load, and a full game session must still be
   playable end to end with voice prompts.
5. Navigate to `/caregiver/dashboard` directly while offline and reload — the
   dashboard must still render from local data.
6. Untick Offline. Within a few seconds the caregiver dashboard "Last synced" value
   updates (only when Firebase is configured).

**Voice**

1. On the home screen, confirm the greeting ("Welcome to CogniCare...") is spoken.
   On iOS it may instead begin on the Play tap — Safari only allows speech that starts
   from a real gesture, which is why the first utterance is primed by the Play button
   rather than fired on page load.
2. Play a session and confirm each screen speaks for itself: the study prompt when the
   picture appears, the question when the options appear, the warm feedback line, the
   tier-change sentence, and the closing "You remembered N of M pictures today."
3. Confirm the voice sounds unhurried and clear (rate 0.9, en-IN where installed).
4. Tap through quickly: a new prompt must cut off the previous one, never queue up and
   read out a stale prompt after the screen has moved on.
5. Leave mid-prompt via the home button — speech must stop immediately.
6. Silence the device (or use a browser with no speech support): the game must remain
   fully playable end to end with no audio and no errors.

**Difficulty transition**

1. Answer three questions correctly in a row. A full-screen teal panel with a rising
   arrow and "Let's make this a little harder" must appear before the next picture.
2. Then answer two wrong in a row: the same panel in orange with a falling arrow and
   "Let's make this a little easier".
3. Time the panel — it must stay long enough to read comfortably at arm's length, and
   nothing on it should invite a tap.
4. Turn on the OS "reduce motion" setting and repeat: the arrow must stop animating and
   the panel must still be readable.

**All five games** (one visit plays each domain once, in turn)

The rotation is memory recall → routine matching → word recall → number sequence →
pattern matching → back to memory recall. Every game is also reachable directly:
`/play` (memory), `/play/routine`, `/play/words`, `/play/numbers`, `/play/patterns`.

1. Play a full session, then tap **Play again** on the finished screen. The next
   session must be the routine game: a sentence about a moment in the day ("It is time
   to brush your teeth. Which one do you need?") with two picture buttons, and **no
   study picture beforehand** — the sentence stays on screen the whole time.
2. Confirm the header now counts "Question 3 of 8", not "Picture 3 of 8", and the
   closing line reads "You matched N of M correctly today."
3. Confirm the cue is spoken when the options appear, and that a difficulty change in
   this domain says "The next ones look more alike" (harder) or "The next ones are
   easier to tell apart" (easier).
4. Check the longest cue — "You want to send a note to a friend. Which one do you
   need?" — still fits above two 160px picture buttons on the smallest screen you plan
   to demo on, without scrolling.
5. Tap **Play again** three more times to reach each new game in turn:
   - **Word recall** (`/play/words`): a small set of words shows briefly ("Remember
     these words: Cup and Dog."), disappears, then "Which word did you just see?" with
     2–4 large word buttons. Confirm the words are large and legible, the study card
     holds long enough to read, and a wrong answer says "The word was …".
   - **Number sequence** (`/play/numbers`): a short run of digits shows, disappears,
     then a plain question ("Which number came last?"). Confirm the spoken prompt says
     the digits as words ("four", "seven"), never "forty-seven", and the buttons show
     the numerals large.
   - **Pattern matching** (`/play/patterns`): a row of coloured shapes shows,
     disappears, then 2–4 candidate rows of shapes. Confirm the shapes are clearly
     distinct by both outline and colour, each row is legible at arm's length, and the
     whole game is one tap per choice — no dragging, swiping or two-finger anything.
6. Tap **Play again** once more from pattern matching: it must return to the memory
   game, so a patient who keeps playing cycles through all five rather than getting
   stuck on one.
7. DevTools → Application → IndexedDB → `cognicare` → `answers`: rows from each new
   session must carry the right `domain` (`word_recall` / `number_sequence` /
   `pattern_matching`) and a matching `questionId` (`wr-…` / `ns-…` / `pm-…`), one row
   per tap, alongside the earlier `memory_recall` and `routine_matching` rows.

**Reminders**

The schedule is bundled data, so to see a reminder without waiting for 08:00, open
`src/data/reminders.js` and set one slot's `at` to a minute or two ahead of the device
clock (a `medicine` one is the clearest), then restart the dev server or rebuild. Undo
it afterwards.

1. Leave the app on the home screen until that time. A full-screen sand-coloured card
   must appear with one picture, one sentence ("It is time to take your medicine.") and
   a single very large **Done** button — nothing else, no countdown and no second choice.
2. Confirm the sentence is spoken as the card appears, and that it is spoken once more
   about 45 seconds later if you leave it alone.
3. Tap **Done**. The card must disappear on the first tap. DevTools → Application →
   IndexedDB → `cognicare` → `reminderEvents`: a new row must already be there —
   `{type: "medicine", status: "dismissed", timestamp, synced: 0}` — written on the tap,
   not at the end of anything.
4. Move the slot forward again and this time **ignore it**. After 90 seconds the card
   must take itself away on its own, and a row with `status: "missed"` must appear.
   Nothing should need to be tapped for that to happen.
5. Reload the page while still inside that reminder's half-hour window. It must **not**
   reappear — the overlay reads today's events on start-up.
6. Now start a game, and let a reminder arrive mid-question. Check that: the card covers
   the game; the study picture underneath does **not** advance while it is up; the game
   prompt is not spoken over the reminder; and after **Done** the question you were on
   is still there and is spoken again.
7. Set a slot to a time that has already passed by more than 30 minutes and reload. No
   card must appear, and **no `missed` row** must be written — the app only reports on
   reminders it actually showed.
8. Repeat step 3 with DevTools → Network → **Offline** ticked. Reminders must behave
   identically: they are scheduled from the device clock and a bundled file, with no
   network involved.
9. Open `/caregiver` and confirm no reminder card ever appears over the caregiver
   screens (the overlay is mounted only in the patient shell).

**Firestore sync** (needs `.env` filled in and the rules published)

Everything below is machine-verified against a fake Firestore in `tests/sync.test.js`.
What cannot be faked is the real SDK, real anonymous sign-in and the real rules — so
these five checks are the ones that matter before a demo that involves a second device.

1. **Rules Playground, before anything else.** Firestore → Rules → Playground: simulate
   `get` on `sessions/abc` **unauthenticated** — it must be **denied**. Then tick
   "Authenticated" and repeat — **allowed**. Then simulate `create` on
   `sessions/whatever` authenticated with `{pairingCode: "ABC123"}` — allowed — and the
   same create with the `pairingCode` removed — **denied**. Do not relax the rules to
   make anything pass.
2. **One document per row.** With `.env` filled in, play one session and dismiss one
   reminder, then wait a few seconds. In the Firestore console, `sessions` and
   `reminderEvents` must each hold exactly one new document, with an id of the form
   `sessions-<12 chars>-<n>`, containing only `pairingCode`, `timestamp` and the score
   or status fields — no name, no answer-level detail, no `questionId`. Authentication →
   Users must show a single anonymous user.
3. **Queue while offline.** DevTools → Network → **Offline**. Play a full session and let
   a reminder time out. Application → IndexedDB → `cognicare`: the new `sessions` and
   `reminderEvents` rows must be there immediately with `synced: 0`, and the Firestore
   console must show nothing new. The game, the voice and the reminder must behave
   exactly as they do online.
4. **Flush on reconnect, with no duplicates.** Untick Offline and wait up to a minute
   (or switch tabs away and back). The queued rows must flip to `synced: 1` in
   IndexedDB, and Firestore must gain exactly one document per row — re-check the
   document count, not just that data arrived. Then hard-reload the app twice and
   confirm the counts in Firestore do **not** change.
5. **Interrupt a write mid-flight.** With a session queued, tick Offline *while* the
   flush is running (or use Network → throttle to `Offline` immediately after a session
   ends). The row must stay `synced: 0` rather than flipping optimistically; when
   connectivity returns it must end up as exactly one document. This is the case the
   derived document id exists for.

Local-only mode is worth one check too: with an empty `.env`, everything on the patient
side must work identically and the console must stay quiet — rows simply accumulate with
`synced: 0`, and they flush later if credentials are added.

**Demo history seeding** (before any demo of the caregiver dashboard)

`npm run demo:plan` prints the scores, tiers, timestamps and reminder events the seeder
would write — without touching IndexedDB. Use it to check the numbers before the demo.

Seeding runs inside the browser (IndexedDB is not reachable from Node). Two ways to
trigger it:

1. **DevTools console** — the primary mechanism for a live demo. Open the app, open the
   browser console, type:
   ```
   window.cognicare.seedDemo()
   ```
   The helper prints what it wrote. It then says: "open /caregiver, tap 'Use this device's
   code', and the dashboard will show it." Pairing uses the device's own stored code, so
   the caregiver does not need to type anything.

2. **URL parameter** — for when a projector is showing the tablet and DevTools is not
   open. Append `?demo=seed` to any app URL, for example:
   ```
   http://localhost:5173/sih26003-cognicare/?demo=seed
   ```
   The seeder runs once and then strips the parameter from the URL, so a reload does not
   silently re-seed.

**What it writes:** 12 days of realistic play history in local IndexedDB — 17 sessions
(9 `memory_recall`, 8 `routine_matching`), 136 answer rows (one per question, local only,
never synced), and 12 reminder events (medicine, hydration, one appointment). All rows carry
`demo: 1` and are stored in the same stores the app uses, so the dashboard reads them through
the real logic with no special cases.

`memory_recall` scores fall 75 → 81 → 78 → 84 → 76 → 71 → 64 → 58 → 49 — a run of 4
consecutive sessions dropping 22 points, so the Step 12 decline alert fires
("Consider a check-in with a doctor"). `routine_matching` stays in the low-to-mid 80s,
ending on a rise, so it reads as steady and does not alert. A demonstrator playing one
extra session live after seeding will not clear the alert.

Sessions are placed at plausible hours (10, 11, 15 and 16 hours UTC, rotated) with
realistic durations (4–7 minutes). The demo is deterministic: running `seedDemo()` again
on the same day produces byte-identical rows (the previous seed is removed first).

**Resetting:** to remove only the seeded history without touching the pairing code, real
patient records or any settings:
```
window.cognicare.resetDemo()
```
Or add `?demo=reset` to any app URL. The console prints how many demo rows were removed.
`demoStatus()` shows the current count of demo vs real rows in each history store.

`clearHistory()` also exists, but it removes **all** rows from all history stores —
real sessions and all. Use `resetDemo()` for the demo reset.

**What does not happen:** no data is sent to Firestore (the `demo` field never reaches
`remotePayload()`), no route is added, no button appears in the patient or caregiver
screens, and no data is written unless the seeder is explicitly triggered. The pairing
code, device id, `lastSyncAt` and any `caregiverCode` setting are never touched.

**Caregiver mode** (`/caregiver`)

Everything about *what* this screen says is machine-verified in `tests/caregiverData.test.js`,
`tests/trends.test.js` and `tests/caregiverFlow.test.js` — the pairing rules, the filtering,
the trend readings, the reminder log and the "Last synced" wording. What needs a browser is
the drawing, the typing and the real database.

1. **Pairing, once.** Open `/caregiver`. Enter the code shown on the patient's device (try it
   in lower case, and with a space or a dash in the middle — all three must be accepted).
   Then enter a 5-character code, and one containing the letter `O` or the digit `0`: each
   must be refused with a sentence a non-technical person can act on, and nothing must
   navigate.
2. **It is remembered.** After pairing you must land on `/caregiver/dashboard`. Hard-reload:
   the dashboard must open directly, with no pairing screen. Now visit `/caregiver` by hand —
   it must redirect straight to the dashboard. Application → IndexedDB → `cognicare` →
   `settings` must show one new row, `caregiverCode`, and the device's own `pairingCode` must
   be **unchanged**.
3. **The charts actually draw.** There is one chart per game domain — five of them, in the
   rotation order — and each played one must render a teal score line (0–100% axis,
   always the full range) and a dashed orange stepped difficulty line on a right-hand 1–3
   axis. Hover a point: the tooltip title must be the full date and time of that session and
   the two lines must read "N% of answers correct" and "Difficulty level N of 3". A domain
   that has not been played yet must show its empty state rather than a flat line at zero.
4. **Chart cleanup.** With DevTools open, navigate dashboard → patient home → dashboard several
   times, then use **Change code** and pair again. No Chart.js "Canvas is already in use"
   error may appear in the console, and the charts must redraw every time.
5. **Empty data reads honestly.** On a device that has never played, each chart area must say
   *"Nothing to chart yet."* — not a flat line at zero — and the sentence beneath must read
   "… has not been played yet." The reminder log must say "No reminders have been recorded
   yet." and "Latest activity" must read "Nothing recorded yet".
6. **The words match the lines.** Play three or four sessions of one game, doing badly on the
   last two, and reload the dashboard. The sentence under that chart must say *declined*; play
   two good sessions of the other game and its sentence must say *steady* or *improving*.
   Confirm no sentence anywhere reads like a diagnosis, and that the not-a-diagnosis note is
   visible on the page.
7. **Reminder log.** Dismiss one reminder and let one time out on the patient side, then reload
   the dashboard. The log must list them newest first as "Medicine / Marked done" and
   "Water / No answer" with readable times ("Today at 9:15 am"), and the summary line must
   count them correctly.
8. **"Last synced" is real.** With `.env` empty, the value must read **Not yet** with a note
   saying nothing has been uploaded — it must never show the current time. With Firebase
   configured and a sync completed, it must show the time the dashboard read the server, and
   the note must say so. Tick Network → **Offline** and reload: the value must not silently
   present itself as fresh.
9. **No cross-patient data.** On the patient's own tablet, use **Change code** and enter a
   *different* valid code. Every chart must be empty and the page must say no records could be
   read for that code — it must **not** fall back to showing this device's history.
10. **Read-only.** With the dashboard open and refreshed several times, the Firestore console
    document counts must not change, and IndexedDB `sessions` / `reminderEvents` /
    `answers` row counts must be identical before and after. The dashboard writes nothing but
    the `caregiverCode` setting.
11. **Patient side untouched.** Home, `/play`, all five games, the voice and the reminders must
    behave exactly as before, and no reminder card may ever appear over a caregiver screen.
12. **Rules unchanged.** Re-run check 1 of the Firestore section above: an **unauthenticated**
    `get` on `sessions/abc` must still be **denied**. Caregiver access needed no rules change,
    and nothing here may relax them.

**Decline alert** (`/caregiver/dashboard`)

The rule — three or more consecutive falling sessions, per domain, with a real drop — is fully
machine-verified in `tests/decline.test.js`, including every edge case and eight deliberate
mutations. What needs a browser is how the card reads.

1. **It stays away when it should.** On a dashboard with no sessions, one session, two sessions,
   or steady/rising scores, there must be **no alert card at all** — not an empty box and not an
   "all clear" panel.
2. **It appears when it should.** Play three sessions of one game, deliberately doing worse each
   time (a drop of at least 5 points overall). Reload the dashboard: a card outlined in orange
   must appear **above the charts**, headed exactly *"Consider a check-in with a doctor"*.
3. **It says it is not a diagnosis, without scrolling.** In the same card, without scrolling on a
   phone-sized window, the words *"This is not a diagnosis."* must be visible, along with the
   innocent explanations (tiredness, a noisy room, an interruption, unlucky questions).
4. **It names the right game.** The sentence must name the game as the patient sees it
   ("Remember the picture has gone down in each of the last 3 sessions…"), and the chart for that
   game must carry the small orange line "This is the game the note at the top of the page is
   about." No other chart may carry that line.
5. **One domain only.** With one game declining and the others steady or improving, the card must
   mention **only** the declining one, and every other chart's reading must still say steady or
   improving.
6. **Recovery clears it.** Play one clearly better session of that game and reload. The card must
   be **gone** — the alert is about now, not about the history.
7. **Tone.** Read the card as a worried relative would: it must look like a suggestion for the
   next ordinary appointment, not an emergency. Nothing red, no exclamation, nothing that names a
   condition.
8. **Screen reader.** With a screen reader on, refreshing the dashboard must announce the card
   politely, not interrupt mid-sentence.
9. **Nothing else changed.** The charts, their readings, the reminder log, "Last synced" and the
   patient side must behave exactly as they did after Step 11.
