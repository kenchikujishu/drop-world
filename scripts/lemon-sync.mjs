#!/usr/bin/env node
/**
 * Lemon Squeezy の商品をサイトに取り込む。
 *
 *   npm run lemon:check   Lemon の商品がサイトにどう出るかを表で確認する（ファイルは書かない）
 *   （npm run dev / npm run build の前にも自動で走る）
 *
 * 流れ:
 *   Lemon API → このスクリプト → content/catalog.generated.json → サイトのビルド
 *
 * 公開中のサイト（Cloudflare Workers）は API キーを持たず、Lemon と通信もしない。
 * 商品データはビルドのたびにこのファイルへ焼き込まれる。
 *
 * 環境変数（ローカルは .env.local、本番は GitHub の Secrets）:
 *   LEMONSQUEEZY_API_KEY   テストモードのキー → テスト商品 / 本番キー → 本番商品
 *   LEMONSQUEEZY_STORE_ID  （任意）キーから見えるストアが複数あるときだけ指定
 *
 * オプション:
 *   --check   表を出すだけでファイルは書かない
 *   --dev     キーが無ければ見本データ（content/lemon-fixture.json）で代用する
 *
 * 商品が0件でも失敗にはしない（空のサイトとして公開する）。
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_FILE = path.join(ROOT, 'content', 'catalog.generated.json');
const FIXTURE_FILE = path.join(ROOT, 'content', 'lemon-fixture.json');
const CATEGORIES = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'content', 'categories.json'), 'utf-8'),
);
const SUB_AXES = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'content', 'subcategories.json'), 'utf-8'),
).axes;

/** 「Japanese Street」「axono」のような書き方のゆれを id に寄せる。 */
function normalizeTag(value) {
  return String(value).trim().toLowerCase().replace(/[\s_]+/g, '-');
}

/** 軸ごとに「書かれうる語 → id」の表を作る（id 本体・別名の両方を入れる）。 */
const SUB_LOOKUP = SUB_AXES.map((axis) => {
  const terms = new Map();
  for (const item of axis.items) {
    terms.set(normalizeTag(item.id), item.id);
    for (const alias of item.aliases ?? []) terms.set(normalizeTag(alias), item.id);
  }
  return {
    id: axis.id,
    keyword: axis.keyword,
    // 説明文の行頭に書ける見出し。「Scene:」「シーン:」など
    linePattern: new RegExp(
      `^(${[axis.keyword, ...(axis.keywordAliases ?? [])].join('|')})\\s*[:：]\\s*(.+)$`,
      'i',
    ),
    terms,
    options: axis.items.map((item) => item.id),
  };
});

// id が全軸で重複していると、どの軸の語か決められなくなる。
{
  const ids = SUB_AXES.flatMap((axis) => axis.items.map((item) => item.id));
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length > 0) {
    throw new Error(
      `content/subcategories.json の id が重複しています: ${[...new Set(dup)].join(', ')}`,
    );
  }
}
// テスト用に差し替えられるようにしてある。通常は触らない。
const API_BASE = (process.env.LEMONSQUEEZY_API_BASE ?? 'https://api.lemonsqueezy.com/v1').replace(
  /\/$/,
  '',
);

const args = new Set(process.argv.slice(2));
const CHECK = args.has('--check');
const DEV = args.has('--dev');

/** 商品名の先頭に付ける品番。例: "DW-PPL-001 Workers — Site & Street" */
const SKU_PATTERN = /^\s*(DW-([A-Z]{3})-(\d{3}))\s+(.+?)\s*$/;

main().catch((error) => {
  console.error(`\n✗ ${error.message}\n`);
  process.exit(1);
});

async function main() {
  const key = process.env.LEMONSQUEEZY_API_KEY?.trim();
  let source;
  let storeName;
  let currency;
  let rawProducts;

  if (key) {
    const store = await resolveStore(key);
    storeName = store.attributes?.name ?? String(store.id);
    currency = store.attributes?.currency ?? 'USD';
    rawProducts = await fetchAllProducts(key, store.id);
    source = 'lemon';
  } else if (DEV || process.env.DW_ALLOW_FIXTURE === '1') {
    const fixture = JSON.parse(fs.readFileSync(FIXTURE_FILE, 'utf-8'));
    storeName = fixture.store.attributes.name;
    currency = fixture.store.attributes.currency;
    rawProducts = fixture.products;
    source = 'fixture';
    console.warn(
      '⚠ LEMONSQUEEZY_API_KEY が無いので、見本データ（content/lemon-fixture.json）で表示します。',
    );
  } else {
    throw new Error(
      [
        'LEMONSQUEEZY_API_KEY が設定されていません。',
        '  本番用のビルドでは見本データを使わず、ここで止めています（偽物のカタログを公開しないため）。',
        '  ローカル: .env.local に LEMONSQUEEZY_API_KEY=... を書く',
        '  本番    : GitHub → Settings → Secrets and variables → Actions に登録',
        '  手順は docs/POSTING.md の「最初に一度だけ」を参照。',
      ].join('\n'),
    );
  }

  const { products, skipped, warnings } = normalize(rawProducts, currency);

  if (CHECK) {
    printTable({ products, skipped, warnings, source, storeName });
    return;
  }

  if (source === 'lemon' && products.length === 0) {
    // 商品が0件の時期もあるので止めずに、空のサイトとして公開する。
    // テスト / 本番キーの取り違えや Publish し忘れでも0件になるので、理由が分かるよう警告に残す。
    warnings.push(
      '公開中（Published）の商品が0件です。サイトは商品なしの状態で公開されます。' +
        'キーのモード（テスト / 本番）と Publish を確認してください。',
    );
    for (const s of skipped) warnings.push(`出していない商品: ${s.name} — ${s.reason}`);
  }

  const catalog = {
    source,
    storeName,
    syncedAt: new Date().toISOString(),
    testMode: products.some((product) => product.testMode),
    products,
  };
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(catalog, null, 2)}\n`);

  console.log(
    `✓ ${source === 'lemon' ? 'Lemon' : '見本データ'}から ${products.length} 点を取り込みました` +
      (catalog.testMode ? '（テストモード）' : ''),
  );
  for (const warning of warnings) console.warn(`  ⚠ ${warning}`);
}

/* ------------------------------------------------------------------ */
/* Lemon API                                                           */
/* ------------------------------------------------------------------ */

async function api(key, pathname) {
  let response;
  try {
    response = await fetch(`${API_BASE}${pathname}`, {
      headers: {
        Accept: 'application/vnd.api+json',
        Authorization: `Bearer ${key}`,
      },
    });
  } catch (error) {
    throw new Error(
      `Lemon Squeezy に接続できませんでした（${error.message}）。\n` +
        '  古い商品情報のまま公開しないよう、ビルドを止めています。',
    );
  }

  if (response.status === 401) {
    throw new Error(
      'Lemon Squeezy の API キーが無効です（401）。Lemon の Settings → API で作り直して登録し直してください。',
    );
  }
  if (!response.ok) {
    const body = (await response.text()).slice(0, 300);
    throw new Error(`Lemon Squeezy API がエラーを返しました（${response.status} ${pathname}）: ${body}`);
  }
  return response.json();
}

async function resolveStore(key) {
  const { data = [] } = await api(key, '/stores');
  const list = data.map((s) => `${s.id}（${s.attributes?.name}）`).join(', ');
  const wanted = process.env.LEMONSQUEEZY_STORE_ID?.trim();

  if (wanted) {
    const store = data.find((s) => String(s.id) === wanted);
    if (!store) {
      throw new Error(`LEMONSQUEEZY_STORE_ID=${wanted} のストアがこのキーから見えません。見えるストア: ${list}`);
    }
    return store;
  }
  if (data.length === 1) return data[0];
  if (data.length === 0) throw new Error('この API キーから見えるストアがありません。');
  throw new Error(`ストアが複数あります。LEMONSQUEEZY_STORE_ID で指定してください: ${list}`);
}

async function fetchAllProducts(key, storeId) {
  const all = [];
  // 100件 × 50ページ = 5000商品まで。それを超えることは当面ない。
  for (let page = 1; page <= 50; page += 1) {
    const query = new URLSearchParams({
      'filter[store_id]': String(storeId),
      'page[number]': String(page),
      'page[size]': '100',
    });
    const body = await api(key, `/products?${query}`);
    const data = body.data ?? [];
    all.push(...data);

    const lastPage = Number(body.meta?.page?.lastPage ?? page);
    if (page >= lastPage || data.length === 0) break;
  }
  return all;
}

/* ------------------------------------------------------------------ */
/* Lemon の商品 → サイトの商品                                           */
/* ------------------------------------------------------------------ */

function normalize(rawProducts, currency) {
  const codeToCategory = Object.fromEntries(CATEGORIES.map((c) => [c.code, c.id]));
  const skipped = [];
  const warnings = [];
  const bySku = new Map();

  for (const raw of rawProducts) {
    const a = raw.attributes ?? {};
    const name = String(a.name ?? '').trim();

    if (a.status !== 'published') {
      skipped.push({ name, reason: '下書き（Publish されていない）' });
      continue;
    }

    const match = name.match(SKU_PATTERN);
    if (!match) {
      skipped.push({ name, reason: '商品名が品番で始まっていない' });
      warnings.push(`「${name}」: 商品名を品番で始めてください（例: DW-PPL-001 Workers）`);
      continue;
    }

    const [, sku, code, , title] = match;
    const category = codeToCategory[code];
    if (!category) {
      skipped.push({ name, reason: `カテゴリ記号 ${code} が未定義` });
      warnings.push(
        `「${name}」: カテゴリ記号 ${code} は使えません（使えるのは ${Object.keys(codeToCategory).join(' / ')}）`,
      );
      continue;
    }

    if (!a.buy_now_url) {
      skipped.push({ name, reason: '購入リンクが無い' });
      continue;
    }

    const { paragraphs, figures, formats, hoverImage, subcategories, unknownTags } =
      parseDescription(a.description);
    for (const { axis, value, options } of unknownTags) {
      warnings.push(
        `${sku}: ${axis} の「${value}」は登録されていません（使えるのは ${options.join(' / ')}）`,
      );
    }
    const product = {
      sku,
      slug: sku.toLowerCase(),
      category,
      title,
      summary: paragraphs[0] ?? '',
      paragraphs,
      figures,
      formats,
      subcategories,
      price: {
        amount: Number(a.price ?? 0) / 100,
        currency,
        formatted: String(a.price_formatted ?? ''),
      },
      checkoutUrl: a.buy_now_url,
      image: a.large_thumb_url || null,
      // LS の API は商品画像を1枚（large_thumb_url）しか返さない。
      // 2枚目（カードのホバー用）は説明文に貼った画像、または「Hover: https://…」の行から取る。
      hoverImage,
      publishedAt: String(a.created_at ?? '').slice(0, 10),
      updatedAt: String(a.updated_at ?? a.created_at ?? ''),
      testMode: Boolean(a.test_mode),
    };

    if (!product.image) warnings.push(`${sku}: 商品画像が未設定です（一覧のサムネイルが空白になります）`);
    if (!product.summary) warnings.push(`${sku}: 説明文が空です`);

    const existing = bySku.get(sku);
    if (existing) {
      warnings.push(
        `${sku} が2つあります。後から更新された方だけを出します（番号の分け方は docs/POSTING.md）`,
      );
      if (existing.updatedAt >= product.updatedAt) continue;
    }
    bySku.set(sku, product);
  }

  const products = [...bySku.values()]
    .sort((x, y) => y.publishedAt.localeCompare(x.publishedAt) || x.sku.localeCompare(y.sku))
    .map(({ updatedAt, ...product }) => product);

  return { products, skipped, warnings };
}

/**
 * Lemon の説明文（HTML）を段落の配列にする。
 * 「Figures: 6」「Formats: DWG, AI」の行は仕様として抜き出し、本文からは除く。
 * 説明文に貼られた画像、または「Hover: https://…」の行は、カードのホバー用2枚目として取り出す。
 * HTML は描画せずテキストとして扱う（管理画面からの入力をそのままページに埋め込まないため）。
 */
function parseDescription(html) {
  const source = String(html ?? '');
  // 説明文に貼られた画像の1枚目。https のみ（javascript: などを弾く）。
  const embedded = [...source.matchAll(/<img[^>]+src\s*=\s*["']([^"']+)["']/gi)]
    .map((m) => m[1].trim())
    .find((url) => /^https:\/\//i.test(url));
  let hoverImage = embedded ?? null;

  const text = source
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/\s*(p|div|li|h[1-6])\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&amp;/g, '&');

  const paragraphs = [];
  let figures = null;
  let formats = [];
  const subcategories = [];
  const unknownTags = [];

  for (const line of text.split('\n').map((l) => l.trim()).filter(Boolean)) {
    const figuresLine = line.match(/^(figures|点数)\s*[:：]\s*(\d+)/i);
    if (figuresLine) {
      figures = Number(figuresLine[2]);
      continue;
    }
    const hoverLine = line.match(/^(hover|ホバー|2枚目)\s*[:：]\s*(\S+)$/i);
    if (hoverLine) {
      if (/^https:\/\//i.test(hoverLine[2])) hoverImage = hoverLine[2];
      continue;
    }
    // Action: / View: / Scene: の行。1行に複数書ける（カンマ・読点・スラッシュ区切り）。
    const axis = SUB_LOOKUP.find((a) => a.linePattern.test(line));
    if (axis) {
      const [, , values] = line.match(axis.linePattern);
      for (const value of values.split(/[,、/]+/).map((v) => v.trim()).filter(Boolean)) {
        const id = axis.terms.get(normalizeTag(value));
        if (id) {
          if (!subcategories.includes(id)) subcategories.push(id);
        } else {
          unknownTags.push({ axis: axis.keyword, value, options: axis.options });
        }
      }
      continue;
    }
    const formatsLine = line.match(/^(formats|形式)\s*[:：]\s*(.+)$/i);
    if (formatsLine) {
      formats = formatsLine[2]
        .split(/[,、/\s]+/)
        .map((f) => f.trim().toUpperCase())
        .filter(Boolean);
      continue;
    }
    paragraphs.push(line);
  }

  // JSON に書いてある順（軸 → 語）に並べる。表示の順序を安定させるため。
  const ordered = SUB_AXES.flatMap((axis) => axis.items.map((item) => item.id)).filter((id) =>
    subcategories.includes(id),
  );

  return { paragraphs, figures, formats, hoverImage, subcategories: ordered, unknownTags };
}

function printTable({ products, skipped, warnings, source, storeName }) {
  console.log(`\nストア: ${storeName}（${source === 'lemon' ? 'Lemon' : '見本データ'}）`);
  console.log(`サイトに出る商品: ${products.length} 点\n`);
  for (const p of products) {
    console.log(
      `  ${p.sku}  ${p.price.formatted.padStart(8)}  ${p.category.padEnd(10)}  ${p.title}` +
        `${p.figures ? `  (${p.figures} figures)` : ''}${p.testMode ? '  [test]' : ''}`,
    );
    if (p.subcategories.length > 0) console.log(`            ${p.subcategories.join(' · ')}`);
  }
  if (skipped.length > 0) {
    console.log('\nサイトに出さない商品:');
    for (const s of skipped) console.log(`  · ${s.name} — ${s.reason}`);
  }
  if (warnings.length > 0) {
    console.log('\n注意:');
    for (const w of warnings) console.log(`  ⚠ ${w}`);
  }
  console.log('');
}
