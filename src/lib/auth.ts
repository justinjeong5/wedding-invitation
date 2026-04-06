import bcrypt from "bcryptjs";
import { getServiceClient } from "@/lib/supabase";
import type { FormState } from "@/types";

const SALT_ROUNDS = 10;
const ADMIN_PASSWORD = process.env.GUEST_GALLERY_ADMIN_PASSWORD ?? "";

export function isAdminPassword(password: string): boolean {
  return !!ADMIN_PASSWORD && password === ADMIN_PASSWORD;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  table: string,
  id: string,
  password: string,
  notFoundMessage: string
): Promise<FormState> {
  const serviceClient = getServiceClient();
  const { data } = await serviceClient
    .from(table)
    .select("password")
    .eq("id", id)
    .single();

  if (!data) {
    return { success: false, error: notFoundMessage };
  }

  const isMatch = await bcrypt.compare(password, data.password);
  if (!isMatch) {
    return { success: false, error: "비밀번호가 일치하지 않습니다." };
  }

  return { success: true };
}
