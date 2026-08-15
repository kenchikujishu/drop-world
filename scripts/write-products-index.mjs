/**
 * content/products-index.ts を生成する。
 *
 * なぜ必要か:
 *   Cloudflare Workers にはファイルシステムが無い。`fs.readdirSync` で商品 JSON を
 *   読むと、実行時に空配列が返って「商品0件のサイト」になってしまう。
 *   そこで JSON を **静的 import する索引ファイル** を生成し、ビルド時に
 *   バンドルへ埋め込む。
 *
 * いつ走るか:
 *   `npm run validate:products`（= build の前に自動実行）と `npm run new:product`。
 *   生成物は Git にコミットする（クローン直後に `npm run dev` が動くように）。
 */

import fs from 'node:fs';
import path from 'node:path';

const PRODUCTS_DIR = path.join(process.cwd(), 'content', 'products');
const OUT_FILE = path.join(process.cwd(), 'content', 'products-index.ts');

/** people-elevation-vol-01 → peopleElevationVol01 */
function toIdentifier(slug) {
  return slug.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());
}

export function writeProductsIndex() {
  const files = fs.existsSync(PRODUCTS_DIR)
    ? fs.readdirSync(PRODUCTS_DIR).filter((file) => file.endsWith('.json')).sort()
    : [];

  const imports = files
    .map((file) => `import ${toIdentifier(file.replace(/\.json$/, ''))} from './products/${file}';`)
    .join('\n');

  const entries = files
    .map(
      (file) =>
        `  { file: '${file}', data: ${toIdentifier(file.replace(/\.json$/, ''))} },`,
    )
    .join('\n');

  const contents = `/* eslint-disable */
// ⚠ このファイルは自動生成です。直接編集しないでください。
// 生成元: scripts/write-products-index.mjs
// 再生成: npm run validate:products（npm run build の前に自動で走ります）
//
// Cloudflare Workers にはファイルシステムが無いため、商品 JSON は fs で読まず、
// ここで静的 import してバンドルに埋め込みます。

${imports}

export const RAW_PRODUCTS: { file: string; data: unknown }[] = [
${entries}
];
`;

  const previous = fs.existsSync(OUT_FILE) ? fs.readFileSync(OUT_FILE, 'utf-8') : '';
  if (previous !== contents) {
    fs.writeFileSync(OUT_FILE, contents);
    return { written: true, count: files.length };
  }
  return { written: false, count: files.length };
}
