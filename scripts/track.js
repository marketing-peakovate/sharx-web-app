#!/usr/bin/env node
// The ONLY writer of tracker/tracker-data.js. No dependencies.
// Usage: see CLAUDE.md "Tracker". Maintenance: `seed [--force]` rebuilds from docs/specs/STATUS.md.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'tracker', 'tracker-data.js');
const STATUSES = ['todo', 'doing', 'done', 'blocked'];

const now = () => new Date().toISOString();
const die = (m) => { console.log(m); process.exit(1); };
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const pctOf = (f) => (f.subs.length ? Math.round(f.subs.reduce((a, s) => a + s.pct, 0) / f.subs.length) : 0);
const clip = (t) => String(t || '').trim().split(/\s+/).filter(Boolean).slice(0, 10).join(' ');

function load() {
  const raw = fs.readFileSync(DATA, 'utf8');
  return JSON.parse(raw.replace(/^\s*window\.TRACKER\s*=\s*/, '').replace(/;\s*$/, ''));
}

// One line per feature header and per sub-feature, so git diffs stay small.
function serialize(d) {
  const q = JSON.stringify;
  const feats = d.features.map((f) => {
    const { subs, ...head } = f;
    return q(head).slice(0, -1) + ',"subs":[\n' + subs.map(q).join(',\n') + '\n]}';
  }).join(',\n');
  return 'window.TRACKER = {\n"now":' + q(d.now) + ',\n"lastActivity":' + q(d.lastActivity) +
    ',\n"features":[\n' + feats + '\n],\n"log":[\n' + d.log.map(q).join(',\n') + '\n]\n};\n';
}

function save(d) {
  d.log = d.log.slice(-30);
  const tmp = DATA + '.' + process.pid + '.tmp';
  fs.writeFileSync(tmp, serialize(d));
  for (let i = 0; ; i++) {
    try { fs.renameSync(tmp, DATA); return; } catch (e) {
      if (i >= 4) { try { fs.unlinkSync(tmp); } catch (_) {} throw e; }
      sleep(60);
    }
  }
}

function parseArgs(args) {
  const o = {}, pos = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) o[args[i].slice(2)] = (args[i + 1] !== undefined && !args[i + 1].startsWith('--')) ? args[++i] : true;
    else pos.push(args[i]);
  }
  return { o, pos };
}

function touch(arg) {
  try {
    let file = arg;
    if (!file) {
      if (process.stdin.isTTY) return;
      const j = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
      file = (j.tool_input && (j.tool_input.file_path || j.tool_input.path)) || '';
    }
    if (!file) return;
    let rel = path.isAbsolute(file) ? path.relative(ROOT, file) : file;
    if (rel.startsWith('..')) rel = file;
    rel = rel.replace(/\\/g, '/');
    if (/tracker\/(tracker-data\.js|index\.html)$/.test(rel)) return;
    const d = load();
    d.lastActivity = { time: now(), file: rel };
    save(d);
  } catch (_) { /* hooks never fail */ }
}

function seed(force) {
  if (fs.existsSync(DATA) && !force) die('Tracker data exists. Use: seed --force');
  const lines = fs.readFileSync(path.join(ROOT, 'docs', 'specs', 'STATUS.md'), 'utf8').split(/\r?\n/);
  const features = [];
  let f = null, n = 0, m;
  for (const l of lines) {
    if ((m = l.match(/^##\s+(F\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*$/))) {
      f = { id: m[1], name: m[2], spec: m[4], owner: m[3], subs: [] };
      features.push(f);
    } else if (f && (m = l.match(/^-\s+(F\d+\.\d+)\s*\|\s*(.+?)\s*\|\s*(todo|doing|done|blocked)\s*$/)) && m[1].startsWith(f.id + '.')) {
      f.subs.push({ id: m[1], name: m[2], status: m[3], pct: m[3] === 'done' ? 100 : 0, note: '', updated: now() });
      n++;
    }
  }
  if (!features.length) die('No features found in docs/specs/STATUS.md.');
  save({ now: 'Not started', lastActivity: { time: now(), file: '(seeded)' }, features, log: [{ t: now(), m: 'seeded from docs/specs/STATUS.md' }] });
  console.log(`ok seeded ${features.length} features, ${n} sub-features`);
}

function update(id, o) {
  const d = load();
  const isFeature = /^F\d+$/.test(id);
  const f = d.features.find((x) => x.id === id.split('.')[0]);
  const s = f && !isFeature ? f.subs.find((x) => x.id === id) : null;
  if (!f || (!isFeature && !s)) die(`Unknown ID ${id}. Ask the user.`);
  if (isFeature) die(`${id} is a feature; its % is computed. Update a sub-feature (${id}.x).`);
  let { status, pct, note } = o;
  if (status !== undefined && !STATUSES.includes(status)) die(`Bad status "${status}". Use todo|doing|done|blocked.`);
  if (pct !== undefined) {
    pct = Number(pct);
    if (!Number.isInteger(pct) || pct < 0 || pct > 100) die('Bad pct. Use an integer 0-100.');
  }
  if (status === 'done') pct = 100;
  else if (status === undefined && pct !== undefined) status = pct > 0 && s.status === 'todo' ? 'doing' : s.status;
  if (pct === 100 && status !== 'blocked') status = 'done';
  if (status !== undefined) s.status = status;
  if (pct !== undefined) s.pct = pct;
  if (note !== undefined) s.note = clip(note === true ? '' : note);
  s.updated = now();
  d.log.push({ t: s.updated, m: `${id} ${s.status} ${s.pct}%${s.note ? ' ' + s.note : ''}` });
  save(d);
  console.log(`ok ${id} ${s.status} ${s.pct}%`);
}

function add(id, name, o) {
  if (!id || !name) die('Usage: add <ID> "<name>" [--spec <path>] [--owner <name>]');
  const d = load();
  if (/^F\d+$/.test(id)) {
    if (d.features.some((f) => f.id === id)) die(`${id} exists.`);
    d.features.push({ id, name, spec: typeof o.spec === 'string' ? o.spec : '', owner: typeof o.owner === 'string' ? o.owner : '', subs: [] });
  } else if (/^F\d+\.\d+$/.test(id)) {
    const f = d.features.find((x) => x.id === id.split('.')[0]);
    if (!f) die(`Unknown ID ${id.split('.')[0]}. Ask the user.`);
    if (f.subs.some((s) => s.id === id)) die(`${id} exists.`);
    f.subs.push({ id, name, status: 'todo', pct: 0, note: '', updated: now() });
  } else die(`Unknown ID ${id}. Ask the user.`);
  d.log.push({ t: now(), m: `added ${id} ${name}` });
  save(d);
  console.log(`ok added ${id}`);
}

function list() {
  const d = load();
  for (const f of d.features) {
    console.log(`${f.id} ${f.name} [${f.owner}] ${pctOf(f)}%`);
    for (const s of f.subs) console.log(`  ${s.id} ${s.status} ${s.pct}% ${s.name}${s.note ? ' — ' + s.note : ''}`);
  }
}

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === 'touch') { touch(rest[0]); process.exit(0); }
if (!cmd) die('Usage: track.js <ID> --status <s> --pct <n> --note "<text>" | now | log | list | add | touch');
const { o, pos } = parseArgs(rest);
if (cmd === 'seed') seed(!!o.force);
else if (!fs.existsSync(DATA)) die('No tracker data. Run: node scripts/track.js seed');
else if (cmd === 'now') { const d = load(); d.now = String(pos[0] || '').slice(0, 140); save(d); console.log('ok now'); }
else if (cmd === 'log') { const d = load(); d.log.push({ t: now(), m: String(pos[0] || '').slice(0, 140) }); save(d); console.log('ok log'); }
else if (cmd === 'list') list();
else if (cmd === 'add') add(pos[0], pos[1], o);
else if (/^F\d+(\.\d+)?$/.test(cmd)) update(cmd, o);
else die(`Unknown ID ${cmd}. Ask the user.`);
