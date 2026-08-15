import type { Metadata } from 'next';
import LegalDocument from '@/components/LegalDocument';
import { LANGS, type Lang } from '@/content/taxonomy';
import { getDict } from '@/lib/i18n';
import { absoluteUrl } from '@/lib/site';

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata(props: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const params = await props.params;
  const dict = getDict(params.lang);
  return {
    title: dict.legal.terms.title,
    description: dict.legal.terms.lead,
    alternates: {
      canonical: absoluteUrl(`/${params.lang}/legal/terms`),
      languages: { en: absoluteUrl('/en/legal/terms'), ja: absoluteUrl('/ja/legal/terms') },
    },
  };
}

export default async function TermsPage(props: { params: Promise<{ lang: Lang }> }) {
  const params = await props.params;
  const dict = getDict(params.lang);
  return (
    <LegalDocument
      kicker={dict.footer.legalHeading}
      doc={dict.legal.terms}
      updatedLabel={dict.legal.lastUpdatedLabel}
      updatedValue={dict.legal.lastUpdated}
    />
  );
}
