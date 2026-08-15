# デプロイ — Cloudflare Workers（drop-world.com）

- **リポジトリ**: `kenchikujishu/drop-world`
- **ホスティング**: Cloudflare Workers（[OpenNext](https://opennext.js.org/cloudflare) アダプタ経由）
- **ドメイン**: `drop-world.com`（Cloudflare で取得済み、DNS も Cloudflare）

ドメイン・DNS・ホスティング・メールがすべて Cloudflare 内で完結する。

---

## ローカルでの確認

```bash
npm run dev        # http://localhost:3000 … 普段の開発はこれ（Next.js の dev サーバー）
npm run preview    # http://localhost:8787 … 本番と同じ Worker をローカルで動かす
```

`npm run preview` は `next build` → OpenNext のバンドル → `wrangler dev` まで通すので、
**本番に出す前の最終確認はこちらで行う。** 1分ほどかかる。

> `npm run dev` と `npm run preview` は挙動が違うことがある。特に **Cloudflare Workers には
> ファイルシステムが無い** ので、`fs` を実行時に呼ぶコードは dev では動いて本番で壊れる。
> （商品データを `content/products-index.ts` 経由で静的 import しているのはこのため。）

## 手元から直接デプロイする

初回だけ Cloudflare にログインする。**`drop-world.com` を持っているアカウント**を選ぶこと。

```bash
npx wrangler login
```

あとはこれだけ。

```bash
npm run deploy
```

`wrangler.jsonc` にカスタムドメインを書いてあるので、**deploy すると
`drop-world.com` と `www.drop-world.com` の DNS レコードと証明書が自動で作られる。**
ダッシュボードでの操作は要らない。

> `npx wrangler deploy --temporary` はログイン不要で動くが、**使い捨ての一時アカウント**に
> 出るだけで、URL は短時間で消えるしカスタムドメインも当たらない。動作確認以外に使わない。

---

## GitHub と繋いで自動デプロイにする（Workers Builds）

push するたびに自動でビルド・デプロイされるようにする。**通常はこちらを使う。**

1. Cloudflare ダッシュボード → **Workers & Pages** → **Create** → **Workers** → **Connect to Git**
2. GitHub を連携して `kenchikujishu/drop-world` を選ぶ
3. ビルド設定:

   | 項目 | 値 |
   | --- | --- |
   | Build command | `npm run cf:build` |
   | Deploy command | `npx wrangler deploy` |
   | Branch | `main` |

4. **Build variables**（下記）を設定 → Save and Deploy

### ビルド環境変数

`NEXT_PUBLIC_*` は**ビルド時にコードへ埋め込まれる**。実行時の Variables ではなく
**Build variables** の方に入れること（入れる場所を間違えると値が反映されない）。

| Key | Value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://drop-world.com` |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | `support@drop-world.com` |
| `NEXT_PUBLIC_LEMON_STORE_URL` | LS のストア URL（審査通過後に確定） |

> `lib/site.ts` の既定値も同じ値なので、未設定でも本番は正しく動く。
> 環境変数は「後から変えたくなったときに1箇所で差し替えられる」ための保険。

---

## ドメインについて

`wrangler.jsonc` の `routes` に書いてあるので、**deploy すれば自動で繋がる。**
DNS レコードを手で作る必要も、ダッシュボードで Custom domain を追加する必要もない。

```jsonc
"routes": [
  { "pattern": "drop-world.com", "custom_domain": true },
  { "pattern": "www.drop-world.com", "custom_domain": true }
]
```

`www` に来たアクセスは `middleware.ts` が apex へ 301 リダイレクトするので、
Cloudflare 側でリダイレクトルールを作る必要もない。

うまく当たらない場合は、Cloudflare にログインしているアカウントが
`drop-world.com` のゾーンを持っているか確認する（別アカウントだと権限エラーになる）。

---

## サポート用メールアドレスを用意する

`support@drop-world.com` はサイト内（お問い合わせ・特商法表記・フッター）に表示され、
**Lemon Squeezy の審査でも連絡先として見られる**。実際に受信できる状態にしておくこと。

Cloudflare の **Email Routing** を使う（無料）:

1. Cloudflare → `drop-world.com` → **Email** → Email Routing を有効化
2. 案内どおり MX と TXT レコードを追加（ボタン一発で入る）
3. Custom address に `support@drop-world.com`、転送先に普段使いの Gmail 等を登録
4. 転送先アドレスに届く確認メールから verify

> 転送だけだと `support@drop-world.com` **から** 返信はできない。
> Gmail の「他のメールアドレスとしてメールを送信」に登録しておくと、
> 問い合わせにこのアドレス名義で返せる。

---

## デプロイ後の確認

- `https://drop-world.com/` → `/ja` か `/en` にリダイレクトされる
- `https://www.drop-world.com/` → apex に 301 で寄る
- `https://drop-world.com/ja/products` → **商品が6点表示される**
  （0件なら商品データがバンドルに入っていない。`content/products-index.ts` を確認）
- `https://drop-world.com/sitemap.xml` → URL が `https://drop-world.com/...` になっている
- `https://drop-world.com/robots.txt` → Sitemap 行が同じく実ドメイン
- お問い合わせページのメールが `support@drop-world.com`

---

## 日々の運用

商品を足すときは `docs/ADD_PRODUCT.md` の手順で `main` に push するだけ。
Workers Builds が自動でビルドしてデプロイする。**手動デプロイの操作は不要。**

ビルドは `npm run validate:products` → `next build` → OpenNext バンドルの順に走るので、
商品 JSON が壊れているとデプロイは失敗し、**古い正常なサイトが公開されたまま残る**。
