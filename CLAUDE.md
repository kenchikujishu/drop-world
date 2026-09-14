# drop world

CAD 添景データ（人物・植栽・動物）を販売するストア。**二人で運営**している。
決済・ファイル配信・税務は **Lemon Squeezy（以下 LS）** が担い、このサイトは
「LS に登録された商品のカタログ ＋ LS のチェックアウトへの導線」。

## いまの状況

- **LS のストア審査前。審査を通すことが最優先**
- 審査前は LS の**テストモード**で商品と価格を作り、サイトはテストモードの API キーで取り込む。
  審査が通ったら本番キーに差し替えるだけ → `docs/GOING_LIVE.md`
- 公開中: https://drop-world.com（Cloudflare Workers / アカウント kenchikujishu@gmail.com）
- リポジトリ: `kenchikujishu/drop-world`

## 商品データの流れ（最重要）

**商品の出どころは LS だけ。リポジトリに商品データは置かない。**

```
二人が LS に投稿（商品名・価格・説明・画像・zip → Publish）
  → scripts/lemon-sync.mjs が LS API から取り込む（npm run build の前に自動で走る）
  → content/catalog.generated.json（gitignore）
  → next build で全ページを静的生成
  → Cloudflare Workers
```

- **反映**: GitHub Actions（`.github/workflows/deploy.yml`）が push・1時間ごと・手動の3通りでデプロイ
- **公開中の Worker は API キーを持たず、LS と通信しない。** 商品データはビルド時に JSON として焼き込む
  （Workers にファイルシステムが無い問題も、LS 障害時にサイトが落ちる問題もこれで避けている）
- **LS と商品の紐付けは、商品名の先頭の品番 `DW-<記号>-<3桁>`。LS の ID は使わない。**
  テスト→本番へのコピーで ID とチェックアウト URL は変わるが、品番は変わらないため
- 品番を小文字にしたものが URL（`/products/dw-ppl-001`）。**品番は一度付けたら変えない**
- カテゴリ記号は `content/categories.json`（PPL / VEG / ANM）。取り込みスクリプトとサイトで共有するため JSON
- 説明文の `Figures: 6` / `Formats: DWG, AI` の行は仕様として抜き出し、本文からは除く
- 説明文の HTML は描画しない（テキストにして段落へ分ける）
- 二人の番号の衝突を避けるため、オーナー 001〜499 / 相方 501〜999 と帯を分けている。
  重複したら後から更新された方を採用し、警告を出す

### 失敗させる条件（意図的）

| 状況 | `npm run dev` | `npm run build` 以降 |
| --- | --- | --- |
| API キーが無い | 見本データ（`content/lemon-fixture.json`）で動く | **失敗** |
| LS に接続できない / キーが無効 | 失敗 | **失敗** |
| 公開中の商品が0件 | 空で動く | **失敗** |

本番で失敗しても、公開中のサイトは前回のまま残る。偽物・空・古い価格のカタログを出さないための設計。
検証目的で見本データのままビルドしたいときだけ `DW_ALLOW_FIXTURE=1` を付ける。

`content/lemon-fixture.json` は LS API の返り値と同じ形にしてあり、取り込み処理のテストにも使える。

二人向けの運用手順は `docs/POSTING.md`。

## 技術構成

- **Next.js 15 (App Router) + TypeScript + React 19**
- **Cloudflare Workers**（[OpenNext](https://opennext.js.org/cloudflare) アダプタ）、デプロイは GitHub Actions
- **スタイリング**: `app/globals.css` の CSS 変数トークン + ルートごとの `*.module.css`（Tailwind は使わない）
- **日英対応**: `app/[lang]` がルートレイアウト、`/` は middleware が振り分け。
  UI の文言は `content/i18n/{en,ja}.ts`。**商品の文言は LS に書いた英語のまま両言語で出す**

### Cloudflare Workers の地雷

**実行時に `fs` を呼ばない。** `npm run dev`（Node）では動くのに本番で壊れる。
本番に出す前の確認は `npm run preview`（実際の Worker が起動する）で行う。

### Next.js 15 の作法

`params` は Promise。ページ / レイアウト / `generateMetadata` では `const { lang } = await params;` のように待ってから使う。

## デザインの決め事

ミニマル・建築系。

- 面ではなく 1px の罫線で領域を分ける。影はほぼ使わない
- `--accent`（ネイビー #1F3A5F）は CTA とリンク専用
- 数値・品番・ファイル形式はモノスペース（`.mono`）
- 商品画像は正方形（LS の商品画像が 1000×1000 のため、カード・ギャラリーとも 1:1）
- ヒーローは「DROP WORLD」のワードマークだけ。キャッチコピーは置かない（オーナーの指示）

## i18n

- `content/i18n/en.ts` が型の正。`ja.ts` は `Dictionary` 型に合わせるので、項目を足すと日本語側の漏れがコンパイルエラーになる
- en.ts に `as const` を付けない（文字列がリテラル型になり日本語が書けなくなる）

## コマンド

```bash
npm run dev                              # LS から取り込み（キーが無ければ見本データ）→ next dev
npm run lemon:check                      # LS の商品がサイトにどう出るかを表で確認（出ない商品と理由も）
npm run export:thumbs -- <ファイル.ai>   # LS にアップする正方形の商品画像（2000px）を書き出す
npm run preview                          # 本番と同じ Worker をローカルで起動（キー必須）
npm run deploy                           # 手元から直接デプロイ（キー必須。通常は GitHub Actions に任せる）
```

ローカルのキーは `.env.local`（`.env.local.example` をコピー）。

## GitHub Actions のシークレット

`LEMONSQUEEZY_API_KEY` / `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID`。
未登録ならデプロイを飛ばして warning を出す（赤くはしない）。

- 公開リポジトリは **60日間 push が無いと schedule の自動実行が止まる**。止まったら Actions で再有効化

## 審査前の残タスク

- [ ] LS: テストモードで商品を作る（harajuku.ai の3点。画像は `~/Desktop/drop-world-lemon-upload/harajuku/`、文言は `docs/POSTING.md` 末尾）
- [ ] LS: テストモードの API キーを作る
- [ ] GitHub: シークレット3つを登録 → 初回デプロイ
- [ ] LS: 相方を Teams に招待
- [ ] `support@drop-world.com` を受信できるようにする（Cloudflare Email Routing）
- [ ] 特定商取引法の表記の空欄（`content/tokushoho.ts`）
- [ ] LS のストア設定（ストア URL = drop-world.com、サポートメール）→ Activate your store

詳細は `docs/LEMON_SETUP.md`。

## 経緯メモ

- `~/Downloads/DROP_WORLD_BRIEF.md`（2026-08-15）は Astro 前提の別案の仕様書。現行サイトには採用していない。
  「品番で LS と紐付け、価格は LS を正とする」という考え方だけ取り入れた
- 以前は商品 JSON をリポジトリに置き、SVG の添景イラストを自動生成していたが、品質が足りず廃止した。
  商品画像は必ず二人が作図した実データを使う
