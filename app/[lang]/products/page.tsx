import { Suspense } from 'react';
import type { Metadata } from 'next';
import ProductBrowser from '@/components/ProductBrowser';
import { LANGS, type Lang } from '@/content/taxonomy';
import { getDict } from '@/lib/i18n';
import { getAllProducts } from '@/lib/products';
import { absoluteUrl } from '@/lib/site';

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export function generateMetadata({ params }: { params: { lang: Lang } }): Metadata {
  const dict = getDict(params.lang);
  return {
    title: dict.products.title,
    description: dict.products.lead,
    alternates: {
      canonical: absoluteUrl(`/${params.lang}/products`),
      languages: {
        en: absoluteUrl('/en/products'),
        ja: absoluteUrl('/ja/products'),
      },
    },
  };
}

export default function ProductsPage({ params }: { params: { lang: Lang } }) {
  const { lang } = params;
  const dict = getDict(lang);
  const products = getAllProducts();

  return (
    <>
      <div className="pageHeader">
        <div className="container">
          <p className="kicker">{dict.meta.siteName}</p>
          <h1>{dict.products.title}</h1>
          <p className="lead">{dict.products.lead}</p>
        </div>
      </div>

      <div className="container">
        {/* useSearchParams を使うため Suspense 境界が必要。 */}
        <Suspense fallback={null}>
          <ProductBrowser products={products} lang={lang} dict={dict} />
        </Suspense>
      </div>
    </>
  );
}
