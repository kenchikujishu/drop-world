import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductBrowser from '@/components/ProductBrowser';
import {
  CATEGORY_IDS,
  LANGS,
  categoryLabel,
  type CategoryId,
  type Lang,
} from '@/content/taxonomy';
import { getDict } from '@/lib/i18n';
import { getByCategory } from '@/lib/products';
import { absoluteUrl } from '@/lib/site';

type Params = { lang: Lang; category: string };

export function generateStaticParams() {
  return LANGS.flatMap((lang) => CATEGORY_IDS.map((category) => ({ lang, category })));
}

function toCategoryId(value: string): CategoryId | null {
  return (CATEGORY_IDS as readonly string[]).includes(value) ? (value as CategoryId) : null;
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const category = toCategoryId(params.category);
  if (!category) return {};

  const dict = getDict(params.lang);
  const label = categoryLabel(category, params.lang);

  return {
    title: `${label} — ${dict.products.title}`,
    description: `${dict.categoryPage.leadPrefix}: ${label}. ${dict.products.lead}`,
    alternates: {
      canonical: absoluteUrl(`/${params.lang}/categories/${category}`),
      languages: {
        en: absoluteUrl(`/en/categories/${category}`),
        ja: absoluteUrl(`/ja/categories/${category}`),
      },
    },
  };
}

export default function CategoryPage({ params }: { params: Params }) {
  const category = toCategoryId(params.category);
  if (!category) notFound();

  const { lang } = params;
  const dict = getDict(lang);
  const products = getByCategory(category);
  const label = categoryLabel(category, lang);

  return (
    <>
      <div className="pageHeader">
        <div className="container">
          <p className="kicker">{dict.common.category}</p>
          <h1>{label}</h1>
          <p className="lead">
            {dict.categoryPage.leadPrefix}: {label}
          </p>
        </div>
      </div>

      <div className="container">
        <Suspense fallback={null}>
          <ProductBrowser
            products={products}
            lang={lang}
            dict={dict}
            lockedCategory={category}
          />
        </Suspense>
      </div>
    </>
  );
}
