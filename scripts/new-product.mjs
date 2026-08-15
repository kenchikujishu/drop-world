#!/usr/bin/env node
/**
 * 商品を1点追加する。`npm run new:product`
 *
 * やること:
 *   1. 対話で内容を聞く
 *   2. content/products/<slug>.json を生成
 *   3. public/products/<slug>/ を作成（ここにサムネイル画像を置く）
 *
 * zip はリポジトリに入れない。Lemon Squeezy 側にアップロードする。
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { CATEGORY_IDS, FORMAT_IDS, VIEW_IDS } from './taxonomy-ids.mjs';

const rl = readline.createInterface({ input, output });

async function ask(question, { required = true, fallback = '' } = {}) {
  while (true) {
    const answer = (await rl.question(`${question}${fallback ? ` [${fallback}]` : ''}: `)).trim();
    if (answer) return answer;
    if (fallback) return fallback;
    if (!required) return '';
    console.log('  → 入力が必要です。');
  }
}

async function askFromList(question, allowed, { multiple = false } = {}) {
  console.log(`\n  選択肢: ${allowed.join(' / ')}`);
  while (true) {
    const raw = await ask(multiple ? `${question}（カンマ区切りで複数可）` : question);
    const values = raw
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    const invalid = values.filter((value) => !allowed.includes(value));
    if (invalid.length > 0) {
      console.log(`  → 未定義の値: ${invalid.join(', ')}`);
      continue;
    }
    if (!multiple && values.length !== 1) {
      console.log('  → 1つだけ指定してください。');
      continue;
    }
    return multiple ? values : values[0];
  }
}

async function askNumber(question, { integer = true } = {}) {
  while (true) {
    const value = Number(await ask(question));
    if (!Number.isFinite(value) || value < 0 || (integer && !Number.isInteger(value))) {
      console.log('  → 数値で入力してください。');
      continue;
    }
    return value;
  }
}

console.log('\n=== drop world / 商品を追加する ===\n');

const slug = await ask('slug（URL に出る識別子。小文字・ハイフン区切り。例: people-elevation-vol-02）');

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error('\n✗ slug は小文字の英数字とハイフンのみが使えます。');
  rl.close();
  process.exit(1);
}

const jsonPath = path.join(process.cwd(), 'content', 'products', `${slug}.json`);
if (fs.existsSync(jsonPath)) {
  console.error(`\n✗ content/products/${slug}.json はすでに存在します。`);
  rl.close();
  process.exit(1);
}

const titleEn = await ask('商品名（英語）');
const titleJa = await ask('商品名（日本語）');
const summaryEn = await ask('一覧に出る要約（英語・1〜2文）');
const summaryJa = await ask('一覧に出る要約（日本語・1〜2文）');

const category = await askFromList('カテゴリ', CATEGORY_IDS);
const views = await askFromList('視点', VIEW_IDS, { multiple: true });
const formats = await askFromList('収録形式', FORMAT_IDS, { multiple: true });

const itemCount = await askNumber('\n収録点数');
const fileSize = await ask('ダウンロードサイズ（例: 12.4 MB）');
const currency = await askFromList('通貨', ['JPY', 'USD'].map((v) => v.toLowerCase()));
const amount = await askNumber('価格（数値のみ）', { integer: currency === 'jpy' });

const checkoutUrl = await ask(
  'Lemon Squeezy のチェックアウト URL（まだ無ければ空 Enter）',
  { required: false },
);

const today = new Date().toISOString().slice(0, 10);

const product = {
  slug,
  title: { en: titleEn, ja: titleJa },
  summary: { en: summaryEn, ja: summaryJa },
  description: {
    en: 'TODO: 英語の本文。空行で段落を分ける。',
    ja: 'TODO: 日本語の本文。空行で段落を分ける。',
  },
  category,
  views,
  formats,
  itemCount,
  fileSize,
  price: { amount, currency: currency.toUpperCase() },
  checkoutUrl: checkoutUrl || null,
  lemonVariantId: null,
  thumbnail: `/products/${slug}/thumb.webp`,
  gallery: [`/products/${slug}/01.webp`, `/products/${slug}/02.webp`],
  tags: [],
  featured: false,
  publishedAt: today,
};

fs.writeFileSync(jsonPath, `${JSON.stringify(product, null, 2)}\n`);

const imageDir = path.join(process.cwd(), 'public', 'products', slug);
fs.mkdirSync(imageDir, { recursive: true });

rl.close();

console.log(`
✓ 作成しました

  content/products/${slug}.json
  public/products/${slug}/          ← ここに画像を置く

次にやること:
  1. public/products/${slug}/ に thumb.webp、01.webp、02.webp を置く
     （枚数を変える場合は JSON の gallery も合わせて直す）
  2. JSON の description（en / ja）を書く
  3. Lemon Squeezy に商品を作って zip をアップし、checkoutUrl を JSON に貼る
  4. npm run validate:products
  5. npm run dev で見た目を確認
  6. git add . && git commit && git push  → Vercel が自動デプロイ

  手順の詳細は docs/ADD_PRODUCT.md に書いてあります。
`);
