'use client';

import { useCallback, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CATEGORIES, type Lang } from '@/content/taxonomy';
import type { Dictionary } from '@/content/i18n/en';
import type { Product } from '@/lib/products';
import ProductGrid from './ProductGrid';
import styles from './product-browser.module.css';

type SortId = 'newest' | 'price-asc' | 'price-desc' | 'name-asc';

/**
 * 商品一覧の絞り込み。状態は URL のクエリだけに持つので、
 * 絞り込んだ結果をそのまま共有・ブックマークできる。
 * 商品データは全件サーバーから受け取り、絞り込みはブラウザ側で行う（ページは静的のまま）。
 */
export default function ProductBrowser({
  products,
  lang,
  dict,
  /** カテゴリページから使うときは、そのカテゴリに固定してカテゴリ絞り込みを隠す。 */
  lockedCategory,
}: {
  products: Product[];
  lang: Lang;
  dict: Dictionary;
  lockedCategory?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [panelOpen, setPanelOpen] = useState(false);

  // 商品が1点も無いカテゴリは選択肢に出さない
  const availableCategories = useMemo(
    () => CATEGORIES.filter((c) => products.some((p) => p.category === c.id)),
    [products],
  );

  const selected = useMemo(
    () => ({
      categories: parseList(searchParams.get('category')),
      min: searchParams.get('min') ?? '',
      max: searchParams.get('max') ?? '',
      sort: (searchParams.get('sort') as SortId | null) ?? 'newest',
    }),
    [searchParams],
  );

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value.length > 0) params.set(key, value);
      else params.delete(key);

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const toggleCategory = useCallback(
    (id: string) => {
      const current = parseList(searchParams.get('category'));
      const next = current.includes(id) ? current.filter((v) => v !== id) : [...current, id];
      setParam('category', next.join(','));
    },
    [searchParams, setParam],
  );

  const filtered = useMemo(() => {
    const min = selected.min === '' ? null : Number(selected.min);
    const max = selected.max === '' ? null : Number(selected.max);

    const result = products.filter((product) => {
      if (selected.categories.length > 0 && !selected.categories.includes(product.category)) {
        return false;
      }
      if (min !== null && Number.isFinite(min) && product.price.amount < min) return false;
      if (max !== null && Number.isFinite(max) && product.price.amount > max) return false;
      return true;
    });

    return sortProducts(result, selected.sort);
  }, [products, selected]);

  const hasFilters = selected.categories.length > 0 || selected.min !== '' || selected.max !== '';

  const sortOptions: { id: SortId; label: string }[] = [
    { id: 'newest', label: dict.common.sortNewest },
    { id: 'price-asc', label: dict.common.sortPriceAsc },
    { id: 'price-desc', label: dict.common.sortPriceDesc },
    { id: 'name-asc', label: dict.common.sortNameAsc },
  ];

  return (
    <div className={styles.layout}>
      <button
        type="button"
        className={styles.panelToggle}
        onClick={() => setPanelOpen((open) => !open)}
        aria-expanded={panelOpen}
        aria-controls="filter-panel"
      >
        {dict.common.filters}
        {hasFilters && <span className={styles.filterDot} aria-hidden="true" />}
      </button>

      <aside
        id="filter-panel"
        className={`${styles.sidebar} ${panelOpen ? styles.sidebarOpen : ''}`}
        aria-label={dict.common.filters}
      >
        {!lockedCategory && availableCategories.length > 1 && (
          <fieldset className={styles.group}>
            <legend className="kicker">{dict.common.category}</legend>
            <div className={styles.options}>
              {availableCategories.map((category) => (
                <label key={category.id} className={styles.option}>
                  <input
                    type="checkbox"
                    checked={selected.categories.includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                  />
                  <span>{category.label[lang]}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <fieldset className={styles.group}>
          <legend className="kicker">
            {dict.common.priceMin} / {dict.common.priceMax}
          </legend>
          <div className={styles.priceRow}>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              className={`mono ${styles.priceInput}`}
              value={selected.min}
              placeholder="$"
              aria-label={dict.common.priceMin}
              onChange={(event) => setParam('min', event.target.value)}
            />
            <span className={styles.priceDash} aria-hidden="true">
              —
            </span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              className={`mono ${styles.priceInput}`}
              value={selected.max}
              placeholder="$"
              aria-label={dict.common.priceMax}
              onChange={(event) => setParam('max', event.target.value)}
            />
          </div>
        </fieldset>

        {hasFilters && (
          <button
            type="button"
            className={styles.clear}
            onClick={() => router.replace(pathname, { scroll: false })}
          >
            {dict.common.clearFilters}
          </button>
        )}
      </aside>

      <div className={styles.results}>
        <div className={styles.resultsBar}>
          <p className={`mono ${styles.count}`}>
            {filtered.length} {dict.common.results}
          </p>

          <label className={styles.sortLabel}>
            <span className="kicker">{dict.common.sort}</span>
            <select
              className={styles.sortSelect}
              value={selected.sort}
              onChange={(event) => setParam('sort', event.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ProductGrid products={filtered} lang={lang} dict={dict} />
      </div>
    </div>
  );
}

function parseList(value: string | null): string[] {
  return value ? value.split(',').filter(Boolean) : [];
}

function sortProducts(products: Product[], sort: SortId): Product[] {
  const sorted = [...products];
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price.amount - b.price.amount);
    case 'price-desc':
      return sorted.sort((a, b) => b.price.amount - a.price.amount);
    case 'name-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title, 'en'));
    case 'newest':
    default:
      return sorted.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }
}
