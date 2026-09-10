#!/usr/bin/env node
/**
 * check-static.mjs - a zero-dependency stand-in for a compiler pass.
 *
 * The sandbox this project was authored in had no access to the npm registry,
 * so `vite build` could not be run there. This script performs the checks that
 * catch the bugs a build would have caught:
 *
 *   1. every relative import resolves to a file that actually exists
 *   2. every bare import is declared in package.json (or explicitly allowed)
 *   3. brackets/braces/parens balance in every JS and JSX file
 *   4. JSX tags balance (open/close/self-close/fragments)
 *   5. every router path used in a <Link to> / navigate() exists in App.jsx
 *   6. no orphan modules under src/ (unreachable from main.jsx or tests)
 *
 * Usage: node scripts/check-static.mjs [--quiet]
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const QUIET = process.argv.includes('--quiet');

const SKIP_DIRS = new Set(['node_modules', 'dist', 'dev-dist', '.git', '.vite', 'coverage']);
const CODE_EXT = new Set(['.js', '.jsx', '.mjs']);
const RESOLVE_EXT = ['', '.js', '.jsx', '.mjs', '.json', '.css', '.svg', '.png'];

/** Bare specifiers that are legitimately not npm packages. */
const ALLOWED_BARE = new Set(['virtual:pwa-register']);
const NODE_BUILTINS = new Set([
  'assert', 'buffer', 'child_process', 'crypto', 'events', 'fs', 'http', 'https',
  'os', 'path', 'process', 'stream', 'test', 'url', 'util', 'zlib',
]);

const ROUTES = new Set([
  '/',
  '/play',
  '/play/routine',
  '/play/words',
  '/play/numbers',
  '/play/patterns',
  '/play/about-me',
  '/patient',
  '/patient/onboarding',
  '/patient/profile',
  '/remember',
  '/reminders',
  '/caregiver',
  '/caregiver/patient',
  '/caregiver/dashboard',
]);

const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry) || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/**
 * Replaces the contents of strings, template literals and comments with spaces
 * (keeping the same length, so line/column numbers stay correct) while leaving
 * real code structure - including ${} braces - intact.
 */
export function blankLiterals(src) {
  const out = Array.from(src);
  const blank = (i) => {
    if (out[i] !== '\n') out[i] = ' ';
  };
  const stack = [{ mode: 'code', depth: 0 }];
  let prev = '';
  let i = 0;

  const isRegexStart = () => {
    if (!prev) return true;
    // '<' is excluded on purpose: in JSX the '/' after '<' opens a closing tag.
    return '(,=:[!&|?{};+-*%~^'.includes(prev);
  };

  while (i < src.length) {
    const top = stack[stack.length - 1];
    const c = src[i];
    const n = src[i + 1];

    if (top.mode === 'code') {
      if (c === '/' && n === '/') {
        stack.push({ mode: 'line' });
        blank(i); blank(i + 1); i += 2; continue;
      }
      if (c === '/' && n === '*') {
        stack.push({ mode: 'block' });
        blank(i); blank(i + 1); i += 2; continue;
      }
      // `n !== '>'` keeps JSX self-closing tags (`<Foo />`) from being read as
      // the start of a regex literal when the previous token was `}`.
      if (c === '/' && n !== '>' && isRegexStart()) {
        stack.push({ mode: 'regex' });
        blank(i); i += 1; continue;
      }
      if (c === "'" || c === '"') {
        stack.push({ mode: 'quote', quote: c });
        blank(i); i += 1; continue;
      }
      if (c === '`') {
        stack.push({ mode: 'tmpl' });
        blank(i); i += 1; continue;
      }
      if (c === '{') top.depth += 1;
      if (c === '}') {
        if (top.depth === 0 && stack.length > 1) {
          stack.pop(); // closes a ${ ... } hole, back to template mode
          i += 1; prev = '}'; continue;
        }
        top.depth -= 1;
      }
      if (!/\s/.test(c)) prev = c;
      i += 1; continue;
    }

    if (top.mode === 'line') {
      if (c === '\n') { stack.pop(); i += 1; continue; }
      blank(i); i += 1; continue;
    }

    if (top.mode === 'block') {
      if (c === '*' && n === '/') { blank(i); blank(i + 1); stack.pop(); i += 2; continue; }
      blank(i); i += 1; continue;
    }

    if (top.mode === 'regex') {
      if (c === '\\') { blank(i); blank(i + 1); i += 2; continue; }
      if (c === '/' || c === '\n') { blank(i); stack.pop(); prev = 'x'; i += 1; continue; }
      blank(i); i += 1; continue;
    }

    if (top.mode === 'quote') {
      if (c === '\\') { blank(i); blank(i + 1); i += 2; continue; }
      if (c === top.quote) { blank(i); stack.pop(); prev = 'x'; i += 1; continue; }
      blank(i); i += 1; continue;
    }

    if (top.mode === 'tmpl') {
      if (c === '\\') { blank(i); blank(i + 1); i += 2; continue; }
      if (c === '`') { blank(i); stack.pop(); prev = 'x'; i += 1; continue; }
      if (c === '$' && n === '{') {
        blank(i);
        stack.push({ mode: 'code', depth: 0 });
        i += 2; prev = '{'; continue;
      }
      blank(i); i += 1; continue;
    }

    i += 1;
  }
  return out.join('');
}

function checkBalance(file, blanked) {
  const closers = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  let line = 1;
  for (let i = 0; i < blanked.length; i += 1) {
    const c = blanked[i];
    if (c === '\n') { line += 1; continue; }
    if (c === '(' || c === '[' || c === '{') stack.push({ c, line });
    else if (closers[c]) {
      const top = stack.pop();
      if (!top) return err(file, `line ${line}: stray '${c}'`);
      if (top.c !== closers[c]) {
        return err(file, `line ${line}: '${c}' closes '${top.c}' opened on line ${top.line}`);
      }
    }
  }
  if (stack.length) {
    const top = stack[stack.length - 1];
    err(file, `unclosed '${top.c}' opened on line ${top.line}`);
  }
}

/** JSX tag balance. Only run on .jsx files, where `<` always starts a tag. */
function checkJsxTags(file, blanked) {
  const stack = [];
  let i = 0;
  let line = 1;
  while (i < blanked.length) {
    const c = blanked[i];
    if (c === '\n') { line += 1; i += 1; continue; }
    if (c !== '<') { i += 1; continue; }
    const rest = blanked.slice(i, i + 240);
    if (blanked[i + 1] === '>') { stack.push({ name: 'Fragment', line }); i += 2; continue; }
    if (blanked[i + 1] === '/') {
      const m = /^<\/\s*([A-Za-z0-9_$.]*)\s*>/.exec(rest);
      if (!m) { i += 1; continue; }
      const name = m[1] || 'Fragment';
      const top = stack.pop();
      if (!top) err(file, `line ${line}: </${name}> has no opening tag`);
      else if (top.name !== name) {
        err(file, `line ${line}: </${name}> closes <${top.name}> opened on line ${top.line}`);
      }
      i += m[0].length; continue;
    }
    const open = /^<([A-Za-z][A-Za-z0-9_$.]*)/.exec(rest);
    if (!open) { i += 1; continue; }
    let j = i + 1;
    let depth = 0;
    let endLine = line;
    while (j < blanked.length) {
      const ch = blanked[j];
      if (ch === '\n') endLine += 1;
      else if (ch === '{') depth += 1;
      else if (ch === '}') depth -= 1;
      else if (ch === '>' && depth <= 0) break;
      j += 1;
    }
    if (j >= blanked.length) {
      err(file, `line ${line}: unterminated <${open[1]}> tag`);
      break;
    }
    if (!/\/\s*$/.test(blanked.slice(i, j))) stack.push({ name: open[1], line });
    line = endLine;
    i = j + 1;
  }
  stack.forEach((t) => err(file, `unclosed <${t.name}> opened on line ${t.line}`));
}

// Anchored to the start of a line so that quoted prose containing the word
// "import" inside this very file is not mistaken for an import statement.
const IMPORT_PATTERNS = [
  /^\s*import\s+[^;'"()]*?from\s*['"]([^'"]+)['"]/gm,
  /^\s*import\s*['"]([^'"]+)['"]/gm,
  /^\s*export\s+[^;'"()]*?from\s*['"]([^'"]+)['"]/gm,
  /import\(\s*['"]([^'"]+)['"]\s*\)/g,
];

function extractImports(src) {
  const found = [];
  for (const re of IMPORT_PATTERNS) {
    let m;
    while ((m = re.exec(src)) !== null) found.push(m[1]);
  }
  return [...new Set(found)];
}

function resolveSpec(file, spec) {
  const base = resolve(dirname(file), spec);
  for (const ext of RESOLVE_EXT) {
    const candidate = base + ext;
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  for (const ext of ['.js', '.jsx', '.mjs']) {
    const candidate = join(base, `index${ext}`);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function packageRoot(spec) {
  const parts = spec.split('/');
  return spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

function checkRoutes(file, src) {
  const re = /(?:\bto=|\bnavigate\(\s*)['"](\/[^'"]*)['"]/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    if (!ROUTES.has(m[1])) err(file, `navigates to unknown route "${m[1]}"`);
  }
}

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const declared = new Set([
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
]);

const files = walk(ROOT).filter((f) => CODE_EXT.has(extname(f)));
const graph = new Map();

for (const file of files) {
  const rel = relative(ROOT, file);
  const src = readFileSync(file, 'utf8');
  const blanked = blankLiterals(src);

  checkBalance(rel, blanked);
  if (extname(file) === '.jsx') checkJsxTags(rel, blanked);
  checkRoutes(rel, src);

  const edges = [];
  for (const spec of extractImports(src)) {
    if (spec.startsWith('.') || spec.startsWith('/')) {
      const target = resolveSpec(file, spec);
      if (!target) err(rel, `cannot resolve import "${spec}"`);
      else edges.push(target);
      continue;
    }
    const root = packageRoot(spec);
    const bare = root.replace(/^node:/, '');
    if (ALLOWED_BARE.has(spec) || ALLOWED_BARE.has(root)) continue;
    if (NODE_BUILTINS.has(bare)) continue;
    if (!declared.has(root)) err(rel, `import "${spec}" is not declared in package.json`);
  }
  graph.set(file, edges);
}

// Reachability: anything under src/ must be reachable from the app entry or a test.
const entries = files.filter(
  (f) => f.endsWith(join('src', 'main.jsx')) || relative(ROOT, f).startsWith('tests') || relative(ROOT, f).startsWith('scripts')
);
const seen = new Set();
const queue = [...entries];
while (queue.length) {
  const file = queue.pop();
  if (seen.has(file)) continue;
  seen.add(file);
  for (const next of graph.get(file) || []) if (!seen.has(next)) queue.push(next);
}
for (const file of files) {
  const rel = relative(ROOT, file);
  if (rel.startsWith('src') && !seen.has(file)) warn(rel, 'module is never imported (orphan)');
}

if (!QUIET) {
  console.log(`static check: ${files.length} JS/JSX files scanned`);
  for (const w of warnings) console.log(`  warn  ${w}`);
}
for (const e of errors) console.error(`  ERROR ${e}`);

if (errors.length) {
  console.error(`\nstatic check FAILED: ${errors.length} error(s)`);
  process.exit(1);
}
console.log(`static check passed (${warnings.length} warning(s))`);
