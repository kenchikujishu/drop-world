import type { Product } from './product-schema';
import type { Lang } from '@/content/taxonomy';

/**
 * ★ Lemon Squeezy API 移行の差し替え点 ★
 *
 * いまは商品 JSON に書いた静的な価格を返している。
 * 審査通過後は resolvePrice() の中身だけを、LS API から取得した価格表の参照に置き換える:
 *
 *   1. ビルド時に GET /v1/variants を叩いて { [variantId]: { amount, currency } } を作る
 *   2. resolvePrice() で product.lemonVariantId をキーに引き、無ければ JSON の値にフォールバック
 *
 * 呼び出し側（ProductCard / 商品ページ / フィルタの価格帯）は一切変更しなくてよい。
 */

export type DisplayPrice = {
  /** 最小単位ではなく通常の単位（1200 = ¥1,200 / 12.99 = $12.99）。 */
  amount: number;
  currency: 'JPY' | 'USD';
  /** 表示用に整形済みの文字列。 */
  formatted: string;
};

export function resolvePrice(product: Product, lang: Lang = 'en'): DisplayPrice {
  const { amount, currency } = product.price;
  return { amount, currency, formatted: formatPrice(amount, currency, lang) };
}

export function formatPrice(amount: number, currency: 'JPY' | 'USD', lang: Lang = 'en'): string {
  return new Intl.NumberFormat(lang === 'ja' ? 'ja-JP' : 'en-US', {
    style: 'currency',
    currency,
    // 円に小数点は出さない。ドルは 12.99 のように2桁。
    minimumFractionDigits: currency === 'JPY' ? 0 : 2,
  }).format(amount);
}
