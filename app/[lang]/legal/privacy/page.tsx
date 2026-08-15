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
    title: dict.legal.privacy.title,
    description: dict.legal.privacy.lead,
    alternates: {
      canonical: absoluteUrl(`/${params.lang}/legal/privacy`),
      languages: { en: absoluteUrl('/en/legal/privacy'), ja: absoluteUrl('/ja/legal/privacy') },
    },
  };
}

export default async function PrivacyPage(props: { params: Promise<{ lang: Lang }> }) {
  const params = await props.params;
  const dict = getDict(params.lang);
  return (
    <LegalDocument
      kicker={dict.footer.legalHeading}
      doc={dict.legal.privacy}
      updatedLabel={dict.legal.lastUpdatedLabel}
      updatedValue={dict.legal.lastUpdated}
    />
  );
}
