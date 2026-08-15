import type { Metadata } from 'next';
import Link from 'next/link';
import { TOKUSHOHO_ROWS } from '@/content/tokushoho';
import { LANGS, type Lang } from '@/content/taxonomy';
import { getDict, href } from '@/lib/i18n';
import { absoluteUrl, siteConfig } from '@/lib/site';
import styles from './tokushoho.module.css';

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata(props: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const params = await props.params;
  const dict = getDict(params.lang);
  return {
    title: dict.legal.tokushoho.title,
    description: dict.legal.tokushoho.lead,
    alternates: {
      canonical: absoluteUrl(`/${params.lang}/legal/tokushoho`),
      languages: {
        en: absoluteUrl('/en/legal/tokushoho'),
        ja: absoluteUrl('/ja/legal/tokushoho'),
      },
    },
  };
}

/** 事業者情報のプレースホルダーを実際の値に差し替える。 */
function fill(value: string): string {
  return value
    .replace('__SUPPORT_EMAIL__', siteConfig.supportEmail)
    .replace('__SITE_URL__', siteConfig.url);
}

export default async function TokushohoPage(props: { params: Promise<{ lang: Lang }> }) {
  const params = await props.params;
  const { lang } = params;
  const dict = getDict(lang);

  return (
    <>
      <div className="pageHeader">
        <div className="container">
          <p className="kicker">{dict.footer.legalHeading}</p>
          <h1>{dict.legal.tokushoho.title}</h1>
          <p className="lead">{dict.legal.tokushoho.lead}</p>
          {lang === 'en' && (
            <p className={styles.jaLink}>
              <Link href={href('ja', '/legal/tokushoho')}>{dict.legal.tokushoho.viewJa} →</Link>
            </p>
          )}
        </div>
      </div>

      <div className={`container-narrow ${styles.body}`}>
        <dl className={styles.table}>
          {TOKUSHOHO_ROWS.map((row) => (
            <div key={row.label} className={styles.row}>
              <dt>{row.label}</dt>
              <dd>
                {row.value ? (
                  <span>{fill(row.value)}</span>
                ) : (
                  <span className={styles.missing}>（記載準備中）</span>
                )}
                {row.note && <span className={styles.note}>{row.note}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  );
}
