import Link from 'next/link';
import { formatLabel, viewLabel, type Lang } from '@/content/taxonomy';
import type { Dictionary } from '@/content/i18n/en';
import type { Product } from '@/lib/product-schema';
import { resolvePrice } from '@/lib/pricing';
import { href } from '@/lib/i18n';
import styles from './product-card.module.css';

export default function ProductCard({
  product,
  lang,
  dict,
}: {
  product: Product;
  lang: Lang;
  dict: Dictionary;
}) {
  const price = resolvePrice(product, lang);

  return (
    <article className={styles.card}>
      <Link href={href(lang, `/products/${product.slug}`)} className={styles.link}>
        <div className={styles.thumb}>
          {/* サムネイルは形式が混在する（SVG プレースホルダー → WebP 実データ）ため
              next/image は使わず素の img で扱う。 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.thumbnail} alt="" width={800} height={600} loading="lazy" />
        </div>

        <div className={styles.body}>
          <p className={`mono ${styles.views}`}>
            {product.views.map((v) => viewLabel(v, lang)).join(' / ')}
          </p>
          <h3 className={styles.title}>{product.title[lang]}</h3>
          <p className={styles.summary}>{product.summary[lang]}</p>

          <div className={styles.footer}>
            <p className={`mono ${styles.meta}`}>
              {product.itemCount}
              {lang === 'ja' ? '点' : ' items'}
              <span className={styles.sep}>·</span>
              {product.formats.map((f) => formatLabel(f, lang)).join(' ')}
            </p>
            <p className={`mono ${styles.price}`}>{price.formatted}</p>
          </div>
        </div>
      </Link>

      <span className="sr-only">{dict.common.viewDetails}</span>
    </article>
  );
}
