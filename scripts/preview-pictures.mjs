#!/usr/bin/env node
/**
 * preview-pictures.mjs - `npm run preview:pictures`
 *
 * The game illustrations are hand-written SVG inside src/components/Picture.jsx.
 * This script rasterises all of them into one contact-sheet PNG
 * (pictures-preview.png) so the whole set can be eyeballed in a second without
 * starting the app - which is how they were checked for legibility while the
 * app was being built.
 *
 * Deliberately zero-dependency: it parses the path data itself and writes the
 * PNG with node:zlib, same as scripts/gen-icons.mjs.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'pictures-preview.png');
const SRC = readFileSync(join(ROOT, 'src', 'components', 'Picture.jsx'), 'utf8');
const ART = SRC.slice(SRC.indexOf('const ART = {'), SRC.indexOf('export default function Picture'));

/* ------------------------------------------------------------------ png ---- */
const TBL = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = TBL[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePng(w, h, rgb) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y += 1) {
    raw[y * (w * 3 + 1)] = 0;
    rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* --------------------------------------------------------------- geometry -- */
function arcPoints(x0, y0, rx, ry, rot, largeArc, sweep, x1, y1) {
  const rad = (rot * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx2 = (x0 - x1) / 2;
  const dy2 = (y0 - y1) / 2;
  const x1p = cos * dx2 + sin * dy2;
  const y1p = -sin * dx2 + cos * dy2;
  let rxs = rx * rx;
  let rys = ry * ry;
  const lam = (x1p * x1p) / rxs + (y1p * y1p) / rys;
  if (lam > 1) {
    const s = Math.sqrt(lam);
    rx *= s;
    ry *= s;
    rxs = rx * rx;
    rys = ry * ry;
  }
  let num = rxs * rys - rxs * y1p * y1p - rys * x1p * x1p;
  if (num < 0) num = 0;
  const coef = (largeArc !== sweep ? 1 : -1) * Math.sqrt(num / (rxs * y1p * y1p + rys * x1p * x1p));
  const cxp = (coef * rx * y1p) / ry;
  const cyp = (-coef * ry * x1p) / rx;
  const cx = cos * cxp - sin * cyp + (x0 + x1) / 2;
  const cy = sin * cxp + cos * cyp + (y0 + y1) / 2;
  const ang = (ux, uy, vx, vy) => {
    const d = (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy));
    const a = Math.acos(Math.min(1, Math.max(-1, d)));
    return ux * vy - uy * vx < 0 ? -a : a;
  };
  const t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
  let dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
  if (!sweep && dt > 0) dt -= 2 * Math.PI;
  if (sweep && dt < 0) dt += 2 * Math.PI;
  const out = [];
  for (let i = 1; i <= 24; i += 1) {
    const t = t1 + (dt * i) / 24;
    out.push([
      cx + rx * Math.cos(t) * cos - ry * Math.sin(t) * sin,
      cy + rx * Math.cos(t) * sin + ry * Math.sin(t) * cos,
    ]);
  }
  return out;
}

const bez = (p0, p1, p2, p3) => {
  const out = [];
  for (let i = 1; i <= 16; i += 1) {
    const t = i / 16;
    const u = 1 - t;
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return out;
};

/* ------------------------------------------------------------- path parse -- */
function pathToSubpaths(d) {
  const t = d.match(/[a-zA-Z]|-?\d*\.?\d+/g) || [];
  const subs = [];
  let cur = [];
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  let cmd = null;
  let px = null;
  let i = 0;
  const arity = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0 };
  while (i < t.length) {
    if (/[a-zA-Z]/.test(t[i])) {
      cmd = t[i];
      i += 1;
    }
    const k = cmd.toLowerCase();
    const rel = cmd === k && k !== 'z';
    if (k === 'z') {
      if (cur.length) cur.push([sx, sy]);
      x = sx;
      y = sy;
      continue;
    }
    const n = t.slice(i, i + arity[k]).map(Number);
    i += arity[k];
    const abs = (dx, dy) => [rel ? x + dx : dx, rel ? y + dy : dy];
    if (k === 'm') {
      if (cur.length > 1) subs.push(cur);
      [x, y] = abs(n[0], n[1]);
      sx = x;
      sy = y;
      cur = [[x, y]];
      px = null;
    } else if (k === 'l') {
      [x, y] = abs(n[0], n[1]);
      cur.push([x, y]);
      px = null;
    } else if (k === 'h') {
      x = rel ? x + n[0] : n[0];
      cur.push([x, y]);
      px = null;
    } else if (k === 'v') {
      y = rel ? y + n[0] : n[0];
      cur.push([x, y]);
      px = null;
    } else if (k === 'c' || k === 's') {
      const c1 = k === 'c' ? abs(n[0], n[1]) : px ? [2 * x - px[0], 2 * y - px[1]] : [x, y];
      const c2 = k === 'c' ? abs(n[2], n[3]) : abs(n[0], n[1]);
      const end = k === 'c' ? abs(n[4], n[5]) : abs(n[2], n[3]);
      cur.push(...bez([x, y], c1, c2, end));
      px = c2;
      [x, y] = end;
    } else if (k === 'q' || k === 't') {
      const c = k === 'q' ? abs(n[0], n[1]) : px ? [2 * x - px[0], 2 * y - px[1]] : [x, y];
      const end = k === 'q' ? abs(n[2], n[3]) : abs(n[0], n[1]);
      cur.push(...bez([x, y], [x + (2 / 3) * (c[0] - x), y + (2 / 3) * (c[1] - y)],
        [end[0] + (2 / 3) * (c[0] - end[0]), end[1] + (2 / 3) * (c[1] - end[1])], end));
      px = c;
      [x, y] = end;
    } else if (k === 'a') {
      const end = abs(n[5], n[6]);
      cur.push(...arcPoints(x, y, n[0], n[1], n[2], n[3], n[4], end[0], end[1]));
      [x, y] = end;
      px = null;
    }
  }
  if (cur.length > 1) subs.push(cur);
  return subs;
}

/* --------------------------------------------------------------- raster ----- */
const S = 384; // supersampled tile
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));

function fill(buf, polys, color) {
  const [r, g, b] = hex(color);
  const edges = [];
  for (const poly of polys) {
    for (let i = 0; i < poly.length; i += 1) {
      const a = poly[i];
      const c = poly[(i + 1) % poly.length];
      if (a[1] !== c[1]) edges.push([a, c]);
    }
  }
  if (!edges.length) return;
  for (let py = 0; py < S; py += 1) {
    const y = (py + 0.5) * (100 / S);
    const xs = [];
    for (const [a, c] of edges) {
      const [x0, y0] = a;
      const [x1, y1] = c;
      if (y >= Math.min(y0, y1) && y < Math.max(y0, y1)) {
        xs.push(x0 + ((y - y0) / (y1 - y0)) * (x1 - x0));
      }
    }
    xs.sort((m, n) => m - n);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const from = Math.max(0, Math.ceil((xs[k] * S) / 100));
      const to = Math.min(S - 1, Math.floor((xs[k + 1] * S) / 100));
      for (let px = from; px <= to; px += 1) {
        const o = (py * S + px) * 3;
        buf[o] = r;
        buf[o + 1] = g;
        buf[o + 2] = b;
      }
    }
  }
}

function stroke(buf, polys, color, width) {
  const w = width / 2;
  for (const poly of polys) {
    for (let i = 0; i + 1 < poly.length; i += 1) {
      const [x0, y0] = poly[i];
      const [x1, y1] = poly[i + 1];
      const len = Math.hypot(x1 - x0, y1 - y0) || 1e-6;
      const nx = (-(y1 - y0) / len) * w;
      const ny = ((x1 - x0) / len) * w;
      fill(buf, [[[x0 + nx, y0 + ny], [x1 + nx, y1 + ny], [x1 - nx, y1 - ny], [x0 - nx, y0 - ny]]], color);
      // round-ish joint
      const j = [];
      for (let a = 0; a < 8; a += 1) {
        j.push([x1 + w * Math.cos((a * Math.PI) / 4), y1 + w * Math.sin((a * Math.PI) / 4)]);
      }
      fill(buf, [j], color);
    }
  }
}

const ellipsePoly = (cx, cy, rx, ry) => {
  const p = [];
  for (let a = 0; a < 64; a += 1) {
    p.push([cx + rx * Math.cos((a * Math.PI) / 32), cy + ry * Math.sin((a * Math.PI) / 32)]);
  }
  return p;
};

function renderTile(jsx) {
  const buf = Buffer.alloc(S * S * 3, 255);
  const tags = jsx.match(/<(path|circle|ellipse|rect)\b[^>]*\/?>/g) || [];
  for (const tag of tags) {
    const at = (n) => {
      const m = tag.match(new RegExp(`${n}="([^"]*)"`));
      return m ? m[1] : null;
    };
    const fillC = at('fill') || 'none';
    const strokeC = at('stroke') || '#14202e';
    const sw = Number(at('strokeWidth') || 3.5);
    let polys = [];
    if (tag.startsWith('<path')) polys = pathToSubpaths(at('d'));
    else if (tag.startsWith('<circle')) {
      polys = [ellipsePoly(+at('cx'), +at('cy'), +at('r'), +at('r'))];
    } else if (tag.startsWith('<ellipse')) {
      polys = [ellipsePoly(+at('cx'), +at('cy'), +at('rx'), +at('ry'))];
    } else {
      const [x, y, w, h] = ['x', 'y', 'width', 'height'].map((n) => +at(n));
      polys = [[[x, y], [x + w, y], [x + w, y + h], [x, y + h]]];
    }
    if (fillC !== 'none') fill(buf, polys, fillC);
    const closed = !tag.startsWith('<path');
    if (strokeC !== 'none') {
      stroke(buf, closed ? polys.map((p) => [...p, p[0]]) : polys, strokeC, sw);
    }
  }
  return buf;
}

/* ---------------------------------------------------------- contact sheet -- */
const entries = [...ART.matchAll(/^ {2}([a-z][a-zA-Z]*):\s*\(([\s\S]*?)^ {2}\),$/gm)].map((m) => [
  m[1],
  m[2],
]);
console.log(`rendering ${entries.length} pictures`);

const TILE = 128;
const COLS = 7;
const rows = Math.ceil(entries.length / COLS);
const W = COLS * TILE;
const H = rows * TILE;
const sheet = Buffer.alloc(W * H * 3, 240);

entries.forEach(([id, jsx], idx) => {
  const big = renderTile(jsx);
  const col = idx % COLS;
  const row = Math.floor(idx / COLS);
  const k = S / TILE;
  for (let y = 0; y < TILE; y += 1) {
    for (let x = 0; x < TILE; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let sy = 0; sy < k; sy += 1) {
        for (let sx = 0; sx < k; sx += 1) {
          const o = ((y * k + sy) * S + (x * k + sx)) * 3;
          r += big[o];
          g += big[o + 1];
          b += big[o + 2];
        }
      }
      const n = k * k;
      const border = x < 2 || y < 2 || x > TILE - 3 || y > TILE - 3;
      const o = ((row * TILE + y) * W + col * TILE + x) * 3;
      sheet[o] = border ? 200 : r / n;
      sheet[o + 1] = border ? 200 : g / n;
      sheet[o + 2] = border ? 200 : b / n;
    }
  }
  console.log(`  ${idx + 1}. ${id}`);
});

writeFileSync(OUT, encodePng(W, H, sheet));
console.log(`wrote ${OUT} (${W}x${H})`);

