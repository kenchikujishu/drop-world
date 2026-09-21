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
const TAXONOMY = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'content', 'taxonomy.json'), 'utf-8'),
);
const TAGS_FILE = path.join(ROOT, 'content', 'tags.json');
const TAGS = JSON.parse(fs.readFileSync(TAGS_FILE, 'utf-8')).tags ?? {};

/** 品番の記号 → 主な被写体（DW-PPL-001 なら people）。 */
const PACK_CODES = TAXONOMY.packCodes;
/** タグに書ける軸。contains / origin / action / scene / views */
const AXIS_IDS = TAXONOMY.axes.map((axis) => axis.id);

/** 「Japanese Street」「axono」のような書き方のゆれを id に寄せる。 */
function normalizeTag(value) {
  return String(value).trim().toLowerCase().replace(/[\s_]+/g, '-');
}

/** 軸ごとに「書かれうる語 → id」の表（id 本体と別名の両方）。 */
const TERMS = Object.fromEntries(
  TAXONOMY.axes.map((axis) => {
    const map = new Map();
    for (const item of axis.items) {
      map.set(normalizeTag(item.id), item.id);
      for (const alias of item.aliases ?? []) map.set(normalizeTag(alias), item.id);
    }
    return [axis.id, { map, options: axis.items.map((item) => item.id) }];
  }),
);

/**
 * content/tags.json を content/taxonomy.json に照らして検証し、品番 → タグ の表にする。
 * 打ち間違いや未定義の値があれば**ビルドを止める**（間違った分類のまま公開しないため）。
 * 図の個別 ID（items）は語彙を持たないので、そのまま通す。
 */
function loadTags(rawTags) {
  const errors = [];
  const resolved = new Map();

  for (const [sku, raw] of Object.entries(rawTags)) {
    if (!/^DW-[A-Z]{3}-\d{3}$/.test(sku)) {
      errors.push(`品番「${sku}」の形は DW-PPL-001 の形式にしてください`);
      continue;
    }
    if (!PACK_CODES[sku.slice(3, 6)]) {
      errors.push(`品番「${sku}」の記号 ${sku.slice(3, 6)} は未定義です（${Object.keys(PACK_CODES).join(' / ')}）`);
      continue;
    }

    const entry = {};
    for (const [axisId, values] of Object.entries(raw)) {
      if (axisId === 'items') {
        entry.items = [].concat(values ?? []).map(String);
        continue;
      }
      if (!AXIS_IDS.includes(axisId)) {
        errors.push(`${sku}: 「${axisId}」という分類はありません（使えるのは ${AXIS_IDS.join(' / ')} / items）`);
        continue;
      }
      const { map, options } = TERMS[axisId];
      entry[axisId] = [];
      for (const value of [].concat(values ?? [])) {
        const id = map.get(normalizeTag(value));
        if (!id) {
          errors.push(`${sku}: ${axisId} の「${value}」は content/taxonomy.json にありません（使えるのは ${options.join(' / ')}）`);
          continue;
        }
        if (!entry[axisId].includes(id)) entry[axisId].push(id);
      }
    }
    resolved.set(sku, entry);
  }

  if (errors.length > 0) {
    throw new Error(
      ['content/tags.json に直すところがあります:', ...errors.map((e) => `  · ${e}`)].join('\n'),
    );
  }
  return resolved;
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
  // 見本データのときは、見本ファイルの中に書いたタグを使う（content/tags.json は本物の商品用）。
  let rawTags = TAGS;

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
    rawTags = fixture.tags ?? {};
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

  const { products, skipped, warnings } = normalize(rawProducts, currency, rawTags);

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

function normalize(rawProducts, currency, rawTags) {
  const tags = loadTags(rawTags);
  const seenSkus = new Set();
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
    const primary = PACK_CODES[code];
    if (!primary) {
      skipped.push({ name, reason: `品番の記号 ${code} が未定義` });
      warnings.push(
        `「${name}」: 品番の記号 ${code} は使えません（使えるのは ${Object.keys(PACK_CODES).join(' / ')}）`,
      );
      continue;
    }
    seenSkus.add(sku);

    // 分類は content/tags.json が正。書かれていなければ、品番の記号から決まる被写体だけが付く。
    const tag = tags.get(sku) ?? {};
    const contains = tag.contains?.length
      ? tag.contains
      : primary === 'scene'
        ? []
        : [primary];

    if (!a.buy_now_url) {
      skipped.push({ name, reason: '購入リンクが無い' });
      continue;
    }

    const { paragraphs, figures, formats, hoverImage, strayTagLines } = parseDescription(
      a.description,
    );
    for (const line of strayTagLines) {
      warnings.push(
        `${sku}: 説明文の「${line}」は使いません。分類は content/tags.json で管理します（docs/POSTING.md）`,
      );
    }
    const product = {
      sku,
      slug: sku.toLowerCase(),
      /** 品番の記号（PPL / FUR / SCN …）。 */
      packCode: code,
      /** 含まれる被写体。シーンパックは複数。 */
      contains,
      origin: tag.origin ?? [],
      action: tag.action ?? [],
      scene: tag.scene ?? [],
      views: tag.views ?? [],
      items: tag.items ?? [],
      title,
      summary: paragraphs[0] ?? '',
      paragraphs,
      figures,
      formats,
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

  for (const sku of tags.keys()) {
    if (!seenSkus.has(sku)) {
      warnings.push(`content/tags.json の ${sku} に対応する商品が Lemon にありません（下書きのままか、品番違い）`);
    }
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
  // 旧方式（説明文に Action: などを書く）の名残。本文に出さず、警告だけ出す。
  const strayTagLines = [];

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
    // 旧方式で書かれた分類の行。読み飛ばして警告する（分類は content/tags.json）。
    if (/^(action|view|views|scene|contains|origin|動作|投影|投影法|シーン)\s*[:：]/i.test(line)) {
      strayTagLines.push(line);
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

  return { paragraphs, figures, formats, hoverImage, strayTagLines };
}

function printTable({ products, skipped, warnings, source, storeName }) {
  console.log(`\nストア: ${storeName}（${source === 'lemon' ? 'Lemon' : '見本データ'}）`);
  console.log(`サイトに出る商品: ${products.length} 点\n`);
  for (const p of products) {
    console.log(
      `  ${p.sku}  ${p.price.formatted.padStart(8)}  ${p.title}` +
        `${p.figures ? `  (${p.figures} figures)` : ''}${p.testMode ? '  [test]' : ''}`,
    );
    const tags = [...p.contains, ...p.origin, ...p.action, ...p.scene, ...p.views];
    if (tags.length > 0) console.log(`            ${tags.join(' · ')}`);
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
