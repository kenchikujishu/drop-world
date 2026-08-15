import type { Metadata } from 'next';
import { LANGS, type Lang } from '@/content/taxonomy';
import { getDict } from '@/lib/i18n';
import { absoluteUrl } from '@/lib/site';
import styles from './faq.module.css';

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export function generateMetadata({ params }: { params: { lang: Lang } }): Metadata {
  const dict = getDict(params.lang);
  return {
    title: dict.faq.title,
    description: dict.faq.lead,
    alternates: {
      canonical: absoluteUrl(`/${params.lang}/faq`),
      languages: { en: absoluteUrl('/en/faq'), ja: absoluteUrl('/ja/faq') },
    },
  };
}

export default function FaqPage({ params }: { params: { lang: Lang } }) {
  const dict = getDict(params.lang);
  const allItems = dict.faq.groups.flatMap((group) => group.items);

  return (
    <>
      <div className="pageHeader">
        <div className="container">
          <p className="kicker">{dict.nav.faq}</p>
          <h1>{dict.faq.title}</h1>
          <p className="lead">{dict.faq.lead}</p>
        </div>
      </div>

      <div className={`container-narrow ${styles.body}`}>
        {dict.faq.groups.map((group) => (
          <section key={group.heading} className={styles.group}>
            <h2 className={styles.groupHeading}>{group.heading}</h2>
            <dl className={styles.list}>
              {group.items.map((item) => (
                <div key={item.q} className={styles.item}>
                  <dt className={styles.question}>{item.q}</dt>
                  <dd className={styles.answer}>{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: allItems.map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: { '@type': 'Answer', text: item.a },
            })),
          }),
        }}
      />
    </>
  );
}
