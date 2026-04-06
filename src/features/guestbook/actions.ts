"use server";

import { supabase, getServiceClient } from "@/lib/supabase";
import { hashPassword, verifyPassword, isAdminPassword } from "@/lib/auth";
import type { FormState, GuestbookEntry } from "@/types";

const NOT_FOUND = "메시지를 찾을 수 없습니다.";

export async function submitGuestbook(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const name = formData.get("name") as string;
  const message = formData.get("message") as string;
  const password = formData.get("password") as string;

  if (!name || !message || !password) {
    return { success: false, error: "모든 항목을 입력해주세요." };
  }

  if (name.length > 50) {
    return { success: false, error: "이름은 50자 이내로 입력해주세요." };
  }

  if (message.length > 500) {
    return { success: false, error: "메시지는 500자 이내로 입력해주세요." };
  }

  if (password.length > 50) {
    return { success: false, error: "비밀번호는 50자 이내로 입력해주세요." };
  }

  const hashedPassword = await hashPassword(password);

  const visitor_id = (formData.get("visitor_id") as string) || null;

  const { error } = await supabase.from("guestbook").insert({
    name,
    message,
    password: hashedPassword,
    visitor_id,
  });

  if (error) {
    return { success: false, error: "전송에 실패했습니다. 다시 시도해주세요." };
  }

  return { success: true };
}

const PAGE_SIZE = 10;

export async function getGuestbookEntries(
  cursor?: string
): Promise<{ entries: GuestbookEntry[]; hasMore: boolean }> {
  let query = supabase
    .from("guestbook")
    .select("id, name, message, edited, created_at")
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE + 1);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;

  if (error) return { entries: [], hasMore: false };

  const rows = data ?? [];
  const hasMore = rows.length > PAGE_SIZE;

  return { entries: rows.slice(0, PAGE_SIZE), hasMore };
}

export async function updateGuestbookEntry(
  id: string,
  password: string,
  newMessage: string
): Promise<FormState> {
  if (!newMessage.trim()) {
    return { success: false, error: "메시지를 입력해주세요." };
  }

  if (newMessage.length > 500) {
    return { success: false, error: "메시지는 500자 이내로 입력해주세요." };
  }

  const verify = await verifyPassword("guestbook", id, password, NOT_FOUND);
  if (!verify.success) return verify;

  const serviceClient = getServiceClient();
  const { error } = await serviceClient
    .from("guestbook")
    .update({ message: newMessage.trim(), edited: true })
    .eq("id", id);

  if (error) {
    return { success: false, error: "수정에 실패했습니다." };
  }

  return { success: true };
}

export async function deleteGuestbookEntry(
  id: string,
  password: string,
  isAdmin = false
): Promise<FormState> {
  if (isAdmin) {
    if (!isAdminPassword(password)) {
      return { success: false, error: "권한이 없습니다." };
    }
  } else {
    const verify = await verifyPassword("guestbook", id, password, NOT_FOUND);
    if (!verify.success) return verify;
  }

  const serviceClient = getServiceClient();
  const { error } = await serviceClient.from("guestbook").delete().eq("id", id);
  if (error) {
    return { success: false, error: "삭제에 실패했습니다." };
  }

  return { success: true };
}
