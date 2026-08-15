# drop world

CAD 添景データ（人物・植栽・家具・車両など）を販売するストア。決済とファイル配信は
**Lemon Squeezy（以下 LS）** に任せ、このサイトは「カタログ + 外部チェックアウトへの導線」に徹する。

## いまの状況

**LS のストア審査を通すためのサイト。** 審査通過後に LS の API から価格を自動取得する構成へ移行する。
移行の差し替え点は `lib/pricing.ts` の `resolvePrice()` 1関数に閉じてある。

商品は6点入っているが、いずれも **仮データ + プレースホルダー画像**（`PREVIEW PENDING` の文字入り）。
審査に出す前に実データへ差し替えること。→ `docs/LEMON_SETUP.md`

## 技術構成

- **Next.js 15 (App Router) + TypeScript + React 19**
- **ホスティング**: Cloudflare Workers（[OpenNext](https://opennext.js.org/cloudflare) アダプタ）
- **DB なし。全ページ静的生成（SSG）**。商品は `content/products/*.json` をビルド時に読むだけ
- **スタイリング**: `app/globals.css` の CSS 変数トークン + ルートごとの `*.module.css`（Tailwind は使わない）
- **フォント**: Archivo（英字見出し）/ Zen Kaku Gothic New（日本語本文）/ IBM Plex Mono（数値・寸法・ファイル名）
- **バリデーション**: zod（`lib/product-schema.ts`）

### Cloudflare Workers で踏んではいけない地雷

**Workers にファイルシステムは無い。実行時に `fs` を呼ぶコードを書かないこと。**

`npm run dev`（Node）では動くのに本番で壊れる、という形で出る。実際、商品データを
`fs.readdirSync` で読んでいたときは、Worker 上で商品0件のサイトになった。

いまは `content/products-index.ts`（自動生成）が全 JSON を静的 import しており、
ビルド時にバンドルへ埋め込まれる。索引は `npm run validate:products` が作り直す。
**この生成物は Git にコミットする**（クローン直後に `npm run dev` が動くように）。

本番に出す前は `npm run dev` ではなく **`npm run preview`**（実際の Worker が起動する）で確認する。

### Next.js 15 の作法

`params` と `searchParams` は Promise。ページ / レイアウト / `generateMetadata` では
`const { lang } = await params;` のように await してから使う。

## デザインの決め事

ミニマル・建築系。

- **面ではなく 1px の罫線で領域を分ける。影はほぼ使わない**
- `--accent`（ブループリント・ネイビー #1F3A5F）は **CTA とリンクの専用色**。装飾に使わない
- **数値・ファイル名・寸法は必ずモノスペース**（`.mono` クラス / `--font-mono`）
- ダークモードは未対応（審査に不要。後から `prefers-color-scheme` で足せる）

## i18n

- **`app/[lang]/layout.tsx` がルートレイアウト**（`app/layout.tsx` は置かない）
- `/` は `middleware.ts` が Accept-Language を見て `/en` か `/ja` へ 307 リダイレクト
- 文言は `content/i18n/en.ts` が型の正。`ja.ts` は `Dictionary` 型に適合させるので、
  **項目を足したら日本語側もコンパイルエラーで教えてくれる**
- en.ts に `as const` を付けてはいけない（文字列がリテラル型になり ja が書けなくなる）

## カテゴリ・視点・フォーマット

`content/taxonomy.ts` **1ファイルが正**。ナビ、フィルタ、バリデーション、サイトマップが全部ここを見ている。
増やすときはここだけ編集する。

スクリプト（`.mjs`）は TS を import できないので、`scripts/taxonomy-ids.mjs` が
taxonomy.ts の `const X_IDS = [...] as const;` を正規表現で読み出している。**この書式は崩さないこと。**

## 商品を追加する

```bash
npm run new:product
```

→ 手順の詳細は `docs/ADD_PRODUCT.md`

**zip はリポジトリに入れない**（`.gitignore` で弾いている）。ファイル配信は LS のストレージが担う。
Git に入れるのはサムネイル画像（`public/products/<slug>/`）だけ。

## ローカル開発

```bash
npm install
npm run dev                 # http://localhost:3000 … 普段の開発
npm run preview             # http://localhost:8787 … 本番と同じ Worker で確認
npm run validate:products   # 商品JSONの検査 + 索引の再生成（build 前に自動で走る）
npm run build               # Next.js のビルドだけ
npm run cf:build            # Worker のバンドルまで
npm run deploy              # 手元から直接デプロイ
```

`npm run build` は `validate:products` → `next build` の順。壊れた商品 JSON は
ビルドが通らないので、そのままデプロイされることはない。

ローカルの環境変数は `.env.local`（Git 管理外、`.env.local.example` を複製して作る）。
既定値が本番と同じなので、未設定でも動く:

- `NEXT_PUBLIC_SITE_URL` — 公開 URL。sitemap / robots / OGP / 構造化データが参照
- `NEXT_PUBLIC_SUPPORT_EMAIL` — サポート窓口。Contact と特商法ページに出る
- `NEXT_PUBLIC_LEMON_STORE_URL` — LS のストア URL

## デプロイ

- **リポジトリ**: `kenchikujishu/drop-world`
- **本番**: https://drop-world.com（ドメイン・DNS・ホスティング・メールすべて Cloudflare）
- GitHub の `main` に push → **Workers Builds が自動デプロイ**（手動作業は不要）
- `NEXT_PUBLIC_*` はビルド時に埋め込まれるので、Cloudflare の **Build variables** に入れる
  （実行時の Variables ではない）

初期セットアップ（Workers Builds の接続、カスタムドメイン、Email Routing）は `docs/DEPLOY.md`。

## 未対応・残タスク

- `content/tokushoho.ts` の `value: ''` の項目（販売業者 / 運営責任者 / 所在地 / 電話番号）が空。
  サイト上は赤い「（記載準備中）」として表示される。**国内向け販売の前に埋めること**
- 全商品の `checkoutUrl` が `null`（サイト上は「販売準備中」）。LS 側で商品を作ってから貼る
- 商品のサムネイルがプレースホルダー SVG（`scripts/generate-placeholders.mjs` 生成）
