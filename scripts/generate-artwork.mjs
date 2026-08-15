#!/usr/bin/env node
/**
 * 商品のサムネイル / ギャラリー画像（SVG）を作図する。
 *
 *   node scripts/generate-artwork.mjs
 *
 * 出力先は public/products/<slug>/{thumb,01,02,03}.svg。
 * 図形の定義は scripts/lib/figures.mjs にある。
 *
 * 線は vector-effect="non-scaling-stroke" で描くので、図が大きくても小さくても
 * 線幅が揃う（作例と同じ、製図らしい見え方にするため）。
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  adultAxo,
  adultBack,
  adultFront,
  adultSide,
  broadleafTree,
  catCurled,
  catSide,
  childAxo,
  childFront,
  childSide,
  coniferTree,
  dogSitting,
  dogSide,
  shrub,
  treePlan,
} from './lib/figures.mjs';

const W = 960;
const H = 960;

const INK = '#1a1a1a';
const FILL = '#ececec';

/* ------------------------------------------------------------------ */
/* 描画                                                                */
/* ------------------------------------------------------------------ */

function place(figure, { x, y, scale = 1, flip = false }) {
  const transform = `translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`;
  const body = figure
    .map(({ d, kind }) =>
      kind === 'outline'
        ? `<path d="${d}" fill="${FILL}" stroke="${INK}" stroke-width="1.7" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"/>`
        : `<path d="${d}" fill="none" stroke="${INK}" stroke-width="1.05" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"/>`,
    )
    .join('\n    ');
  return `  <g transform="${transform}">\n    ${body}\n  </g>`;
}

function sheet(items) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
  <rect width="${W}" height="${H}" fill="#ffffff"/>
${items.map((item) => place(item.figure, item)).join('\n')}
  <line x1="0" y1="${H - 3}" x2="${W}" y2="${H - 3}" stroke="${INK}" stroke-width="3"/>
</svg>
`;
}

/* ------------------------------------------------------------------ */
/* 各商品のレイアウト                                                    */
/* ------------------------------------------------------------------ */

/** 大人。作例と同じく上段に俯瞰・アクソメ、下段に背面・正面・側面。 */
const workers = {
  thumb: [
    { figure: adultAxo(), x: 175, y: 430, scale: 2.0 },
    { figure: adultSide(), x: 480, y: 445, scale: 2.05, flip: true },
    { figure: adultAxo(), x: 790, y: 425, scale: 1.9, flip: true },
    { figure: adultBack(), x: 175, y: 905, scale: 2.15 },
    { figure: adultFront(), x: 480, y: 905, scale: 2.15 },
    { figure: adultSide(), x: 790, y: 905, scale: 2.15 },
  ],
  '01': [
    { figure: adultFront(), x: 200, y: 890, scale: 2.3 },
    { figure: adultBack(), x: 480, y: 890, scale: 2.3 },
    { figure: adultSide(), x: 760, y: 890, scale: 2.3 },
  ],
  '02': [
    { figure: adultSide(), x: 150, y: 470, scale: 1.75 },
    { figure: adultSide(), x: 420, y: 470, scale: 1.75, flip: true },
    { figure: adultFront(), x: 690, y: 470, scale: 1.75 },
    { figure: adultBack(), x: 150, y: 910, scale: 1.75 },
    { figure: adultAxo(), x: 420, y: 890, scale: 1.75 },
    { figure: adultAxo(), x: 690, y: 890, scale: 1.75, flip: true },
  ],
  '03': [
    { figure: adultSide(), x: 180, y: 880, scale: 2.4 },
    { figure: adultFront(), x: 480, y: 880, scale: 2.4 },
    { figure: adultAxo(), x: 790, y: 800, scale: 2.4, flip: true },
  ],
};

/** 子ども。 */
const children = {
  thumb: [
    { figure: childAxo(), x: 300, y: 440, scale: 2.6 },
    { figure: childSide(), x: 690, y: 450, scale: 2.5 },
    { figure: childFront(), x: 300, y: 900, scale: 2.9 },
    { figure: childSide(), x: 690, y: 900, scale: 2.9, flip: true },
  ],
  '01': [
    { figure: childFront(), x: 260, y: 880, scale: 3.4 },
    { figure: childSide(), x: 680, y: 880, scale: 3.4 },
  ],
  '02': [
    { figure: childSide(), x: 240, y: 460, scale: 2.6, flip: true },
    { figure: childFront(), x: 700, y: 460, scale: 2.6 },
    { figure: childAxo(), x: 240, y: 900, scale: 2.6 },
    { figure: childAxo(), x: 700, y: 900, scale: 2.6, flip: true },
  ],
  '03': [
    { figure: childFront(), x: 200, y: 900, scale: 2.4 },
    { figure: childSide(), x: 430, y: 900, scale: 2.4 },
    { figure: childSide(), x: 650, y: 900, scale: 2.4, flip: true },
    { figure: childAxo(), x: 840, y: 880, scale: 2.4 },
  ],
};

/** 樹木。 */
const trees = {
  thumb: [
    { figure: broadleafTree(190, 2), x: 175, y: 470, scale: 1.5 },
    { figure: coniferTree(200), x: 480, y: 470, scale: 1.4 },
    { figure: broadleafTree(165, 9), x: 785, y: 470, scale: 1.5 },
    { figure: broadleafTree(150, 21), x: 175, y: 930, scale: 1.5 },
    { figure: broadleafTree(185, 33), x: 480, y: 930, scale: 1.5 },
    { figure: coniferTree(170), x: 785, y: 930, scale: 1.45 },
  ],
  '01': [
    { figure: broadleafTree(210, 4), x: 240, y: 900, scale: 2.0 },
    { figure: broadleafTree(180, 14), x: 620, y: 900, scale: 2.0 },
    { figure: shrub(80, 6), x: 850, y: 900, scale: 2.0 },
  ],
  '02': [
    { figure: coniferTree(220), x: 250, y: 910, scale: 1.9 },
    { figure: coniferTree(180), x: 520, y: 910, scale: 1.9 },
    { figure: broadleafTree(160, 41), x: 780, y: 910, scale: 1.9 },
  ],
  '03': [
    { figure: broadleafTree(150, 2), x: 160, y: 480, scale: 1.4 },
    { figure: broadleafTree(140, 9), x: 400, y: 480, scale: 1.4 },
    { figure: broadleafTree(160, 21), x: 640, y: 480, scale: 1.4 },
    { figure: coniferTree(150), x: 860, y: 480, scale: 1.4 },
    { figure: broadleafTree(155, 33), x: 160, y: 930, scale: 1.4 },
    { figure: coniferTree(140), x: 400, y: 930, scale: 1.4 },
    { figure: broadleafTree(145, 41), x: 640, y: 930, scale: 1.4 },
    { figure: broadleafTree(150, 55), x: 860, y: 930, scale: 1.4 },
  ],
};

/** 低木と平面。 */
const shrubs = {
  thumb: [
    { figure: treePlan(180, 3), x: 250, y: 260, scale: 1.5 },
    { figure: treePlan(150, 12), x: 660, y: 250, scale: 1.5 },
    { figure: shrub(90, 5), x: 180, y: 900, scale: 2.1 },
    { figure: shrub(110, 15), x: 480, y: 900, scale: 2.1 },
    { figure: shrub(80, 25), x: 780, y: 900, scale: 2.1 },
  ],
  '01': [
    { figure: shrub(100, 2), x: 200, y: 880, scale: 2.6 },
    { figure: shrub(120, 12), x: 520, y: 880, scale: 2.6 },
    { figure: shrub(90, 22), x: 810, y: 880, scale: 2.6 },
  ],
  '02': [
    { figure: treePlan(200, 7), x: 260, y: 300, scale: 1.3 },
    { figure: treePlan(170, 17), x: 680, y: 290, scale: 1.3 },
    { figure: treePlan(190, 27), x: 260, y: 700, scale: 1.3 },
    { figure: treePlan(160, 37), x: 680, y: 690, scale: 1.3 },
  ],
  '03': [
    { figure: shrub(70, 3), x: 130, y: 500, scale: 1.9 },
    { figure: shrub(90, 13), x: 370, y: 500, scale: 1.9 },
    { figure: shrub(75, 23), x: 610, y: 500, scale: 1.9 },
    { figure: shrub(95, 33), x: 850, y: 500, scale: 1.9 },
    { figure: treePlan(130, 43), x: 250, y: 780, scale: 1.5 },
    { figure: treePlan(120, 53), x: 700, y: 780, scale: 1.5 },
  ],
};

/** 犬。 */
const dogs = {
  thumb: [
    { figure: dogSide(95), x: 250, y: 420, scale: 2.1 },
    { figure: dogSitting(95), x: 700, y: 430, scale: 2.1 },
    { figure: dogSide(80), x: 230, y: 900, scale: 2.1, flip: true },
    { figure: dogSide(105), x: 680, y: 900, scale: 2.1 },
  ],
  '01': [
    { figure: dogSide(110), x: 300, y: 780, scale: 2.7 },
    { figure: dogSitting(110), x: 740, y: 800, scale: 2.7 },
  ],
  '02': [
    { figure: dogSide(70), x: 200, y: 400, scale: 2.0 },
    { figure: dogSide(90), x: 620, y: 410, scale: 2.0, flip: true },
    { figure: dogSitting(75), x: 200, y: 880, scale: 2.0 },
    { figure: dogSide(100), x: 620, y: 880, scale: 2.0 },
  ],
  '03': [
    { figure: dogSide(65), x: 180, y: 500, scale: 1.7 },
    { figure: dogSitting(70), x: 480, y: 500, scale: 1.7 },
    { figure: dogSide(75), x: 800, y: 500, scale: 1.7, flip: true },
    { figure: dogSide(85), x: 250, y: 900, scale: 1.7 },
    { figure: dogSide(60), x: 640, y: 900, scale: 1.7, flip: true },
    { figure: dogSitting(90), x: 860, y: 900, scale: 1.7 },
  ],
};

/** 猫。 */
const cats = {
  thumb: [
    { figure: catSide(70), x: 270, y: 400, scale: 2.4 },
    { figure: catCurled(45), x: 710, y: 400, scale: 2.4 },
    { figure: catSide(60), x: 250, y: 880, scale: 2.4, flip: true },
    { figure: catSide(78), x: 700, y: 880, scale: 2.4 },
  ],
  '01': [
    { figure: catSide(80), x: 300, y: 760, scale: 3.2 },
    { figure: catCurled(50), x: 720, y: 780, scale: 3.2 },
  ],
  '02': [
    { figure: catSide(55), x: 200, y: 400, scale: 2.2 },
    { figure: catSide(70), x: 620, y: 400, scale: 2.2, flip: true },
    { figure: catCurled(40), x: 220, y: 880, scale: 2.2 },
    { figure: catSide(62), x: 660, y: 880, scale: 2.2 },
  ],
  '03': [
    { figure: catSide(50), x: 170, y: 480, scale: 1.9 },
    { figure: catCurled(38), x: 500, y: 480, scale: 1.9 },
    { figure: catSide(58), x: 820, y: 480, scale: 1.9, flip: true },
    { figure: catSide(64), x: 250, y: 890, scale: 1.9 },
    { figure: catCurled(42), x: 620, y: 890, scale: 1.9, flip: true },
    { figure: catSide(48), x: 880, y: 890, scale: 1.9 },
  ],
};

const SHEETS = {
  'people-workers-vol-01': workers,
  'people-children-vol-01': children,
  'vegetation-trees-vol-01': trees,
  'vegetation-shrubs-vol-01': shrubs,
  'animal-dogs-vol-01': dogs,
  'animal-cats-vol-01': cats,
};

/* ------------------------------------------------------------------ */
/* 実行                                                                */
/* ------------------------------------------------------------------ */

let count = 0;
for (const [slug, variants] of Object.entries(SHEETS)) {
  const dir = path.join(process.cwd(), 'public', 'products', slug);
  fs.mkdirSync(dir, { recursive: true });

  for (const [name, items] of Object.entries(variants)) {
    fs.writeFileSync(path.join(dir, `${name}.svg`), sheet(items));
    count += 1;
  }
}

console.log(`✓ ${count} 枚の添景シートを public/products/ に生成しました。`);
