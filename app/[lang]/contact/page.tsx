import type { Metadata } from 'next';
import Link from 'next/link';
import { LANGS, type Lang } from '@/content/taxonomy';
import { getDict, href } from '@/lib/i18n';
import { absoluteUrl, siteConfig } from '@/lib/site';
import styles from './contact.module.css';

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata(props: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const params = await props.params;
  const dict = getDict(params.lang);
  return {
    title: dict.contact.title,
    description: dict.contact.lead,
    alternates: {
      canonical: absoluteUrl(`/${params.lang}/contact`),
      languages: { en: absoluteUrl('/en/contact'), ja: absoluteUrl('/ja/contact') },
    },
  };
}

export default async function ContactPage(props: { params: Promise<{ lang: Lang }> }) {
  const params = await props.params;
  const { lang } = params;
  const dict = getDict(lang);

  return (
    <>
      <div className="pageHeader">
        <div className="container">
          <p className="kicker">{dict.nav.contact}</p>
          <h1>{dict.contact.title}</h1>
          <p className="lead">{dict.contact.lead}</p>
        </div>
      </div>

      <div className={`container-narrow ${styles.body}`}>
        <dl className={styles.details}>
          <div className={styles.row}>
            <dt>{dict.contact.emailLabel}</dt>
            <dd>
              <a href={`mailto:${siteConfig.supportEmail}`} className={`mono ${styles.email}`}>
                {siteConfig.supportEmail}
              </a>
            </dd>
          </div>

          <div className={styles.row}>
            <dt>{dict.contact.hoursLabel}</dt>
            <dd>{dict.contact.hoursValue}</dd>
          </div>

          <div className={styles.row}>
            <dt>{dict.contact.orderLabel}</dt>
            <dd>{dict.contact.orderValue}</dd>
          </div>

          {/* 誰から買うのかを英語圏の購入者にも示す（Lemon Squeezy の審査でも見られる）。
              詳しい事業者情報は特商法のページ。 */}
          <div className={styles.row}>
            <dt>{dict.contact.businessLabel}</dt>
            <dd>{dict.contact.businessValue}</dd>
          </div>
        </dl>

        <section className={styles.aside}>
          <h2 className={styles.asideTitle}>{dict.contact.beforeYouWrite}</h2>
          <p className={styles.asideBody}>{dict.contact.beforeYouWriteBody}</p>
          <Link href={href(lang, '/faq')} className="btn btn-outline">
            {dict.contact.faqLink}
          </Link>
        </section>
      </div>
    </>
  );
}
