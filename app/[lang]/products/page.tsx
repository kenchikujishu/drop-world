import { Suspense } from 'react';
import type { Metadata } from 'next';
import ProductBrowser from '@/components/ProductBrowser';
import ProductGrid from '@/components/ProductGrid';
import { LANGS, type Lang } from '@/content/taxonomy';
import { getDict } from '@/lib/i18n';
import { getAllProducts } from '@/lib/products';
import { absoluteUrl } from '@/lib/site';

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata(props: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const params = await props.params;
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

export default async function ProductsPage(props: { params: Promise<{ lang: Lang }> }) {
  const params = await props.params;
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
        {/* ProductBrowser は useSearchParams を使う client component なので Suspense 境界が要る。
            fallback を「絞り込み前の全件」にしておくと、プリレンダーされた HTML に商品一覧が
            そのまま入る（検索エンジンと JS 無効時のため）。ハイドレート後に絞り込み版へ差し替わる。 */}
        <Suspense fallback={<ProductGrid products={products} lang={lang} dict={dict} />}>
          <ProductBrowser products={products} lang={lang} dict={dict} />
        </Suspense>
      </div>
    </>
  );
}
