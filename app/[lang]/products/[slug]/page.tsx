import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BuyButton from '@/components/BuyButton';
import Gallery from '@/components/Gallery';
import ProductGrid from '@/components/ProductGrid';
import { AXES, LANGS, subjectLabel, type Lang } from '@/content/taxonomy';
import { getDict, href } from '@/lib/i18n';
import {
  getAllProducts,
  getProduct,
  getRelated,
  hasFilterPage,
  hasScenePage,
  hasSubjectPage,
} from '@/lib/products';
import { absoluteUrl } from '@/lib/site';
import styles from './product.module.css';

type Params = { lang: Lang; slug: string };

/**
 * 全商品をビルド時に静的生成する。
 * ⚠ `dynamicParams = false` は付けない。OpenNext の Worker 上では生成済みのページまで 404 になる。
 * 存在しない品番はページ内の notFound() で 404 にしている。
 */
export function generateStaticParams() {
  return LANGS.flatMap((lang) => getAllProducts().map((product) => ({ lang, slug: product.slug })));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};

  return {
    title: product.title,
    description: product.summary,
    alternates: {
      canonical: absoluteUrl(`/${lang}/products/${product.slug}`),
      languages: {
        en: absoluteUrl(`/en/products/${product.slug}`),
        ja: absoluteUrl(`/ja/products/${product.slug}`),
      },
    },
    openGraph: {
      type: 'website',
      title: product.title,
      description: product.summary,
      images: product.image ? [{ url: product.image }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { lang, slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const dict = getDict(lang);
  const related = getRelated(product);

  const subject = product.contains[0];
  const specs = [
    { label: dict.product.sku, value: product.sku },
    product.figures
      ? { label: dict.product.figures, value: `${product.figures}${lang === 'ja' ? '点' : ''}` }
      : null,
    product.formats.length > 0 ? { label: dict.common.formats, value: product.formats.join(', ') } : null,
    product.publishedAt ? { label: dict.common.released, value: product.publishedAt } : null,
  ].filter((spec): spec is { label: string; value: string } => spec !== null);

  /**
   * 分類は軸ごとに1行。ページがあるものだけリンクにする
   * （点数が少ない組み合わせはページを作っていないため）。
   */
  const tagRows = AXES.map((axis) => {
    const ids = (product[axis.id as 'contains' | 'origin' | 'action' | 'scene' | 'views'] ??
      []) as string[];
    return {
      axis,
      items: axis.items
        .filter((item) => ids.includes(item.id))
        .map((item) => ({
          ...item,
          url:
            axis.id === 'contains'
              ? hasSubjectPage(item.id)
                ? href(lang, `/${item.id}`)
                : null
              : axis.id === 'scene'
                ? hasScenePage(item.id)
                  ? href(lang, `/scenes/${item.id}`)
                  : null
                : axis.id === 'action' && subject && hasFilterPage(subject, item.id)
                  ? href(lang, `/${subject}/${item.id}`)
                  : null,
        })),
    };
  }).filter((row) => row.items.length > 0);

  return (
    <>
      <nav className={`container ${styles.breadcrumb}`} aria-label="Breadcrumb">
        <Link href={href(lang, '/products')}>{dict.product.backToProducts}</Link>
        <span aria-hidden="true">/</span>
        {subject && hasSubjectPage(subject) && (
          <Link href={href(lang, `/${subject}`)}>{subjectLabel(subject, lang)}</Link>
        )}
      </nav>

      <div className={`container ${styles.layout}`}>
        <div className={styles.media}>
          {product.image && (
            <Gallery
              images={[product.image, product.hoverImage].filter(
                (src): src is string => Boolean(src),
              )}
              alt={product.title}
              label={dict.common.gallery}
            />
          )}
        </div>

        <div className={styles.info}>
          <p className="kicker">
            {product.sku}
            {subject ? ` · ${subjectLabel(subject, lang)}` : ''}
          </p>
          <h1 className={styles.title}>{product.title}</h1>
          <p className={styles.summary}>{product.summary}</p>

          <div className={styles.buy}>
            <BuyButton
              checkoutUrl={product.checkoutUrl}
              price={product.price.formatted}
              testMode={product.testMode}
              dict={dict}
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
              {tagRows.map(({ axis, items }) => (
                <div key={axis.id} className={styles.specRow}>
                  <dt>{axis.label[lang]}</dt>
                  <dd className={styles.specLinks}>
                    {items.map((item) =>
                      item.url ? (
                        <Link key={item.id} href={item.url}>
                          {item.label[lang]}
                        </Link>
                      ) : (
                        <span key={item.id}>{item.label[lang]}</span>
                      ),
                    )}
                  </dd>
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

      {product.paragraphs.length > 1 && (
        <section className={`container ${styles.description}`}>
          <h2 className={styles.descriptionTitle}>{dict.product.aboutThisSet}</h2>
          {product.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </section>
      )}

      {related.length > 0 && (
        <section className={`container ${styles.related}`}>
          <h2 className={styles.descriptionTitle}>{dict.common.related}</h2>
          <ProductGrid products={related} lang={lang} dict={dict} />
        </section>
      )}

      {/* 検索エンジン向けの構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.title,
            sku: product.sku,
            description: product.summary,
            image: product.image ?? undefined,
            brand: { '@type': 'Brand', name: dict.meta.siteName },
            offers: {
              '@type': 'Offer',
              price: product.price.amount,
              priceCurrency: product.price.currency,
              availability: 'https://schema.org/InStock',
              url: absoluteUrl(`/${lang}/products/${product.slug}`),
            },
          }),
        }}
      />
    </>
  );
}
