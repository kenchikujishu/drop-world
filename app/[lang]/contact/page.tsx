import type { Metadata } from 'next';
import Link from 'next/link';
import { LANGS, type Lang } from '@/content/taxonomy';
import { getDict, href } from '@/lib/i18n';
import { absoluteUrl, siteConfig } from '@/lib/site';
import styles from './contact.module.css';

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export function generateMetadata({ params }: { params: { lang: Lang } }): Metadata {
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

export default function ContactPage({ params }: { params: { lang: Lang } }) {
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
