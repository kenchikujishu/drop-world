import type { Metadata } from 'next';
import Prose from '@/components/Prose';
import { LANGS, type Lang } from '@/content/taxonomy';
import { getDict } from '@/lib/i18n';
import { absoluteUrl } from '@/lib/site';
import styles from './license.module.css';

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export function generateMetadata({ params }: { params: { lang: Lang } }): Metadata {
  const dict = getDict(params.lang);
  return {
    title: dict.license.title,
    description: dict.license.lead,
    alternates: {
      canonical: absoluteUrl(`/${params.lang}/license`),
      languages: { en: absoluteUrl('/en/license'), ja: absoluteUrl('/ja/license') },
    },
  };
}

export default function LicensePage({ params }: { params: { lang: Lang } }) {
  const dict = getDict(params.lang);

  return (
    <>
      <div className="pageHeader">
        <div className="container">
          <p className="kicker">{dict.footer.legalHeading}</p>
          <h1>{dict.license.title}</h1>
          <p className="lead">{dict.license.lead}</p>
        </div>
      </div>

      <div className="container">
        <section className={styles.tableSection}>
          <h2 className={styles.tableTitle}>{dict.license.tableTitle}</h2>
          <ul className={styles.table}>
            {dict.license.rows.map((row) => (
              <li key={row.use} className={styles.row}>
                <span
                  className={row.allowed ? styles.markOk : styles.markNg}
                  aria-hidden="true"
                />
                <span className={styles.use}>{row.use}</span>
                <span className={`mono ${row.allowed ? styles.labelOk : styles.labelNg}`}>
                  {row.allowed ? dict.license.allowed : dict.license.notAllowed}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="container-narrow prose">
        <Prose sections={dict.license.sections} />
      </div>
    </>
  );
}
