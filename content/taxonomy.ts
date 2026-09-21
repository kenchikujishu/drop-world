import taxonomy from './taxonomy.json';

/**
 * 言語と分類の定義。
 *
 * 分類の語彙は content/taxonomy.json が正。取り込みスクリプト（scripts/lemon-sync.mjs）と
 * 共有するため JSON にしてある。値を増やすときは JSON に1行足すだけでよい。
 *
 * 商品ごとのタグは content/tags.json（品番 → タグ）。Lemon 側には分類を持たせない。
 */

export type Lang = 'en' | 'ja';

export const LANGS: Lang[] = ['en', 'ja'];
export const DEFAULT_LANG: Lang = 'en';

export type Localized = Record<Lang, string>;

export type Term = {
  id: string;
  label: Localized;
  /** 書き方のゆれ（axono → axo など）。取り込み時だけ使う。 */
  aliases?: string[];
};

export type Axis = {
  /** contains / origin / action / scene / views */
  id: string;
  label: Localized;
  /** ナビゲーションの柱にする軸（被写体とシーン）。 */
  nav?: boolean;
  items: Term[];
};

type TaxonomyFile = {
  /** 品番の記号 → そのパックの主な被写体。DW-SCN-001 は複数被写体のシーンパック。 */
  packCodes: Record<string, string>;
  axes: Axis[];
};

const file = taxonomy as unknown as TaxonomyFile;

export const PACK_CODES: Record<string, string> = file.packCodes;
export const AXES: Axis[] = file.axes;

export function axis(id: string): Axis {
  const found = AXES.find((a) => a.id === id);
  if (!found) throw new Error(`content/taxonomy.json に軸 ${id} がありません`);
  return found;
}

/** 被写体（People / Furniture / …）。トップとヘッダーの柱。 */
export const SUBJECTS: Term[] = axis('contains').items;
export const SUBJECT_IDS: string[] = SUBJECTS.map((s) => s.id);

/** シーン（Street / Hospital / …）。 */
export const SCENES: Term[] = axis('scene').items;
export const SCENE_IDS: string[] = SCENES.map((s) => s.id);

/** 被写体ページの中で絞り込みに使う軸（動作とシーン）。 */
export const FILTER_AXES: Axis[] = [axis('action'), axis('scene')];

export const VIEWS: Term[] = axis('views').items;

export function termLabel(axisId: string, id: string, lang: Lang): string {
  return axis(axisId).items.find((item) => item.id === id)?.label[lang] ?? id;
}

/** 軸を問わず id からラベルを引く（商品カードのバッジなど）。 */
export function anyLabel(id: string, lang: Lang): string {
  for (const a of AXES) {
    const found = a.items.find((item) => item.id === id);
    if (found) return found.label[lang];
  }
  return id;
}

export function subjectLabel(id: string, lang: Lang): string {
  return termLabel('contains', id, lang);
}

export function sceneLabel(id: string, lang: Lang): string {
  return termLabel('scene', id, lang);
}

export function isLang(value: string): value is Lang {
  return (LANGS as string[]).includes(value);
}
