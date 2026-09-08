import test from 'node:test';
import assert from 'node:assert/strict';
import { BASE_PATH, BACKGROUND_COLOR, THEME_COLOR, pwaOptions } from '../pwa.config.js';

test('BASE_PATH is a GitHub Pages style path', () => {
  assert.match(BASE_PATH, /^\/.*\/$/, 'needs a leading and trailing slash');
});

test('manifest carries everything a browser needs to offer "Add to Home Screen"', () => {
  const m = pwaOptions.manifest;
  assert.ok(m.name && m.name.length > 3);
  assert.ok(m.short_name && m.short_name.length <= 12, 'short_name must fit a launcher label');
  assert.equal(m.display, 'standalone');
  assert.equal(m.start_url, BASE_PATH);
  assert.equal(m.scope, BASE_PATH);
  assert.equal(m.theme_color, THEME_COLOR);
  assert.equal(m.background_color, BACKGROUND_COLOR);
  assert.equal(m.lang, 'en', 'English-only build');
});

test('manifest has the icon sizes Chrome and iOS require', () => {
  const sizes = pwaOptions.manifest.icons.map((i) => i.sizes);
  assert.ok(sizes.includes('192x192'), '192px icon missing');
  assert.ok(sizes.includes('512x512'), '512px icon missing');
  const maskable = pwaOptions.manifest.icons.filter((i) => i.purpose === 'maskable');
  assert.equal(maskable.length, 1, 'exactly one maskable icon expected');
  for (const icon of pwaOptions.manifest.icons) {
    assert.equal(icon.type, 'image/png');
    assert.ok(!icon.src.startsWith('/'), 'icon src must stay base-relative');
  }
});

test('workbox precaches the whole shell so the app works with no network', () => {
  const wb = pwaOptions.workbox;
  for (const ext of ['js', 'css', 'html', 'svg', 'png']) {
    assert.ok(wb.globPatterns.some((p) => p.includes(ext)), `${ext} not precached`);
  }
  assert.equal(wb.navigateFallback, `${BASE_PATH}index.html`);
  assert.equal(wb.cleanupOutdatedCaches, true);
  assert.equal(wb.clientsClaim, true);
});

test('service worker registration is hand-rolled, not injected twice', () => {
  assert.equal(pwaOptions.injectRegister, null);
  assert.equal(pwaOptions.registerType, 'autoUpdate');
  assert.equal(pwaOptions.devOptions.enabled, true, 'offline testing should work in dev too');
});
