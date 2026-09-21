import type { MetadataRoute } from 'next';
import { FILTER_AXES, LANGS, SCENE_IDS, SUBJECT_IDS } from '@/content/taxonomy';
import {
  getAllProducts,
  hasFilterPage,
  hasScenePage,
  hasSubjectPage,
} from '@/lib/products';
import { absoluteUrl } from '@/lib/site';

/** 静的ページのパス（言語プレフィックスなし）。 */
const STATIC_PATHS = [
  '',
  '/products',
  '/scenes',
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
  const filters = FILTER_AXES.flatMap((axis) => axis.items.map((item) => item.id));
  const now = new Date();

  const paths = [
    ...STATIC_PATHS,
    // ページが存在するものだけ載せる（商品が無い / 少ない組み合わせはページを作っていない）
    ...SUBJECT_IDS.filter(hasSubjectPage).map((subject) => `/${subject}`),
    ...SUBJECT_IDS.flatMap((subject) =>
      filters.filter((filter) => hasFilterPage(subject, filter)).map((filter) => `/${subject}/${filter}`),
    ),
    ...SCENE_IDS.filter(hasScenePage).map((scene) => `/scenes/${scene}`),
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
