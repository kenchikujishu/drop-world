import Link from 'next/link';
import { CATEGORIES, type Lang } from '@/content/taxonomy';
import type { Dictionary } from '@/content/i18n/en';
import { href } from '@/lib/i18n';
import { siteConfig } from '@/lib/site';
import styles from './footer.module.css';

type Props = {
  lang: Lang;
  dict: Dictionary;
  categoryCounts: Record<string, number>;
};

export default function Footer({ lang, dict, categoryCounts }: Props) {
  const visibleCategories = CATEGORIES.filter((c) => (categoryCounts[c.id] ?? 0) > 0);

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <p className={styles.wordmark}>drop world</p>
          <p className={styles.tagline}>{dict.footer.tagline}</p>
          <a href={`mailto:${siteConfig.supportEmail}`} className={`mono ${styles.email}`}>
            {siteConfig.supportEmail}
          </a>
        </div>

        <nav className={styles.column} aria-label={dict.footer.shopHeading}>
          <h2 className="kicker">{dict.footer.shopHeading}</h2>
          <Link href={href(lang, '/products')}>{dict.common.allProducts}</Link>
          {visibleCategories.map((category) => (
            <Link key={category.id} href={href(lang, `/categories/${category.id}`)}>
              {category.label[lang]}
            </Link>
          ))}
        </nav>

        <nav className={styles.column} aria-label={dict.footer.infoHeading}>
          <h2 className="kicker">{dict.footer.infoHeading}</h2>
          <Link href={href(lang, '/about')}>{dict.nav.about}</Link>
          <Link href={href(lang, '/license')}>{dict.nav.license}</Link>
          <Link href={href(lang, '/faq')}>{dict.nav.faq}</Link>
          <Link href={href(lang, '/contact')}>{dict.nav.contact}</Link>
        </nav>

        <nav className={styles.column} aria-label={dict.footer.legalHeading}>
          <h2 className="kicker">{dict.footer.legalHeading}</h2>
          <Link href={href(lang, '/legal/terms')}>{dict.footer.terms}</Link>
          <Link href={href(lang, '/legal/privacy')}>{dict.footer.privacy}</Link>
          <Link href={href(lang, '/legal/refund')}>{dict.footer.refund}</Link>
          <Link href={href(lang, '/legal/tokushoho')}>{dict.footer.tokushoho}</Link>
        </nav>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p className={styles.payment}>{dict.footer.paymentNote}</p>
        <p className={`mono ${styles.copyright}`}>
          © {new Date().getFullYear()} {dict.footer.copyright}
        </p>
      </div>
    </footer>
  );
}
