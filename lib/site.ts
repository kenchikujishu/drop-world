/**
 * サイト全体の設定。環境変数が未設定でも動くよう、開発用の既定値を持たせている。
 * 本番では Cloudflare の Build variables に設定する（NEXT_PUBLIC_* はビルド時に埋め込まれるため）。
 */

export const siteConfig = {
  name: 'drop world',

  /** 本番ドメイン。sitemap / robots / OGP / 構造化データが参照する。 */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://drop-world.com',

  /**
   * サポート窓口。Contact ページ・特商法ページ・フッターに表示される。
   * ⚠ このアドレスで実際にメールを受け取れる状態にすること
   *   （Cloudflare の Email Routing で Gmail 等へ転送するのが手軽）。
   */
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@drop-world.com',

  /** Lemon Squeezy のストア URL（審査通過後に確定）。 */
  lemonStoreUrl: process.env.NEXT_PUBLIC_LEMON_STORE_URL ?? 'https://drop-world.lemonsqueezy.com',
} as const;

export function absoluteUrl(path = ''): string {
  return `${siteConfig.url.replace(/\/$/, '')}${path}`;
}
