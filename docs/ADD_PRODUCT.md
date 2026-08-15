# 商品を1点追加する

1商品 = `content/products/<slug>.json` 1ファイル + `public/products/<slug>/` の画像。
この2つを足して push すれば、Vercel が自動でデプロイして商品ページが生える。

---

## 手順

### 1. JSON の雛形をつくる

```bash
npm run new:product
```

対話で slug / 商品名（英日）/ 要約（英日）/ カテゴリ / 視点 / 収録形式 / 点数 / サイズ / 価格を聞かれる。
終わると次の2つができる。

```
content/products/<slug>.json
public/products/<slug>/            ← 空フォルダ。ここに画像を置く
```

**slug の付け方**: `<カテゴリ>-<内容>-<視点>-vol-<番号>` にしておくと一覧で並びが揃う。
例: `people-elevation-vol-02`, `vegetation-shrubs-plan-vol-01`

### 2. サムネイル画像を置く

`public/products/<slug>/` に WebP で置く。

| ファイル | 用途 |
| --- | --- |
| `thumb.webp` | 一覧カード・OGP画像。**4:3**、横 1200px 程度 |
| `01.webp` `02.webp` … | 商品ページのギャラリー。同じく 4:3 |

雛形は `thumb.webp` + `01.webp` + `02.webp` を参照している。枚数を変えたら
JSON の `gallery` 配列も合わせて直すこと（存在しない画像を指していると手順4で弾かれる）。

> 中身は `object-fit: cover` で切り取られる。**被写体を上下左右に寄せすぎない。**

### 3. 説明文を書く

生成された JSON の `description.en` / `description.ja` が `TODO:` のままなので書き換える。
**空行（`\n\n`）で段落が分かれる。**

書く内容の目安（既存の商品 JSON がそのまま見本になる）:

- 1段落目 — 何が何点入っているか、どんな図面で使うものか
- 2段落目 — 寸法の根拠、レイヤー構成、収録形式の内訳

### 4. Lemon Squeezy に商品を作る

1. LS 管理画面 → Products → New Product
2. zip をアップロード（**zip はこのリポジトリに入れない**）
3. 価格を JSON の `price` と同じ額・同じ通貨で設定する
4. 発行されたチェックアウト URL を JSON の `checkoutUrl` に貼る

`checkoutUrl` が `null` のあいだ、商品ページの購入ボタンは「販売準備中」と表示される。

### 5. 検査する

```bash
npm run validate:products
```

JSON の形式、taxonomy に無い値、**画像ファイルが実在するか** まで見る。
`checkoutUrl` が未設定の商品は警告として一覧表示される（エラーにはしない）。

### 6. 見た目を確認する

```bash
npm run dev
```

- `/ja/products` — 一覧に出るか、カードの要約が2行に収まっているか
- `/ja/products/<slug>` — ギャラリー、仕様表、購入ボタン
- `/en/products/<slug>` — 英語側も同様に

### 7. push する

```bash
git add . && git commit -m "add product: <slug>" && git push
```

Vercel が自動でデプロイする。手動デプロイの操作は不要。

---

## カテゴリや収録形式を増やしたいとき

`content/taxonomy.ts` **だけ** を編集する。ナビゲーション、フィルタ、バリデーション、
サイトマップが全部そこを見ているので、他を触る必要はない。

```ts
export const CATEGORY_IDS = [..., 'lighting'] as const;

export const CATEGORIES: Term<CategoryId>[] = [
  ...,
  { id: 'lighting', label: { en: 'Lighting', ja: '照明' } },
];
```

> `const X_IDS = [...] as const;` の書式は崩さないこと。
> `scripts/taxonomy-ids.mjs` がこの1行を正規表現で読んでいる。

商品が0点のカテゴリはヘッダーとフッターに出ない（空のページに誘導しないため）。
`/ja/categories/lighting` 自体は最初から存在する。

## 商品を目立たせたいとき

JSON の `"featured": true` にすると、トップの「注目のセット」とヒーロー下の画像帯に出る。
4点まで表示され、足りないぶんは新着から自動で補われる。
