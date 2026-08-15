#!/usr/bin/env node
/**
 * 商品 JSON を書き出す。カタログを組み直すときの一括生成用。
 * 通常の1点追加は `npm run new:product` を使う。
 */

import fs from 'node:fs';
import path from 'node:path';

const DIR = path.join(process.cwd(), 'content', 'products');
fs.mkdirSync(DIR, { recursive: true });

const products = [
  {
    slug: 'people-workers-vol-01',
    title: { en: 'People — Site & Street Vol.01', ja: '人物 現場・街路 Vol.01' },
    summary: {
      en: '24 standing and walking figures in work clothing, drawn in front, back, side and top-down views.',
      ja: '作業着の人物24点。正面・背面・側面・俯瞰の4方向で作図しています。',
    },
    description: {
      en: 'A general-purpose set of scale figures for elevations, sections and site plans. Twenty-four people — standing, walking, waiting — each drawn in four views so the same person can appear consistently across a whole drawing set.\n\nHeights run from 1,550 to 1,850 mm, drawn at 1:1 in millimetres. Outline, fill and detail sit on three named layers, so you can drop the fill for a line-only elevation or hide the detail layer for small-scale plots. DWG is saved in the AutoCAD 2013 format, with a matching DXF for older or non-Autodesk software, plus a layered AI file and transparent PNGs at 2,000 px tall.',
      ja: '立面図・断面図・配置図のための汎用的な人物セットです。立つ・歩く・待つといった24点を、それぞれ4方向で作図しているので、同じ人物を図面一式にわたって一貫して配置できます。\n\n身長は 1,550〜1,850mm、ミリ単位のモデル空間 1:1 で作図。輪郭・塗り・ディテールを3つの名前付きレイヤーに分けているので、塗りを消して線だけの立面にしたり、小さい縮尺の出力時にディテールを非表示にしたりできます。DWG は AutoCAD 2013 形式、旧バージョンや Autodesk 以外のソフト向けに DXF を同梱。ほかにレイヤー付き AI と、高さ 2,000px の背景透過 PNG が入っています。',
    },
    category: 'people',
    views: ['elevation', 'plan', 'multi-angle'],
    formats: ['dwg', 'dxf', 'ai', 'png'],
    itemCount: 24,
    fileSize: '12.4 MB',
    price: { amount: 12.99, currency: 'USD' },
    tags: ['scale figure', 'human', 'worker'],
    featured: true,
    publishedAt: '2026-08-12',
  },
  {
    slug: 'people-children-vol-01',
    title: { en: 'People — Children Vol.01', ja: '人物 子ども Vol.01' },
    summary: {
      en: '16 children aged roughly 4 to 10, standing, walking and pointing, in four views each.',
      ja: '4〜10歳ほどの子ども16点。立つ・歩く・指さす姿を、それぞれ4方向で作図。',
    },
    description: {
      en: 'Children for housing, school, park and retail drawings. Sixteen figures aged roughly four to ten, in postures that read at a glance — standing, walking, pointing, looking up.\n\nHeights run from 1,000 to 1,400 mm, which is what keeps a family group believable next to the adults in our other sets. Line weights match People — Site & Street Vol.01, so the two sets can be mixed in one elevation without adjustment. Includes DWG, DXF, a layered AI file and transparent PNGs.',
      ja: '住宅・学校・公園・商業施設の図面のための子どもです。4〜10歳ほどの16点を、ひと目で姿勢が分かるポーズ（立つ・歩く・指さす・見上げる）で収録しています。\n\n身長は 1,000〜1,400mm。当店の大人のセットと並べたときに家族連れとして自然に見える寸法にしています。線の太さは「人物 現場・街路 Vol.01」と揃えてあるので、2つのセットを同じ立面図に混ぜても調整は不要です。DWG、DXF、レイヤー付き AI、背景透過 PNG を同梱。',
    },
    category: 'people',
    views: ['elevation', 'multi-angle'],
    formats: ['dwg', 'dxf', 'ai', 'png'],
    itemCount: 16,
    fileSize: '7.8 MB',
    price: { amount: 9.99, currency: 'USD' },
    tags: ['scale figure', 'child', 'family'],
    featured: true,
    publishedAt: '2026-08-10',
  },
  {
    slug: 'vegetation-trees-vol-01',
    title: { en: 'Trees — Elevation Vol.01', ja: '樹木 立面 Vol.01' },
    summary: {
      en: '20 deciduous and evergreen trees in elevation, from 2 m saplings to 12 m street trees.',
      ja: '落葉樹・常緑樹あわせて20点の立面。樹高2mの若木から12mの街路樹まで。',
    },
    description: {
      en: 'Twenty trees drawn in elevation at heights from 2,000 to 12,000 mm, covering the species most often specified on street and courtyard planting plans. Canopies are drawn as an outline plus a separate foliage layer, so the same tree works as a flat silhouette on a small-scale elevation or as a detailed drawing at 1:50.\n\nTrunks and main branches are drawn to real proportions, and each tree sits on its own base point at ground level so it inserts at the correct height without rescaling. Includes DWG, DXF, layered AI and EPS, plus transparent PNGs.',
      ja: '樹高 2,000〜12,000mm の樹木20点を立面で作図。街路樹や中庭の植栽計画でよく指定される樹種を中心に選んでいます。樹冠は輪郭と、別レイヤーの葉のテクスチャの2層構成。同じ木を、小縮尺の立面ではシルエットとして、1/50 では描き込んだ樹木として使えます。\n\n幹と主枝は実際の比率で作図し、各樹木は地盤面の基準点を持っているので、縮尺し直さずに正しい高さで挿入できます。DWG、DXF、レイヤー付き AI と EPS、背景透過 PNG を同梱。',
    },
    category: 'vegetation',
    views: ['elevation'],
    formats: ['dwg', 'dxf', 'ai', 'eps', 'png'],
    itemCount: 20,
    fileSize: '16.8 MB',
    price: { amount: 14.99, currency: 'USD' },
    tags: ['tree', 'planting', 'landscape'],
    featured: true,
    publishedAt: '2026-08-08',
  },
  {
    slug: 'vegetation-shrubs-vol-01',
    title: { en: 'Shrubs & Tree Plans Vol.01', ja: '低木・樹木平面 Vol.01' },
    summary: {
      en: '28 shrubs in elevation and tree canopies in plan, for planting plans and site layouts.',
      ja: '低木の立面と樹木の平面あわせて28点。植栽計画と配置図のために。',
    },
    description: {
      en: 'The other half of a planting drawing: low hedges and shrub masses in elevation, and tree canopies seen from above for the site plan. Twenty-eight pieces in total, with canopy diameters from 1,200 to 6,000 mm.\n\nPlan symbols are drawn as closed polylines with the trunk position marked at the centre, so they can be used for setting out as well as presentation. The branch structure sits on its own layer and can be switched off for a simpler symbol. Includes DWG, DXF, a layered AI file and transparent PNGs.',
      ja: '植栽図のもう半分です。生垣や低木のかたまりを立面で、樹木の樹冠を配置図用に平面で収録しました。合計28点、樹冠の直径は 1,200〜6,000mm。\n\n平面記号は閉じたポリラインで作図し、中心に幹の位置を落としてあるので、プレゼンだけでなく墨出しの検討にも使えます。枝の分岐は別レイヤーなので、非表示にすればシンプルな記号になります。DWG、DXF、レイヤー付き AI、背景透過 PNG を同梱。',
    },
    category: 'vegetation',
    views: ['elevation', 'plan'],
    formats: ['dwg', 'dxf', 'ai', 'png'],
    itemCount: 28,
    fileSize: '9.6 MB',
    price: { amount: 8.99, currency: 'USD' },
    tags: ['shrub', 'hedge', 'planting plan'],
    featured: true,
    publishedAt: '2026-08-06',
  },
  {
    slug: 'animal-dogs-vol-01',
    title: { en: 'Dogs — Elevation Vol.01', ja: '犬 立面 Vol.01' },
    summary: {
      en: '14 dogs across small, medium and large breeds, standing, walking and sitting.',
      ja: '小型・中型・大型あわせて犬14点。立位・歩行・座位を収録。',
    },
    description: {
      en: 'Dogs for residential elevations, park and streetscape drawings. Fourteen animals across small, medium and large breeds, drawn standing, walking and sitting, with both side and front views.\n\nShoulder heights run from 250 to 700 mm, so the dogs sit correctly against the people in our other sets. Line weights match the People sets, which means they can be mixed in one elevation without adjustment. Includes DWG, DXF, a layered AI file and transparent PNGs.',
      ja: '住宅の立面図、公園や街並みの図面のための犬です。小型・中型・大型の14点を、立位・歩行・座位で、側面と正面の両方から作図しています。\n\n体高は 250〜700mm。当店の人物セットと並べても大きさが正しく見えます。線の太さも人物セットと揃えてあるので、同じ立面図に混ぜても調整は不要です。DWG、DXF、レイヤー付き AI、背景透過 PNG を同梱。',
    },
    category: 'animal',
    views: ['elevation', 'multi-angle'],
    formats: ['dwg', 'dxf', 'ai', 'png'],
    itemCount: 14,
    fileSize: '6.1 MB',
    price: { amount: 9.99, currency: 'USD' },
    tags: ['dog', 'pet', 'park'],
    featured: false,
    publishedAt: '2026-08-04',
  },
  {
    slug: 'animal-cats-vol-01',
    title: { en: 'Cats — Elevation Vol.01', ja: '猫 立面 Vol.01' },
    summary: {
      en: '12 cats standing, sitting, walking and curled up, at true shoulder heights.',
      ja: '猫12点。立位・座位・歩行・丸まった姿勢を実寸で。',
    },
    description: {
      en: 'Cats for interior elevations, courtyard and streetscape drawings. Twelve animals — standing, sitting, walking, and curled up asleep — drawn in side and three-quarter views.\n\nShoulder heights run from 230 to 300 mm. As with the rest of the catalogue, line weights are consistent with the People and Dogs sets so everything can be mixed in one drawing. Includes DWG, DXF, a layered AI file and transparent PNGs.',
      ja: '室内の立面図、中庭や街並みの図面のための猫です。立つ・座る・歩く・丸まって寝る、の12点を側面と斜めから作図しています。\n\n体高は 230〜300mm。カタログの他の商品と同様、人物セット・犬セットと線の太さを揃えているので、同じ図面に混ぜて使えます。DWG、DXF、レイヤー付き AI、背景透過 PNG を同梱。',
    },
    category: 'animal',
    views: ['elevation', 'multi-angle'],
    formats: ['dwg', 'dxf', 'ai', 'png'],
    itemCount: 12,
    fileSize: '5.2 MB',
    price: { amount: 7.99, currency: 'USD' },
    tags: ['cat', 'pet', 'interior'],
    featured: false,
    publishedAt: '2026-08-02',
  },
];

for (const p of products) {
  const json = {
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    description: p.description,
    category: p.category,
    views: p.views,
    formats: p.formats,
    itemCount: p.itemCount,
    fileSize: p.fileSize,
    price: p.price,
    downloads: [
      { format: 'dwg', file: `/downloads/${p.slug}/${p.slug}-dwg.zip` },
      { format: 'ai', file: `/downloads/${p.slug}/${p.slug}-ai.zip` },
    ],
    checkoutUrl: null,
    lemonVariantId: null,
    thumbnail: `/products/${p.slug}/thumb.svg`,
    gallery: [
      `/products/${p.slug}/01.svg`,
      `/products/${p.slug}/02.svg`,
      `/products/${p.slug}/03.svg`,
    ],
    tags: p.tags,
    featured: p.featured,
    publishedAt: p.publishedAt,
  };
  fs.writeFileSync(path.join(DIR, `${p.slug}.json`), `${JSON.stringify(json, null, 2)}\n`);
}

console.log(`✓ 商品 ${products.length} 点を content/products/ に書き出しました。`);
