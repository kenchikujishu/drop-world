/**
 * サイト全体の設定。環境変数が未設定でも動くよう、開発用の既定値を持たせている。
 * 本番では Vercel の Environment Variables に設定する。
 */

export const siteConfig = {
  name: 'drop world',

  /** 独自ドメインを繋いだら NEXT_PUBLIC_SITE_URL を書き換える。sitemap / robots / OGP が参照する。 */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dropworld.vercel.app',

  /** サポート窓口。Contact ページと法務ページに表示される。 */
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@dropworld.example',

  /** Lemon Squeezy のストア URL（審査通過後に確定）。 */
  lemonStoreUrl: process.env.NEXT_PUBLIC_LEMON_STORE_URL ?? 'https://dropworld.lemonsqueezy.com',
} as const;

export function absoluteUrl(path = ''): string {
  return `${siteConfig.url.replace(/\/$/, '')}${path}`;
}
