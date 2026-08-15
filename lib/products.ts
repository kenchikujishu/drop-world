import { RAW_PRODUCTS } from '@/content/products-index';
import { productSchema, type Product } from './product-schema';
import type { CategoryId } from '@/content/taxonomy';

/**
 * 商品データの読み込み。`content/products/*.json` を1商品1ファイルで持つ。
 *
 * ⚠ ファイルシステムは読まない。Cloudflare Workers に fs が無いため、
 *   実行時に fs を触ると商品0件のサイトになってしまう。
 *   代わりに自動生成の `content/products-index.ts` が全 JSON を静的 import しており、
 *   ビルド時にバンドルへ埋め込まれる（索引は validate:products が作り直す）。
 */

let cache: Product[] | null = null;

export function getAllProducts(): Product[] {
  if (cache) return cache;

  const products = RAW_PRODUCTS.map(({ file, data }) => {
    const parsed = productSchema.safeParse(data);

    if (!parsed.success) {
      // ここで落とさないと壊れたデータのままデプロイされる。
      throw new Error(
        `content/products/${file} がスキーマに適合しません:\n${parsed.error.issues
          .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
          .join('\n')}`,
      );
    }

    if (parsed.data.slug !== file.replace(/\.json$/, '')) {
      throw new Error(
        `content/products/${file}: slug "${parsed.data.slug}" がファイル名と一致していません。`,
      );
    }

    return parsed.data;
  });

  cache = sortByNewest(products);
  return cache;
}

export function getProduct(slug: string): Product | undefined {
  return getAllProducts().find((p) => p.slug === slug);
}

export function getByCategory(category: CategoryId): Product[] {
  return getAllProducts().filter((p) => p.category === category);
}

export function getFeatured(limit = 4): Product[] {
  const all = getAllProducts();
  const featured = all.filter((p) => p.featured);
  // featured が足りなければ新着で埋める。トップが寂しくならないように。
  const rest = all.filter((p) => !p.featured);
  return [...featured, ...rest].slice(0, limit);
}

export function getRelated(product: Product, limit = 3): Product[] {
  return getAllProducts()
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .slice(0, limit);
}

/** カテゴリごとの商品数。カテゴリ一覧で「0件」を出さないための判定にも使う。 */
export function getCategoryCounts(): Record<string, number> {
  return getAllProducts().reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});
}

function sortByNewest(products: Product[]): Product[] {
  return [...products].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export type { Product };
