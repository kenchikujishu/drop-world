# Lemon Squeezy — 審査に出すまで / 通過後のAPI連携

## 1. 審査に出す前のチェックリスト

Lemon Squeezy（以下 LS）は新規ストアを人力でレビューする。見られるのは
**「ライブのサイトがあり、何を売っているかが明確で、法務ページが揃っていること」**。
（参照: [Activate Your Store](https://docs.lemonsqueezy.com/help/getting-started/activate-your-store) /
[Prohibited Products](https://docs.lemonsqueezy.com/help/getting-started/prohibited-products)）

### サイト側（このリポジトリで対応済み）

- [x] 商品一覧・商品詳細ページ（収録形式・点数・サイズ・価格を明示）
- [x] 利用規約 `/legal/terms`
- [x] プライバシーポリシー `/legal/privacy`
- [x] 返金ポリシー `/legal/refund`
- [x] ライセンス `/license`（著作権を自社保有している旨を明記）
- [x] よくある質問 `/faq`
- [x] 連絡先 `/contact`（メールアドレス）
- [x] 「役務提供ではなく既製データの販売である」と全ページで統一（LS の禁止商品に当たらないため）

### まだ埋まっていないもの ← **審査に出す前に必ず対応**

- [ ] **実データへの差し替え** — 商品6点はいずれも仮データ。サムネイルには `PREVIEW PENDING` と入っている。
      架空の商品のまま審査に出すと落ちる
- [ ] **`checkoutUrl`** — 全商品 `null`。サイト上は「販売準備中」と出るので、
      この状態が並んでいると "coming soon サイト" と判断されうる。**LS 側で商品を作って URL を貼ること**
- [ ] **サポート用メールアドレス** — `support@drop-world.com` で**実際に受信できる状態にする**。
      Cloudflare の Email Routing で Gmail 等へ転送するのが手軽（→ `docs/DEPLOY.md`）
- [ ] **独自ドメインの接続** — `drop-world.com` を Vercel に繋ぐ（→ `docs/DEPLOY.md`）。
      サイト側のコードは `drop-world.com` 前提で設定済み
- [ ] **特定商取引法に基づく表記** — `content/tokushoho.ts` の空欄
      （販売業者 / 運営責任者 / 所在地 / 電話番号）。国内向け販売で必要。
      所在地と電話番号は「請求があったら遅滞なく開示します」という書き方も認められている

### LS 側

- [ ] Settings → Payouts で銀行口座または PayPal を接続
- [ ] Store の通貨を **商品 JSON の `price.currency` と揃える**（いまは全商品 `JPY`）。
      LS 側を USD にするなら、全 JSON の `price` を USD 額に直す
- [ ] 商品を作成し、zip をアップロード
- [ ] KYC / KYB の質問に正直に答える（承認まで通常1〜2営業日）

---

## 2. 審査通過後 — LS API で価格を自動取得する

### 差し替える場所

**`lib/pricing.ts` の `resolvePrice()` 1関数だけ。** 呼び出し側（`ProductCard` /
商品ページ / フィルタの価格帯 / 構造化データ）は一切変更しなくてよい。

### 手順

1. LS 管理画面 → Settings → API で API キーを発行し、Vercel の環境変数に入れる

   ```
   LEMONSQUEEZY_API_KEY=...
   LEMONSQUEEZY_STORE_ID=...
   ```

2. 商品 JSON の `lemonVariantId` に、LS の Variant ID を入れる
   （`GET /v1/products?filter[store_id]=...` で確認できる）

3. ビルド時に価格表を取ってくるモジュールを足す

   ```ts
   // lib/lemon.ts
   export async function fetchPriceTable(): Promise<Record<string, DisplayPrice>> {
     const res = await fetch('https://api.lemonsqueezy.com/v1/variants', {
       headers: {
         Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
         Accept: 'application/vnd.api+json',
       },
       next: { revalidate: 3600 },
     });
     // → { [variantId]: { amount, currency, formatted } } に整形して返す
   }
   ```

4. `resolvePrice()` を、`lemonVariantId` をキーにその表を引く形に変える。
   **表に無ければ JSON の `price` にフォールバックする**（API が落ちても値段が消えないように）

### 注意

- LS の価格は**最小通貨単位**（USD ならセント、JPY なら円）で返る。
  `DisplayPrice.amount` は通常の単位なので、USD は 100 で割る
- 価格を LS 側で変えたら、Vercel で再デプロイするまでサイトの表示は変わらない
  （`revalidate: 3600` を入れれば1時間で追従する）
- `checkoutUrl` は API から取らず JSON に置いたままでよい。ここが変わることは滅多にない

---

## 3. 決済フローの全体像

```
サイト（Vercel）                         Lemon Squeezy
─────────────────                      ─────────────────
商品ページ
  └ 購入ボタン ──────────────────────→ チェックアウト画面
                                          ├ 決済処理
                                          ├ 消費税 / VAT の計算と納付
                                          ├ 領収書の発行
                                          └ ダウンロードリンクをメール送信
                                                   │
                                          購入者 ←─┘
```

LS が **Merchant of Record（販売事業者）** なので、決済・税務・領収書・ファイル配信は
すべて LS 側の責任範囲。こちらがカード情報を持つことはない。
この点は利用規約とプライバシーポリシーの本文にも書いてある。
