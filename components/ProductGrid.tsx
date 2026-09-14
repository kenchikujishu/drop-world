import type { Lang } from '@/content/taxonomy';
import type { Dictionary } from '@/content/i18n/en';
import type { Product } from '@/lib/products';
import ProductCard from './ProductCard';
import styles from './product-grid.module.css';

export default function ProductGrid({
  products,
  lang,
  dict,
}: {
  products: Product[];
  lang: Lang;
  dict: Dictionary;
}) {
  if (products.length === 0) {
    return <p className={styles.empty}>{dict.common.noResults}</p>;
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
