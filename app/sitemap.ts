import type { MetadataRoute } from 'next';
import { CATEGORY_IDS, LANGS } from '@/content/taxonomy';
import { getAllProducts, getCategoryCounts } from '@/lib/products';
import { absoluteUrl } from '@/lib/site';

/** 静的ページのパス（言語プレフィックスなし）。 */
const STATIC_PATHS = [
  '',
  '/products',
  '/license',
  '/faq',
  '/about',
  '/contact',
  '/legal/terms',
  '/legal/privacy',
  '/legal/refund',
  '/legal/tokushoho',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const products = getAllProducts();
  const counts = getCategoryCounts();
  const now = new Date();

  const paths = [
    ...STATIC_PATHS,
    // 商品が無いカテゴリのページは存在しないので載せない
    ...CATEGORY_IDS.filter((category) => (counts[category] ?? 0) > 0).map(
      (category) => `/categories/${category}`,
    ),
    ...products.map((product) => `/products/${product.slug}`),
  ];

  return LANGS.flatMap((lang) =>
    paths.map((path) => ({
      url: absoluteUrl(`/${lang}${path}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : path.startsWith('/products/') ? 0.8 : 0.6,
      alternates: {
        languages: Object.fromEntries(
          LANGS.map((other) => [other, absoluteUrl(`/${other}${path}`)]),
        ),
      },
    })),
  );
}
