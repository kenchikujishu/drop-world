import type { Lang } from '@/content/taxonomy';
import type { Dictionary } from '@/content/i18n/en';
import type { Product } from '@/lib/products';
import ProductCard from './ProductCard';
import styles from './product-grid.module.css';

export default function ProductGrid({
  products,
  lang,
  dict,
  emptyMessage,
}: {
  products: Product[];
  lang: Lang;
  dict: Dictionary;
  /** 0件のときの文言。省略時は「条件に合う商品がない」。 */
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return <p className={styles.empty}>{emptyMessage ?? dict.common.noResults}</p>;
  }

  return (
    <ul className={styles.grid}>
      {products.map((product) => (
        <li key={product.slug}>
          <ProductCard product={product} lang={lang} dict={dict} />
        </li>
      ))}
    </ul>
  );
}
