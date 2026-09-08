#!/usr/bin/env node
/**
 * postbuild.mjs - runs automatically after `vite build`.
 *
 *  1. Asserts the service worker really precached the app shell, so "works
 *     offline" is checked by the build instead of being assumed.
 *  2. Asserts the web manifest and its icons landed in dist/.
 *  3. Writes dist/404.html (a copy of index.html) so that deep links like
 *     /caregiver/dashboard survive a hard refresh on GitHub Pages, and
 *     dist/.nojekyll so Pages serves every file untouched.
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const fail = (msg) => {
  console.error(`postbuild FAILED: ${msg}`);
  process.exit(1);
};

if (!existsSync(join(DIST, 'index.html'))) fail('dist/index.html missing - run `vite build` first');

/* ------------------------------------------------- service worker precache */

const swFile = ['sw.js', 'service-worker.js'].map((f) => join(DIST, f)).find(existsSync);
if (!swFile) fail('no service worker in dist/ - is vite-plugin-pwa still configured?');

const sw = readFileSync(swFile, 'utf8');
const precached = [...sw.matchAll(/"url"\s*:\s*"([^"]+)"/g)].map((m) => m[1]);
if (precached.length < 4) fail(`service worker precaches only ${precached.length} files`);

const needs = [
  ['index.html', (u) => u.endsWith('index.html')],
  ['a JS bundle', (u) => u.endsWith('.js')],
  ['a CSS bundle', (u) => u.endsWith('.css')],
  ['an app icon', (u) => u.endsWith('.png')],
];
for (const [label, match] of needs) {
  if (!precached.some(match)) fail(`${label} is not in the service worker precache list`);
}

/* -------------------------------------------------------------- manifest */

const manifestFile = ['manifest.webmanifest', 'manifest.json']
  .map((f) => join(DIST, f))
  .find(existsSync);
if (!manifestFile) fail('no web manifest in dist/');

const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
if (manifest.display !== 'standalone') fail('manifest.display must be "standalone" to be installable');
for (const icon of manifest.icons || []) {
  const rel = icon.src.replace(/^\.?\//, '').replace(manifest.scope?.replace(/^\//, '') || '', '');
  if (!existsSync(join(DIST, rel))) fail(`manifest icon missing from dist: ${icon.src}`);
}

/* ------------------------------------------------ GitHub Pages SPA support */

copyFileSync(join(DIST, 'index.html'), join(DIST, '404.html'));
writeFileSync(join(DIST, '.nojekyll'), '');

console.log(
  [
    'postbuild OK',
    `  service worker : ${swFile.replace(`${ROOT}/`, '')} precaches ${precached.length} files`,
    `  manifest       : ${manifest.name} (${(manifest.icons || []).length} icons, display=${manifest.display})`,
    '  404.html       : written (SPA deep links survive refresh on GitHub Pages)',
    '  .nojekyll      : written',
  ].join('\n')
);
