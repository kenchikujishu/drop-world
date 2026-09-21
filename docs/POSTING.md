# 商品の投稿と反映（二人用）

商品そのもの（名前・価格・説明・画像・ダウンロードファイル）は **Lemon Squeezy** で管理します。
**分類（どのカテゴリに出すか）だけは GitHub の `content/tags.json`** で管理します。

```
  あなた ─┐
           ├─→  Lemon Squeezy        商品名・価格・説明・画像・zip を登録して Publish
  相方   ─┘         ＋
                GitHub の content/tags.json   品番ごとに分類タグを1行足す
                          │
                          │  1時間ごとに自動 ／ 急ぐときは手動ボタン
                          ▼
                    GitHub Actions がサイトを作り直す
                          │
                          ▼
                    drop-world.com に反映
```

> **なぜ分けるのか**: Lemon にはカテゴリ機能がありません。分類をリポジトリで持つと、
> 打ち間違い（`sittting` など）をビルドで弾けて、日英のラベルも付けられます。
> 分類を書かなくても商品は出ます（品番の記号どおりの被写体に入ります）。

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
| **Description** | 英語の説明文。最後に `Figures: 6` と `Formats: DWG, AI` の2行 |
| **Pricing** | Single payment で金額（通貨はストアの設定に従う） |
| **Media** | 手順1の画像。**1枚目がサイトのサムネイル**になります |
| **Files** | 販売する zip |

説明文の例:

```
Commuters on their way to work, drawn walking in six views: top-down, front, back and side.

Outline and fill sit on separate layers, drawn at 1:1 in millimetres.

Figures: 6
Formats: DWG, AI
```

`Figures` と `Formats` はサイトの仕様表に使われ、本文には出ません。
**分類（Action: など）はここには書きません。** `content/tags.json` に書きます（手順4）。

### 3. Publish する

右上の **Publish**。**Draft のままではサイトに出ません。**

### 分類（タグ）を付ける

GitHub の `content/tags.json` に1ブロック足します（→ [下の節](#分類タグを付ける)）。
**書かなくても商品は出ます**（品番の記号どおりの被写体に入ります）。

### 5. 反映を待つ

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

| 記号 | 主な被写体 |
| --- | --- |
| `PPL` | People（人物） |
| `FUR` | Furniture（家具） |
| `VEG` | Vegetation（植栽） |
| `ANM` | Animal（動物） |
| `SCN` | 複数の被写体が混ざるシーンパック |

**二人で同じ番号を使わないよう、番号の帯を分けます。**

| 担当 | 使う番号 |
| --- | --- |
| あなた | 001 〜 499 |
| 相方 | 501 〜 999 |

- 同じ品番が2つあると、**後から更新した方だけ**がサイトに出ます
- 品番は**一度付けたら変えない**でください。URL が品番から作られるので、変えるとリンクが切れます

---

## 分類（タグ）を付ける

GitHub の [`content/tags.json`](https://github.com/kenchikujishu/drop-world/blob/main/content/tags.json)
を開き、**鉛筆マーク（Edit this file）**を押して、品番ごとに1ブロック足します。

```json
{
  "tags": {
    "DW-PPL-004": {
      "contains": ["people"],
      "origin": ["japanese"],
      "action": ["walking", "carrying"],
      "scene": ["street"],
      "views": ["plan", "elevation"]
    }
  }
}
```

書けたら下の **Commit changes** を押すだけです。1〜3分でサイトに反映されます。

| 項目 | 意味 | 書ける言葉 |
| --- | --- | --- |
| `contains` | 含まれる被写体（複数可） | `people` / `furniture` / `vegetation` / `animal` |
| `origin` | 地域（任意） | `japanese` |
| `action` | 動作（人物・動物のみ。任意） | `standing` / `walking` / `running` / `sitting` / `cycling` / `climbing-stairs` / `using-tools` / `carrying` / `talking` |
| `scene` | 使う場面（任意・複数可） | `street` / `park` / `station` / `school` / `hospital` / `office` / `farm` / `construction-site` / `retail` / `housing` |
| `views` | 収録している投影法 | `plan` / `elevation` / `axo` |
| `items` | パックに入っている図の個別 ID（任意） | `jp-walk-umbrella-01` のような自由な文字列 |

### 決まりごと

- **書かなくてもよい。** 何も書かなければ、品番の記号どおりの被写体だけが付きます
  （`DW-PPL-004` なら people）
- **複数書ける。** `"action": ["walking", "carrying"]`
- **投影法を混載したセットは全部書く。** `"views": ["plan", "elevation", "axo"]`。
  1種類だけのときは、カードに「Plan only（平面のみ）」と出ます
- **シーンパック（`DW-SCN-001`）は `contains` に入っている被写体すべてのページに出ます。**
  カードに「Scene set」のバッジが付きます
- **表に無い言葉を書くとビルドが失敗します**（＝サイトは前のまま。打ち間違いが公開されません）。
  失敗すると Actions が赤くなり、どの品番のどの言葉が悪いか日本語で出ます
- 言葉を増やしたいときは `content/taxonomy.json` に1行足します（オーナーに依頼）

### サイトでの出かた

- `https://drop-world.com/ja/people/` — 被写体のページ
- `https://drop-world.com/ja/people/walking/` — 被写体 × 動作 / シーン
- `https://drop-world.com/ja/scenes/street/` — シーン（被写体は混ざる）
- ヘッダーの **人物** にカーソルを合わせると、この一覧が出ます
- **商品が2点未満の組み合わせはページを作りません**（中身の薄いページを作らないため）。
  メニューには出ますが、リンクにはなりません

---

## サムネイルの2枚目（カーソルを合わせると切り替わる）

商品一覧のサムネイルは、**カーソルを合わせると2枚目にふわっと切り替わります**。

⚠ Lemon の API は **Media に入れた画像を1枚（サムネイル）しか返しません**。
そのため2枚目は、次のどちらかの方法で指定します。

1. **説明文に画像を貼る** — 説明文の中に画像を挿入すると、その1枚目を使います
2. **説明文に URL の行を書く** — `Hover: https://…`（`https://` で始まる画像の URL）

2枚目を入れなかった商品は、カーソルを合わせても何も起きません（1枚目のままです）。
2枚目は商品ページのプレビューにも並びます。

---

## よくある操作

| やりたいこと | やり方 |
| --- | --- |
| 価格を変える | Lemon で変えるだけ（最大1時間で反映） |
| 画像・説明を直す | Lemon で直すだけ |
| 販売をやめる | Lemon で Draft に戻す（サイトから消える） |
| 分類を変える | GitHub の `content/tags.json` を直す |
| 分類に使える言葉を増やす | `content/taxonomy.json` に1行足す（オーナーに依頼） |

---

## サイトに出ないとき

1. **Publish** しているか
2. 商品名が `DW-XXX-000 ` で始まっているか（ハイフン、3桁の番号、そのあと半角スペース）
3. 記号が `PPL` / `FUR` / `VEG` / `ANM` / `SCN` のどれかか
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
