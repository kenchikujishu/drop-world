import catalogJson from '@/content/catalog.generated.json';
import { FILTER_AXES, SCENE_IDS, SUBJECT_IDS } from '@/content/taxonomy';

/**
 * 商品データ。
 *
 * 名前・価格・説明・画像・ダウンロードファイルの出どころは Lemon Squeezy。
 * **分類（タグ）の出どころは content/tags.json**（品番 → タグ）。Lemon 側には分類を持たせない。
 * `scripts/lemon-sync.mjs` がビルド前に両方を合わせて `content/catalog.generated.json` に書き出す。
 *
 * 商品を足す・価格を変えるのは Lemon の管理画面、分類を変えるのは tags.json。→ docs/POSTING.md
 */

export type Product = {
  /** 品番。Lemon の商品名の先頭に付ける（例: DW-PPL-001）。Lemon の ID は使わない。 */
  sku: string;
  /** URL 用。品番を小文字にしたもの。 */
  slug: string;
  /** 品番の記号（PPL / FUR / VEG / ANM / SCN）。 */
  packCode: string;
  /** 含まれる被写体。シーンパックは複数入る。 */
  contains: string[];
  origin: string[];
  action: string[];
  scene: string[];
  views: string[];
  /** パックに入っている図の個別 ID（jp-walk-umbrella-01 など）。 */
  items: string[];
  /** 商品名から品番を除いたもの。 */
  title: string;
  /** 説明文の1段落目。一覧カードとメタ説明に使う。 */
  summary: string;
  paragraphs: string[];
  figures: number | null;
  formats: string[];
  price: { amount: number; currency: string; formatted: string };
  checkoutUrl: string;
  /** Lemon の商品画像（1000×1000）。 */
  image: string | null;
  /** カードにカーソルを合わせたときに出す2枚目。無ければ null。 */
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

/**
 * ページを作る最低点数。これ未満の組み合わせ（/people/walking/ など）はページを作らない。
 * 中身の薄いページを検索エンジンに並べないため。被写体そのもののページは1点からでも作る。
 */
export const MIN_PRODUCTS_PER_PAGE = 2;

/** 新着順（取り込み時に並べ替え済み）。 */
export function getAllProducts(): Product[] {
  return catalog.products;
}

export function getProduct(slug: string): Product | undefined {
  return catalog.products.find((p) => p.slug === slug);
}

/** 新着順の先頭から。トップページの「新着」に使う。 */
export function getLatest(limit = 12): Product[] {
  return catalog.products.slice(0, limit);
}

/** その被写体を含む商品（シーンパックも contains に入っていれば出る）。 */
export function getBySubject(subject: string): Product[] {
  return catalog.products.filter((p) => p.contains.includes(subject));
}

/** 被写体 × 絞り込み（動作 or シーン）。 */
export function getBySubjectAndFilter(subject: string, filter: string): Product[] {
  return getBySubject(subject).filter(
    (p) => p.action.includes(filter) || p.scene.includes(filter),
  );
}

/** シーンで横断（被写体は混ざる）。 */
export function getByScene(scene: string): Product[] {
  return catalog.products.filter((p) => p.scene.includes(scene));
}

export function getRelated(product: Product, limit = 3): Product[] {
  const subject = product.contains[0];
  return catalog.products
    .filter((p) => p.slug !== product.slug && subject && p.contains.includes(subject))
    .slice(0, limit);
}

/** 被写体ごとの商品数。 */
export function getSubjectCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const subject of SUBJECT_IDS) counts[subject] = getBySubject(subject).length;
  return counts;
}

/** シーンごとの商品数（被写体は問わない）。 */
export function getSceneCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const scene of SCENE_IDS) counts[scene] = getByScene(scene).length;
  return counts;
}

/** 被写体ページの中の絞り込み（動作・シーン）ごとの商品数。 */
export function getFilterCounts(subject: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const axis of FILTER_AXES) {
    for (const item of axis.items) {
      counts[item.id] = getBySubjectAndFilter(subject, item.id).length;
    }
  }
  return counts;
}

/** 全被写体ぶんの絞り込み件数。ヘッダーのメニューが使う。 */
export function getAllFilterCounts(): Record<string, Record<string, number>> {
  return Object.fromEntries(SUBJECT_IDS.map((subject) => [subject, getFilterCounts(subject)]));
}

export function hasSubjectPage(subject: string): boolean {
  return getBySubject(subject).length > 0;
}

export function hasFilterPage(subject: string, filter: string): boolean {
  return getBySubjectAndFilter(subject, filter).length >= MIN_PRODUCTS_PER_PAGE;
}

export function hasScenePage(scene: string): boolean {
  return getByScene(scene).length >= MIN_PRODUCTS_PER_PAGE;
}

/** 複数の被写体が混ざるシーンパックか（カードに「Scene set」バッジを出す）。 */
export function isSceneSet(product: Product): boolean {
  return product.packCode === 'SCN' || product.contains.length > 1;
}

export function getCatalogMeta(): Omit<Catalog, 'products'> {
  const { products: _products, ...meta } = catalog;
  return meta;
}
