#!/usr/bin/env node
/**
 * Lemon にアップロードする商品画像を作る。
 *
 *   npm run export:thumbs -- <ファイル> [<ファイル> ...] [--out <フォルダ>]
 *
 * - .ai / .pdf は各ページを1枚ずつ書き出す（白紙ページは飛ばす）
 * - .png / .jpg はそのまま使う
 * どれも 2000×2000 の正方形（白い余白で埋める）にそろえる。
 * Lemon は商品画像を正方形で扱うため、縦長のまま上げると上下が切れる。
 *
 * 出力先の既定: デスクトップの drop-world-lemon-upload/<元ファイル名>/
 * macOS 専用（PDFKit と sips を使う）。
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SIZE = 2000;
// これより小さい PNG は何も描かれていないページとみなす
const BLANK_BYTES = 60_000;

const argv = process.argv.slice(2);
const outIndex = argv.indexOf('--out');
const outBase =
  outIndex >= 0 && argv[outIndex + 1]
    ? expandHome(argv[outIndex + 1])
    : path.join(os.homedir(), 'Desktop', 'drop-world-lemon-upload');
const inputs = argv.filter((_, i) => outIndex < 0 || (i !== outIndex && i !== outIndex + 1));

if (inputs.length === 0) {
  console.error('使い方: npm run export:thumbs -- <ファイル.ai|.pdf|.png|.jpg> [...] [--out <フォルダ>]');
  process.exit(1);
}

const renderScript = path.join(process.cwd(), 'scripts', 'lib', 'render-pdf.js');

for (const input of inputs) {
  const source = expandHome(input);
  if (!fs.existsSync(source)) {
    console.error(`✗ 見つかりません: ${source}`);
    process.exitCode = 1;
    continue;
  }

  const ext = path.extname(source).toLowerCase();
  const outDir = path.join(outBase, path.basename(source, path.extname(source)));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dw-thumbs-'));
  fs.mkdirSync(outDir, { recursive: true });

  let pages = [];
  if (ext === '.ai' || ext === '.pdf') {
    execFileSync('osascript', ['-l', 'JavaScript', renderScript, source, tmp, String(SIZE), 'page'], {
      stdio: 'ignore',
    });
    pages = fs
      .readdirSync(tmp)
      .filter((f) => /^page-\d+\.png$/.test(f))
      .sort((a, b) => pageNumber(a) - pageNumber(b))
      .map((f) => path.join(tmp, f));
  } else if (['.png', '.jpg', '.jpeg'].includes(ext)) {
    const resized = path.join(tmp, 'page-1.png');
    execFileSync('sips', ['-s', 'format', 'png', '-Z', String(SIZE), source, '--out', resized], {
      stdio: 'ignore',
    });
    pages = [resized];
  } else {
    console.error(`✗ 対応していない形式です: ${source}（.ai / .pdf / .png / .jpg）`);
    process.exitCode = 1;
    continue;
  }

  const written = [];
  let sheet = 0;
  for (const page of pages) {
    if (fs.statSync(page).size < BLANK_BYTES) continue;
    sheet += 1;
    const out = path.join(outDir, `sheet-${sheet}.png`);
    execFileSync('sips', ['-p', String(SIZE), String(SIZE), '--padColor', 'FFFFFF', page, '--out', out], {
      stdio: 'ignore',
    });
    written.push(out);
  }

  fs.rmSync(tmp, { recursive: true, force: true });

  if (written.length === 0) {
    console.error(`✗ ${path.basename(source)}: 書き出せるページがありませんでした`);
    process.exitCode = 1;
    continue;
  }
  console.log(`✓ ${path.basename(source)} → ${written.length} 枚（${SIZE}×${SIZE}）`);
  for (const file of written) console.log(`    ${file}`);
}

function expandHome(p) {
  return p.replace(/^~(?=$|\/)/, os.homedir());
}

function pageNumber(filename) {
  return Number(filename.match(/-(\d+)\.png$/)?.[1] ?? 0);
}
