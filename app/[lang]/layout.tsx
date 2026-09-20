import type { Metadata } from 'next';
import { Archivo, IBM_Plex_Mono, Zen_Kaku_Gothic_New } from 'next/font/google';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { LANGS, isLang, type Lang } from '@/content/taxonomy';
import { getDict } from '@/lib/i18n';
import { getCategoryCounts, getSubcategoryCounts } from '@/lib/products';
import { absoluteUrl, siteConfig } from '@/lib/site';
import '../globals.css';

/** app/layout.tsx は置かない。このファイルがルートレイアウト（html / body を持つ）。 */

const display = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-display',
  display: 'swap',
});

const body = Zen_Kaku_Gothic_New({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-body',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const dict = getDict(lang);

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${dict.meta.siteName} — ${dict.meta.tagline}`,
      template: `%s — ${dict.meta.siteName}`,
    },
    description: dict.meta.description,
    alternates: {
      canonical: absoluteUrl(`/${lang}`),
      languages: { en: absoluteUrl('/en'), ja: absoluteUrl('/ja') },
    },
    openGraph: {
      type: 'website',
      siteName: dict.meta.siteName,
      title: `${dict.meta.siteName} — ${dict.meta.tagline}`,
      description: dict.meta.description,
      locale: lang === 'ja' ? 'ja_JP' : 'en_US',
      url: absoluteUrl(`/${lang}`),
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  /** Next.js 15 から params は Promise。使う前に await する。 */
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;

  if (!isLang(rawLang)) notFound();
  const lang = rawLang as Lang;
  const dict = getDict(lang);
  const categoryCounts = getCategoryCounts();

  return (
    <html lang={lang} className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <a href="#main" className="sr-only">
          {dict.nav.skipToContent}
        </a>
        <div className="pageShell">
          <Header
            lang={lang}
            dict={dict}
            categoryCounts={categoryCounts}
            subcategoryCounts={getSubcategoryCounts()}
          />
          <main id="main">{children}</main>
          <Footer lang={lang} dict={dict} categoryCounts={categoryCounts} />
        </div>
      </body>
    </html>
  );
}
