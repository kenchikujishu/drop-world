import type { Dictionary } from '@/content/i18n/en';
import styles from './buy-button.module.css';

/**
 * 商品ページの購入パネル。購入ボタンは Lemon Squeezy のチェックアウトへの外部リンク。
 *
 * ストア審査前（テストモード）は、チェックアウトもテストモードで開き実際の決済は起きない。
 * その旨をパネル内に明記する。本番キーに切り替えると自動で消える。
 */
export default function BuyButton({
  checkoutUrl,
  price,
  testMode,
  dict,
}: {
  checkoutUrl: string;
  price: string;
  testMode: boolean;
  dict: Dictionary;
}) {
  return (
    <div className={styles.wrap}>
      <p className={`mono ${styles.price}`}>{price}</p>

      <a className="btn btn-block" href={checkoutUrl} target="_blank" rel="noopener noreferrer">
        {dict.common.buyNow}
      </a>

      <ul className={styles.perks}>
        <li>{dict.common.instantDownload}</li>
        <li>{dict.common.oneTimePayment}</li>
        <li>{dict.common.commercialUse}</li>
      </ul>

      {testMode ? (
        <>
          <p className={`${styles.pending} ${styles.testMode}`}>{dict.product.testModeLabel}</p>
          <p className={styles.note}>{dict.product.testModeNote}</p>
        </>
      ) : (
        <p className={styles.note}>{dict.common.buyNote}</p>
      )}
    </div>
  );
}
