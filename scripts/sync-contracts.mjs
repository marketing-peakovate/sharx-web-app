// Copies api/src/contracts → web/src/contracts (generated copy, never edited by hand).
//   node scripts/sync-contracts.mjs          write the copy
//   node scripts/sync-contracts.mjs --check  exit 1 if the copy is stale (used by CI)
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'api', 'src', 'contracts');
const dst = join(root, 'web', 'src', 'contracts');
const HEADER =
  '// GENERATED from api/src/contracts by scripts/sync-contracts.mjs. Do not edit; change the source and re-run the script.\n';
const check = process.argv.includes('--check');

const list = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.ts')).sort() : []);
const wanted = new Map(list(src).map((f) => [f, HEADER + readFileSync(join(src, f), 'utf8')]));
const stale = [];

for (const [f, content] of wanted) {
  const p = join(dst, f);
  if (!existsSync(p) || readFileSync(p, 'utf8') !== content) stale.push(f);
}
for (const f of list(dst)) if (!wanted.has(f)) stale.push(`${f} (removed upstream)`);

if (check) {
  if (stale.length) {
    console.error(`web/src/contracts is out of date: ${stale.join(', ')}\nRun: node scripts/sync-contracts.mjs`);
    process.exit(1);
  }
  console.log('contracts in sync');
} else {
  mkdirSync(dst, { recursive: true });
  for (const f of list(dst)) if (!wanted.has(f)) rmSync(join(dst, f));
  for (const [f, content] of wanted) writeFileSync(join(dst, f), content);
  console.log(`contracts synced (${wanted.size} files)`);
}
