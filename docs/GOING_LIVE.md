# 審査通過後に本番へ切り替える

所要15分ほど。**コードの変更は不要**です。

審査前に Lemon のテストモードで作った商品（価格・説明・画像・zip）を本番にコピーし、
サイトが読む API キーを本番用に差し替えるだけです。

---

## 手順

### 1. 商品を本番にコピーする

1. Lemon の画面左下で **Test mode** をオンにする
2. **Products** を開き、商品ごとに **…** → **Copy to Live Mode**
3. **Test mode をオフ**にして本番側の Products を開き、コピーされた商品を1つずつ確認する
   - 価格・説明・画像・**zip ファイル**が入っているか（入っていなければ付け直す）
   - **Publish** されているか

> 本番にコピーすると、Lemon 上の商品 ID とチェックアウト URL は新しくなります。
> サイトは**商品名の品番（DW-PPL-001 など）で紐付けている**ので、この変化の影響を受けません。
> **品番は変えずにコピーしてください。**

### 2. 本番の API キーを作る

Test mode がオフの状態で **Settings** → **API** → **+** → 名前 `drop-world site (live)` → コピー

### 3. GitHub のシークレットを差し替える

[Settings → Secrets and variables → Actions](https://github.com/kenchikujishu/drop-world/settings/secrets/actions)
→ `LEMONSQUEEZY_API_KEY` の **✏️（Update）** → 2 のキーを貼って保存

### 4. サイトを作り直す

[Actions](https://github.com/kenchikujishu/drop-world/actions) → **サイトを更新** → **Run workflow**

### 5. 確認する

- [ ] 商品ページの「ストア審査中」の表示が消えている
- [ ] 購入ボタンから開くチェックアウトに **Test mode の帯が出ていない**
- [ ] 全商品が一覧に出ている
- [ ] （任意）自分で1件買って zip が届くことを確かめ、Lemon で返金する

---

## 切り替えたあと

- **新しい商品は Live mode（Test mode オフ）で作ってください。**
  テストモードで作った商品は本番のキーから見えないので、サイトに出ません
- テストモードの API キーは、Settings → API から削除してかまいません
- ローカルの `.env.local` に書いたキーも本番のものに差し替えます
