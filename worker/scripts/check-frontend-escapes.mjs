#!/usr/bin/env node
// The SPA lives inside TypeScript template literals, so a single backslash is
// eaten before the browser ever sees it: `\s` becomes `s`, `\]` becomes `]`.
// That silently corrupts regex literals rather than failing the build, so this
// scanner fails CI instead.
//
// This guard exists only while the frontend has no build step. Delete it once
// the SPA is built from real .jsx sources.

import { readFileSync } from 'node:fs';

const FILES = [
  'src/frontend.ts',
  'src/frontend/shared.ts',
  'src/frontend/content.ts',
  'src/frontend/admin.ts',
];

// Escapes that survive a template literal untouched. Everything else loses its
// backslash: \n \r \t \b \f \v \0 \\ \` \' \" \$ \xHH \uHHHH and line splices.
const SURVIVES = /^([nrtbfv0\\`'"$\n]|x[0-9a-fA-F]{2}|u)/;

let failures = 0;

for (const file of FILES) {
  const lines = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8').split('\n');

  lines.forEach((line, index) => {
    const eaten = new Set();

    for (let i = 0; i < line.length - 1; i++) {
      if (line[i] !== '\\') continue;
      if (SURVIVES.test(line.slice(i + 1))) {
        // A literal `\\` consumes both characters.
        if (line[i + 1] === '\\') i++;
        continue;
      }
      eaten.add('\\' + line[i + 1]);
    }

    if (eaten.size > 0) {
      failures++;
      console.error(`${file}:${index + 1}  eaten escape(s): ${[...eaten].join(' ')}`);
      console.error(`    ${line.trim()}`);
    }
  });
}

if (failures > 0) {
  console.error(
    `\n${failures} line(s) contain a backslash escape that the template literal will strip.` +
      `\nDouble the backslash (\\\\s, \\\\]) so the browser receives the escape intact.`
  );
  process.exit(1);
}

console.log(`Frontend escape check passed (${FILES.length} files).`);
