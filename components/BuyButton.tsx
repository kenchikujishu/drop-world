import type { Dictionary } from '@/content/i18n/en';
import { formatLabel, type FormatId, type Lang } from '@/content/taxonomy';
import styles from './buy-button.module.css';

type Download = { format: FormatId; file: string; size?: string };

/**
 * 商品ページの購入 / ダウンロードパネル。表示は3通り:
 *
 *   1. checkoutUrl あり  → Lemon Squeezy のチェックアウトへ（正式公開後の姿）
 *   2. downloads あり    → サイトから直接ダウンロード（LS 審査が通るまでの暫定）
 *   3. どちらも無し      → 販売準備中
 *
 * checkoutUrl を優先しているので、審査通過後は商品 JSON に URL を入れるだけで
 * 購入ボタンに切り替わる。
 */
export default function BuyButton({
  checkoutUrl,
  downloads,
  price,
  dict,
  lang,
}: {
  checkoutUrl: string | null;
  downloads: Download[];
  price: string;
  dict: Dictionary;
  lang: Lang;
}) {
  if (checkoutUrl) {
    return (
      <div className={styles.wrap}>
        <p className={`mono ${styles.price}`}>{price}</p>

        <a className="btn btn-block" href={checkoutUrl} target="_blank" rel="noopener noreferrer">
          {dict.common.buyNow}
        </a>

        <Perks dict={dict} />
        <p className={styles.note}>{dict.common.buyNote}</p>
      </div>
    );
  }

  if (downloads.length > 0) {
    return (
      <div className={styles.wrap}>
        <p className={`mono ${styles.price}`}>{price}</p>

        <h2 className={`kicker ${styles.downloadHeading}`}>{dict.product.downloadHeading}</h2>

        <ul className={styles.downloads}>
          {downloads.map((download) => (
            <li key={download.file}>
              <a className={styles.downloadLink} href={download.file} download>
                <span className={styles.downloadFormat}>{formatLabel(download.format, lang)}</span>
                {download.size && <span className={`mono ${styles.downloadSize}`}>{download.size}</span>}
                <span className={styles.downloadIcon} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>

        {/* 購入まわりの訴求（買い切り等）は、直接配布中は噛み合わないので出さない。 */}
        <ul className={styles.perks}>
          <li>{dict.common.commercialUse}</li>
        </ul>
        <p className={styles.note}>{dict.product.downloadNote}</p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <p className={`mono ${styles.price}`}>{price}</p>
      <p className={styles.pending}>{dict.product.checkoutPending}</p>
      <p className={styles.note}>{dict.product.checkoutPendingNote}</p>
    </div>
  );
}

function Perks({ dict }: { dict: Dictionary }) {
  return (
    <ul className={styles.perks}>
      <li>{dict.common.instantDownload}</li>
      <li>{dict.common.oneTimePayment}</li>
      <li>{dict.common.commercialUse}</li>
    </ul>
  );
}
