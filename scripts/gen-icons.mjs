#!/usr/bin/env node
/**
 * gen-icons.mjs - generates the PWA icon set with no image libraries.
 *
 * Spec rule: all images are bundled locally (no Firebase Cloud Storage, no CDN),
 * so the icons are produced here from pure geometry and committed to the repo.
 *
 * The mark is a caring-hands heart built from an exact union of one diamond and
 * two circles in a 100x100 space, so the raster icons and favicon.svg are the
 * same shape rather than two lookalikes.
 *
 * Usage: node scripts/gen-icons.mjs
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');

const TEAL = [15, 118, 110]; // #0f766e - matches THEME_COLOR
const WHITE = [255, 255, 255];

/* ---------------------------------------------------------------- geometry */

/** Heart in a 100x100 box: diamond + two circles, unioned. */
function inHeart(x, y) {
  if (Math.abs(x - 50) + Math.abs(y - 56) <= 36) return true;
  if ((x - 32) ** 2 + (y - 38) ** 2 <= 25.5 ** 2) return true;
  if ((x - 68) ** 2 + (y - 38) ** 2 <= 25.5 ** 2) return true;
  return false;
}

function inRoundedRect(x, y, size, radius) {
  const min = radius;
  const max = size - radius;
  const cx = Math.min(Math.max(x, min), max);
  const cy = Math.min(Math.max(y, min), max);
  return (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2 + 1e-9;
}

/* ------------------------------------------------------------------- png io */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(size, rgba) {
  const stride = size * 4 + 1;
  const raw = Buffer.alloc(stride * size);
  for (let y = 0; y < size; y += 1) {
    rgba.copy(raw, y * stride + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---------------------------------------------------------------- rendering */

/**
 * @param {number} size    pixel size
 * @param {boolean} masked  true = full-bleed background + glyph inside the
 *                          Android maskable safe zone
 */
function renderIcon(size, masked) {
  const rgba = Buffer.alloc(size * size * 4);
  const SS = 3; // 3x3 supersampling for clean edges
  const glyphScale = masked ? 0.58 : 0.72;
  const radius = masked ? 0 : size * 0.22;

  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      let bg = 0;
      let fg = 0;
      for (let sy = 0; sy < SS; sy += 1) {
        for (let sx = 0; sx < SS; sx += 1) {
          const x = px + (sx + 0.5) / SS;
          const y = py + (sy + 0.5) / SS;
          if (radius === 0 || inRoundedRect(x, y, size, radius)) bg += 1;
          // map pixel into the glyph's own 100x100 space
          const gx = ((x - size / 2) / (size * glyphScale)) * 100 + 50;
          const gy = ((y - size * (masked ? 0.5 : 0.52)) / (size * glyphScale)) * 100 + 56;
          if (inHeart(gx, gy)) fg += 1;
        }
      }
      const total = SS * SS;
      const bgA = bg / total;
      const fgA = fg / total;
      const i = (py * size + px) * 4;
      for (let c = 0; c < 3; c += 1) {
        rgba[i + c] = Math.round(TEAL[c] * (1 - fgA) + WHITE[c] * fgA);
      }
      // The glyph always sits inside the background, so coverage is the bg's.
      rgba[i + 3] = Math.round(255 * bgA);
    }
  }
  return encodePng(size, rgba);
}

const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="CogniCare">
  <rect width="100" height="100" rx="22" fill="#0f766e"/>
  <g fill="#ffffff" transform="translate(50 52) scale(0.72) translate(-50 -56)">
    <polygon points="50,92 14,56 50,20 86,56"/>
    <circle cx="32" cy="38" r="25.5"/>
    <circle cx="68" cy="38" r="25.5"/>
  </g>
</svg>
`;

mkdirSync(OUT_DIR, { recursive: true });
const written = [];
for (const [name, size, masked] of [
  ['icon-192.png', 192, false],
  ['icon-512.png', 512, false],
  ['icon-maskable-512.png', 512, true],
  ['apple-touch-icon.png', 180, true],
]) {
  const buf = renderIcon(size, masked);
  writeFileSync(join(OUT_DIR, name), buf);
  written.push(`${name} (${size}px, ${(buf.length / 1024).toFixed(1)} kB)`);
}
writeFileSync(join(OUT_DIR, 'favicon.svg'), FAVICON_SVG);
written.push('favicon.svg');
console.log(`icons written to public/icons:\n  - ${written.join('\n  - ')}`);
