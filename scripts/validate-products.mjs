#!/usr/bin/env node
/**
 * 商品 JSON の検査。`npm run build` の前に自動で走る。
 *
 * lib/product-schema.ts (Zod) と役割が重なるが、こちらは
 * **画像ファイルが実在するか** まで見る。参照先の画像が無いまま
 * デプロイされると、商品ページの画像だけが割れる —— それを防ぐのが目的。
 */

import fs from 'node:fs';
import path from 'node:path';
import { CATEGORY_IDS, FORMAT_IDS, VIEW_IDS } from './taxonomy-ids.mjs';

const PRODUCTS_DIR = path.join(process.cwd(), 'content', 'products');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

const errors = [];

function fail(file, message) {
  errors.push(`${file}: ${message}`);
}

function checkLocalized(file, field, value) {
  if (!value || typeof value !== 'object') {
    return fail(file, `${field} は { en, ja } のオブジェクトである必要があります。`);
  }
  for (const lang of ['en', 'ja']) {
    if (typeof value[lang] !== 'string' || value[lang].trim() === '') {
      fail(file, `${field}.${lang} が空です。`);
    }
  }
}

function checkEnumList(file, field, value, allowed, { min = 1 } = {}) {
  if (!Array.isArray(value) || value.length < min) {
    return fail(file, `${field} は最低 ${min} 件の配列である必要があります。`);
  }
  for (const item of value) {
    if (!allowed.includes(item)) {
      fail(file, `${field} の "${item}" は未定義です。使える値: ${allowed.join(', ')}`);
    }
  }
}

function checkImage(file, field, value) {
  if (typeof value !== 'string' || !value.startsWith('/')) {
    return fail(file, `${field} は "/" で始まるパスである必要があります。`);
  }
  if (!fs.existsSync(path.join(PUBLIC_DIR, value))) {
    fail(file, `${field} が指す画像が見つかりません → public${value}`);
  }
}

if (!fs.existsSync(PRODUCTS_DIR)) {
  console.error('content/products/ がありません。');
  process.exit(1);
}

const files = fs.readdirSync(PRODUCTS_DIR).filter((file) => file.endsWith('.json'));

if (files.length === 0) {
  console.error('content/products/ に商品がありません。最低1点は必要です。');
  process.exit(1);
}

for (const file of files) {
  let product;
  try {
    product = JSON.parse(fs.readFileSync(path.join(PRODUCTS_DIR, file), 'utf-8'));
  } catch (error) {
    fail(file, `JSON として読めません: ${error.message}`);
    continue;
  }

  const expectedSlug = file.replace(/\.json$/, '');
  if (product.slug !== expectedSlug) {
    fail(file, `slug "${product.slug}" がファイル名と一致していません（期待値: ${expectedSlug}）。`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug ?? '')) {
    fail(file, 'slug は小文字の英数字とハイフンのみが使えます。');
  }

  checkLocalized(file, 'title', product.title);
  checkLocalized(file, 'summary', product.summary);
  checkLocalized(file, 'description', product.description);

  if (!CATEGORY_IDS.includes(product.category)) {
    fail(file, `category "${product.category}" は未定義です。使える値: ${CATEGORY_IDS.join(', ')}`);
  }
  checkEnumList(file, 'views', product.views, VIEW_IDS);
  checkEnumList(file, 'formats', product.formats, FORMAT_IDS);

  if (!Number.isInteger(product.itemCount) || product.itemCount <= 0) {
    fail(file, 'itemCount は1以上の整数である必要があります。');
  }
  if (typeof product.fileSize !== 'string' || product.fileSize.trim() === '') {
    fail(file, 'fileSize が空です（例: "12.4 MB"）。');
  }

  if (!product.price || typeof product.price.amount !== 'number' || product.price.amount < 0) {
    fail(file, 'price.amount は0以上の数値である必要があります。');
  }
  if (!['JPY', 'USD'].includes(product.price?.currency)) {
    fail(file, 'price.currency は "JPY" か "USD" である必要があります。');
  }

  if (product.checkoutUrl !== null) {
    try {
      new URL(product.checkoutUrl);
    } catch {
      fail(file, 'checkoutUrl は有効な URL か null である必要があります。');
    }
  }

  if (product.lemonVariantId !== null && typeof product.lemonVariantId !== 'string') {
    fail(file, 'lemonVariantId は文字列か null である必要があります。');
  }

  checkImage(file, 'thumbnail', product.thumbnail);
  if (!Array.isArray(product.gallery) || product.gallery.length === 0) {
    fail(file, 'gallery は最低1枚必要です。');
  } else {
    product.gallery.forEach((image, index) => checkImage(file, `gallery[${index}]`, image));
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(product.publishedAt ?? '')) {
    fail(file, 'publishedAt は YYYY-MM-DD 形式である必要があります。');
  }
}

if (errors.length > 0) {
  console.error(`\n✗ 商品データに ${errors.length} 件の問題があります:\n`);
  for (const error of errors) console.error(`  - ${error}`);
  console.error('');
  process.exit(1);
}

/* 販売可能かどうかは警告に留める（LS 側に商品を作る前は checkoutUrl が null のため）。 */
const pending = files.filter((file) => {
  const product = JSON.parse(fs.readFileSync(path.join(PRODUCTS_DIR, file), 'utf-8'));
  return product.checkoutUrl === null;
});

console.log(`✓ 商品 ${files.length} 点、問題なし。`);
if (pending.length > 0) {
  console.log(
    `\n⚠ うち ${pending.length} 点は checkoutUrl が未設定です（サイト上は「販売準備中」と表示されます）:`,
  );
  for (const file of pending) console.log(`  - ${file}`);
  console.log('\n  Lemon Squeezy の審査に出す前に、LS 側で商品を作成して URL を入れてください。');
  console.log('  詳しくは docs/LEMON_SETUP.md を参照。');
}
