'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CATEGORIES, type Lang } from '@/content/taxonomy';
import type { Dictionary } from '@/content/i18n/en';
import { href } from '@/lib/i18n';
import LangSwitch from './LangSwitch';
import styles from './header.module.css';

type Props = {
  lang: Lang;
  dict: Dictionary;
  /** 商品が0件のカテゴリはカテゴリ帯に出さない。 */
  categoryCounts: Record<string, number>;
};

export default function Header({ lang, dict, categoryCounts }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // ページ遷移したらモバイルメニューを閉じる。
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const links = [
    { href: href(lang, '/products'), label: dict.nav.products },
    { href: href(lang, '/license'), label: dict.nav.license },
    { href: href(lang, '/faq'), label: dict.nav.faq },
    { href: href(lang, '/about'), label: dict.nav.about },
    { href: href(lang, '/contact'), label: dict.nav.contact },
  ];

  const visibleCategories = CATEGORIES.filter((c) => (categoryCounts[c.id] ?? 0) > 0);

  return (
    <header className={styles.header}>
      <div className={styles.mainRow}>
        <div className={`container ${styles.mainRowInner}`}>
          <Link href={href(lang, '/')} className={styles.wordmark}>
            drop&nbsp;world
            <span className={styles.wordmarkDot} aria-hidden="true" />
          </Link>

          <nav className={styles.desktopNav} aria-label={dict.nav.menu}>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={styles.navLink}
                aria-current={pathname === link.href ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.actions}>
            <LangSwitch lang={lang} label={dict.footer.langLabel} />
            <button
              type="button"
              className={styles.menuButton}
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? dict.nav.close : dict.nav.menu}
            </button>
          </div>
        </div>
      </div>

      {visibleCategories.length > 0 && (
        <div className={styles.categoryRow}>
          <div className={`container ${styles.categoryScroller}`}>
            <Link href={href(lang, '/products')} className={styles.categoryLink}>
              {dict.common.allProducts}
            </Link>
            {visibleCategories.map((category) => (
              <Link
                key={category.id}
                href={href(lang, `/categories/${category.id}`)}
                className={styles.categoryLink}
              >
                {category.label[lang]}
              </Link>
            ))}
          </div>
        </div>
      )}

      {menuOpen && (
        <nav id="mobile-menu" className={styles.mobileMenu} aria-label={dict.nav.menu}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={styles.mobileLink}>
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
