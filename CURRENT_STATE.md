# CURRENT STATE

Updated after every numbered build step.

**Last completed step: 14 - end-to-end simulation and static checks: the full test suite
was exercised against the completed Step 13 implementation, all 274 tests pass, the static
checker reports 64 files with 0 errors and 0 warnings, and the demo-plan preview script
confirms the seeded history matches the documented scores and timeline.**

## Working and verified

- Scaffold: Vite + React + Tailwind + React Router, base path `/sih26003-cognicare/`,
  `pwa.config.js` holding manifest/Workbox options as plain data so tests can assert them.
- Design system for elderly use: 20px root font, `min-h-tap` 80px / 120px / 180px tokens,
  high-contrast ink-on-paper palette, `.tap-target` helper, reduced-motion support, and a
  test that fails if any gesture handler (touchmove, swipe, pinch, wheel) appears in `src/`.
- Patient Home: one enormous Play button plus a small "For caregivers" link, nothing else.
- App icons generated in-repo with no image dependencies (`npm run gen:icons`): 192, 512,
  maskable 512, apple-touch 180, and a matching `favicon.svg`. Tests read each PNG header
  and assert the real pixel size matches the manifest declaration.
- Offline story is now enforced by the build and the tests, not assumed:
  - Workbox precaches js/css/html/svg/png/webmanifest with `navigateFallback` pointing at
    the cached shell under the base path; `registerType: 'autoUpdate'` so a patient never
    sees an update prompt.
  - `scripts/postbuild.mjs` runs as part of `npm run build` and *fails the build* if the
    emitted service worker does not precache index.html, a JS bundle, a CSS bundle and an
    icon, or if a manifest icon is missing from `dist/`.
  - The same script writes `dist/404.html` and `dist/.nojekyll` so deep links survive a
    hard refresh on GitHub Pages.
  - A test asserts firebase imports are confined to `src/config/firebase.js` and
    `src/lib/remote.js`, and that nothing in `src/` calls `fetch`/`XMLHttpRequest`, so the
    game loop cannot quietly acquire a network dependency.
- `firestore.rules` written (append-only, auth required, pairingCode must be a string).
- Memory recall game playable end to end in the engine:
  - `src/lib/sessionEngine.js` is the whole game loop as pure functions over plain data,
    with the clock and the random source injected - so `node --test` plays complete
    sessions and the same seed always replays identically.
  - 26 questions (8 / 8 / 10 across the three tiers), each showing one picture to remember
    and then asking which of two pictures it was. Study time shortens with the tier and the
    distractor gets closer (tier 3 pairs same-category items: cup/glass, not cup/shoe).
  - 27 illustrations drawn as inline SVG in `src/components/Picture.jsx` - no image files to
    fetch or precache, sharp at any tap size, a few kB in the bundle.
  - `npm run preview:pictures` rasterises the whole set into one contact sheet PNG so the
    drawings can be checked for legibility without a browser. Three of them (towel,
    telephone, toothbrush) were unrecognisable on first render and were redrawn.
  - Session is capped at 8 questions or 6 minutes, whichever comes first; the score the
    caregiver chart will read is a percent, so sessions of different lengths compare.
  - Feedback is warm either way - no red crosses, no "wrong", and a wrong answer is
    followed by the right picture and "That one is tricky. Well tried."
- Storage: every answer is written to IndexedDB the moment it is tapped, and the session
  row the caregiver chart will plot is written when the session ends.
  - `src/lib/store.js` holds the rules (field lists, enum checks, the sync queue) as pure
    logic over an injected driver; `src/lib/idbDriver.js` is the only file that touches
    IndexedDB, and a test fails if that changes.
  - `src/lib/privacy.js` refuses about 30 forbidden field names (name, address, phone, dob,
    diagnosis, medication, doctor, notes...) and any string over 120 characters, on every
    local *and* future remote write. Records are also built from a fixed field list, so an
    extra property is dropped rather than stored.
  - Per-answer detail never leaves the device; only `{domain, score, difficultyTierEnd,
    timestamp}` is queued for Firestore.
  - Falls back to in-memory storage when IndexedDB is blocked, so the game still plays.
- Adaptive difficulty is live and the patient is always told about it:
  - Two consecutive wrong answers drop one tier, three consecutive right raise one, clamped
    to 1-3. `tierDecision()` is a pure function of the two streaks and returns null at the
    floor or the ceiling, so no transition is announced for a change that did not happen.
  - A change never lands silently: the engine enters a `TIER` phase carrying
    `{from, to, direction, message}`, and `/play` holds a full-screen coloured panel with one
    animated arrow and the sentence for `TIER_MS` (2000ms) before the next picture appears.
    Orange arrow-down for easier, teal arrow-up for harder, `role="status"` +
    `aria-live="assertive"`, and the panel degrades to no motion under
    `prefers-reduced-motion`.
  - Both streaks reset on a change, so the next move needs a fresh run of answers rather
    than stepping again on the very next question.
  - The wording lives once in `TIER_MESSAGE`; the screen renders `change.message` rather
    than a retyped copy, which is what step 7 reads aloud.
  - A logged answer carries the tier the question was actually asked at, and the tier moves
    only after the record is written, so the caregiver chart cannot attribute an answer to a
    difficulty the patient never saw.
- Voice is live across both games, and it is optional by design:
  - One reusable helper, not scattered calls. `src/lib/speak.js` is the entire voice
    behaviour as a pure function with the synthesiser injected (exactly like the clock and
    random source in the engine), so `node --test` proves the rules with a fake synth and no
    browser. `src/lib/voice.js` is the only file allowed to touch the browser speech API, and
    a test fails if `speechSynthesis`/`SpeechSynthesisUtterance` appears anywhere else in
    `src/` - the same confinement pattern as `db.js`.
  - Every screen speaks its own line on arrival: the home greeting, the study prompt, the
    question, the warm feedback, the tier-change sentence, and the closing count. The tier
    and closing lines are read from the same string the screen renders, so the voice and the
    text can never drift apart.
  - Newest prompt wins: each `speak()` cancels the previous utterance first, so the
    self-advancing screens never queue a backlog of stale prompts read out after the moment
    has passed. Leaving a screen (`HomeButton`, route unmount) cancels speech.
  - iOS Safari only lets speech begin inside a user gesture, so the Play tap primes the queue
    with a single silent (volume 0) utterance before navigating to `/play`; every later
    prompt fired by a timer is then allowed to play.
  - Voice is a help, never a requirement. A device with no speech support makes every call a
    safe no-op, a thrown synth error is swallowed and logged, and the game is byte-for-byte
    the same played in silence. Muting cancels current speech and refuses new speech until
    turned back on.
- Routine matching (game domain 2) is playable on the *same* engine, not a second game loop:
  - 24 questions (8 per tier) in `src/data/routineMatching.js`. The patient is told a moment
    from an ordinary day - "It is time to brush your teeth. Which one do you need?" - and taps
    the object it needs, from two large picture-and-word buttons. Identical interaction to
    domain 1, and it reuses the existing 27 drawings, so there is no new artwork.
  - Nothing is memorised here: the cue is words and it stays on screen beside the options for
    as long as the patient needs it. That is expressed as `studyItem: null` on the question,
    and the engine's one new line - `openingPhase(question)` - is what opens such a question
    straight on the options instead of a study screen. That is the whole engine change.
  - Difficulty is the closeness of the wrong object: tier 1 unrelated (teeth / kettle), tier 2
    plausible but for another moment (a dark room: lamp or spectacles?), tier 3 the same
    category and a near neighbour (hot tea: cup or glass?). The tier-3 rule is machine-checked
    against the item categories, exactly as in domain 1.
  - Because it is the same engine, adaptive difficulty, the 2-second transition, the voice on
    every screen and the immediate IndexedDB write all apply unchanged - each is re-asserted
    against this domain by its own test rather than assumed.
  - Every word that differs between the two games now comes from the bank, not the screen:
    the header counter (`Picture 3 of 8` vs `Question 3 of 8`), the closing count, and what the
    difficulty change explains ("The next pictures are a little quicker" vs "The next ones look
    more alike"). No screen can describe the wrong game.
  - A visit reaches both: "Play again" rotates to the other domain (`src/data/banks.js`), so
    the patient still has exactly one button and is never asked to choose an exercise, and both
    caregiver trend lines get data.
  - Playing it through surfaced one real fault, now fixed: some pairs exist in both directions
    (hot tea → cup vs something cold → glass), and two such questions in a row showed the same
    two pictures twice with the answer swapped. Question selection now skips the previous pair
    when anything else is available, in both domains.
- Reminders (medicine, hydration, appointment) run on the device, with no server and no push:
  - `src/data/reminders.js` is the whole schedule as data - seven slots across the day, each
    `{id, type, at: 'HH:MM'}` with an optional `days` list for weekly ones (the appointment
    falls on Tuesdays). Nothing about the day is stored or fetched; the device clock and the
    bundled file are the only inputs, so reminders behave identically with the network off.
  - `src/lib/reminderEngine.js` holds every rule as pure functions with zero imports and the
    clock passed in, exactly like `sessionEngine.js`: which slot is due now, whether today's
    history already settles it, what a tick does to a reminder on screen, and what event a
    Done tap or a timeout produces. `node --test` therefore plays whole days through it.
  - A reminder is due at its time and for 30 minutes after, never later - an hours-late
    medicine prompt would be worse than none - and the day never queues up behind itself:
    only one card is ever on screen, and the earliest ready slot goes first.
  - `src/components/ReminderOverlay.jsx` is the only thing in the app that watches the clock.
    It is mounted in the patient shell in `App.jsx`, so a reminder can cover the home screen or
    a game but can never appear over a caregiver screen.
  - The card is one drawing, one sentence and one 180px "Done" button on a full-screen colour
    used nowhere else. No countdown, no progress bar, no "Later": doing nothing is allowed and
    is recorded honestly. It reuses the existing `medicine`, `glass` and `clock` drawings, so
    there is no new artwork, and `role="dialog"` + `aria-modal` + `aria-live="assertive"` mean
    a screen reader announces it too.
  - Voice goes through the same `speak()` every other screen uses - no second speech path - and
    reads exactly the sentence on screen. If nothing is tapped, the line is repeated once at
    45 seconds, then the card takes itself away at 90 seconds and logs `missed`.
  - Every reminder event is written to IndexedDB the moment it happens, through the existing
    fire-and-forget `recordReminderEvent`, as `{type, status, timestamp, synced}` - the same
    path and the same privacy guard as a game answer, drained by the sync layer and never awaited
    by the UI, so slow storage cannot leave the card stuck on screen.
  - `missed` can only ever mean "shown and not acted on": the timeout is measured from when the
    card appeared, never from when the slot was due, so slots that elapsed while the app was
    closed are never shown and never logged. A caregiver will not see missed doses the patient
    was never actually prompted about.
  - The overlay reads today's events on mount (`readReminderEvents`), so a reload mid-window
    cannot re-announce a reminder already dealt with, and a resolved slot stays resolved.
  - A reminder pauses the game underneath rather than covering a running one: the shell
    publishes `reminderOnScreen` through `<Outlet context>`, and `/play` holds its timers and
    stays silent while it is true. Without that, a study picture could disappear behind the
    card and advance, and the patient would be asked about a picture they never saw - a wrong
    answer that would drop the tier and put a dip on the caregiver's chart that never happened.
    On dismissal the current prompt is spoken again, so the patient is re-oriented.
- Firestore sync drains the queue that step 5 has been filling, without the patient side
  noticing it exists:
  - Nothing about the existing design changed. The IndexedDB schema, every write path and every
    screen are untouched; `store.pendingSync()` / `store.markSynced()` were already the seam, and
    this step is their first consumer. The only edits to existing files are a listener hook in
    `db.js` and five lines of composition in `main.jsx`.
  - `src/lib/sync.js` holds every rule as pure logic over an *injected* remote - the same shape
    as the store over its driver - and imports nothing but `privacy.js` and `store.js`.
    `src/lib/remote.js` is the only file in the app that talks to Firestore. So `node --test`
    drives the whole layer against a fake Firestore with no browser and no Firebase project.
  - Duplicate safety is structural, not probabilistic. The document id is *derived* from the
    local row (`sessions-<deviceId>-<rowId>`), so every attempt at a row addresses the same
    document; the write is `setDoc` at that id (never `addDoc`, never `merge`), and the published
    create-only rules make a second write a rejected *update*. One `getDocFromServer` read then
    settles whether the record is already there.
  - A row is marked synced only after the server has acknowledged the write, or after a
    server-side read has confirmed the document exists. Anything unconfirmable - a timeout, a
    refusal, a failed confirmation read - leaves the row queued: a redundant retry is cheap, a
    falsely-synced row is history the caregiver never sees.
  - Every network call is bounded (8s). A Firestore write does not fail when the connection
    dies, it waits, so without a bound one flaky write would wedge the whole queue.
  - Reconnect is noticed four ways: a 3s start-up delay, the browser `online` event, a 60s sweep
    and a nudge from `db.js` the moment a syncable row is written. `navigator.onLine` is only ever
    used to skip pointless work, never to decide that a write succeeded.
  - Retries back off 5s → 5min, and `maxFailuresPerRun: 3` stops one broken row consuming a whole
    run. Attempt state is in memory; the only persisted sync state is still the `synced` flag,
    plus a `lastSyncAt` setting that is written only when records really reached Firestore.
  - Per-answer detail still never leaves the device: `answers` has no remote collection. A remote
    document is built field by field from a fixed list - `{pairingCode, domain, score,
    difficultyTierEnd, timestamp}` or `{pairingCode, type, status, timestamp}` - and put through
    the same privacy guard as a local write.
  - With no `.env` the manager reports `local-only`, makes no network call and retries nothing,
    leaving every row queued. The app is complete in that mode, and the same rows flush on the
    next run if credentials are added later.
  - Firebase is loaded by dynamic `import()`, so a local-only device never downloads the SDK;
    the step-3 confinement test now catches a lazy `import('firebase…')` as well as a static one.
- Caregiver mode is live at `/caregiver` and `/caregiver/dashboard`, reading the records the sync
  layer has been writing since step 10 - without a second data path, and without writing anything:
  - Pairing is one code typed once. No username, no password, no patient name, no account and no
    login screen - the code the patient's device already shows is the whole handshake, and the
    existing anonymous sign-in from step 10 is the only authentication involved. `/caregiver` takes
    the code, `/caregiver/dashboard` shows the data, a stored code redirects past the pairing
    screen, and "Change code" clears it and comes back.
  - The typed code lives under its own setting (`caregiverCode`), deliberately **not**
    `SETTINGS.pairingCode`. Every device mints its own pairing code, including a caregiver's phone,
    so conflating the two would show a caregiver their own empty history and imply the patient had
    stopped playing. A test asserts each key leaves the other alone.
  - Codes are validated the way a person types them: lower case, a stray space or a dash in the
    middle all work, and anything else is refused with a sentence a non-technical reader can act on
    ("A pairing code is 6 characters long - this one has 5.", "They never contain the letters I or
    O, or the digits 0 and 1.").
  - `src/lib/caregiverData.js` holds every rule as pure logic over an *injected* remote, exactly
    like `sync.js` over its own - so the privacy rules are executable in `node --test`. It imports
    no Firebase and no `config/env.js`; the page composes the real Firestore remote and passes it in.
  - Two independent filters on every read. The Firestore query constrains on `pairingCode`
    server-side and `onlyForCode()` filters again after the rows arrive, because a promise that no
    caregiver ever sees another patient's records should not rest on one hand-written `where`
    clause. The test remote has a `leak` mode that appends a stranger's rows to every answer, and
    the assertions prove none of them reach the screen.
  - Local records are read only when the typed code *is* this device's own code. Local rows carry
    no pairing code - they are simply "this device's" - so on any other code they are not the rows
    being asked for. That single gate is what makes the demo case honest: one tablet with no
    Firebase project still shows a real dashboard, while a caregiver holding a different code on
    that same tablet sees nothing.
  - Rows are rebuilt field by field from a fixed list, never spread, so a document that somehow
    grew a `patientName`, `notes` or `address` could not be displayed even by accident. Nothing new
    is stored anywhere: pairing writes one local setting and the `patients` collection stays unused.
  - The dashboard is read-only, and it is enforced. A test wraps the store so `saveSession`,
    `logReminderEvent`, `markSynced` and `clearHistory` throw, and asserts the whole flow writes
    exactly one setting - `caregiverCode` - and nothing else. No remote write, update or delete
    exists in the file.
  - One Chart.js trend line per domain, labelled with the game's own name from `src/data/banks.js`:
    the score on a y-axis **pinned to 0-100** (auto-scaling would render a wobble between 68% and
    72% as a collapse) and the difficulty tier as a dashed, stepped line on a separate 1-3 axis.
    Tooltips name the day and explain both numbers in words.
  - `src/lib/chartSpec.js` was split out of the component so those readability rules are testable
    at all - `node --test` cannot import JSX. `src/components/TrendChart.jsx` is now only the
    *lifetime* of a Chart.js instance: it is the single file importing `chart.js`, it imports it
    lazily so a patient never downloads a charting library, and it destroys the instance both on
    data change and on unmount. If the library fails to load the numbers are still listed as text.
  - Insufficient data is never drawn as a trend. An empty series renders "Nothing to chart yet."
    rather than a flat line at zero; a single session is plotted but the words say plainly that one
    session cannot show a trend; two sessions get a reading that adds "two sessions is a start
    rather than a trend".
  - Under each chart is a sentence, not a number: "Remember the picture has declined across the
    last 6 sessions." The averages follow as supporting detail, and the difficulty line gets its
    own sentence so a caregiver knows whether the sessions are even comparable. Rows that cannot be
    plotted honestly are dropped, and the series reports its true total separately from the count
    it drew.
  - Nothing reads like a diagnosis, and that is machine-checked: a headline may not begin with a
    digit, and a blocklist regex (`diagnos*`, `dementia`, `alzheimer*`, `impair*`, `deteriorat*`,
    `symptom*`, `cognitive decline`, ...) is run over the headline, the detail and the difficulty
    sentence of every branch. `NOT_A_DIAGNOSIS` - "These are scores from a practice game ... Share
    them with a doctor rather than reading a condition into them." - is rendered on the page.
  - "Last synced" is honest rather than reassuring. Three different times could be meant by that
    phrase, so the value always arrives with a sentence saying which it is - the dashboard's own
    read, this device's last upload, or nothing yet - plus a separate "latest activity" line and a
    staleness warning. With nothing read it says "Unavailable" or "Not yet"; it never prints the
    current clock as a sync time.
  - Unavailable and stale are distinguished from empty. An unreachable server, a rules refusal, an
    unconfigured device and a genuinely empty history all produce zero rows but different
    sentences, so a blank chart can never look like a patient who stopped playing.
  - The reminder log lists the last 12 events newest first - "Medicine / Marked done",
    "Water / No answer", "Today at 9:15 am" - drops any row whose type or status is not one the app
    itself writes, and adds a counting summary line.
  - No security rule changed, because none needed to: step 10 already published
    `allow read: if request.auth != null` on both collections. A test now asserts every
    `allow read|get|list` still carries that condition, so loosening one fails the suite. The query
    omits `orderBy` (an equality `where` plus an `orderBy` needs a hand-built composite index) and
    sorts in JS instead, bounded at 300 rows.
  - The caregiver screens sit outside `PatientLayout`, so a reminder card can never cover them - a
    test asserts the layout's route block contains no `caregiver` path. The patient design system is
    untouched: the dashboard uses the shared `card` and `btn-quiet` and a test fails if it reaches
    for `btn-primary`, `min-h-tap-lg` or `min-h-tap-xl`, while `PatientHome.jsx` still uses them.
- Demo data seeding (Step 13) fabricates 12 days of realistic play history into local IndexedDB:
  - 17 sessions (9 `memory_recall`, 8 `routine_matching`), 136 answer rows (one per question,
    local only), and 12 reminder events (medicine, hydration, one appointment; 10 dismissed, 2 missed).
  - `memory_recall` scores fall 75 → 81 → 78 → 84 → 76 → 71 → 64 → 58 → 49 — a run of 4
    consecutive sessions dropping 22 points, triggering the Step 12 decline alert
    ("Consider a check-in with a doctor"). `routine_matching` stays in the low-to-mid 80s and
    reads as `TREND.steady`.
  - All seeded rows carry `demo: 1`; nothing else in the app does. The store's own write methods
    apply this mark, so real writes produce byte-identical stored shapes. The mark is absent from
    `remotePayload()` in `sync.js`, so it cannot reach Firestore.
  - Trigger: `window.cognicare.seedDemo()` in DevTools, or `?demo=seed` in any app URL (stripped
    after handling). Reset: `window.cognicare.resetDemo()` or `?demo=reset`. `window.cognicare.demoStatus()`
    shows demo vs real counts.
  - The generator is deterministic (fixed-seed LCG, explicit score arrays), so re-seeding on the
    same day overwrites rather than duplicates. `npm run demo:plan` prints the plan without
    touching IndexedDB.
  - 35 new tests in `tests/demoData.test.js` cover schema, domains, day span, plausible hours,
    decline alert through the real rule, steady domain not alerting, reminder log, determinism,
    idempotency, surgical reset, Firestore isolation, dashboard consumption, and the mechanism wiring.
- Verification run for this step: `npm run verify` - **274/274 pass, 0 fail**. `npm run check` -
  **64 files scanned, 0 errors, 0 warnings**. `npm run demo:plan` produces the correct output.
  - The 274 tests cover: the session engine (27), the store and privacy (17), the sync layer
    against a fake Firestore (20), caregiver data filtering and pairing (34), the full caregiver
    journey (12), decline alert edge cases (28), reminder engine (24), voice (10), demo data
    (35), art bounds (3), design system (4), icons (4), offline/build (8), PWA config (4),
    question quality (12), and time formatting (11).
  - The sync, caregiver, decline and demo suites were each attacked with deliberate mutations on a
    throwaway copy: every suite fails when the behaviour it guards is broken, and the copy is
    reverted immediately afterwards. Full mutation detail is in the per-step DECISIONS.md entries.
  - Source-reading tests cover what cannot be executed in Node: Chart.js confined to one file,
    `fetch`/`XMLHttpRequest` absent from `src/`, `speechSynthesis` confined to `voice.js`,
    `idb` confined to `idbDriver.js`, caregiver routes outside the patient shell, the dashboard
    deriving its view through exactly the functions the simulation uses, `NOT_A_DIAGNOSIS` rendered,
    and `firestore.rules` carrying the required auth conditions.

## Half-built

- The alert card has never been seen in a browser. Every word of it and every condition behind it is
  executed by `node --test`, and its colours, its `role`/`aria-live` and the disclaimer's position
  inside the card are asserted by reading the component source — but whether the outline really
  separates it from the charts, and whether it reads as a suggestion rather than a verdict, needs a
  browser and is on the README checklist.
- The sync layer has never spoken to a real Firestore. Every rule is executed against a fake that
  mirrors the published security rules and the SDK's failure modes, but `npm install` is impossible
  here, so the actual SDK, anonymous sign-in and the Rules Playground are on the README manual
  checklist. That is the largest single gap in the project.
- No browser has run this code: `npm install` is impossible in the authoring sandbox, so
  everything is verified via `node --test` plus `scripts/check-static.mjs`. The browser-only
  checks (install prompt, DevTools offline reload, IndexedDB rows in the Application tab, speech,
  canvas drawing, the alert card rendering) are written out in the README "Manual verification
  checklist".
- `npm run build` cannot be executed in this sandbox. The static checker confirms all imports
  resolve and all routes are known; the postbuild script's precache verification has not run
  against a real Vite emission.

## Known gaps at this point

- `.env` is still empty, so the app is in local-only mode. That is a supported mode, but
  cross-device sync stays off until the six `VITE_FIREBASE_*` values are pasted in.
- `firestore.rules` has not been published or exercised in the Rules Playground - that is a
  console action, listed in the README.
- No browser has run this code: `npm install` is impossible in the authoring sandbox, so
  everything is verified via `node --test` plus a static checker. The browser-only checks
  (install prompt, DevTools offline reload, IndexedDB rows in the Application tab, speech,
  canvas drawing, the alert card rendering) are written out as the README "Manual verification
  checklist". Voice is an example of the split: the rules (newest-prompt-wins, prime-once,
  silence-when-unsupported, the voice settings) are all proven with a fake synth, but whether
  the en-IN voice actually sounds clear and unhurried at rate 0.9, and whether iOS speaks after
  the primed tap, can only be heard on a real device. The tier transition is on that list too:
  the timings and the wording are tested, but how the animation *feels* at 480ms in, and whether
  two seconds is long enough to read at arm's length, can only be judged on a real screen. The
  same applies to reminders: the schedule, the window, the timeout, the repeat, the pause and the
  writes are all machine-verified, but the card actually appearing over a running game, the
  announcement being audible, and the `missed` row showing up in DevTools are on the manual
  checklist. Sync is now the biggest instance of the same split: the derived document id, the
  "never synced before the server says so" rule, the offline queue, the reconnect triggers, the
  backoff and the duplicate-safety behaviour under an uncertain result are all executed against a
  fake Firestore, and four deliberate mutations confirm those tests fail when the behaviour is
  broken - but whether the real SDK's anonymous sign-in succeeds, whether the published rules
  accept these exact documents, and whether one document per row appears in the Firestore console
  can only be seen with a browser and a project. Those five checks are written out as a new README
  section.
- A queued row that is somehow *unacceptable* to the rules retries for as long as the app is open
  (backing off to five minutes) and is reported as `blocked`, but nothing tells the user. Since the
  payload is built from a fixed field list and validated locally, the realistic cause is
  misconfiguration rather than bad data, and surfacing it belongs with the dashboard's status line
  in a future step. It never affects the patient side.
- A reminder pauses the game clock but not the session cap: the six-minute `SESSION_MAX_MS`
  limit is measured in wall-clock time, so a 90-second reminder eats into it and a session
  interrupted twice can end a question or two early. That is the intended trade (the cap
  exists to stop a patient tiring, which a long interruption also does), but it is a real
  behaviour worth knowing before a demo.
- Only part of the routine-matching difficulty gradient is machine-checked. A test proves tier 3
  pairs same-category objects and tiers 1-2 do not, but the difference between tier 1
  (the wrong object has nothing to do with the moment) and tier 2 (plausible in daily life, but
  for a different moment) is a human judgment about the cues, not something a test can assert.
  It is stated here rather than claimed as verified.
- `npm run build` cannot be run in this sandbox, so the postbuild script's precache verification,
  the `dist/404.html` fallback and `.nojekyll` output are untested against a real Vite emission.
  The static checker (`npm run check`) confirms every import resolves and every route is known,
  which is the strongest available substitute.
- No Chart.js canvas has ever been drawn. `chartSpec.js` is fully tested as data — axis ranges,
  tooltip wording, reduced motion — and the instance lifetime is asserted by reading the
  component's source, but whether the two charts are legible on a real screen, and whether
  navigating away and back really leaves no "Canvas is already in use" error, needs a browser.
- No caregiver read has ever hit a real Firestore. The filtering, the fallback and the failure
  wording are executed against a fake, and the rules are asserted to still require
  `request.auth != null` on every read, but the actual query, the real anonymous sign-in and the
  Rules Playground denial check are on the README checklist.
- Which domain a visit starts on is not remembered between app launches: every visit opens on
  memory recall and "Play again" rotates from there. Persisting it would be a settings read at
  session start, which belongs with the other settings work in a future step.

## Next step

Real browser and Firebase validation. All 14 build steps are complete and the 274-test suite
passes. The remaining work is manual: open the app in a browser, run through the README
"Manual verification checklist" (install prompt, DevTools offline reload, IndexedDB inspection,
speech, canvas drawing, alert card rendering, Firestore Rules Playground, anonymous sign-in),
and paste Firebase credentials into `.env` to enable cross-device sync. No new feature development
is planned.
