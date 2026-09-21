import Link from 'next/link';
import { VIEWS, subjectLabel, type Lang } from '@/content/taxonomy';
import type { Dictionary } from '@/content/i18n/en';
import { isSceneSet, type Product } from '@/lib/products';
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

  // 投影法はナビゲーションに出さず、カードのバッジで見せる。
  // 1種類だけのときは「Plan only／平面のみ」と明示する（買ってから気づく事故を防ぐ）。
  const views = VIEWS.filter((view) => product.views.includes(view.id));
  const viewBadges =
    views.length === 1
      ? [lang === 'ja' ? `${views[0].label.ja}のみ` : `${views[0].label.en} only`]
      : views.map((view) => view.label[lang]);
  const subject = product.contains[0];

  return (
    <article className={styles.card}>
      <Link href={href(lang, `/products/${product.slug}`)} className={styles.link}>
        <div className={styles.thumb}>
          {product.image && (
            // 画像は Lemon の CDN から。next/image の最適化は Workers で使わないので素の img。
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image} alt="" width={1000} height={1000} loading="lazy" />
          )}
          {/* 2枚目があるときだけ、カーソルを合わせるとふわっと切り替わる（CSS の opacity）。
              タッチ端末では hover が無いので1枚目のまま。 */}
          {product.hoverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={styles.thumbHover}
              src={product.hoverImage}
              alt=""
              width={1000}
              height={1000}
              loading="lazy"
              aria-hidden="true"
            />
          )}
        </div>

        <div className={styles.body}>
          <p className={`mono ${styles.views}`}>
            {product.sku}
            {subject ? ` · ${subjectLabel(subject, lang)}` : ''}
          </p>
          <h3 className={styles.title}>{product.title}</h3>

          {(viewBadges.length > 0 || isSceneSet(product)) && (
            <div className={styles.badges}>
              {isSceneSet(product) && (
                <span className={`mono ${styles.badge} ${styles.badgeStrong}`}>
                  {dict.browse.sceneSet}
                </span>
              )}
              {viewBadges.map((badge) => (
                <span key={badge} className={`mono ${styles.badge}`}>
                  {badge}
                </span>
              ))}
            </div>
          )}
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
