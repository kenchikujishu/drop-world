# 作業ログ

## 2026-08-15 — 初期構築（Lemon Squeezy 審査用）

Next.js 14 + TypeScript で新規構築。`~/Desktop/map` と同じ流儀（CSS変数トークン +
CSS Modules、Vercel 自動デプロイ）に揃えた。

### つくったもの

- **サイト構造** — ホーム / 商品一覧 / 商品詳細 / カテゴリ別 / ライセンス / FAQ /
  About / Contact / 利用規約 / プライバシー / 返金ポリシー / 特商法表記。日英2言語で計53ページ
- **i18n** — `app/[lang]/layout.tsx` をルートレイアウトにする Next.js 標準の構成。
  `/` は middleware が Accept-Language で振り分け。`en.ts` を型の正にして日本語側の記述漏れを
  コンパイルエラーで拾う
- **商品データ層** — `content/products/*.json` に1商品1ファイル。zod で検証し、
  `npm run build` の前に `validate:products` が走る（画像の実在まで確認する）
- **絞り込み** — カテゴリ × 視点 × 形式 × 価格帯 + ソート。状態は URL クエリだけに持つので、
  絞り込んだ結果を共有できる。ページ自体は静的のまま、絞り込みはブラウザ側
- **審査対応** — LS が確認する項目（明確な商品説明・価格・連絡先・返金/規約/プライバシー・
  IP保有の明示・役務提供でないこと）を各ページの本文に落とし込んだ
- **商品追加フロー** — `npm run new:product` で JSON 雛形と画像フォルダを生成。
  手順書は `docs/ADD_PRODUCT.md`

### 決めたこと

- **価格は JSON の静的値**。審査後の LS API 連携は `lib/pricing.ts` の `resolvePrice()`
  1関数を差し替えるだけで済むようにした（呼び出し側は無変更）
- **zip はリポジトリに入れない**。ファイル配信は LS のストレージが担うため。
  Git に入れるのはサムネイル画像だけ
- **通貨は JPY**。LS ストア側の通貨と揃える必要がある

### 仮のまま残っているもの

- 商品6点はすべて仮データ。サムネイルは `scripts/generate-placeholders.mjs` が生成した
  SVG で、右下に `PREVIEW PENDING` と入れてある（差し替え忘れが一目で分かるように）
- 全商品の `checkoutUrl` が `null` → サイト上は「販売準備中」
- `content/tokushoho.ts` の販売業者 / 運営責任者 / 所在地 / 電話番号が空
- `NEXT_PUBLIC_SITE_URL` と `NEXT_PUBLIC_SUPPORT_EMAIL` が仮の値

→ 審査に出す前の対応一覧は `docs/LEMON_SETUP.md`

### 確認したこと

- `npm run build` で53ページが静的生成される
- `/` が Accept-Language に応じて `/en` / `/ja` へ 307
- 絞り込みが URL クエリに反映され、結果件数が正しい（`?category=people` → 2件）
- 言語スイッチが同じページのまま `/en` ↔ `/ja` を移動する
- モバイル幅 375px で横スクロールが出ない。ハンバーガーメニューが開閉する
- ブラウザのコンソールエラーなし
