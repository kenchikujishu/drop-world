/**
 * content/taxonomy.ts から ID 一覧を読み出す。
 *
 * スクリプトは .mjs なので TypeScript を直接 import できない。かといって ID を
 * 二重に持つと必ずズレるので、`const X_IDS = [...] as const;` の1行を正規表現で拾う。
 * taxonomy.ts の書式を変えるとここが落ちるが、その場合はメッセージで気づける。
 */

import fs from 'node:fs';
import path from 'node:path';

const SOURCE = path.join(process.cwd(), 'content', 'taxonomy.ts');

function extract(name) {
  const source = fs.readFileSync(SOURCE, 'utf-8');
  const match = source.match(new RegExp(`const ${name} = \\[([^\\]]*)\\] as const;`));

  if (!match) {
    throw new Error(
      `content/taxonomy.ts から ${name} を読み取れませんでした。` +
        `\`const ${name} = [...] as const;\` の形式が保たれているか確認してください。`,
    );
  }

  return [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

export const CATEGORY_IDS = extract('CATEGORY_IDS');
export const VIEW_IDS = extract('VIEW_IDS');
export const FORMAT_IDS = extract('FORMAT_IDS');
