// Fails if UI code uses physical-direction Tailwind classes (breaks Arabic RTL). Use ms-/me-/ps-/pe-/start-/end-/text-start.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BAD =
  /(?<![\w-])-?(?:m[lr]|p[lr]|left|right|border-[lr]|rounded-[lr]|rounded-[tb][lr]|scroll-[mp][lr])-[\w[\].%/-]+|(?<![\w-])(?:text|float|clear)-(?:left|right)(?![\w-])/g;
const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx|css)$/.test(name)) files.push(p);
  }
};
walk('src');

let failures = 0;
for (const file of files) {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      for (const m of line.matchAll(BAD)) {
        failures++;
        console.error(`${file}:${i + 1}  physical class "${m[0]}" (use a logical one)`);
      }
    });
}
if (failures) process.exit(1);
console.log(`logical-css: ${files.length} files clean`);
