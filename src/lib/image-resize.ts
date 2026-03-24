const MAX_DIMENSION = 1920;
const MAX_SIZE_BYTES = 1 * 1024 * 1024; // 1MB
const INITIAL_QUALITY = 0.85;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      type,
      quality
    );
  });
}

export async function resizeImage(file: File): Promise<File> {
  if (file.size <= MAX_SIZE_BYTES && file.type === "image/webp") {
    return file;
  }

  const img = await loadImage(file);
  const { naturalWidth: width, naturalHeight: height } = img;

  let targetW = width;
  let targetH = height;

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    targetW = Math.round(width * ratio);
    targetH = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, targetW, targetH);
  URL.revokeObjectURL(img.src);

  // Safari doesn't support WebP toBlob — fall back to JPEG
  const supportsWebP = await canvasToBlob(canvas, "image/webp", 0.8)
    .then((b) => b.type === "image/webp")
    .catch(() => false);

  const mimeType = supportsWebP ? "image/webp" : "image/jpeg";
  const ext = supportsWebP ? "webp" : "jpg";

  let quality = INITIAL_QUALITY;
  let blob = await canvasToBlob(canvas, mimeType, quality);

  while (blob.size > MAX_SIZE_BYTES && quality > 0.3) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, mimeType, quality);
  }

  return new File([blob], file.name.replace(/\.\w+$/, `.${ext}`), {
    type: mimeType,
  });
}
