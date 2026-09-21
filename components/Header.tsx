'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FILTER_AXES, SCENES, SUBJECTS, type Lang } from '@/content/taxonomy';
import type { Dictionary } from '@/content/i18n/en';
import { href } from '@/lib/i18n';
import LangSwitch from './LangSwitch';
import styles from './header.module.css';

type Props = {
  lang: Lang;
  dict: Dictionary;
  /** 被写体ごとの商品数。0件でもメニューには出すが、ページが無いのでリンクにしない。 */
  subjectCounts: Record<string, number>;
  /** 被写体ごとの「絞り込み（動作・シーン）→ 商品数」。 */
  filterCounts: Record<string, Record<string, number>>;
  /** シーンごとの商品数（被写体横断）。 */
  sceneCounts: Record<string, number>;
  /** ページが存在する組み合わせ。少数の組み合わせはページを作らないので、リンクにしない。 */
  filterPages: Record<string, string[]>;
  scenePages: string[];
};

export default function Header({
  lang,
  dict,
  subjectCounts,
  filterCounts,
  sceneCounts,
  filterPages,
  scenePages,
}: Props) {
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

  /**
   * 被写体ごとのメニュー。**商品が0件でも項目は出す**（オーナーの指示、2026-09-21）。
   * ページが無いものはリンクにせず淡色のテキストにする（404 に飛ばさないため）。
   */
  function subjectMenu(subject: string) {
    const counts = filterCounts[subject] ?? {};
    const pages = filterPages[subject] ?? [];
    return FILTER_AXES.map((axis) => ({
      axis,
      items: axis.items.map((item) => ({
        ...item,
        count: counts[item.id] ?? 0,
        url: pages.includes(item.id) ? href(lang, `/${subject}/${item.id}`) : null,
      })),
    }));
  }

  const sceneMenu = SCENES.map((scene) => ({
    ...scene,
    count: sceneCounts[scene.id] ?? 0,
    url: scenePages.includes(scene.id) ? href(lang, `/scenes/${scene.id}`) : null,
  }));

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

      <div className={styles.categoryRow}>
        <div className={`container ${styles.categoryScroller}`}>
          <Link href={href(lang, '/products')} className={styles.categoryLink}>
            {dict.common.allProducts}
          </Link>

          {SUBJECTS.map((subject) => {
            const hasPage = (subjectCounts[subject.id] ?? 0) > 0;
            return (
              // カーソルを合わせる / キーボードで入ると絞り込みの一覧が出る（CSS だけで開く）。
              <div key={subject.id} className={styles.categoryItem}>
                {hasPage ? (
                  <Link href={href(lang, `/${subject.id}`)} className={styles.categoryLink}>
                    {subject.label[lang]}
                  </Link>
                ) : (
                  <span className={`${styles.categoryLink} ${styles.empty}`}>
                    {subject.label[lang]}
                  </span>
                )}

                <div className={styles.subPanel}>
                  {subjectMenu(subject.id).map(({ axis, items }) => (
                    <div key={axis.id} className={styles.subGroup}>
                      <p className={`mono ${styles.subAxis}`}>{axis.label[lang]}</p>
                      {items.map((item) =>
                        item.url ? (
                          <Link key={item.id} href={item.url} className={styles.subLink}>
                            {item.label[lang]}
                            <span className={`mono ${styles.subCount}`}>{item.count}</span>
                          </Link>
                        ) : (
                          <span key={item.id} className={`${styles.subLink} ${styles.empty}`}>
                            {item.label[lang]}
                          </span>
                        ),
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* シーン（被写体横断） */}
          <div className={styles.categoryItem}>
            <Link href={href(lang, '/scenes')} className={styles.categoryLink}>
              {dict.common.scenes}
            </Link>
            <div className={styles.subPanel}>
              <div className={styles.subGroup}>
                <p className={`mono ${styles.subAxis}`}>{dict.browse.scenesTitle}</p>
                {sceneMenu.map((scene) =>
                  scene.url ? (
                    <Link key={scene.id} href={scene.url} className={styles.subLink}>
                      {scene.label[lang]}
                      <span className={`mono ${styles.subCount}`}>{scene.count}</span>
                    </Link>
                  ) : (
                    <span key={scene.id} className={`${styles.subLink} ${styles.empty}`}>
                      {scene.label[lang]}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" className={styles.mobileMenu} aria-label={dict.nav.menu}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={styles.mobileLink}>
              {link.label}
            </Link>
          ))}

          {/* スマートフォンには hover が無いので、絞り込みはこのメニューに並べる。 */}
          {SUBJECTS.map((subject) => (
            <div key={subject.id} className={styles.mobileGroup}>
              <p className={`mono ${styles.mobileGroupTitle}`}>{subject.label[lang]}</p>
              <div className={styles.mobileSubLinks}>
                {subjectMenu(subject.id)
                  .flatMap(({ items }) => items)
                  .map((item) =>
                    item.url ? (
                      <Link key={item.id} href={item.url} className={styles.mobileSubLink}>
                        {item.label[lang]}
                        <span className={`mono ${styles.subCount}`}>{item.count}</span>
                      </Link>
                    ) : (
                      <span key={item.id} className={`${styles.mobileSubLink} ${styles.empty}`}>
                        {item.label[lang]}
                      </span>
                    ),
                  )}
              </div>
            </div>
          ))}

          <div className={styles.mobileGroup}>
            <p className={`mono ${styles.mobileGroupTitle}`}>{dict.common.scenes}</p>
            <div className={styles.mobileSubLinks}>
              {sceneMenu.map((scene) =>
                scene.url ? (
                  <Link key={scene.id} href={scene.url} className={styles.mobileSubLink}>
                    {scene.label[lang]}
                    <span className={`mono ${styles.subCount}`}>{scene.count}</span>
                  </Link>
                ) : (
                  <span key={scene.id} className={`${styles.mobileSubLink} ${styles.empty}`}>
                    {scene.label[lang]}
                  </span>
                ),
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
