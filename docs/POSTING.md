# 商品の投稿と反映（二人用）

drop world の商品は **Lemon Squeezy だけ** で管理します。
サイト（drop-world.com）は Lemon の商品を自動で取り込んで表示するので、
**商品を出すのに GitHub もコードも触る必要はありません。**

```
  あなた ─┐
           ├─→  Lemon Squeezy（同じストアに二人とも所属）
  相方   ─┘         商品名・価格・説明・画像・zip を登録して Publish
                          │
                          │  1時間ごとに自動 ／ 急ぐときは手動ボタン
                          ▼
                    GitHub Actions がサイトを作り直す
                          │
                          ▼
                    drop-world.com に反映
```

---

## 商品を出す（毎回これだけ）

### 1. 画像を用意する

- **正方形**の PNG / JPG（2000×2000px 推奨）。縦長のまま上げると Lemon 上で上下が切れます
- Illustrator のファイルから作る場合は、あなたの Mac で次を実行すると正方形の PNG ができます

  ```bash
  cd ~/Desktop/dropworld && npm run export:thumbs -- ~/Downloads/ファイル名.ai
  ```

  → デスクトップの `drop-world-lemon-upload/ファイル名/` に `sheet-1.png`, `sheet-2.png` … ができます

### 2. Lemon で商品を作る

Lemon 管理画面 → **Products** → **+ New product**

| 欄 | 入れるもの |
| --- | --- |
| **Name** | **品番 + 半角スペース + 商品名**。例: `DW-PPL-004 Commuters — Morning Rush` |
| **Description** | 英語の説明文。**最後の2行**に `Figures: 6` と `Formats: DWG, AI` を書く |
| **Pricing** | Single payment、USD で金額 |
| **Media** | 手順1の画像。**1枚目がサイトのサムネイル**になります |
| **Files** | 販売する zip |

説明文の例:

```
A site worker in a short-sleeve work shirt, cap and safety boots, drawn walking in six views.

Outline and light grey fill sit on separate layers, drawn at 1:1 in millimetres.

Figures: 6
Formats: DWG, AI
```

`Figures` と `Formats` の行は、サイトの仕様表（収録点数・形式）に使われ、本文には出ません。

### 3. Publish する

右上の **Publish**。**Draft のままではサイトに出ません。**

### 4. 反映を待つ

- **何もしなければ最大1時間**でサイトに出ます
- 急ぐとき: GitHub の [Actions](https://github.com/kenchikujishu/drop-world/actions) → **サイトを更新** → **Run workflow**（1〜3分で反映）
- 商品ページの URL は品番を小文字にしたもの: `https://drop-world.com/en/products/dw-ppl-004`

---

## 品番の決まり

```
DW-PPL-004
   │   └── 番号（3桁）
   └────── カテゴリ記号
```

| 記号 | カテゴリ |
| --- | --- |
| `PPL` | People（人物） |
| `VEG` | Vegetation（植栽） |
| `ANM` | Animal（動物） |

**二人で同じ番号を使わないよう、番号の帯を分けます。**

| 担当 | 使う番号 |
| --- | --- |
| あなた | 001 〜 499 |
| 相方 | 501 〜 999 |

- 同じ品番が2つあると、**後から更新した方だけ**がサイトに出ます
- 品番は**一度付けたら変えない**でください。URL が品番から作られるので、変えるとリンクが切れます

---

## よくある操作

| やりたいこと | やり方 |
| --- | --- |
| 価格を変える | Lemon で変えるだけ（最大1時間で反映） |
| 画像・説明を直す | Lemon で直すだけ |
| 販売をやめる | Lemon で Draft に戻す（サイトから消える） |
| カテゴリを増やす | `content/categories.json` に1行足す（ここだけはコード変更） |

---

## サイトに出ないとき

1. **Publish** しているか
2. 商品名が `DW-XXX-000 ` で始まっているか（ハイフン、3桁の番号、そのあと半角スペース）
3. 記号が `PPL` / `VEG` / `ANM` のどれかか
4. 1時間待ったか。GitHub の Actions で最新の「サイトを更新」が **緑のチェック** になっているか
5. あなたの Mac で次を実行すると、**出る商品・出ない商品と理由**が表で出ます

   ```bash
   cd ~/Desktop/dropworld && npm run lemon:check
   ```

Actions が赤くなっているときは、クリックするとエラーの内容が日本語で出ています。
Lemon に接続できない・キーが無効などのときは、**古い情報のままサイトを壊さないよう、あえて失敗させています**（公開中のサイトはそのまま残ります）。

---

## 最初に一度だけ（オーナーが行う）

### A. 相方を Lemon のストアに招待する

Lemon → **Settings** → **Team** → **+** → 相方のメールアドレス

- 招待リンクの期限は24時間
- 相方は **Member** 権限になり、商品の作成・編集・Publish まですべてできます。触れないのは支払い・プラン・チーム管理だけです

### B. Lemon の API キーを作る（テストモード）

1. Lemon の画面左下で **Test mode** をオンにする
2. **Settings** → **API** → **+**
3. 名前は `drop-world site` など → 作成
4. 表示されたキーをコピー（**一度しか表示されません**）

審査前はテストモードのキーを使います。審査が通ったら本番のキーに差し替えます → [GOING_LIVE.md](GOING_LIVE.md)

### C. Cloudflare の API トークンを作る

1. [dash.cloudflare.com](https://dash.cloudflare.com) → 右上のアイコン → **My Profile** → **API Tokens** → **Create Token**
2. テンプレート **Edit Cloudflare Workers** の **Use template**
3. **Account Resources**: drop-world.com があるアカウントを選ぶ
4. **Zone Resources**: `drop-world.com` を選ぶ
5. **Continue to summary** → **Create Token** → 表示されたトークンをコピー

アカウント ID は、ローカルで `npx wrangler whoami` を実行すると表示されます。

> デプロイで「ドメイン（custom domain）の権限がない」というエラーが出た場合は、
> トークンを編集して **Zone → DNS → Edit** を追加してください。

### D. GitHub にシークレットを登録する

[リポジトリの Settings → Secrets and variables → Actions](https://github.com/kenchikujishu/drop-world/settings/secrets/actions) → **New repository secret** を3回

| Name | Value |
| --- | --- |
| `LEMONSQUEEZY_API_KEY` | B で作ったキー |
| `CLOUDFLARE_API_TOKEN` | C で作ったトークン |
| `CLOUDFLARE_ACCOUNT_ID` | C のアカウント ID |

登録したら [Actions](https://github.com/kenchikujishu/drop-world/actions) → **サイトを更新** → **Run workflow**。
緑のチェックになれば完了です。

### E. （任意）相方を GitHub に招待する

相方にも「急ぐときの手動反映ボタン」を押してもらいたい場合だけ行います。
[Settings → Collaborators](https://github.com/kenchikujishu/drop-world/settings/access) → **Add people**。

**不要なら、相方は GitHub アカウント自体いりません。** 待てば1時間以内に反映されます。

---

## 注意: 自動更新が止まることがある

GitHub は、**60日間リポジトリに push が無い**と1時間ごとの自動実行を止めます。
止まったら [Actions](https://github.com/kenchikujishu/drop-world/actions) → **サイトを更新** → **Enable workflow** で再開してください。
（手動の Run workflow はいつでも使えます）

---

## 初回の3商品（harajuku.ai から）

画像はデスクトップの `drop-world-lemon-upload/harajuku/` にあります。価格は仮の案です。

### sheet-1.png

- **Name**: `DW-PPL-001 Workers — Site & Street`
- **Price**: $12.99
- **Description**:

  ```
  A site worker in a short-sleeve work shirt, cap and safety boots, drawn walking in six views: top-down, two aerial three-quarter views, back, front and side. The same figure can be used consistently across a plan, an axonometric and an elevation.

  Outline and light grey fill sit on separate layers, drawn at 1:1 in millimetres.

  Figures: 6
  Formats: DWG, AI
  ```

### sheet-2.png

- **Name**: `DW-PPL-002 City Walk — Woman with Phone`
- **Price**: $9.99
- **Description**:

  ```
  A young woman in an oversized shirt and wide trousers, looking at her phone as she walks. Six views: top-down, two aerial three-quarter views, front, back and side.

  Outline and light grey fill sit on separate layers, drawn at 1:1 in millimetres.

  Figures: 6
  Formats: DWG, AI
  ```

### sheet-3.png

- **Name**: `DW-PPL-003 Yukata Pair — Summer Festival`
- **Price**: $12.99
- **Description**:

  ```
  A couple in yukata with geta sandals and a kinchaku bag, walking side by side. Four views: front, back and two aerial three-quarter views.

  Line drawing without fill, drawn at 1:1 in millimetres.

  Figures: 8
  Formats: DWG, AI
  ```
