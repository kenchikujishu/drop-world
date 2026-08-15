import type { Dictionary } from '@/content/i18n/en';
import styles from './buy-button.module.css';

/**
 * Lemon Squeezy のチェックアウトへの外部リンク。
 * checkoutUrl が未設定（LS 側に商品を作る前）の場合は「販売準備中」を表示する。
 */
export default function BuyButton({
  checkoutUrl,
  price,
  dict,
}: {
  checkoutUrl: string | null;
  price: string;
  dict: Dictionary;
}) {
  if (!checkoutUrl) {
    return (
      <div className={styles.wrap}>
        <p className={`mono ${styles.price}`}>{price}</p>
        <p className={styles.pending}>{dict.product.checkoutPending}</p>
        <p className={styles.note}>{dict.product.checkoutPendingNote}</p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <p className={`mono ${styles.price}`}>{price}</p>

      <a
        className="btn btn-block"
        href={checkoutUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {dict.common.buyNow}
      </a>

      <ul className={styles.perks}>
        <li>{dict.common.instantDownload}</li>
        <li>{dict.common.oneTimePayment}</li>
        <li>{dict.common.commercialUse}</li>
      </ul>

      <p className={styles.note}>{dict.common.buyNote}</p>
    </div>
  );
}
