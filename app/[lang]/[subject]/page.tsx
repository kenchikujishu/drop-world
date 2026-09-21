import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductGrid from '@/components/ProductGrid';
import { FILTER_AXES, LANGS, SUBJECT_IDS, subjectLabel, type Lang } from '@/content/taxonomy';
import { getDict, href } from '@/lib/i18n';
import { getBySubject, getFilterCounts, hasFilterPage } from '@/lib/products';
import { absoluteUrl } from '@/lib/site';
import styles from './browse.module.css';

type Params = { lang: Lang; subject: string };

/**
 * 被写体のページ（/en/people/）。商品が1点でもあれば作る。
 * ⚠ `dynamicParams = false` は付けない。OpenNext の Worker 上では生成済みのページまで 404 になる。
 */
export function generateStaticParams() {
  return LANGS.flatMap((lang) =>
    SUBJECT_IDS.filter((subject) => getBySubject(subject).length > 0).map((subject) => ({
      lang,
      subject,
    })),
  );
}

export async function generateMetadata(props: { params: Promise<Params> }): Promise<Metadata> {
  const { lang, subject } = await props.params;
  if (!SUBJECT_IDS.includes(subject)) return {};

  const dict = getDict(lang);
  const label = subjectLabel(subject, lang);

  return {
    title: `${label} — ${dict.products.title}`,
    description: `${dict.browse.leadPrefix}: ${label}. ${dict.products.lead}`,
    alternates: {
      canonical: absoluteUrl(`/${lang}/${subject}`),
      languages: {
        en: absoluteUrl(`/en/${subject}`),
        ja: absoluteUrl(`/ja/${subject}`),
      },
    },
  };
}

export default async function SubjectPage(props: { params: Promise<Params> }) {
  const { lang, subject } = await props.params;
  if (!SUBJECT_IDS.includes(subject)) notFound();

  const products = getBySubject(subject);
  if (products.length === 0) notFound();

  const dict = getDict(lang);
  const counts = getFilterCounts(subject);

  return (
    <>
      <div className="pageHeader">
        <div className="container">
          <p className="kicker">{dict.common.category}</p>
          <h1>{subjectLabel(subject, lang)}</h1>
          <p className="lead">
            {dict.browse.leadPrefix}: {subjectLabel(subject, lang)}
          </p>
        </div>
      </div>

      <div className="container">
        {/* 動作とシーンで絞り込む。ページがある組み合わせ（既定で2点以上）だけリンクにする。 */}
        <nav className={styles.filters} aria-label={dict.browse.filterBy}>
          {FILTER_AXES.map((axis) => (
            <div key={axis.id} className={styles.filterGroup}>
              <p className={`mono ${styles.filterAxis}`}>{axis.label[lang]}</p>
              <div className={styles.filterLinks}>
                {axis.items.map((item) =>
                  hasFilterPage(subject, item.id) ? (
                    <Link
                      key={item.id}
                      href={href(lang, `/${subject}/${item.id}`)}
                      className={styles.filterLink}
                    >
                      {item.label[lang]}
                      <span className={`mono ${styles.filterCount}`}>{counts[item.id]}</span>
                    </Link>
                  ) : (
                    <span key={item.id} className={`${styles.filterLink} ${styles.empty}`}>
                      {item.label[lang]}
                      {counts[item.id] > 0 && (
                        <span className={`mono ${styles.filterCount}`}>{counts[item.id]}</span>
                      )}
                    </span>
                  ),
                )}
              </div>
            </div>
          ))}
        </nav>

        <div className={styles.grid}>
          <ProductGrid products={products} lang={lang} dict={dict} />
        </div>
      </div>
    </>
  );
}
