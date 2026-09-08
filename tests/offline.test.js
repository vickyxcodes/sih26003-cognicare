import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASE_PATH, pwaOptions } from '../pwa.config.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const srcFiles = walk(SRC).filter((f) => ['.js', '.jsx'].includes(extname(f)));

/**
 * The patient experience must not depend on the network. Firebase is therefore
 * only allowed inside the sync boundary; if this list grows, offline play is at
 * risk and the change should be deliberate.
 */
const FIREBASE_ALLOWED = new Set([
  join('src', 'config', 'firebase.js'),
  join('src', 'lib', 'remote.js'),
]);

test('firebase is confined to the sync boundary', () => {
  for (const file of srcFiles) {
    const src = readFileSync(file, 'utf8');
    // Static and dynamic: `remote.js` loads the SDK with import(), so a lazy
    // import elsewhere has to be caught too.
    if (!/from\s+'firebase|import\(\s*'firebase/.test(src)) continue;
    const rel = relative(ROOT, file);
    assert.ok(
      FIREBASE_ALLOWED.has(rel),
      `${rel} imports firebase directly - the patient game loop must stay offline-only`
    );
  }
});

test('nothing in src/ calls fetch or XMLHttpRequest', () => {
  for (const file of srcFiles) {
    const src = readFileSync(file, 'utf8');
    assert.doesNotMatch(src, /\bfetch\(|XMLHttpRequest/, `${relative(ROOT, file)} makes a raw request`);
  }
});

test('workbox precaches every asset type the build emits', () => {
  const patterns = pwaOptions.workbox.globPatterns.join(' ');
  for (const ext of ['js', 'css', 'html', 'svg', 'png', 'webmanifest']) {
    assert.ok(patterns.includes(ext), `${ext} files would not be precached`);
  }
});

test('navigation falls back to the cached shell under the base path', () => {
  assert.equal(pwaOptions.workbox.navigateFallback, `${BASE_PATH}index.html`);
  assert.equal(pwaOptions.registerType, 'autoUpdate', 'patients must never see an update prompt');
  assert.equal(pwaOptions.workbox.skipWaiting, true);
});

test('the build pipeline verifies the precache and writes the SPA fallback', () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  assert.match(pkg.scripts.build, /vite build/);
  assert.match(pkg.scripts.build, /scripts\/postbuild\.mjs/, 'build must run the postbuild checks');
  const postbuild = readFileSync(join(ROOT, 'scripts', 'postbuild.mjs'), 'utf8');
  assert.match(postbuild, /404\.html/);
  assert.match(postbuild, /\.nojekyll/);
});

test('service worker status is observable so "offline ready" can be surfaced', () => {
  const register = readFileSync(join(SRC, 'lib', 'swRegister.js'), 'utf8');
  assert.match(register, /onOfflineReady/);
  assert.match(register, /immediate:\s*true/);
});
