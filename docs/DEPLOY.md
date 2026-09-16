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
**申請前に受信できる状態にしておくこと。**

ドメインが Cloudflare にあるので、**Email Routing** で Gmail に転送するのが早い（無料・5分）。

1. [dash.cloudflare.com](https://dash.cloudflare.com) → 左の **Compute** → **Email Service** → **Email Routing**
   （古い画面では `drop-world.com` を開いて左の **Email**）
2. **Onboard Domain** → `drop-world.com` を選ぶ → 追加される DNS レコードを確認して **Done**
   - MX 3件（受信を Cloudflare に向ける）
   - TXT 2件（SPF と DKIM）
   - ⚠ ここで **既存の MX レコードは置き換わる**。このドメインで他のメールを受けている場合は先に確認する
3. **Destination Addresses** → 受け取りたい Gmail を登録 → Gmail 側に届く確認メールの
   **Verify email address** を押す（これを踏まないと転送されない）
4. **Routing Rules** → **Create routing rule**
   - Email pattern: `support` ＋ `@drop-world.com`
   - Action: **Send to an email** → 手順3の Gmail
5. 別のメールから `support@drop-world.com` に試しに送り、Gmail に届くか確認する（迷惑メールも見る）

> **Catch-all** を有効にすると、`hello@` など他の宛名もまとめて受け取れる。
> 誤字で届かない事故が減るので、有効にしておいてよい。

### `support@` 名義で返信する

Cloudflare Email Routing は **受信（転送）専用**で、送信はできない。
そのまま Gmail から返信すると **差出人が個人の Gmail アドレスになる**ので、
送信できるメールサービスを別に用意する。

> ⚠ Gmail の「他のメールアドレスとしてメールを送信」（送信用 SMTP を登録して Gmail から
> 別アドレス名義で送る方法）は、**Google 以外のアドレスについて 2027年1月で終了**する
> （[Gmail ヘルプ](https://support.google.com/mail/answer/17101213)）。
> いま組んでも1年ほどで作り直しになるため、下の2つから選ぶ。

| 方法 | 費用 | 受信の扱い | 向き |
| --- | --- | --- | --- |
| **Zoho Mail 無料プラン** | 無料（5ユーザー・各5GB） | **MX を Zoho に向け替える**（Cloudflare Email Routing は解除） | 費用をかけたくない場合。ブラウザと Zoho 純正アプリからのみ利用可（IMAP / SMTP は有料プラン） |
| **Google Workspace** | 1ユーザー月 $7 前後 | **MX を Google に向け替える**（同上） | いつもの Gmail の画面で完結させたい場合。`support@` はユーザーの**エイリアス**にすれば1ユーザー分の課金で足りる |

どちらも `drop-world.com` の MX を置き換えるため、**Cloudflare Email Routing とは併用しない**
（Email Routing を止めてから、新しい MX を入れる）。

Zoho は無料プランが使えるデータセンターが限られる。登録時に日本（jp）を選べない場合は、
使える地域を選ぶか Google Workspace にする。

---

## うまくいかないとき

Actions の「サイトを更新」が **赤** になったら、開いてログの `✗` の行を読む。日本語で理由が出ている。

| メッセージ | 対処 |
| --- | --- |
| `LEMONSQUEEZY_API_KEY が設定されていません` | GitHub のシークレットを登録する |
| `API キーが無効です（401）` | Lemon でキーを作り直して登録し直す |
| `Lemon Squeezy に接続できませんでした` | Lemon 側の障害。時間をおいて Run workflow |
| custom domain / DNS の権限エラー | Cloudflare の API トークンに **Zone → DNS → Edit** を足す |
| サイトを開くと **Error 1102 Worker exceeded resource limits** | `open-next.config.ts` の静的アセットキャッシュが外れていないか確認。応答ヘッダー `x-opennext-cache` が `HIT` になっているか |

**失敗しても、公開中のサイトは前回デプロイした状態のまま残る。**

「サイトを更新」に黄色の warning だけ出て何も起きていない場合は、シークレットが未登録。

緑なのにサイトに商品が出ないときは、ログの `⚠` を読む。`公開中（Published）の商品が0件です` なら、
キーのモード（テスト / 本番）と Publish を確認する。

公開リポジトリでは、60日間 push が無いと1時間ごとの自動実行が止まる。
止まったら Actions → サイトを更新 → **Enable workflow**。
