import categories from './categories.json';
import subcategories from './subcategories.json';

/**
 * 言語とカテゴリの定義。
 *
 * カテゴリは content/categories.json が正。取り込みスクリプト（scripts/lemon-sync.mjs）と
 * 共有するため JSON にしてある。カテゴリを増やすときは JSON に1行足すだけでよい
 * （`code` は Lemon の商品名に付ける品番の記号。例: DW-PPL-001 の PPL）。
 */

export type Lang = 'en' | 'ja';

export const LANGS: Lang[] = ['en', 'ja'];
export const DEFAULT_LANG: Lang = 'en';

export type Localized = Record<Lang, string>;

export type Category = {
  id: string;
  /** 品番に使う3文字の記号 */
  code: string;
  label: Localized;
};

export type CategoryId = string;

export const CATEGORIES: Category[] = categories;
export const CATEGORY_IDS: CategoryId[] = CATEGORIES.map((category) => category.id);

export function categoryLabel(id: CategoryId, lang: Lang): string {
  return CATEGORIES.find((c) => c.id === id)?.label[lang] ?? id;
}

/* ------------------------------------------------------------------ *
 * サブカテゴリ
 *
 * 3つの軸（動作 / 投影法 / シーン）を持つ。1つの商品に複数付く（例: 座る × 日本の街路）。
 * 語彙は content/subcategories.json が正。取り込みスクリプトと共有するため JSON にしてある。
 * ------------------------------------------------------------------ */

export type Subcategory = {
  id: string;
  label: Localized;
  /** 書き方のゆれ（axono → axonometric など）。取り込み時だけ使う。 */
  aliases?: string[];
};

export type SubcategoryAxis = {
  id: string;
  /** Lemon の説明文に書く見出し。例: "Action" → `Action: sitting` */
  keyword: string;
  keywordAliases?: string[];
  label: Localized;
  items: Subcategory[];
};

export const SUB_AXES: SubcategoryAxis[] = (
  subcategories as { axes: unknown[] }
).axes as SubcategoryAxis[];

export const SUBCATEGORIES: Subcategory[] = SUB_AXES.flatMap((axis) => axis.items);
export const SUBCATEGORY_IDS: string[] = SUBCATEGORIES.map((sub) => sub.id);

export function subcategoryLabel(id: string, lang: Lang): string {
  return SUBCATEGORIES.find((sub) => sub.id === id)?.label[lang] ?? id;
}

/** その語がどの軸のものか。ナビや商品ページで軸ごとにまとめるのに使う。 */
export function subcategoryAxis(id: string): SubcategoryAxis | undefined {
  return SUB_AXES.find((axis) => axis.items.some((sub) => sub.id === id));
}

/** 与えられた id を、JSON に書いてある順（軸 → 語）に並べ替える。 */
export function sortSubcategories(ids: string[]): string[] {
  return SUBCATEGORY_IDS.filter((id) => ids.includes(id));
}

export function isLang(value: string): value is Lang {
  return (LANGS as string[]).includes(value);
}
