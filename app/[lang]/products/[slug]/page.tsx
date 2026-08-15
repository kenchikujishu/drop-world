import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BuyButton from '@/components/BuyButton';
import Gallery from '@/components/Gallery';
import ProductGrid from '@/components/ProductGrid';
import {
  LANGS,
  categoryLabel,
  formatLabel,
  viewLabel,
  type Lang,
} from '@/content/taxonomy';
import { getDict, href } from '@/lib/i18n';
import { resolvePrice } from '@/lib/pricing';
import { getAllProducts, getDownloadSize, getProduct, getRelated } from '@/lib/products';
import { absoluteUrl } from '@/lib/site';
import styles from './product.module.css';

type Params = { lang: Lang; slug: string };

export function generateStaticParams() {
  return LANGS.flatMap((lang) => getAllProducts().map((product) => ({ lang, slug: product.slug })));
}

export async function generateMetadata(props: { params: Promise<Params> }): Promise<Metadata> {
  const params = await props.params;
  const product = getProduct(params.slug);
  if (!product) return {};

  const title = product.title[params.lang];
  const description = product.summary[params.lang];

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(`/${params.lang}/products/${product.slug}`),
      languages: {
        en: absoluteUrl(`/en/products/${product.slug}`),
        ja: absoluteUrl(`/ja/products/${product.slug}`),
      },
    },
    openGraph: {
      type: 'website',
      title,
      description,
      images: [{ url: absoluteUrl(product.thumbnail) }],
    },
  };
}

export default async function ProductPage(props: { params: Promise<Params> }) {
  const params = await props.params;
  const product = getProduct(params.slug);
  if (!product) notFound();

  const { lang } = params;
  const dict = getDict(lang);
  const price = resolvePrice(product, lang);
  const related = getRelated(product);

  const specs = [
    { label: dict.common.category, value: categoryLabel(product.category, lang) },
    { label: dict.common.view, value: product.views.map((v) => viewLabel(v, lang)).join(' / ') },
    {
      label: dict.common.formats,
      value: product.formats.map((f) => formatLabel(f, lang)).join(', '),
    },
    {
      label: dict.common.whatsIncluded,
      value: `${product.itemCount}${lang === 'ja' ? '点' : ' items'}`,
    },
    { label: dict.common.fileSize, value: product.fileSize },
    { label: dict.common.released, value: product.publishedAt },
  ];

  return (
    <>
      <nav className={`container ${styles.breadcrumb}`} aria-label="Breadcrumb">
        <Link href={href(lang, '/products')}>{dict.product.backToProducts}</Link>
        <span aria-hidden="true">/</span>
        <Link href={href(lang, `/categories/${product.category}`)}>
          {categoryLabel(product.category, lang)}
        </Link>
      </nav>

      <div className={`container ${styles.layout}`}>
        <div className={styles.media}>
          <Gallery
            images={product.gallery}
            alt={product.title[lang]}
            label={dict.common.gallery}
          />
        </div>

        <div className={styles.info}>
          <p className="kicker">{categoryLabel(product.category, lang)}</p>
          <h1 className={styles.title}>{product.title[lang]}</h1>
          <p className={styles.summary}>{product.summary[lang]}</p>

          <div className={styles.buy}>
            <BuyButton
              checkoutUrl={product.checkoutUrl}
              downloads={product.downloads.map((d) => ({
                ...d,
                size: getDownloadSize(d.file),
              }))}
              price={price.formatted}
              dict={dict}
              lang={lang}
            />
          </div>

          <section className={styles.specs}>
            <h2 className="kicker">{dict.product.specs}</h2>
            <dl>
              {specs.map((spec) => (
                <div key={spec.label} className={styles.specRow}>
                  <dt>{spec.label}</dt>
                  <dd className="mono">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <p className={styles.license}>
            {dict.product.licenseShort}{' '}
            <Link href={href(lang, '/license')}>{dict.product.licenseLink}</Link>
          </p>
        </div>
      </div>

      <section className={`container ${styles.description}`}>
        <h2 className={styles.descriptionTitle}>{dict.product.aboutThisSet}</h2>
        {product.description[lang]
          .split('\n\n')
          .filter(Boolean)
          .map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
      </section>

      {related.length > 0 && (
        <section className={`container ${styles.related}`}>
          <h2 className={styles.descriptionTitle}>{dict.common.related}</h2>
          <ProductGrid products={related} lang={lang} dict={dict} />
        </section>
      )}

      {/* 検索エンジン向けの構造化データ。価格は resolvePrice と同じ値を使う。 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.title[lang],
            description: product.summary[lang],
            image: absoluteUrl(product.thumbnail),
            brand: { '@type': 'Brand', name: dict.meta.siteName },
            offers: {
              '@type': 'Offer',
              price: price.amount,
              priceCurrency: price.currency,
              availability: product.checkoutUrl
                ? 'https://schema.org/InStock'
                : 'https://schema.org/PreOrder',
              url: absoluteUrl(`/${lang}/products/${product.slug}`),
            },
          }),
        }}
      />
    </>
  );
}
