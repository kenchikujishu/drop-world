import { en, type Dictionary } from '@/content/i18n/en';
import { ja } from '@/content/i18n/ja';
import { DEFAULT_LANG, isLang, type Lang } from '@/content/taxonomy';

const DICTIONARIES: Record<Lang, Dictionary> = { en, ja };

export function getDict(lang: Lang): Dictionary {
  return DICTIONARIES[lang];
}

/** URL セグメントから言語を取り出す。不正な値は既定言語に落とす。 */
export function resolveLang(segment: string | undefined): Lang {
  return segment && isLang(segment) ? segment : DEFAULT_LANG;
}

/** 言語付きのパスを組み立てる。`href('ja', '/products')` → `/ja/products` */
export function href(lang: Lang, path = ''): string {
  const clean = path === '/' ? '' : path;
  return `/${lang}${clean}`;
}

export type { Dictionary, Lang };
