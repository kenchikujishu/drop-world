/* eslint-disable */
// ⚠ このファイルは自動生成です。直接編集しないでください。
// 生成元: scripts/write-products-index.mjs
// 再生成: npm run validate:products（npm run build の前に自動で走ります）
//
// Cloudflare Workers にはファイルシステムが無いため、商品 JSON は fs で読まず、
// ここで静的 import してバンドルに埋め込みます。

import animalCatsVol01 from './products/animal-cats-vol-01.json';
import animalDogsVol01 from './products/animal-dogs-vol-01.json';
import peopleChildrenVol01 from './products/people-children-vol-01.json';
import peopleWorkersVol01 from './products/people-workers-vol-01.json';
import vegetationShrubsVol01 from './products/vegetation-shrubs-vol-01.json';
import vegetationTreesVol01 from './products/vegetation-trees-vol-01.json';

export const RAW_PRODUCTS: { file: string; data: unknown }[] = [
  { file: 'animal-cats-vol-01.json', data: animalCatsVol01 },
  { file: 'animal-dogs-vol-01.json', data: animalDogsVol01 },
  { file: 'people-children-vol-01.json', data: peopleChildrenVol01 },
  { file: 'people-workers-vol-01.json', data: peopleWorkersVol01 },
  { file: 'vegetation-shrubs-vol-01.json', data: vegetationShrubsVol01 },
  { file: 'vegetation-trees-vol-01.json', data: vegetationTreesVol01 },
];

/** 配布 zip のサイズ。実ファイルから自動算出しているので手で直さないこと。 */
export const DOWNLOAD_SIZES: Record<string, string> = {
  '/downloads/animal-cats-vol-01/animal-cats-vol-01-dwg.zip': '606 B',
  '/downloads/animal-cats-vol-01/animal-cats-vol-01-ai.zip': '603 B',
  '/downloads/animal-dogs-vol-01/animal-dogs-vol-01-dwg.zip': '606 B',
  '/downloads/animal-dogs-vol-01/animal-dogs-vol-01-ai.zip': '604 B',
  '/downloads/people-children-vol-01/people-children-vol-01-dwg.zip': '607 B',
  '/downloads/people-children-vol-01/people-children-vol-01-ai.zip': '606 B',
  '/downloads/people-workers-vol-01/people-workers-vol-01-dwg.zip': '608 B',
  '/downloads/people-workers-vol-01/people-workers-vol-01-ai.zip': '605 B',
  '/downloads/vegetation-shrubs-vol-01/vegetation-shrubs-vol-01-dwg.zip': '612 B',
  '/downloads/vegetation-shrubs-vol-01/vegetation-shrubs-vol-01-ai.zip': '610 B',
  '/downloads/vegetation-trees-vol-01/vegetation-trees-vol-01-dwg.zip': '609 B',
  '/downloads/vegetation-trees-vol-01/vegetation-trees-vol-01-ai.zip': '607 B',
};
