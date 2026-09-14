# drop world

CAD 添景データ（人物・植栽・動物）のストア。https://drop-world.com

- 商品は **Lemon Squeezy だけ**で管理する。サイトは Lemon の商品を自動で取り込んで表示する
- Next.js 15 / Cloudflare Workers / GitHub Actions で自動デプロイ

## 商品を出す人へ

**[docs/POSTING.md](docs/POSTING.md)** を読んでください。Lemon の管理画面だけで完結します。

## ドキュメント

| | |
| --- | --- |
| [docs/POSTING.md](docs/POSTING.md) | 商品の投稿と反映（二人用）・最初の設定 |
| [docs/GOING_LIVE.md](docs/GOING_LIVE.md) | Lemon の審査通過後に本番へ切り替える |
| [docs/LEMON_SETUP.md](docs/LEMON_SETUP.md) | Lemon の審査に出す前のチェックリスト |
| [docs/DEPLOY.md](docs/DEPLOY.md) | デプロイの仕組みとトラブル対応 |
| [CLAUDE.md](CLAUDE.md) | 技術構成・設計の決め事 |

## 開発

```bash
npm install
npm run dev            # http://localhost:3000（API キーが無ければ見本データで動く）
npm run lemon:check    # Lemon の商品がサイトにどう出るか確認
npm run preview        # 本番と同じ Worker で確認（キー必須）
```

キーは `.env.local.example` をコピーして `.env.local` に書く。

## 構成

```
.github/workflows/deploy.yml   push・1時間ごと・手動でデプロイ
scripts/lemon-sync.mjs         Lemon API → content/catalog.generated.json
scripts/export-thumbnails.mjs  .ai / .pdf → Lemon 用の正方形画像
content/categories.json        カテゴリと品番の記号（PPL / VEG / ANM）
content/lemon-fixture.json     キーが無いときの見本データ（Lemon API と同じ形）
content/i18n/{en,ja}.ts        UI の文言と法務ページ本文
lib/products.ts                取り込んだ商品データの読み出し
app/[lang]/                    全ページ
wrangler.jsonc                 Worker とカスタムドメインの設定
```
