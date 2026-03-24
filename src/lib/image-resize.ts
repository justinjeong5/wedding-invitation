const MAX_DIMENSION = 1920;
const MAX_SIZE_BYTES = 1 * 1024 * 1024; // 1MB
const INITIAL_QUALITY = 0.85;

export async function resizeImage(file: File): Promise<File> {
  if (file.size <= MAX_SIZE_BYTES && file.type === "image/webp") {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  let targetW = width;
  let targetH = height;

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    targetW = Math.round(width * ratio);
    targetH = Math.round(height * ratio);
  }

  const canvas = new OffscreenCanvas(targetW, targetH);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  bitmap.close();

  let quality = INITIAL_QUALITY;
  let blob = await canvas.convertToBlob({ type: "image/webp", quality });

  while (blob.size > MAX_SIZE_BYTES && quality > 0.3) {
    quality -= 0.1;
    blob = await canvas.convertToBlob({ type: "image/webp", quality });
  }

  return new File([blob], file.name.replace(/\.\w+$/, ".webp"), {
    type: "image/webp",
  });
}
