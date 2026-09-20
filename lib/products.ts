import catalogJson from '@/content/catalog.generated.json';

/**
 * 商品データ。
 *
 * 出どころは Lemon Squeezy だけ。`scripts/lemon-sync.mjs` がビルド前に Lemon の API から取り込み、
 * `content/catalog.generated.json` に書き出す。サイトはそのファイルを読むだけで、
 * 実行時に Lemon と通信しない（Workers に API キーを置かない / Lemon が落ちてもサイトは落ちない）。
 *
 * 商品を足す・価格を変えるのは Lemon の管理画面で行う。→ docs/POSTING.md
 */

export type Product = {
  /** 品番。Lemon の商品名の先頭に付ける（例: DW-PPL-001）。テスト→本番で Lemon の ID が変わっても不変。 */
  sku: string;
  /** URL 用。品番を小文字にしたもの。 */
  slug: string;
  category: string;
  /** 商品名から品番を除いたもの。 */
  title: string;
  /** 説明文の1段落目。一覧カードとメタ説明に使う。 */
  summary: string;
  paragraphs: string[];
  /** 説明文の「Figures: 6」行から。書いていなければ null。 */
  figures: number | null;
  /** 説明文の「Formats: DWG, AI」行から。 */
  formats: string[];
  /** 説明文の「Action:／View:／Scene:」行から。語彙は content/subcategories.json。 */
  subcategories: string[];
  price: { amount: number; currency: string; formatted: string };
  checkoutUrl: string;
  /** Lemon の商品画像（1000×1000）。 */
  image: string | null;
  /** カードにカーソルを合わせたときに出す2枚目。説明文に貼られた画像から取る。無ければ null。 */
  hoverImage: string | null;
  publishedAt: string;
  /** テストモードの商品（＝ストア審査前）。 */
  testMode: boolean;
};

type Catalog = {
  source: 'lemon' | 'fixture';
  storeName: string;
  syncedAt: string;
  testMode: boolean;
  products: Product[];
};

const catalog = catalogJson as unknown as Catalog;

/** 新着順（取り込み時に並べ替え済み）。 */
export function getAllProducts(): Product[] {
  return catalog.products;
}

export function getProduct(slug: string): Product | undefined {
  return catalog.products.find((p) => p.slug === slug);
}

export function getByCategory(category: string): Product[] {
  return catalog.products.filter((p) => p.category === category);
}

/** 新着順の先頭から。トップページの「新着」に使う。 */
export function getLatest(limit = 12): Product[] {
  return catalog.products.slice(0, limit);
}

/** カテゴリ × サブカテゴリの商品。サブカテゴリのページで使う。 */
export function getBySubcategory(category: string, sub: string): Product[] {
  return catalog.products.filter(
    (p) => p.category === category && p.subcategories.includes(sub),
  );
}

/**
 * カテゴリごとの「サブカテゴリ → 件数」。
 * ヘッダーのメニューと、サブカテゴリのページを作る対象を決めるのに使う。
 */
export function getSubcategoryCounts(): Record<string, Record<string, number>> {
  const counts: Record<string, Record<string, number>> = {};
  for (const product of catalog.products) {
    const forCategory = (counts[product.category] ??= {});
    for (const sub of product.subcategories) {
      forCategory[sub] = (forCategory[sub] ?? 0) + 1;
    }
  }
  return counts;
}

export function getRelated(product: Product, limit = 3): Product[] {
  return catalog.products
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .slice(0, limit);
}

/** カテゴリごとの商品数。0件のカテゴリをナビに出さないために使う。 */
export function getCategoryCounts(): Record<string, number> {
  return catalog.products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});
}

export function getCatalogMeta(): Omit<Catalog, 'products'> {
  const { products: _products, ...meta } = catalog;
  return meta;
}
