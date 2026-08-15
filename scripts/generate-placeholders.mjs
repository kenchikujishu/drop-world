#!/usr/bin/env node
/**
 * 仮のサムネイル画像（SVG）を生成する。
 *
 * ⚠ これは実データが届くまでのつなぎ。右下に "PREVIEW PENDING" と入れてあるので、
 *   差し替え忘れたまま公開しても一目で分かる。実サムネイルを
 *   public/products/<slug>/ に置いたら、この SVG は消してよい。
 *
 *   使い方: node scripts/generate-placeholders.mjs
 */

import fs from 'node:fs';
import path from 'node:path';

const W = 800;
const H = 600;
const BASE = 470; // 地面のライン
const ROOT = path.join(process.cwd(), 'public', 'products');

const INK = '#16150F';
const LINE = '#D8D6CD';
const PAPER = '#F1F0EA';

/* ------------------------------------------------------------------ */
/* 被写体ごとの作図                                                      */
/* ------------------------------------------------------------------ */

const s = (d, width = 1.6) =>
  `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const c = (cx, cy, r, width = 1.6) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${INK}" stroke-width="${width}"/>`;

const SUBJECTS = {
  // 立ち姿の人物
  people: (x, scale) => {
    const h = 170 * scale;
    const head = BASE - h;
    const shoulder = head + h * 0.16;
    const hip = head + h * 0.55;
    return [
      c(x, head + h * 0.07, h * 0.075),
      s(`M ${x} ${shoulder} V ${hip}`),
      s(`M ${x - h * 0.14} ${shoulder + h * 0.05} Q ${x} ${shoulder - h * 0.01} ${x + h * 0.14} ${shoulder + h * 0.05}`),
      s(`M ${x - h * 0.14} ${shoulder + h * 0.05} L ${x - h * 0.16} ${hip - h * 0.04}`),
      s(`M ${x + h * 0.14} ${shoulder + h * 0.05} L ${x + h * 0.17} ${hip - h * 0.02}`),
      s(`M ${x} ${hip} L ${x - h * 0.1} ${BASE}`),
      s(`M ${x} ${hip} L ${x + h * 0.11} ${BASE}`),
    ].join('');
  },

  // 樹木
  vegetation: (x, scale) => {
    const h = 200 * scale;
    const top = BASE - h;
    const r = h * 0.3;
    return [
      s(`M ${x} ${BASE} V ${top + r * 1.1}`),
      s(`M ${x} ${BASE - h * 0.34} l ${-r * 0.5} ${-r * 0.36}`),
      s(`M ${x} ${BASE - h * 0.46} l ${r * 0.48} ${-r * 0.32}`),
      c(x, top + r, r),
      c(x - r * 0.62, top + r * 1.5, r * 0.52),
      c(x + r * 0.66, top + r * 1.45, r * 0.48),
    ].join('');
  },

  // 椅子（立面）
  furniture: (x, scale) => {
    const h = 120 * scale;
    const w = h * 0.75;
    const seat = BASE - h * 0.46;
    return [
      s(`M ${x - w / 2} ${seat} H ${x + w / 2}`),
      s(`M ${x - w / 2} ${seat} V ${BASE}`),
      s(`M ${x + w / 2} ${seat} V ${BASE}`),
      s(`M ${x - w / 2} ${seat} V ${BASE - h}`),
      s(`M ${x - w / 2} ${BASE - h} H ${x - w * 0.12}`),
      s(`M ${x - w * 0.12} ${BASE - h} V ${seat}`),
    ].join('');
  },

  // 乗用車（立面）
  vehicle: (x, scale) => {
    const w = 210 * scale;
    const h = w * 0.42;
    const left = x - w / 2;
    const roofL = left + w * 0.26;
    const roofR = left + w * 0.68;
    return [
      s(
        `M ${left} ${BASE - h * 0.34} q 0 ${-h * 0.2} ${w * 0.1} ${-h * 0.22} L ${roofL} ${BASE - h * 0.56} q ${w * 0.06} ${-h * 0.44} ${w * 0.16} ${-h * 0.44} h ${w * 0.14} q ${w * 0.12} 0 ${w * 0.18} ${h * 0.44} l ${w * 0.16} ${h * 0.04} q ${w * 0.08} ${h * 0.06} ${w * 0.08} ${h * 0.28} v ${h * 0.3} H ${left} Z`,
      ),
      s(`M ${roofL} ${BASE - h * 0.56} H ${roofR}`),
      c(left + w * 0.24, BASE - h * 0.06, h * 0.19),
      c(left + w * 0.77, BASE - h * 0.06, h * 0.19),
    ].join('');
  },

  // 犬（立面）
  animal: (x, scale) => {
    const w = 110 * scale;
    const h = w * 0.62;
    const left = x - w / 2;
    const back = BASE - h;
    return [
      s(`M ${left} ${back + h * 0.24} q ${w * 0.3} ${-h * 0.2} ${w * 0.72} 0`),
      s(`M ${left} ${back + h * 0.24} V ${BASE - h * 0.06}`),
      s(`M ${left + w * 0.72} ${back + h * 0.24} q ${w * 0.16} ${-h * 0.06} ${w * 0.16} ${-h * 0.22} l ${w * 0.12} ${-h * 0.02} l ${-w * 0.02} ${h * 0.3}`),
      s(`M ${left + w * 0.08} ${back + h * 0.5} V ${BASE}`),
      s(`M ${left + w * 0.24} ${back + h * 0.52} V ${BASE}`),
      s(`M ${left + w * 0.62} ${back + h * 0.5} V ${BASE}`),
      s(`M ${left + w * 0.74} ${back + h * 0.52} V ${BASE}`),
      s(`M ${left} ${back + h * 0.26} q ${-w * 0.14} ${-h * 0.3} ${-w * 0.02} ${-h * 0.4}`),
    ].join('');
  },

  // ベンチ・植木鉢などの小物
  decoration: (x, scale) => {
    const h = 90 * scale;
    const w = h * 1.7;
    return [
      s(`M ${x - w / 2} ${BASE - h * 0.52} H ${x + w / 2}`),
      s(`M ${x - w / 2} ${BASE - h * 0.62} H ${x + w / 2}`),
      s(`M ${x - w * 0.38} ${BASE - h * 0.52} V ${BASE}`),
      s(`M ${x + w * 0.38} ${BASE - h * 0.52} V ${BASE}`),
      s(`M ${x - w * 0.38} ${BASE - h * 0.62} V ${BASE - h}`),
      s(`M ${x + w * 0.38} ${BASE - h * 0.62} V ${BASE - h}`),
      s(`M ${x - w * 0.38} ${BASE - h} H ${x + w * 0.38}`),
    ].join('');
  },

  // 切妻の小さな建物
  building: (x, scale) => {
    const w = 150 * scale;
    const h = w * 0.9;
    const left = x - w / 2;
    return [
      s(`M ${left} ${BASE} V ${BASE - h * 0.6} L ${x} ${BASE - h} L ${left + w} ${BASE - h * 0.6} V ${BASE} Z`),
      s(`M ${left + w * 0.18} ${BASE} V ${BASE - h * 0.3} H ${left + w * 0.42} V ${BASE}`),
      s(`M ${left + w * 0.58} ${BASE - h * 0.16} h ${w * 0.24} v ${-h * 0.2} h ${-w * 0.24} Z`),
    ].join('');
  },

  // 遠景のスカイライン
  background: (x, scale) => {
    const w = 240 * scale;
    const left = x - w / 2;
    const blocks = [0.5, 0.78, 0.34, 0.62, 0.44];
    return blocks
      .map((ratio, index) => {
        const bw = w / blocks.length;
        const bx = left + index * bw;
        const bh = 150 * scale * ratio + 30;
        return s(`M ${bx} ${BASE} V ${BASE - bh} H ${bx + bw * 0.86} V ${BASE}`, 1.3);
      })
      .join('');
  },
};

/* ------------------------------------------------------------------ */
/* SVG 組み立て                                                         */
/* ------------------------------------------------------------------ */

function grid() {
  const lines = [];
  for (let x = 40; x < W; x += 40) {
    lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${LINE}" stroke-width="1"/>`);
  }
  for (let y = 40; y < H; y += 40) {
    lines.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${LINE}" stroke-width="1"/>`);
  }
  return lines.join('');
}

function makeSvg({ category, count, scales, label }) {
  const draw = SUBJECTS[category] ?? SUBJECTS.people;
  const step = W / (count + 1);

  const figures = Array.from({ length: count }, (_, index) =>
    draw(step * (index + 1), scales[index % scales.length]),
  ).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
  <rect width="${W}" height="${H}" fill="${PAPER}"/>
  ${grid()}
  <line x1="0" y1="${BASE}" x2="${W}" y2="${BASE}" stroke="${INK}" stroke-width="1.2"/>
  ${figures}
  <text x="24" y="${H - 26}" font-family="ui-monospace, monospace" font-size="15" fill="#9C998D" letter-spacing="1.6">${label}</text>
  <text x="${W - 24}" y="${H - 26}" text-anchor="end" font-family="ui-monospace, monospace" font-size="15" fill="#9C998D" letter-spacing="1.6">PREVIEW PENDING</text>
</svg>
`;
}

/* ------------------------------------------------------------------ */
/* 実行                                                                */
/* ------------------------------------------------------------------ */

/** 1商品につき thumb + 3枚のギャラリー。枚数と大きさを変えて別カットに見せる。 */
const VARIANTS = [
  { name: 'thumb', count: 4, scales: [1, 0.86, 1.06, 0.92] },
  { name: '01', count: 4, scales: [1, 0.86, 1.06, 0.92] },
  { name: '02', count: 6, scales: [0.8, 0.7, 0.86, 0.74, 0.9, 0.78] },
  { name: '03', count: 3, scales: [1.15, 1, 1.1] },
];

const PRODUCTS = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'scripts', 'placeholder-manifest.json'), 'utf-8'),
);

let written = 0;
for (const { slug, category } of PRODUCTS) {
  const dir = path.join(ROOT, slug);
  fs.mkdirSync(dir, { recursive: true });

  for (const variant of VARIANTS) {
    const svg = makeSvg({
      category,
      count: variant.count,
      scales: variant.scales,
      label: slug.toUpperCase().replace(/-/g, ' '),
    });
    fs.writeFileSync(path.join(dir, `${variant.name}.svg`), svg);
    written += 1;
  }
}

console.log(`✓ ${written} 枚のプレースホルダー SVG を public/products/ に生成しました。`);
