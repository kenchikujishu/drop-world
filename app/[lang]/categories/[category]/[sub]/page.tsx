import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductGrid from '@/components/ProductGrid';
import {
  CATEGORY_IDS,
  LANGS,
  SUB_AXES,
  categoryLabel,
  subcategoryAxis,
  subcategoryLabel,
  type Lang,
} from '@/content/taxonomy';
import { getDict, href } from '@/lib/i18n';
import { getBySubcategory, getSubcategoryCounts } from '@/lib/products';
import { absoluteUrl } from '@/lib/site';
import styles from './sub.module.css';

type Params = { lang: Lang; category: string; sub: string };

/**
 * 商品があるカテゴリ × サブカテゴリの組み合わせだけページを作る。
 * ⚠ `dynamicParams = false` は付けない（OpenNext の Worker 上で生成済みのページまで 404 になる）。
 */
export function generateStaticParams() {
  const counts = getSubcategoryCounts();
  return LANGS.flatMap((lang) =>
    CATEGORY_IDS.flatMap((category) =>
      Object.keys(counts[category] ?? {}).map((sub) => ({ lang, category, sub })),
    ),
  );
}

export async function generateMetadata(props: { params: Promise<Params> }): Promise<Metadata> {
  const { lang, category, sub } = await props.params;
  if (getBySubcategory(category, sub).length === 0) return {};

  const dict = getDict(lang);
  const label = `${subcategoryLabel(sub, lang)} — ${categoryLabel(category, lang)}`;

  return {
    title: `${label} — ${dict.products.title}`,
    description: `${dict.categoryPage.leadPrefix}: ${label}`,
    alternates: {
      canonical: absoluteUrl(`/${lang}/categories/${category}/${sub}`),
      languages: {
        en: absoluteUrl(`/en/categories/${category}/${sub}`),
        ja: absoluteUrl(`/ja/categories/${category}/${sub}`),
      },
    },
  };
}

export default async function SubcategoryPage(props: { params: Promise<Params> }) {
  const { lang, category, sub } = await props.params;
  const products = getBySubcategory(category, sub);
  if (products.length === 0) notFound();

  const dict = getDict(lang);
  const axis = subcategoryAxis(sub);
  const counts = getSubcategoryCounts()[category] ?? {};

  return (
    <>
      <div className="pageHeader">
        <div className="container">
          <p className="kicker">
            <Link href={href(lang, `/categories/${category}`)} className={styles.parentLink}>
              {categoryLabel(category, lang)}
            </Link>
            {axis ? ` · ${axis.label[lang]}` : ''}
          </p>
          <h1>{subcategoryLabel(sub, lang)}</h1>
          <p className="lead">
            {dict.categoryPage.leadPrefix}: {categoryLabel(category, lang)} /{' '}
            {subcategoryLabel(sub, lang)}
          </p>
        </div>
      </div>

      <div className="container">
        {/* 同じカテゴリの他のサブカテゴリへの行き来。軸ごとにまとめる。 */}
        <nav className={styles.siblings} aria-label={dict.common.filters}>
          {SUB_AXES.map((group) => {
            const items = group.items.filter((item) => (counts[item.id] ?? 0) > 0);
            if (items.length === 0) return null;
            return (
              <div key={group.id} className={styles.siblingGroup}>
                <p className={`mono ${styles.siblingAxis}`}>{group.label[lang]}</p>
                <div className={styles.siblingLinks}>
                  {items.map((item) => (
                    <Link
                      key={item.id}
                      href={href(lang, `/categories/${category}/${item.id}`)}
                      className={styles.siblingLink}
                      aria-current={item.id === sub ? 'page' : undefined}
                    >
                      {item.label[lang]}
                      <span className={`mono ${styles.siblingCount}`}>{counts[item.id]}</span>
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
