import type { Metadata } from 'next';
import LegalDocument from '@/components/LegalDocument';
import { LANGS, type Lang } from '@/content/taxonomy';
import { getDict } from '@/lib/i18n';
import { absoluteUrl } from '@/lib/site';

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export function generateMetadata({ params }: { params: { lang: Lang } }): Metadata {
  const dict = getDict(params.lang);
  return {
    title: dict.legal.refund.title,
    description: dict.legal.refund.lead,
    alternates: {
      canonical: absoluteUrl(`/${params.lang}/legal/refund`),
      languages: { en: absoluteUrl('/en/legal/refund'), ja: absoluteUrl('/ja/legal/refund') },
    },
  };
}

export default function RefundPage({ params }: { params: { lang: Lang } }) {
  const dict = getDict(params.lang);
  return (
    <LegalDocument
      kicker={dict.footer.legalHeading}
      doc={dict.legal.refund}
      updatedLabel={dict.legal.lastUpdatedLabel}
      updatedValue={dict.legal.lastUpdated}
    />
  );
}
