import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

/**
 * OpenNext（Cloudflare アダプタ）の設定。
 *
 * このサイトは全ページをビルド時に生成し、再検証（ISR）は使わない。
 * そこで、ビルド時に作ったページを Workers の静的アセットからそのまま返す。
 *
 * ⚠ 既定（キャッシュなし）のままだと、アクセスのたびに Worker が React でページを組み立て直し、
 *   無料プランの CPU 上限（1リクエスト 10ms）を超えて Error 1102 が断続的に出た（2026-09-15）。
 *
 * - incrementalCache: 生成済みページを静的アセットから読む（読み取り専用。再検証はできない）
 * - enableCacheInterception: キャッシュにあるページはサーバー処理を読み込まずに返す
 */
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
