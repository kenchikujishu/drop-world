import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LANG, LANGS } from '@/content/taxonomy';

/**
 * 言語プレフィックスのないパスを /en または /ja に振り分ける。
 * ルートレイアウトが app/[lang]/layout.tsx にあるため、言語なしの URL は存在しない。
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLang = LANGS.some(
    (lang) => pathname === `/${lang}` || pathname.startsWith(`/${lang}/`),
  );
  if (hasLang) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${detectLang(request)}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

/** Accept-Language が日本語を優先していれば /ja、それ以外は既定言語。 */
function detectLang(request: NextRequest): string {
  const header = request.headers.get('accept-language') ?? '';
  const preferred = header
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of preferred) {
    if (tag.startsWith('ja')) return 'ja';
    if (tag.startsWith('en')) return 'en';
  }
  return DEFAULT_LANG;
}

export const config = {
  // 静的ファイル・画像・API・メタデータ系のルートは素通しする。
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|products/|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico|txt|xml)$).*)',
  ],
};
