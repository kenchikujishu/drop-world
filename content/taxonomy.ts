import categories from './categories.json';

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

export function isLang(value: string): value is Lang {
  return (LANGS as string[]).includes(value);
}
