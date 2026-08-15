# デプロイ — Vercel + Cloudflare（drop-world.com）

- **リポジトリ**: `kenchikujishu/drop-world`
- **ホスティング**: Vercel（`main` に push → 自動デプロイ）
- **ドメイン**: `drop-world.com`（Cloudflare で取得済み。DNS も Cloudflare）

---

## 1. Vercel にプロジェクトを作る

1. https://vercel.com/new → GitHub の `kenchikujishu/drop-world` を Import
2. Framework Preset に **Next.js** が自動で入る。Build / Output の設定は変えない
3. Deploy

初回デプロイで `https://drop-world-xxxx.vercel.app` が払い出される。

## 2. 環境変数を入れる

Vercel の Project Settings → **Environment Variables**。Production / Preview / Development
すべてにチェックを入れて追加する。

| Key | Value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://drop-world.com` |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | `support@drop-world.com` |
| `NEXT_PUBLIC_LEMON_STORE_URL` | LS のストア URL（審査通過後に確定） |

> `lib/site.ts` の既定値も同じ値なので、未設定でも本番は正しく動く。
> 環境変数は「ドメインを変えたくなったときに1箇所で差し替えられる」ための保険。

環境変数を変えたら **再デプロイが必要**（Deployments → 最新の … → Redeploy）。

## 3. ドメインを繋ぐ

### Vercel 側

Project Settings → **Domains** で2つ追加する。

- `drop-world.com`
- `www.drop-world.com`

Vercel は片方を primary、もう片方をリダイレクトとして扱う。**apex（`drop-world.com`）を
primary** にしておく（サイト内のリンクと `NEXT_PUBLIC_SITE_URL` が apex 前提のため）。

### Cloudflare 側（DNS）

Cloudflare ダッシュボード → `drop-world.com` → **DNS** → Records に追加する。

| Type | Name | Content | Proxy |
| --- | --- | --- | --- |
| A | `@` | `76.76.21.21` | **DNS only（グレーの雲）** |
| CNAME | `www` | `cname.vercel-dns.com` | **DNS only（グレーの雲）** |

> ⚠ **プロキシ（オレンジの雲）をオンにしないこと。**
> Vercel 側も証明書を発行するため二重プロキシになり、リダイレクトループや
> 証明書エラーの原因になる。どうしても Cloudflare のプロキシを通したい場合は、
> Cloudflare の SSL/TLS モードを **Full (strict)** にする必要がある。

Vercel の Domains 画面が `Valid Configuration` に変われば完了（DNS 反映まで数分〜数十分）。

## 4. サポート用メールアドレスを用意する

`support@drop-world.com` はサイト内（お問い合わせ・特商法表記・フッター）に表示され、
**Lemon Squeezy の審査でも連絡先として見られる**。実際に受信できる状態にしておくこと。

Cloudflare の **Email Routing** を使うのが手軽（無料）:

1. Cloudflare → `drop-world.com` → **Email** → Email Routing を有効化
2. 案内どおり MX と TXT レコードを追加（ボタン一発で入る）
3. Custom address に `support@drop-world.com`、転送先に普段使いの Gmail 等を登録
4. 転送先アドレスに届く確認メールから verify

> 転送だけだと `support@drop-world.com` **から** 返信はできない。
> Gmail の「他のメールアドレスとしてメールを送信」に登録しておくと、
> 問い合わせにこのアドレス名義で返せる。

## 5. 確認

デプロイ後に見ておくところ:

- `https://drop-world.com/` → `/ja` か `/en` にリダイレクトされる
- `https://www.drop-world.com/` → apex にリダイレクトされる
- `https://drop-world.com/sitemap.xml` → URL が `https://drop-world.com/...` になっている
  （`.vercel.app` のままなら環境変数を入れて再デプロイ）
- `https://drop-world.com/robots.txt` → Sitemap 行が同じく実ドメイン
- お問い合わせページのメールアドレスが `support@drop-world.com` になっている

---

## 日々の運用

商品を足すときは `docs/ADD_PRODUCT.md` の手順で `main` に push するだけ。
Vercel が自動でビルドしてデプロイする。**手動デプロイの操作は不要。**

ビルドは `npm run validate:products` → `next build` の順に走るので、
商品 JSON が壊れているとデプロイは失敗し、**古い正常なサイトが公開されたまま残る**。
