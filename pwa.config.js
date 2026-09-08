/**
 * PWA + base-path configuration.
 *
 * Kept dependency-free on purpose: `vite.config.js` imports it, and the test
 * suite can import it under plain Node (no bundler) to assert the manifest and
 * Workbox options are well formed.
 *
 * BASE_PATH must match the GitHub Pages repository name, with leading and
 * trailing slashes. For a <user>.github.io root site use '/'.
 */
export const BASE_PATH = '/sih26003-cognicare/';

export const APP_NAME = 'CogniCare';
export const APP_DESCRIPTION =
  'Gentle daily memory games and reminders for elderly users. Works fully offline.';

/** Theme colours also used by the Tailwind design system. */
export const THEME_COLOR = '#0f766e';
export const BACKGROUND_COLOR = '#fbf9f4';

export const pwaOptions = {
  // We call registerSW() ourselves in src/lib/swRegister.js so we can react to
  // the "offline ready" event, so the plugin must not inject its own snippet.
  injectRegister: null,
  registerType: 'autoUpdate',
  includeAssets: ['icons/favicon.svg', 'icons/apple-touch-icon.png'],
  manifest: {
    id: BASE_PATH,
    name: 'CogniCare - daily memory care',
    short_name: APP_NAME,
    description: APP_DESCRIPTION,
    lang: 'en',
    dir: 'ltr',
    start_url: BASE_PATH,
    scope: BASE_PATH,
    display: 'standalone',
    orientation: 'portrait',
    background_color: BACKGROUND_COLOR,
    theme_color: THEME_COLOR,
    categories: ['health', 'medical', 'lifestyle'],
    icons: [
      { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  workbox: {
    // Precache the whole shell: after the first load the patient experience
    // must never need the network again.
    globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest,woff2}'],
    navigateFallback: `${BASE_PATH}index.html`,
    navigateFallbackDenylist: [/^\/api\//],
    cleanupOutdatedCaches: true,
    clientsClaim: true,
    skipWaiting: true,
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
  },
  devOptions: {
    // Lets you test offline behaviour with `npm run dev` too, not just a build.
    enabled: true,
    type: 'module',
    navigateFallback: 'index.html',
  },
};
