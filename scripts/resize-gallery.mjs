#!/usr/bin/env node
/**
 * Gallery image resize script
 *
 * 목적: 모바일 전용 청첩장에서 88장 × 4000×3000 원본 이미지로 인한
 *       Chrome renderer OOM (Aw Snap!) 을 해결하기 위해 사전 리사이즈.
 *
 * 전략:
 * - 모바일 최대 DPR 3 + Swiper Zoom 2x 를 고려해 가로 1600px 로 축소
 * - JPEG quality 85, mozjpeg, progressive (육안상 원본과 거의 동일)
 * - EXIF orientation 은 rotate() 로 적용 후 메타데이터 제거
 * - 원본은 public/images/gallery/_original/ 에 백업 (idempotent)
 * - 커버는 LCP 최적화를 위해 1200px quality 82 로 별도 처리
 * - 병렬 처리 (concurrency 6) 로 88장을 빠르게 처리
 * - width 기반 idempotency: 이미 리사이즈된 파일은 재처리하지 않음
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(process.cwd());
const GALLERY_DIR = path.join(ROOT, "public/images/gallery");
const BACKUP_DIR = path.join(GALLERY_DIR, "_original");
const COVER_SRC = path.join(ROOT, "public/images/cover.jpg");
const COVER_BACKUP = path.join(ROOT, "public/images/_original_cover.jpg");

const GALLERY_MAX_WIDTH = 1600;
const GALLERY_QUALITY = 85;
const COVER_MAX_WIDTH = 1200;
const COVER_QUALITY = 82;
const CONCURRENCY = 6;

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
}

async function resizeToBuffer(srcPath, { maxWidth, quality }) {
  return sharp(srcPath)
    .rotate()
    .resize({
      width: maxWidth,
      withoutEnlargement: true,
      fit: "inside",
    })
    .jpeg({
      quality,
      mozjpeg: true,
      progressive: true,
      chromaSubsampling: "4:2:0",
    })
    .toBuffer();
}

async function atomicWrite(dest, buffer) {
  const tmp = `${dest}.tmp`;
  await fs.writeFile(tmp, buffer);
  await fs.rename(tmp, dest);
}

async function processGalleryFile(file) {
  const src = path.join(GALLERY_DIR, file);
  const backup = path.join(BACKUP_DIR, file);

  // 1. 원본을 백업에 보관 (idempotent)
  if (!(await exists(backup))) {
    await fs.copyFile(src, backup);
  }

  // 2. width 기반으로 이미 리사이즈 완료 여부 판정 (결정론적)
  const currentMeta = await sharp(src).metadata();
  const originalSize = (await fs.stat(backup)).size;
  const currentSize = (await fs.stat(src)).size;

  if (currentMeta.width && currentMeta.width <= GALLERY_MAX_WIDTH) {
    return { file, originalSize, finalSize: currentSize, skipped: true };
  }

  // 3. 원본(backup)에서 리사이즈하여 src 를 atomic 교체
  const buffer = await resizeToBuffer(backup, {
    maxWidth: GALLERY_MAX_WIDTH,
    quality: GALLERY_QUALITY,
  });
  await atomicWrite(src, buffer);

  return { file, originalSize, finalSize: buffer.length, skipped: false };
}

async function runInPool(items, concurrency, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function next() {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, next));
  return results;
}

async function processGallery() {
  await ensureDir(BACKUP_DIR);

  const entries = await fs.readdir(GALLERY_DIR, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && /\.(jpe?g|png)$/i.test(e.name))
    .map((e) => e.name)
    .sort();

  const results = await runInPool(files, CONCURRENCY, processGalleryFile);

  let totalBefore = 0;
  let totalAfter = 0;
  let processed = 0;
  let skipped = 0;

  for (const r of results) {
    totalBefore += r.originalSize;
    totalAfter += r.finalSize;
    if (r.skipped) {
      skipped++;
    } else {
      processed++;
      const saving = (((r.originalSize - r.finalSize) / r.originalSize) * 100).toFixed(0);
      console.log(
        `  ${r.file}  ${formatSize(r.originalSize)} → ${formatSize(r.finalSize)}  (-${saving}%)`
      );
    }
  }

  console.log(
    `\n  총 ${files.length}장: 처리 ${processed}, skip ${skipped}`
  );
  if (totalBefore > 0) {
    console.log(
      `  용량: ${formatSize(totalBefore)} → ${formatSize(totalAfter)}  (-${(
        ((totalBefore - totalAfter) / totalBefore) *
        100
      ).toFixed(0)}%)\n`
    );
  }
}

async function processCover() {
  if (!(await exists(COVER_SRC))) {
    console.log("  cover.jpg 없음, 스킵\n");
    return;
  }

  if (!(await exists(COVER_BACKUP))) {
    await fs.copyFile(COVER_SRC, COVER_BACKUP);
  }

  const currentMeta = await sharp(COVER_SRC).metadata();
  const originalSize = (await fs.stat(COVER_BACKUP)).size;
  const currentSize = (await fs.stat(COVER_SRC)).size;

  if (currentMeta.width && currentMeta.width <= COVER_MAX_WIDTH) {
    console.log(`  cover.jpg  이미 최적화됨 (${formatSize(currentSize)})\n`);
    return;
  }

  const buffer = await resizeToBuffer(COVER_BACKUP, {
    maxWidth: COVER_MAX_WIDTH,
    quality: COVER_QUALITY,
  });
  await atomicWrite(COVER_SRC, buffer);

  const saving = (((originalSize - buffer.length) / originalSize) * 100).toFixed(0);
  console.log(
    `  cover.jpg  ${formatSize(originalSize)} → ${formatSize(buffer.length)}  (-${saving}%)\n`
  );
}

async function main() {
  console.log("\n[1/2] gallery 리사이즈 (max 1600px, q85 mozjpeg, concurrency 6)");
  await processGallery();
  console.log("[2/2] cover 리사이즈 (max 1200px, q82 mozjpeg)");
  await processCover();
  console.log("완료. 원본은 _original/ 에 백업됨.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
