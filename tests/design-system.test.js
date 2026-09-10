import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwind from '../tailwind.config.js';

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
const read = (f) => readFileSync(f, 'utf8');

test('tap targets are at least 80px tall by design token', () => {
  assert.equal(tailwind.theme.extend.minHeight.tap, '80px');
  assert.equal(tailwind.theme.extend.minHeight['tap-lg'], '120px');
  assert.equal(tailwind.theme.extend.minHeight['tap-xl'], '180px');
  assert.equal(tailwind.theme.extend.minWidth.tap, '80px');
});

test('root font size is scaled up for elderly readability', () => {
  const css = read(join(SRC, 'index.css'));
  assert.match(css, /font-size:\s*20px/);
  assert.match(css, /\.tap-target\s*\{[\s\S]*min-h-tap/, '.tap-target must enforce the 80px minimum');
  assert.match(css, /prefers-reduced-motion/, 'animations must respect reduced-motion');
});

test('no swipe, pinch or multi-touch gesture handling anywhere', () => {
  const banned = /onTouchMove|onTouchStart|onSwipe|touchmove|gesturestart|onWheel|pinch/i;
  for (const file of srcFiles) {
    assert.doesNotMatch(read(file), banned, `${relative(ROOT, file)} introduces a gesture`);
  }
});

test('every button declares an explicit type', () => {
  for (const file of srcFiles.filter((f) => extname(f) === '.jsx')) {
    const src = read(file);
    const opens = (src.match(/<button\b/g) || []).length;
    const typed = (src.match(/<button\b[^>]*\btype=/g) || []).length;
    assert.equal(typed, opens, `${relative(ROOT, file)} has a <button> without type=`);
  }
});

test('patient home offers every game plus the caregiver link', () => {
  const src = read(join(SRC, 'pages', 'PatientHome.jsx'));
  assert.equal((src.match(/<button\b/g) || []).length, 1, 'home must have a single button');
  assert.equal((src.match(/<Link\b/g) || []).length, 5, 'home must link to all five games and caregivers');
  // The Play control is a <button>, not a <Link>: tapping it also has to prime
  // the speech synthesiser inside a real user gesture (see step 7).
  assert.match(src, /navigate\('\/play'\)/);
  assert.match(src, /to="\/caregiver"/);
  assert.match(src, /to="\/play\/routine"/);
  assert.match(src, /to="\/play\/words"/);
  assert.match(src, /to="\/play\/numbers"/);
  assert.match(src, /to="\/play\/patterns"/);
  assert.match(src, /aria-label=/, 'the big button needs an accessible name');
});

test('the design system uses high-contrast ink on paper, not grey on grey', () => {
  const { colors } = tailwind.theme.extend;
  assert.equal(colors.ink, '#14202e');
  assert.equal(colors.paper, '#fbf9f4');
  assert.equal(colors.primary.DEFAULT, '#0f766e');
});
