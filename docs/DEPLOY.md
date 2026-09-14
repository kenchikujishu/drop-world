# デプロイ

- **本番**: https://drop-world.com（Cloudflare Workers）
- **リポジトリ**: `kenchikujishu/drop-world`
- ドメイン・DNS・ホスティング・メールはすべて Cloudflare

---

## 仕組み

`.github/workflows/deploy.yml`（GitHub Actions の「サイトを更新」）が、次のタイミングでデプロイする。

| きっかけ | 用途 |
| --- | --- |
| `main` への push | コードを変えたとき |
| 1時間ごと（毎時7分） | Lemon で商品を追加・価格変更したものを拾う |
| 手動（Actions → サイトを更新 → Run workflow） | 急いで反映したいとき |

中身は `npm run deploy` で、次の順に走る。

1. `scripts/lemon-sync.mjs` が Lemon API から商品を取り込み、`content/catalog.generated.json` を書く
2. `next build` で全ページを静的生成
3. OpenNext で Worker にまとめ、`wrangler deploy`

**公開中の Worker は Lemon と通信しない。** 商品データはビルド時に焼き込まれる。

必要なシークレットと初回の設定手順は [POSTING.md の「最初に一度だけ」](POSTING.md#最初に一度だけオーナーが行う)。

---

## 手元からデプロイする

普段は GitHub Actions に任せる。手元から出すときは:

1. `.env.local` に `LEMONSQUEEZY_API_KEY=...` を書く
2. `npx wrangler login`（drop-world.com を持つアカウントで）
3. 次を実行

```bash
npm run deploy
```

本番に出す前に実際の Worker で確かめたいときは `npm run preview`（http://localhost:8787）。

---

## ドメイン

`wrangler.jsonc` の `routes` に `drop-world.com` と `www.drop-world.com` を custom domain として書いてある。
deploy 時に DNS レコードと証明書が自動で用意されるので、手作業は不要。
`www` は `middleware.ts` が apex へ 301 で寄せる。

---

## サポート用メール

`support@drop-world.com` はサイト内（お問い合わせ・特商法表記・フッター）に出ており、Lemon の審査でも見られる。
Cloudflare の **Email Routing** で普段のメールに転送する。

1. Cloudflare → `drop-world.com` → **Email** → Email Routing を有効化（MX / TXT はボタンで入る）
2. Custom address `support@drop-world.com` → 転送先を登録 → 届いた確認メールで verify

返信を `support@` 名義で送りたい場合は、Gmail の「他のメールアドレスとしてメールを送信」に登録する。

---

## うまくいかないとき

Actions の「サイトを更新」が **赤** になったら、開いてログの `✗` の行を読む。日本語で理由が出ている。

| メッセージ | 対処 |
| --- | --- |
| `LEMONSQUEEZY_API_KEY が設定されていません` | GitHub のシークレットを登録する |
| `API キーが無効です（401）` | Lemon でキーを作り直して登録し直す |
| `公開中（Published）の商品が1つも取れませんでした` | キーのモード（テスト / 本番）と、商品の Publish を確認 |
| `Lemon Squeezy に接続できませんでした` | Lemon 側の障害。時間をおいて Run workflow |
| custom domain / DNS の権限エラー | Cloudflare の API トークンに **Zone → DNS → Edit** を足す |

**失敗しても、公開中のサイトは前回デプロイした状態のまま残る。**

「サイトを更新」に黄色の warning だけ出て何も起きていない場合は、シークレットが未登録。

公開リポジトリでは、60日間 push が無いと1時間ごとの自動実行が止まる。
止まったら Actions → サイトを更新 → **Enable workflow**。
