const MAX_DIMENSION = 1920;
const MAX_SIZE_BYTES = 1 * 1024 * 1024; // 1MB
const MAX_INPUT_SIZE = 30 * 1024 * 1024; // 30MB (원본 제한, 리사이즈 후 1MB 이하로 변환)
const INITIAL_QUALITY = 0.85;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const MAX_ASPECT_RATIO = 3; // 가로:세로 또는 세로:가로 최대 3:1

export function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "JPG, PNG, WebP, HEIC 형식만 업로드할 수 있습니다.";
  }
  if (file.size > MAX_INPUT_SIZE) {
    return "파일 크기는 30MB 이하여야 합니다.";
  }
  return null;
}

export function validateAspectRatio(width: number, height: number): string | null {
  const ratio = Math.max(width / height, height / width);
  if (ratio > MAX_ASPECT_RATIO) {
    return "일반적인 사진 비율이 아닙니다. (배너, 파노라마 등은 업로드할 수 없습니다)";
  }
  return null;
}

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
