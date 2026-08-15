import { z } from 'zod';
import { CATEGORY_IDS, FORMAT_IDS, VIEW_IDS } from '@/content/taxonomy';

/**
 * 商品 JSON のスキーマ。
 * `npm run validate:products`（build 前に自動実行）と実行時の読み込みの両方がこれを使う。
 * 商品を1つずつ足していく運用なので、ここが壊れたデータの唯一の関門になる。
 */

const localized = z.object({
  en: z.string().min(1),
  ja: z.string().min(1),
});

export const productSchema = z.object({
  /** URL に出る識別子。ファイル名と一致していること。 */
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug は小文字の英数字とハイフンのみ'),

  title: localized,
  /** 一覧カードとメタ説明に出る1〜2文。 */
  summary: localized,
  /** 商品ページ本文。空行区切りで段落になる。 */
  description: localized,

  category: z.enum(CATEGORY_IDS),
  views: z.array(z.enum(VIEW_IDS)).min(1),
  formats: z.array(z.enum(FORMAT_IDS)).min(1),

  /** 収録点数。 */
  itemCount: z.number().int().positive(),
  /** 表示用のダウンロードサイズ（例: "12.4 MB"）。 */
  fileSize: z.string().min(1),

  price: z.object({
    amount: z.number().nonnegative(),
    currency: z.enum(['JPY', 'USD']),
  }),

  /**
   * サイトから直接配布するファイル。`public/downloads/<slug>/` に置いた zip を指す。
   *
   * Lemon Squeezy の審査が通るまでの暫定運用。審査通過後は LS がファイル配信を担うので、
   * この配列を空にして checkoutUrl を入れれば購入ボタンに切り替わる。
   * サイズは自動算出するので JSON には書かない（content/products-index.ts が実ファイルから拾う）。
   */
  downloads: z
    .array(
      z.object({
        format: z.enum(FORMAT_IDS),
        file: z.string().startsWith('/downloads/'),
      }),
    )
    .default([]),

  /**
   * Lemon Squeezy のチェックアウト URL。
   * 商品を LS 側で作る前は null にしておく。
   * ここが埋まると、ダウンロードボタンより優先して購入ボタンが出る。
   */
  checkoutUrl: z.string().url().nullable(),

  /** 審査通過後、LS API から価格を引くためのキー。それまでは null。 */
  lemonVariantId: z.string().nullable(),

  thumbnail: z.string().startsWith('/'),
  gallery: z.array(z.string().startsWith('/')).min(1),

  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),

  /** YYYY-MM-DD。新着順の並び替えに使う。 */
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'publishedAt は YYYY-MM-DD 形式'),
});

export type Product = z.infer<typeof productSchema>;
