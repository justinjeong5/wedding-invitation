const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/guest-photos`;

export function getImageUrl(path: string) {
  return `${STORAGE_BASE}/${path}`;
}
