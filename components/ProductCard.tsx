import Link from 'next/link';
import { categoryLabel, type Lang } from '@/content/taxonomy';
import type { Dictionary } from '@/content/i18n/en';
import type { Product } from '@/lib/products';
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
  const meta = [
    product.figures ? `${product.figures}${lang === 'ja' ? '点' : ' figures'}` : null,
    product.formats.length > 0 ? product.formats.join(' ') : null,
  ].filter(Boolean);

  return (
    <article className={styles.card}>
      <Link href={href(lang, `/products/${product.slug}`)} className={styles.link}>
        <div className={styles.thumb}>
          {product.image && (
            // 画像は Lemon の CDN から。next/image の最適化は Workers で使わないので素の img。
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image} alt="" width={1000} height={1000} loading="lazy" />
          )}
        </div>

        <div className={styles.body}>
          <p className={`mono ${styles.views}`}>
            {product.sku} · {categoryLabel(product.category, lang)}
          </p>
          <h3 className={styles.title}>{product.title}</h3>
          <p className={styles.summary}>{product.summary}</p>

          <div className={styles.footer}>
            <p className={`mono ${styles.meta}`}>{meta.join(' · ')}</p>
            <p className={`mono ${styles.price}`}>{product.price.formatted}</p>
          </div>
        </div>
      </Link>

      <span className="sr-only">{dict.common.viewDetails}</span>
    </article>
  );
}
