"use server";

import { isAdminPassword } from "@/lib/auth";

export async function verifyAdminPassword(password: string): Promise<boolean> {
  return isAdminPassword(password);
}
