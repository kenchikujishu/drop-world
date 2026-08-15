/**
 * drop world のタクソノミー定義。
 *
 * カテゴリ・視点・フォーマットを増やすときは **このファイルだけ** を編集する。
 * ナビゲーション、フィルタ、商品JSONのバリデーション、サイトマップがすべてここを参照している。
 */

export type Lang = 'en' | 'ja';

export const LANGS: Lang[] = ['en', 'ja'];
export const DEFAULT_LANG: Lang = 'en';

export type Localized = Record<Lang, string>;

export type Term<T extends string> = {
  id: T;
  label: Localized;
};

/* ------------------------------------------------------------------ */
/* Category — 被写体                                                    */
/* ------------------------------------------------------------------ */

export const CATEGORY_IDS = ['people', 'vegetation', 'animal'] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export const CATEGORIES: Term<CategoryId>[] = [
  { id: 'people', label: { en: 'People', ja: '人物' } },
  { id: 'vegetation', label: { en: 'Vegetation', ja: '植栽' } },
  { id: 'animal', label: { en: 'Animal', ja: '動物' } },
];

/* ------------------------------------------------------------------ */
/* View — 図面上の見え方                                                 */
/* ------------------------------------------------------------------ */

export const VIEW_IDS = ['elevation', 'plan', 'section', 'axonometric', 'multi-angle'] as const;

export type ViewId = (typeof VIEW_IDS)[number];

export const VIEWS: Term<ViewId>[] = [
  { id: 'elevation', label: { en: 'Elevation', ja: '立面' } },
  { id: 'plan', label: { en: 'Plan', ja: '平面' } },
  { id: 'section', label: { en: 'Section', ja: '断面' } },
  { id: 'axonometric', label: { en: 'Axonometric', ja: 'アクソメ' } },
  { id: 'multi-angle', label: { en: 'Multi-angle', ja: '複数アングル' } },
];

/* ------------------------------------------------------------------ */
/* Format — 同梱されるファイル形式                                        */
/* ------------------------------------------------------------------ */

export const FORMAT_IDS = ['dwg', 'dxf', 'ai', 'eps', 'pdf', 'png'] as const;

export type FormatId = (typeof FORMAT_IDS)[number];

export const FORMATS: Term<FormatId>[] = [
  { id: 'dwg', label: { en: 'DWG', ja: 'DWG' } },
  { id: 'dxf', label: { en: 'DXF', ja: 'DXF' } },
  { id: 'ai', label: { en: 'AI', ja: 'AI' } },
  { id: 'eps', label: { en: 'EPS', ja: 'EPS' } },
  { id: 'pdf', label: { en: 'PDF', ja: 'PDF' } },
  { id: 'png', label: { en: 'PNG', ja: 'PNG' } },
];

/* ------------------------------------------------------------------ */
/* ヘルパー                                                             */
/* ------------------------------------------------------------------ */

export function categoryLabel(id: CategoryId, lang: Lang): string {
  return CATEGORIES.find((c) => c.id === id)?.label[lang] ?? id;
}

export function viewLabel(id: ViewId, lang: Lang): string {
  return VIEWS.find((v) => v.id === id)?.label[lang] ?? id;
}

export function formatLabel(id: FormatId, lang: Lang): string {
  return FORMATS.find((f) => f.id === id)?.label[lang] ?? id.toUpperCase();
}

export function isLang(value: string): value is Lang {
  return (LANGS as string[]).includes(value);
}
