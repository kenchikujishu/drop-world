import Link from 'next/link';
import ProductGrid from '@/components/ProductGrid';
import { SCENES, SUBJECTS, type Lang } from '@/content/taxonomy';
import { getDict, href } from '@/lib/i18n';
import { getLatest, getSceneCounts, getSubjectCounts } from '@/lib/products';
import styles from './home.module.css';

export default async function HomePage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const dict = getDict(lang);
  const latest = getLatest(12);
  const counts = getSubjectCounts();
  const sceneCounts = getSceneCounts();
  const sceneTotal = Object.values(sceneCounts).reduce((sum, n) => sum + n, 0);

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

      {/* ---- 被写体とシーン（商品が0件でも出す） ---- */}
      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHead}>
          <div>
            <h2 className={styles.sectionTitle}>{dict.home.categoriesTitle}</h2>
          </div>
        </div>

        <ul className={styles.categoryGrid}>
          {SUBJECTS.map((subject) => {
            const count = counts[subject.id] ?? 0;
            const label = (
              <>
                <span className={styles.categoryName}>{subject.label[lang]}</span>
                <span className={`mono ${styles.categoryCount}`}>
                  {String(count).padStart(2, '0')}
                </span>
              </>
            );
            return (
              <li key={subject.id}>
                {count > 0 ? (
                  <Link href={href(lang, `/${subject.id}`)} className={styles.categoryTile}>
                    {label}
                  </Link>
                ) : (
                  // ページが無いのでリンクにしない。分類だけ先に見せる。
                  <span className={`${styles.categoryTile} ${styles.categoryTileEmpty}`}>
                    {label}
                  </span>
                )}
              </li>
            );
          })}

          <li>
            {sceneTotal > 0 ? (
              <Link href={href(lang, '/scenes')} className={styles.categoryTile}>
                <span className={styles.categoryName}>{dict.common.scenes}</span>
                <span className={`mono ${styles.categoryCount}`}>
                  {String(SCENES.filter((s) => (sceneCounts[s.id] ?? 0) > 0).length).padStart(2, '0')}
                </span>
              </Link>
            ) : (
              <span className={`${styles.categoryTile} ${styles.categoryTileEmpty}`}>
                <span className={styles.categoryName}>{dict.common.scenes}</span>
                <span className={`mono ${styles.categoryCount}`}>00</span>
              </span>
            )}
          </li>
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
