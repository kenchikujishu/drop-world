/* eslint-disable */
// ⚠ このファイルは自動生成です。直接編集しないでください。
// 生成元: scripts/write-products-index.mjs
// 再生成: npm run validate:products（npm run build の前に自動で走ります）
//
// Cloudflare Workers にはファイルシステムが無いため、商品 JSON は fs で読まず、
// ここで静的 import してバンドルに埋め込みます。

import animalCompanionsElevationVol01 from './products/animal-companions-elevation-vol-01.json';
import furnitureInteriorPlanVol01 from './products/furniture-interior-plan-vol-01.json';
import peopleElevationVol01 from './products/people-elevation-vol-01.json';
import peoplePlanVol01 from './products/people-plan-vol-01.json';
import vegetationTreesElevationVol01 from './products/vegetation-trees-elevation-vol-01.json';
import vehicleCarsElevationVol01 from './products/vehicle-cars-elevation-vol-01.json';

export const RAW_PRODUCTS: { file: string; data: unknown }[] = [
  { file: 'animal-companions-elevation-vol-01.json', data: animalCompanionsElevationVol01 },
  { file: 'furniture-interior-plan-vol-01.json', data: furnitureInteriorPlanVol01 },
  { file: 'people-elevation-vol-01.json', data: peopleElevationVol01 },
  { file: 'people-plan-vol-01.json', data: peoplePlanVol01 },
  { file: 'vegetation-trees-elevation-vol-01.json', data: vegetationTreesElevationVol01 },
  { file: 'vehicle-cars-elevation-vol-01.json', data: vehicleCarsElevationVol01 },
];
