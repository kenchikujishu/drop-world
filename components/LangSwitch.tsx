'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LANGS, type Lang } from '@/content/taxonomy';
import styles from './lang-switch.module.css';

/**
 * 言語切り替え。いま見ているページの同じパスのまま言語だけ差し替える。
 * 例: /ja/products/tree-01 → /en/products/tree-01
 */
export default function LangSwitch({ lang, label }: { lang: Lang; label: string }) {
  const pathname = usePathname() ?? `/${lang}`;

  return (
    <div className={styles.wrap} role="group" aria-label={label}>
      {LANGS.map((target) => {
        const isCurrent = target === lang;
        return (
          <Link
            key={target}
            href={swapLang(pathname, target)}
            className={styles.item}
            aria-current={isCurrent ? 'true' : undefined}
            hrefLang={target}
          >
            {target.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}

function swapLang(pathname: string, target: Lang): string {
  const segments = pathname.split('/');
  // segments[0] は空文字、segments[1] が言語。
  if (segments.length > 1 && (LANGS as string[]).includes(segments[1])) {
    segments[1] = target;
    return segments.join('/');
  }
  return `/${target}`;
}
