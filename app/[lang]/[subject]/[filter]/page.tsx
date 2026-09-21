import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductGrid from '@/components/ProductGrid';
import {
  FILTER_AXES,
  LANGS,
  SUBJECT_IDS,
  anyLabel,
  subjectLabel,
  type Lang,
} from '@/content/taxonomy';
import { getDict, href } from '@/lib/i18n';
import { getBySubjectAndFilter, getFilterCounts, hasFilterPage } from '@/lib/products';
import { absoluteUrl } from '@/lib/site';
import styles from '../browse.module.css';

type Params = { lang: Lang; subject: string; filter: string };

/**
 * 被写体 × 絞り込みのページ（/en/people/walking/）。
 * 商品が MIN_PRODUCTS_PER_PAGE 点以上ある組み合わせだけ作る（中身の薄いページを作らないため）。
 */
export function generateStaticParams() {
  const filters = FILTER_AXES.flatMap((axis) => axis.items.map((item) => item.id));
  return LANGS.flatMap((lang) =>
    SUBJECT_IDS.flatMap((subject) =>
      filters
        .filter((filter) => hasFilterPage(subject, filter))
        .map((filter) => ({ lang, subject, filter })),
    ),
  );
}

export async function generateMetadata(props: { params: Promise<Params> }): Promise<Metadata> {
  const { lang, subject, filter } = await props.params;
  if (!hasFilterPage(subject, filter)) return {};

  const dict = getDict(lang);
  const label = `${subjectLabel(subject, lang)} / ${anyLabel(filter, lang)}`;

  return {
    title: `${label} — ${dict.products.title}`,
    description: `${dict.browse.leadPrefix}: ${label}`,
    alternates: {
      canonical: absoluteUrl(`/${lang}/${subject}/${filter}`),
      languages: {
        en: absoluteUrl(`/en/${subject}/${filter}`),
        ja: absoluteUrl(`/ja/${subject}/${filter}`),
      },
    },
  };
}

export default async function SubjectFilterPage(props: { params: Promise<Params> }) {
  const { lang, subject, filter } = await props.params;
  if (!hasFilterPage(subject, filter)) notFound();

  const dict = getDict(lang);
  const products = getBySubjectAndFilter(subject, filter);
  const counts = getFilterCounts(subject);

  return (
    <>
      <div className="pageHeader">
        <div className="container">
          <p className="kicker">
            <Link href={href(lang, `/${subject}`)} className={styles.parentLink}>
              {subjectLabel(subject, lang)}
            </Link>
          </p>
          <h1>{anyLabel(filter, lang)}</h1>
          <p className="lead">
            {dict.browse.leadPrefix}: {subjectLabel(subject, lang)} / {anyLabel(filter, lang)}
          </p>
        </div>
      </div>

      <div className="container">
        <nav className={styles.filters} aria-label={dict.browse.filterBy}>
          {FILTER_AXES.map((axis) => {
            const items = axis.items.filter((item) => hasFilterPage(subject, item.id));
            if (items.length === 0) return null;
            return (
              <div key={axis.id} className={styles.filterGroup}>
                <p className={`mono ${styles.filterAxis}`}>{axis.label[lang]}</p>
                <div className={styles.filterLinks}>
                  {items.map((item) => (
                    <Link
                      key={item.id}
                      href={href(lang, `/${subject}/${item.id}`)}
                      className={styles.filterLink}
                      aria-current={item.id === filter ? 'page' : undefined}
                    >
                      {item.label[lang]}
                      <span className={`mono ${styles.filterCount}`}>{counts[item.id]}</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className={styles.grid}>
          <ProductGrid products={products} lang={lang} dict={dict} />
        </div>
      </div>
    </>
  );
}
