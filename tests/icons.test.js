import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pwaOptions } from '../pwa.config.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');

function readPngHeader(file) {
  const buf = readFileSync(file);
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.ok(buf.subarray(0, 8).equals(signature), `${file} is not a PNG`);
  assert.equal(buf.subarray(12, 16).toString('ascii'), 'IHDR');
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), bytes: buf.length };
}

test('every manifest icon exists on disk at the declared size', () => {
  for (const icon of pwaOptions.manifest.icons) {
    const file = join(PUBLIC, icon.src);
    assert.ok(existsSync(file), `${icon.src} is declared in the manifest but missing from public/`);
    const { width, height } = readPngHeader(file);
    const [w, h] = icon.sizes.split('x').map(Number);
    assert.equal(width, w, `${icon.src} width`);
    assert.equal(height, h, `${icon.src} height`);
  }
});

test('extra assets referenced by the PWA plugin exist', () => {
  for (const asset of pwaOptions.includeAssets) {
    assert.ok(existsSync(join(PUBLIC, asset)), `includeAssets entry missing: ${asset}`);
  }
});

test('index.html points at the real icon files, base path included', () => {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  const iconHrefs = hrefs.filter((h) => h.includes('/icons/'));
  assert.ok(iconHrefs.length >= 2, 'expected favicon + apple-touch-icon links');
  for (const href of iconHrefs) {
    assert.ok(href.startsWith('/sih26003-cognicare/'), `${href} must include the base path`);
    const file = join(PUBLIC, href.replace('/sih26003-cognicare/', ''));
    assert.ok(existsSync(file), `index.html references a missing file: ${href}`);
  }
});

test('favicon.svg and the raster icons use the same mark geometry', () => {
  const svg = readFileSync(join(PUBLIC, 'icons', 'favicon.svg'), 'utf8');
  assert.match(svg, /polygon points="50,92 14,56 50,20 86,56"/);
  assert.match(svg, /circle cx="32" cy="38" r="25.5"/);
  assert.match(svg, /circle cx="68" cy="38" r="25.5"/);
  assert.match(svg, /#0f766e/, 'mark should use the theme colour');
});
