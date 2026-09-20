import Link from 'next/link';
import ProductGrid from '@/components/ProductGrid';
import { CATEGORIES, type Lang } from '@/content/taxonomy';
import { getDict, href } from '@/lib/i18n';
import { getCategoryCounts, getLatest } from '@/lib/products';
import styles from './home.module.css';

export default async function HomePage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const dict = getDict(lang);
  const latest = getLatest(12);
  const counts = getCategoryCounts();
  // 商品が1点も無いカテゴリは出さない（空のページに誘導しないため）
  const categories = CATEGORIES.filter((category) => (counts[category.id] ?? 0) > 0);

  return (
    <>
      {/* ---- ヒーロー ---- */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <p className="kicker">{dict.home.heroKicker}</p>
          <h1 className={styles.heroTitle}>{dict.home.heroTitle}</h1>
          <div className={styles.heroActions}>
            <Link href={href(lang, '/products')} className="btn">
              {dict.home.heroCta}
            </Link>
            <Link href={href(lang, '/license')} className="btn btn-outline">
              {dict.home.heroCtaSecondary}
            </Link>
          </div>
        </div>
      </section>

      {/* ---- 新着（新しい順に12点） ---- */}
      {latest.length > 0 && (
        <section className={`container ${styles.section}`}>
          <div className={styles.sectionHead}>
            <div>
              <h2 className={styles.sectionTitle}>{dict.home.latestTitle}</h2>
              <p className={styles.sectionLead}>{dict.home.latestLead}</p>
            </div>
            <Link href={href(lang, '/products')} className={styles.sectionLink}>
              {dict.common.browseAll} →
            </Link>
          </div>
          <ProductGrid products={latest} lang={lang} dict={dict} />
        </section>
      )}

      {/* ---- カテゴリ ---- */}
      {categories.length > 0 && (
        <section className={`container ${styles.section}`}>
          <div className={styles.sectionHead}>
            <div>
              <h2 className={styles.sectionTitle}>{dict.home.categoriesTitle}</h2>
            </div>
          </div>

          <ul className={styles.categoryGrid}>
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={href(lang, `/categories/${category.id}`)}
                  className={styles.categoryTile}
                >
                  <span className={styles.categoryName}>{category.label[lang]}</span>
                  <span className={`mono ${styles.categoryCount}`}>
                    {String(counts[category.id] ?? 0).padStart(2, '0')}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---- 購入の流れ ---- */}
      <section className={styles.bandSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>{dict.home.howTitle}</h2>
          <p className={styles.sectionLead}>{dict.home.howLead}</p>

          <ol className={styles.steps}>
            {dict.home.howSteps.map((step) => (
              <li key={step.n} className={styles.step}>
                <span className={`mono ${styles.stepNumber}`}>{step.n}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepBody}>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- 品質 ---- */}
      <section className={`container ${styles.section}`}>
        <h2 className={styles.sectionTitle}>{dict.home.qualityTitle}</h2>
        <ul className={styles.qualityGrid}>
          {dict.home.qualityPoints.map((point) => (
            <li key={point.title} className={styles.quality}>
              <h3 className={styles.qualityTitle}>{point.title}</h3>
              <p className={styles.qualityBody}>{point.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
