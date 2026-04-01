import { createClient } from "@supabase/supabase-js";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}

const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const publishableKey = requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

export const supabase = createClient(supabaseUrl, publishableKey);

export function getServiceClient() {
  const secretKey = requireEnv("SUPABASE_SECRET_KEY");
  return createClient(supabaseUrl, secretKey);
}
