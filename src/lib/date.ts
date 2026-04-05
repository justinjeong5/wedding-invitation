export function isAfterWedding(): boolean {
  const weddingDate = new Date(2026, 6, 11, 23, 59, 59);
  return new Date() > weddingDate;
}

export function isGuestGalleryOpen(): boolean {
  // 7월 10일 (전날) 낮 12시부터 공개
  const openDate = new Date(2026, 6, 10, 12, 0, 0);
  return new Date() > openDate;
}
