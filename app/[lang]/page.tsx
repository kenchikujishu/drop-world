import Link from 'next/link';
import ProductGrid from '@/components/ProductGrid';
import { CATEGORIES, type Lang } from '@/content/taxonomy';
import { getDict, href } from '@/lib/i18n';
import { getCategoryCounts, getFeatured } from '@/lib/products';
import styles from './home.module.css';

export default async function HomePage(props: { params: Promise<{ lang: Lang }> }) {
  const params = await props.params;
  const { lang } = params;
  const dict = getDict(lang);
  const featured = getFeatured(4);
  const counts = getCategoryCounts();

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

        {featured.length > 0 && (
          <div className={`container ${styles.heroStrip}`}>
            {featured.slice(0, 4).map((product) => (
              <Link
                key={product.slug}
                href={href(lang, `/products/${product.slug}`)}
                className={styles.stripTile}
                aria-label={product.title[lang]}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.thumbnail} alt="" width={600} height={450} />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ---- 注目のセット ---- */}
      {featured.length > 0 && (
        <section className={`container ${styles.section}`}>
          <div className={styles.sectionHead}>
            <div>
              <h2 className={styles.sectionTitle}>{dict.home.featuredTitle}</h2>
              <p className={styles.sectionLead}>{dict.home.featuredLead}</p>
            </div>
            <Link href={href(lang, '/products')} className={styles.sectionLink}>
              {dict.common.browseAll} →
            </Link>
          </div>
          <ProductGrid products={featured} lang={lang} dict={dict} />
        </section>
      )}

      {/* ---- カテゴリ ---- */}
      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHead}>
          <div>
            <h2 className={styles.sectionTitle}>{dict.home.categoriesTitle}</h2>
            <p className={styles.sectionLead}>{dict.home.categoriesLead}</p>
          </div>
        </div>

        <ul className={styles.categoryGrid}>
          {CATEGORIES.map((category) => {
            const count = counts[category.id] ?? 0;
            return (
              <li key={category.id}>
                <Link
                  href={href(lang, `/categories/${category.id}`)}
                  className={styles.categoryTile}
                >
                  <span className={styles.categoryName}>{category.label[lang]}</span>
                  <span className={`mono ${styles.categoryCount}`}>
                    {count.toString().padStart(2, '0')}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

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
