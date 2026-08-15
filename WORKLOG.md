# 作業ログ

## 2026-08-15 — drop-world.com で公開

`wrangler login`（kenchikujishu@gmail.com）のうえで `npm run deploy`。
`wrangler.jsonc` の `routes` に custom_domain を書いてあるので、DNS レコードと
証明書も deploy 時に自動で用意された。ダッシュボードでの操作なし。

確認: 全ルート 200、`/` の言語振り分け 307、`www` → apex 301、商品6点表示、
zip ダウンロード可、sitemap が実ドメイン、HTTP/2 + TLS。

> 補足: 先に `--temporary` で出した URL は使い捨ての一時アカウントに載るもので、
> 短時間で消えた。動作確認以外には使わないこと。

---

## 2026-08-15 — サイトからの直接ダウンロードを実装、デモ公開

Lemon Squeezy の審査が通るまでは LS のファイル配信が使えないので、
**サイトから直接 zip を配る暫定モード**を入れた。

- 商品 JSON に `downloads`（`{ format, file }` の配列）を追加。
  `public/downloads/<slug>/` に置いた zip を指す
- 商品ページに DWG / AI のダウンロードボタンを表示。押すと zip が落ちる
- 表示するファイルサイズは **実ファイルから自動算出**（`content/products-index.ts` に埋め込む）。
  JSON に手で書くと zip 差し替え時に必ずズレるため
- 表示の優先順位は `checkoutUrl` > `downloads` > 販売準備中。
  **審査通過後は JSON に checkoutUrl を入れるだけで購入ボタンに切り替わる**
- `.gitignore` の `*.zip` に `public/downloads/` の例外を追加

デモを `npx wrangler deploy --temporary` で公開:
https://drop-world.honorable-jitterbug.workers.dev
（Cloudflare の一時アカウントなので期限あり。本番は Workers Builds + drop-world.com）

商品6点の zip は中身が README だけのダミー。実データが届いたら差し替える。

---

## 2026-08-15 — ホスティングを Cloudflare Workers に変更

ドメインを Cloudflare で取得済みだったため、Vercel をやめて Cloudflare に一本化した。

### やったこと

- **Next.js 14 → 15、React 18 → 19**。OpenNext のアダプタが Next 15 以上を要求するため。
  `params` / `searchParams` が Promise になったので、公式 codemod で全ページを await 形式に移行
- **Cloudflare Workers + [OpenNext](https://opennext.js.org/cloudflare)** を導入
  （`wrangler.jsonc` / `open-next.config.ts` / `public/_headers`）
- **`www` → apex の 301 リダイレクトを `middleware.ts` に実装**。
  Cloudflare 側でリダイレクトルールを作らずに済む
- プライバシーポリシーのホスティング事業者の記載を Vercel → Cloudflare に修正
- `docs/DEPLOY.md` を Workers Builds 版に全面書き換え

### 詰まったところ

**Cloudflare Workers にファイルシステムが無い。** `lib/products.ts` が
`fs.readdirSync` で商品 JSON を読んでいたため、Worker 上では商品0件のサイトになった
（`npm run dev` では正常に見えるので気づきにくい）。

→ `content/products-index.ts` を自動生成し、全 JSON を静的 import してバンドルに
埋め込む形に変更。索引は `npm run validate:products` が作り直し、生成物はコミットする。

**商品一覧ページの HTML に商品が1件も入っていなかった。** フィルタが `useSearchParams` を
使う client component で、Suspense の fallback が `null` だったため。
fallback を「絞り込み前の全件グリッド」に変更し、プリレンダー HTML に一覧が入るようにした
（検索エンジンと JS 無効時のため）。これは Vercel でも同じ状態だった。

### 確認したこと

`npm run preview`（実際の Worker）で全ルート 200、商品6点表示、絞り込み動作、
`www` リダイレクト実装、`npm run dev` も従来どおり動作。

---

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
