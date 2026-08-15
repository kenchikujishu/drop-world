import type { Metadata } from 'next';
import Prose from '@/components/Prose';
import { LANGS, type Lang } from '@/content/taxonomy';
import { getDict } from '@/lib/i18n';
import { absoluteUrl } from '@/lib/site';

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export function generateMetadata({ params }: { params: { lang: Lang } }): Metadata {
  const dict = getDict(params.lang);
  return {
    title: dict.about.title,
    description: dict.about.lead,
    alternates: {
      canonical: absoluteUrl(`/${params.lang}/about`),
      languages: { en: absoluteUrl('/en/about'), ja: absoluteUrl('/ja/about') },
    },
  };
}

export default function AboutPage({ params }: { params: { lang: Lang } }) {
  const dict = getDict(params.lang);

  return (
    <>
      <div className="pageHeader">
        <div className="container">
          <p className="kicker">{dict.meta.siteName}</p>
          <h1>{dict.about.title}</h1>
          <p className="lead">{dict.about.lead}</p>
        </div>
      </div>

      <div className="container-narrow prose">
        <Prose sections={dict.about.sections} />
      </div>
    </>
  );
}
