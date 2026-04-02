export function isAfterWedding(): boolean {
  const weddingDate = new Date(2026, 6, 11, 23, 59, 59);
  return new Date() > weddingDate;
}
