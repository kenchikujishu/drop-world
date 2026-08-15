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

- [ ] **実データへの差し替え** — 商品6点のサムネイルは `scripts/generate-artwork.mjs` が生成した
      SVG イラストで、実際の CAD データを書き出したものではない。zip も中身は README だけのダミー。
      **販売する実物と、サイトに出ている内容が一致している状態にしてから審査に出すこと**
- [ ] **`checkoutUrl`** — 全商品 `null`。いまは代わりに `downloads`（サイトからの直接配布）で
      動いている。

      なお **審査前にチェックアウトを動く状態にはできない**（ストアが承認されるまで LS の
      決済画面が有効にならないため）。審査で見られるのは「何をいくらで売る店か」がサイトから
      分かることなので、価格と商品説明が出ていれば要件は満たしている。
      ただし **無料でダウンロードし放題に見える状態は避けたい**ので、LS 側で商品を
      作れる段階になったら URL を入れて購入ボタンに切り替えるのが望ましい。
- [ ] **サポート用メールアドレス** — `support@drop-world.com` で**実際に受信できる状態にする**。
      Cloudflare の Email Routing で Gmail 等へ転送するのが手軽（→ `docs/DEPLOY.md`）
- [x] **独自ドメインの接続** — `drop-world.com` で公開済み
- [ ] **特定商取引法に基づく表記** — `content/tokushoho.ts` の空欄
      （販売業者 / 運営責任者 / 所在地 / 電話番号）。国内向け販売で必要。
      所在地と電話番号は「請求があったら遅滞なく開示します」という書き方も認められている

### LS 側

- [ ] Settings → Payouts で銀行口座または PayPal を接続
- [ ] Store の通貨を **商品 JSON の `price.currency` と揃える**（いまは全商品 `USD`）
- [ ] 商品を作成し、zip をアップロード
- [ ] KYC / KYB の質問に正直に答える（承認まで通常1〜2営業日）

---

## 2. 審査通過後 — LS API で価格を自動取得する

### 差し替える場所

**`lib/pricing.ts` の `resolvePrice()` 1関数だけ。** 呼び出し側（`ProductCard` /
商品ページ / フィルタの価格帯 / 構造化データ）は一切変更しなくてよい。

### 手順

1. LS 管理画面 → Settings → API で API キーを発行し、Cloudflare の Build variables に入れる

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

- LS の価格は**最小通貨単位**（USD ならセント）で返る。
  `DisplayPrice.amount` は通常の単位なので 100 で割る
- 価格を LS 側で変えたら、Cloudflare で再デプロイするまでサイトの表示は変わらない
  （`revalidate: 3600` を入れれば1時間で追従する）
- `checkoutUrl` は API から取らず JSON に置いたままでよい。ここが変わることは滅多にない

---

## 3. 決済フローの全体像

```
サイト（Cloudflare Workers）              Lemon Squeezy
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
