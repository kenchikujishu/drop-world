# 作業ログ

## 2026-09-21 — 分類をリポジトリ側に移し、URL を短くした

オーナーから仕様書。**Lemon には分類を持たせず、リポジトリで管理する**方針に変更。
仕様書は Astro 前提（実物は Next.js）、Lemon の ID で紐付ける前提（実物は品番）だったので、
違いを報告して判断をもらってから実装した。

### 決まったこと

- 分類は **`content/tags.json`（品番 → タグ）の1ファイル**にまとめる。GitHub の Web 画面で編集できる
- Lemon との紐付けは**品番のまま**（Copy to Live Mode で LS の ID は全部変わるため）
- 品番は `DW-` を維持。家具の記号は `FRN` → **`FUR`**、シーンパック **`SCN`** を追加
- URL は `/categories/people` → **`/people/`** に短縮（旧 URL は middleware で 301）

### 分類の形

`content/taxonomy.json` に5軸。`contains` / `origin` / `action` / `scene` / `views`。
**`contains` は複数可** なので、被写体が混ざるシーンパックを人物にも家具にも出せる。
tags.json に語彙外の値があると**取り込みが失敗する**（打ち間違いを公開しないため）。

### ページ

| URL | 中身 |
| --- | --- |
| `/[lang]/people/` | その被写体を含む商品。動作とシーンで絞り込み |
| `/[lang]/people/walking/` | 被写体 × 動作 / シーン |
| `/[lang]/scenes/` | シーンごとの一覧（被写体混在） |
| `/[lang]/scenes/street/` | そのシーンの商品 |

`MIN_PRODUCTS_PER_PAGE`（既定2）未満の組み合わせはページを作らない（`lib/products.ts` の定数）。
投影法はナビに出さず、カードのバッジ（`PLAN` / `ELEVATION` / `AXO`、1種類なら `PLAN ONLY`）で見せる。
被写体が複数のパックには `SCENE SET` バッジ。

## 2026-09-21 — メニューは商品が0件でも全部出す

toffu.co のようなメガメニューにしたい、というオーナーの指示。
カテゴリ帯とドロップダウンに、**商品が無いカテゴリ / サブカテゴリも表示する**ようにした。
ただし 0件のものはページが存在しないため、リンクにせず淡色のテキストにしている
（404 に飛ばさず、中身の無いページも作らないため）。

## 2026-09-21 — 審査に落ちた。トップの整理とカテゴリの作り直し

LS のストア審査に不通過（理由は未確認。LS に問い合わせ中）。オーナーの指示で見直し。

### トップページ

- **ヒーロー直下の画像ストリップを削除**
- 「注目のセット」→ **「新着」= 新しい順に12点**（`getFeatured` → `getLatest`）

### サムネイルのホバー

カードにカーソルを合わせると2枚目に 0.35 秒でクロスフェードする（CSS の opacity だけ。JS なし）。

⚠ **LS の API は商品画像を1枚しか返さない**（`large_thumb_url`。Media に10枚入れても出てこない）。
そのため2枚目は、説明文に貼った画像か `Hover: https://…` の行から取る実装にした。
2枚目がある商品ページでは、プレビューにも2枚並ぶ。

### カテゴリの作り直し

メインカテゴリ（品番の記号）に **FURNITURE（FRN）** を追加。そのうえで**サブカテゴリを3軸**にした。

| 軸 | 説明文の行 | 例 |
| --- | --- | --- |
| 動作 | `Action:` | sitting / climbing-stairs / using-tools |
| 投影法 | `View:` | top / elevation / axonometric |
| シーン | `Scene:` | japanese-street / farm / hospital |

- 1商品に複数付く（`SITTING` × `JAPANESE STREET` など）。投影法を混載したセットは3つ全部書けばよい
- 語彙は `content/subcategories.json` が正。**未登録の語は無視して警告**（オーナーの選択。表記ゆれを防ぐため）
- ページは `/categories/<カテゴリ>/<サブ>`。**商品がある組み合わせだけ**生成し、sitemap にも載せる
- ヘッダーのカテゴリにカーソルを合わせると、軸ごとの一覧が出る（CSS だけで開く。キーボードでも開く）。
  スマートフォンには hover が無いので、ハンバーガーメニュー側に並べた
- 商品ページの仕様表にも軸ごとの行を足し、サブカテゴリのページへリンクした

## 2026-09-16 — 受取口座の条件を調べてまとめた

審査申請中に出た疑問の調査結果を `docs/LEMON_SETUP.md` の「受取口座について」に残した。

- 販売は USD だが **受取通貨に JPY を選べ、mid-market レートで換算**される（銀行の TTB より有利）
- **PayPay銀行は使えない。** 海外からの送金（被仕向送金）を取り扱っていないため、
  LS の銀行検索にも出てこない
- **Wise も勧めない。** 日本の銀行ではないので検索に出ず、JPY の受取口座情報も発行されない。
  USD の口座情報は米国の銀行のもので、日本の事業者の入金先としては弾かれる可能性が高い
- 使えるのはメガバンク・ゆうちょ・楽天銀行など。被仕向送金手数料は銀行差が大きいので事前に確認する

## 2026-09-16 — About ページを補強、メール送信の方針を整理

Lemon の審査に出す直前の仕上げ。`support@drop-world.com` の受信（Cloudflare Email Routing）は
オーナー側で設定完了。

### About ページに3節を追加（英語・日本語）

- **運営者について** — 日本の2名で運営、屋号と運営責任者、所在地・電話は請求時開示
- **販売の範囲** — 国内外に販売、価格は USD、税は LS が加算・納付、想定する読み手
- **サポートと返金** — 窓口は1つ、2営業日以内、14日以内の全額返金の条件

「決済とお届け」にも、対応する決済手段・数分でリンクが届くこと・円建て請求額は為替で変わることを追記。
誰が・どこに・何を売っていて、困ったら誰に言えばいいのかが About だけで分かる状態にした
（LS の審査でサイトを見られるため、および英語圏の購入者向け）。

### `support@` 名義での返信について

Gmail の「他のメールアドレスとしてメールを送信」は、**Google 以外のアドレスについて 2027年1月で終了**する
（[Gmail ヘルプ](https://support.google.com/mail/answer/17101213)）。
SMTP リレーを噛ませる無料の方法は1年で作り直しになるため採らない。
`docs/DEPLOY.md` に Zoho Mail 無料プラン（Web のみ）と Google Workspace（エイリアスで1ユーザー分）の
2択を書いた。どちらも MX を置き換えるので Cloudflare Email Routing とは併用しない。

## 2026-09-16 — 海外向け（USD）に合わせて表記を整理、審査の要件を再整理

「海外向けにも売る、価格は USD」という方針を受けての調整。

- **特商法の「販売価格」** — 「金額（消費税込）」→「各商品ページに表示された米ドル（USD）建ての金額」。
  税は Merchant of Record である LS が計算・納付する旨と、円建ての支払額は為替で変わる旨を補足に書いた
- **特商法の「販売業者」** — 補足に、個々の注文の販売事業者は Lemon Squeezy, LLC であることを明記
- **お問い合わせページに運営者を追加**（英語・日本語）。誰から買うのかが英語圏の購入者にも分かるようにした。
  LS の審査でもサイトの連絡先・事業者情報は見られる
- **`docs/LEMON_SETUP.md` を書き直し** — 申請前に用意するもの（本人確認書類・受取口座・W-8BEN・
  サポートメール）、質問票への答え方、残りの手順、日本の特商法をどう扱うかの判断理由
- **`docs/DEPLOY.md` のサポート用メール** — Cloudflare Email Routing の手順を実際の画面に合わせて具体化。
  受信専用で送信はできない（Gmail から返信すると差出人が個人アドレスになる）点も書いた

### 特商法を残す判断

LS の審査自体には不要（LS は米国の会社で、見るのは英語の規約・返金・連絡先）。
それでも、運営は日本にあり日本語でも販売しているため、日本の購入者に対する通信販売にあたる。
日本の法人は表記の無いサイトを購買規程で弾くことがある。出しておいて損がないので残す。

## 2026-09-16 — 特定商取引法に基づく表記を記入

空欄だった4項目を埋めた（`content/tokushoho.ts`）。

| 項目 | 記載 |
| --- | --- |
| 販売業者 | 屋号「drop world」 |
| 運営責任者 | 宮地凌央（Ryo Miyaji） |
| 所在地 | ご請求があったら遅滞なく開示します |
| 電話番号 | ご請求があったら遅滞なく開示します |

所在地・電話番号は、個人事業者が常時掲載しない場合に認められている「請求時開示」の書き方。
**開示の請求がメールで来たら遅滞なく（数日以内に）応じること**。断ると法令違反になるため、
その旨をファイル先頭のコメントと `docs/LEMON_SETUP.md` に書き残した。

請求の連絡先が分かるよう、2項目の補足に「下記のメールアドレス宛にご連絡ください」を入れてある
（`support@drop-world.com` の受信設定はまだ残タスク）。

## 2026-09-15 — Error 1102（Worker の CPU 上限超え）を解消

### 症状

drop-world.com を開くと **Error 1102 Worker exceeded resource limits** が出て、サイトが開けないことがあった。
調べた時点では全ページ 200 で、**断続的**に発生していた。

### 原因

OpenNext の既定設定（インクリメンタルキャッシュなし）では、ビルド時に生成したページを配信せず、
**アクセスのたびに Worker が React でページを組み立て直していた**。
Cloudflare Workers の無料プランは1リクエストあたり CPU 10ms までなので、組み立てがそれを超えたときに 1102 になる。

以前「Workers にファイルシステムが無いので商品0件になる」問題が出たのも、同じく毎回組み立て直していたのが根っこ。

### 対処

`open-next.config.ts` で、ビルド時に生成したページを Workers の静的アセットから返すようにした。

```ts
defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache, // 読み取り専用。再検証（ISR）は使えない
  enableCacheInterception: true,                 // キャッシュにあるページはサーバー処理を読み込まない
});
```

生成済みページは `opennextjs-cloudflare deploy`（と `preview`）の中の populate 処理で
`.open-next/assets/cdn-cgi/_next_cache/` に入る。`build` だけでは入らない。

### 確認したこと

- ローカルの Worker で、生成済みページ28件がキャッシュに入り、全ページ `x-opennext-cache: HIT`、応答 4〜7ms
- 存在しない品番・商品の無いカテゴリは従来どおり 404（この場合だけは毎回組み立てる）

### メモ

- 手元の wrangler のログインが切れていて `wrangler tail` でログを取れなかった。推測ではなく、
  キャッシュの有無とヘッダーで効果を確認した
- このサイトは全ページが静的生成で再検証を使わないので、この設定で困ることはない。
  Lemon の商品変更は、GitHub Actions のビルド→デプロイで新しいページが作られて反映される

---

## 2026-09-15 — 過去データを撤去し、Lemon から実際に反映

### 経緯

- オーナーから「**これまで生成したデータや昔のデータは一切使わない。今はサイトは空でよい**」と指示があった。
  前日、harajuku.ai から作った画像を開発用の見本データとしてリポジトリに入れていたのを撤回した
- GitHub にシークレット3つを登録してもらい、Lemon にデモ商品を登録 → 手動実行で drop-world.com に反映できた
  （1点 → 2点）。ストア通貨が JPY だったので USD に変えてもらった

### やったこと

- `public/fixture/` の画像を削除し、`content/lemon-fixture.json` を画像なしの汎用サンプルにした（本番では使われない）
- **Lemon の公開商品が0件でもビルドを失敗させない**ようにした。空のサイトとして公開し、ログに警告を残す。
  商品一覧は「準備中」と表示する
- GitHub Actions の checkout / setup-node を v5 に更新（Node 20 非推奨の警告への対応）
- ドキュメントから harajuku.ai 前提の記述を削除し、通貨を USD に更新

### 確認したこと

- 0件の Lemon（モック）から取り込み → 失敗せず警告だけ出る
- 空のカタログで `next build` が通る。商品一覧に「準備中」、トップに商品・注目セット・カテゴリが出ない
- 本番: 手動実行で Lemon の2商品（DW-PPL-001 / 002）が $9.99 で出て、購入ボタンが Lemon のチェックアウトにつながる

### メモ

- 空のカタログでの `next build` が1回だけ「Workers runtime failed to start（miniflare）」で落ちた。
  並行して別の処理を走らせていたときで、単独で再実行したら通った。
  `next.config.mjs` の `initOpenNextCloudflareForDev()` が起動するローカル実行環境の一時的な失敗
- 生成 HTML を grep で確かめるときは、表示されるタグ（例 `>Featured sets</h2>`）で探す。
  文言辞書がクライアント部品の props としてページに埋め込まれるので、文字列だけだと表示していなくても見つかる

---

## 2026-09-14 — 商品の出どころを Lemon Squeezy に一本化（二人運営のため）

### 背景

- 二人で運営するので、**両方が同じ場所に投稿してサイトに反映される流れ**が必要になった
- LS の審査前でも価格設定まで進めておきたい。調べると、LS は審査前はストア自体が**テストモード**で、
  商品・価格・zip・チェックアウトまで作れる。審査後は商品ごとに「Copy to Live Mode」で本番へコピーする
- ただし本番へコピーすると **商品 ID とチェックアウト URL が変わる**。JSON に URL を貼る方式だと全商品貼り直しになる

### 決めたこと（オーナーの選択）

- **投稿先は LS だけ。** 相方は Git 未経験なので、LS の管理画面だけで完結させる
- `~/Downloads/260815_harajuku.ai` は自作と確認 → 最初の3商品に使う

### やったこと

- `scripts/lemon-sync.mjs`: LS API → `content/catalog.generated.json`（`npm run build` の前に自動で走る）
  - **商品名の先頭の品番 `DW-<記号>-<3桁>` で紐付け**（LS の ID は使わない）。品番の小文字が URL
  - 説明文の `Figures:` / `Formats:` 行を仕様として抜き出す。HTML は描画せずテキストにする
  - 本番ビルドで「キー無し / 接続不可 / キー無効 / 公開商品0件」は失敗させる（公開中のサイトは残る）
  - `npm run dev` はキーが無ければ見本データ（`content/lemon-fixture.json`、LS API と同じ形）
- リポジトリ内の商品 JSON、SVG 生成、サイトからの zip 直接配布の仕組みを削除
- `.github/workflows/deploy.yml`: push・毎時・手動でデプロイ。シークレット未登録なら warning を出して飛ばす
- `scripts/export-thumbnails.mjs`: .ai / .pdf → LS 用の 2000px 正方形 PNG（白紙ページは除外）
- ドキュメント: `docs/POSTING.md`（二人用の手順・初期設定・初回3商品の文言）、`docs/GOING_LIVE.md`、
  `LEMON_SETUP.md` / `DEPLOY.md` / `CLAUDE.md` / `README.md` を全面改訂
- 商品画像を正方形表示に変更。商品の無いカテゴリはナビ・sitemap・ページ（404）から外す
- 商品ページに「ストア審査中（テストモード）」を表示。本番キーに替えると自動で消える

### つまずき

- **`dynamicParams = false` を付けると、OpenNext の Worker 上では生成済みのページまで 404 になる。**
  `next build` の出力ではページが生成されているので気づきにくい。外して、ページ内の `notFound()` で 404 にした
- LS の公式ドキュメントは WebFetch だと 403。検索結果に出る公式ドキュメントの抜粋で仕様を確認した

### 確認したこと

- 取り込み: 見本データで3点、下書きと品番なしは理由付きで除外。キー無しの本番ビルドは失敗する
- モックの LS API: 3ページにまたがる取得、品番重複時に新しい方を採用、401、ストア ID 不一致、接続失敗
- 見本データで Worker をビルド（33ページ）→ `wrangler dev` で全ルート 200。
  商品の無いカテゴリ・存在しない品番・旧 URL は 404。購入リンク、審査中表示、品番・点数・形式、JSON-LD を確認
- **本番の drop-world.com はまだ旧カタログのまま。** GitHub にシークレットを登録した後の初回デプロイで切り替わる

---

## 2026-08-16 — カタログを3カテゴリに再構成、添景イラストを作図

- **カテゴリを people / vegetation / animal の3つに絞った**（家具・車両・小物・建物・背景を削除）。
  商品も6点に組み直し、各カテゴリ2点ずつ
- **価格を USD に統一**（$7.99〜$14.99）
- **ヒーローのコピーを削除し、DROP WORLD のワードマークだけを大きく出す構成に変更**
- **添景イラストの作図スクリプトを追加**（`scripts/lib/figures.mjs` + `scripts/generate-artwork.mjs`）。
  輪郭線＋淡いグレー塗り、`vector-effect="non-scaling-stroke"` で縮尺によらず線幅を揃える。
  人物（正面・背面・側面・俯瞰）、子ども、広葉樹・針葉樹・低木・樹木平面、犬・猫を作図
- 旧プレースホルダー（`generate-placeholders.mjs`、`PREVIEW PENDING` 入りの格子画像）は削除

### 作図でつまずいた点

描画順を間違えると関節が浮く。**脚 → 靴 → 腕（肩から手まで一本）→ 首 → 胴 → 袖 → 頭**の順に
描いて、腕の付け根と首の下端を胴で隠す。最初は腕と首を胴の後に描いていたため、
首が四角い板、腕が胴から離れたカプセルに見えていた。動物も同じで、胴と頭の間に首を挟まないと
頭が浮く。

確認は `qlmanage -t -s 900 -o <dir> <file>.svg` で PNG に落として目視するのが早い
（ブラウザで SVG を直接開くと表示倍率が安定しない）。

### 未達

作例として渡された手描きの添景（服のしわ、体重の乗り方まで描き込まれたもの）の水準には届いていない。
いま入っているのは「輪郭＋淡いグレー塗りで、縮尺と姿勢が読める」レベルのイラスト。
実データのサムネイルが用意でき次第、差し替える前提。

---

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
