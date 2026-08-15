import { defineCloudflareConfig } from '@opennextjs/cloudflare';

/**
 * OpenNext（Cloudflare アダプタ）の設定。
 *
 * このサイトは全ページ静的生成で ISR / オンデマンド再検証を使っていないため、
 * incrementalCache などのオーバーライドは不要。既定のままでよい。
 * 将来 ISR を使うなら R2 のインクリメンタルキャッシュをここで指定する。
 */
export default defineCloudflareConfig();
