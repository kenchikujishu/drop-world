# drop world

CAD 添景データ（人物・植栽・動物）を販売するストア。
決済とファイル配信は [Lemon Squeezy](https://www.lemonsqueezy.com/) が担当し、
このサイトはカタログと外部チェックアウトへの導線に徹する。

日英バイリンガル（`/en` `/ja`）、全ページ静的生成、DB なし。
本番: https://drop-world.com（Cloudflare Workers + OpenNext）

```bash
npm install
npm run dev        # http://localhost:3000 … 普段の開発
npm run preview    # http://localhost:8787 … 本番と同じ Worker で確認
```

## ドキュメント

| | |
| --- | --- |
| [CLAUDE.md](CLAUDE.md) | 技術構成・設計の決め事・残タスク |
| [docs/ADD_PRODUCT.md](docs/ADD_PRODUCT.md) | 商品を1点追加する手順 |
| [docs/DEPLOY.md](docs/DEPLOY.md) | Cloudflare Workers + ドメイン（drop-world.com）のセットアップ |
| [docs/LEMON_SETUP.md](docs/LEMON_SETUP.md) | 審査に出す前のチェックリスト / 通過後の API 連携 |

## スクリプト

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー（Next.js） |
| `npm run preview` | 本番と同じ Cloudflare Worker をローカルで起動 |
| `npm run new:product` | 商品を対話的に追加 |
| `npm run validate:products` | 商品JSONと画像の検査 + 索引の再生成 |
| `npm run build` | 検査 → Next.js のビルド |
| `npm run cf:build` | 検査 → Worker のバンドルまで |
| `npm run deploy` | 手元から直接デプロイ |
| `node scripts/generate-artwork.mjs` | 商品サムネイルの添景イラストを再生成 |

## 構成

```
content/
  taxonomy.ts          カテゴリ・視点・フォーマットの定義（増やすときはここだけ）
  i18n/{en,ja}.ts      UI文言と法務ページ本文（en.ts が型の正）
  products/*.json      商品データ（1商品1ファイル）
  products-index.ts    ↑を静的importする自動生成の索引（Workers に fs が無いため）
  tokushoho.ts         特定商取引法に基づく表記
lib/
  products.ts          商品データの読み込み
  product-schema.ts    zod スキーマ
  pricing.ts           ★ 審査通過後の LS API 差し替え点
app/[lang]/            ルートレイアウト兼全ページ（app/layout.tsx は無い）
public/products/<slug>/  サムネイル画像
wrangler.jsonc         Cloudflare Worker の設定
open-next.config.ts    OpenNext アダプタの設定
```
