import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The game pictures are hand-written SVG on a 100x100 grid, and no browser was
 * available while writing them - so these tests act as the eyes: they walk every
 * path and shape and fail if anything is malformed or would be drawn outside the
 * viewBox (i.e. clipped off the side of the picture).
 */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = readFileSync(join(ROOT, 'src', 'components', 'Picture.jsx'), 'utf8');
const ART = SRC.slice(SRC.indexOf('const ART = {'), SRC.indexOf('export default function Picture'));

const SLACK = 8; // strokes and rays may sit slightly proud of the grid
const inBounds = (v) => v >= -SLACK && v <= 100 + SLACK;

/** Coordinate pairs consumed by each path command, and where its endpoint sits. */
const ARITY = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0 };

function walkPath(d, label) {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+/g) || [];
  let i = 0;
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  let cmd = null;
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) {
      cmd = tokens[i];
      i += 1;
    }
    assert.ok(cmd, `${label}: path data starts without a command`);
    const key = cmd.toLowerCase();
    const arity = ARITY[key];
    assert.notEqual(arity, undefined, `${label}: unknown path command "${cmd}"`);
    const relative = cmd === key && key !== 'z';
    if (key === 'z') {
      x = startX;
      y = startY;
      continue;
    }
    const nums = tokens.slice(i, i + arity).map(Number);
    assert.equal(nums.length, arity, `${label}: command "${cmd}" is missing numbers`);
    assert.ok(!nums.some(Number.isNaN), `${label}: command "${cmd}" has a bad number`);
    i += arity;
    if (key === 'h') x = relative ? x + nums[0] : nums[0];
    else if (key === 'v') y = relative ? y + nums[0] : nums[0];
    else {
      const [dx, dy] = nums.slice(-2);
      x = relative ? x + dx : dx;
      y = relative ? y + dy : dy;
    }
    if (key === 'm') {
      startX = x;
      startY = y;
    }
    assert.ok(inBounds(x) && inBounds(y), `${label}: "${cmd}" leaves the picture at ${x},${y}`);
  }
}

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`));
  return m ? m[1] : null;
};

test('every path in the picture set is valid and stays inside the picture', () => {
  const paths = [...ART.matchAll(/<path\b[^>]*>/g)].map((m) => m[0]);
  assert.ok(paths.length > 20, `expected a full picture set, found ${paths.length} paths`);
  for (const tag of paths) {
    const d = attr(tag, 'd');
    assert.ok(d, `a <path> has no d attribute: ${tag.slice(0, 60)}`);
    walkPath(d, d.slice(0, 24));
  }
});

test('circles, ellipses and rectangles stay inside the picture', () => {
  for (const tag of [...ART.matchAll(/<circle\b[^>]*>/g)].map((m) => m[0])) {
    const [cx, cy, r] = ['cx', 'cy', 'r'].map((n) => Number(attr(tag, n)));
    assert.ok(r > 0, `circle with no radius: ${tag}`);
    for (const v of [cx - r, cx + r, cy - r, cy + r]) {
      assert.ok(inBounds(v), `circle at ${cx},${cy} r${r} spills out of the picture`);
    }
  }
  for (const tag of [...ART.matchAll(/<ellipse\b[^>]*>/g)].map((m) => m[0])) {
    const [cx, cy, rx, ry] = ['cx', 'cy', 'rx', 'ry'].map((n) => Number(attr(tag, n)));
    for (const v of [cx - rx, cx + rx, cy - ry, cy + ry]) {
      assert.ok(inBounds(v), `ellipse at ${cx},${cy} spills out of the picture`);
    }
  }
  for (const tag of [...ART.matchAll(/<rect\b[^>]*>/g)].map((m) => m[0])) {
    const [x, y, w, h] = ['x', 'y', 'width', 'height'].map((n) => Number(attr(tag, n)));
    assert.ok(w > 0 && h > 0, `rect with no size: ${tag}`);
    for (const v of [x, y, x + w, y + h]) {
      assert.ok(inBounds(v), `rect at ${x},${y} ${w}x${h} spills out of the picture`);
    }
  }
});

test('the pictures are readable: solid fills and no stray colours', () => {
  const fills = [...ART.matchAll(/fill="([^"]+)"/g)].map((m) => m[1]);
  for (const fill of fills) {
    assert.match(fill, /^(#[0-9a-f]{6}|none)$/i, `unexpected fill value ${fill}`);
  }
  assert.ok(!/opacity=/.test(ART), 'no transparency: contrast has to stay high');
  assert.ok(!/<image\b|href=/.test(ART), 'pictures must not reference external files');
});
