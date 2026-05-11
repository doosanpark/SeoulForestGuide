// 클라이언트 사이드 이미지 리사이즈 (Canvas 사용).
// Canvas re-encoding 과정에서 EXIF가 자연스럽게 제거됨 — 위치정보 누출 방지.

const MAX_DIMENSION = 1024;
const OUTPUT_MIME = "image/jpeg";
const OUTPUT_QUALITY = 0.85;

export interface ResizedImage {
  base64: string; // pure base64, no data: prefix
  mimeType: string;
  width: number;
  height: number;
  byteLength: number;
}

export async function resizeForUpload(file: File): Promise<ResizedImage> {
  const bitmap = await fileToBitmap(file);
  const { width, height } = scaleDown(bitmap.width, bitmap.height, MAX_DIMENSION);

  const canvas =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(width, height)
      : Object.assign(document.createElement("canvas"), { width, height });

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await canvasToBlob(canvas, OUTPUT_MIME, OUTPUT_QUALITY);
  const base64 = await blobToBase64(blob);

  return {
    base64,
    mimeType: OUTPUT_MIME,
    width,
    height,
    byteLength: blob.size,
  };
}

async function fileToBitmap(file: File): Promise<ImageBitmap> {
  // createImageBitmap honors EXIF orientation in modern browsers.
  return await createImageBitmap(file, { imageOrientation: "from-image" });
}

function scaleDown(w: number, h: number, max: number): { width: number; height: number } {
  if (w <= max && h <= max) return { width: w, height: h };
  const ratio = w > h ? max / w : max / h;
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}

function canvasToBlob(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  type: string,
  quality: number,
): Promise<Blob> {
  if ("convertToBlob" in canvas) {
    return canvas.convertToBlob({ type, quality });
  }
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas toBlob failed"))),
      type,
      quality,
    );
  });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string; // "data:image/jpeg;base64,..."
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("FileReader error"));
    reader.readAsDataURL(blob);
  });
}
