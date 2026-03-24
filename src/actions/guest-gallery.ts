"use server";

import { supabase, getServiceClient } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import type { GuestPhoto } from "@/types";

interface FormState {
  success: boolean;
  error?: string;
}

const ADMIN_PASSWORD = process.env.GUEST_GALLERY_ADMIN_PASSWORD ?? "";

export async function uploadGuestPhoto(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const name = (formData.get("name") as string)?.trim();
  const caption = (formData.get("caption") as string)?.trim() || null;
  const password = formData.get("password") as string;
  const file = formData.get("image") as File | null;

  if (!name || !password || !file) {
    return { success: false, error: "필수 항목을 입력해주세요." };
  }

  if (caption && caption.length > 50) {
    return { success: false, error: "캡션은 50자 이내로 입력해주세요." };
  }

  if (!file.type.startsWith("image/")) {
    return { success: false, error: "이미지 파일만 업로드할 수 있습니다." };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "파일 크기는 5MB 이하여야 합니다." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "webp";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("guest-photos")
    .upload(fileName, file, {
      contentType: file.type,
      cacheControl: "31536000",
    });

  if (uploadError) {
    return { success: false, error: "사진 업로드에 실패했습니다." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { error: dbError } = await supabase.from("guest_photos").insert({
    storage_path: fileName,
    name,
    caption,
    password: hashedPassword,
  });

  if (dbError) {
    await supabase.storage.from("guest-photos").remove([fileName]);
    return { success: false, error: "저장에 실패했습니다." };
  }

  return { success: true };
}

const PAGE_SIZE = 12;

export async function getGuestPhotos(
  cursor?: string
): Promise<{ photos: GuestPhoto[]; hasMore: boolean }> {
  let query = supabase
    .from("guest_photos")
    .select("id, storage_path, name, caption, created_at")
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE + 1);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;

  if (error) return { photos: [], hasMore: false };

  const rows = data ?? [];
  const hasMore = rows.length > PAGE_SIZE;

  return { photos: rows.slice(0, PAGE_SIZE), hasMore };
}

export async function deleteGuestPhoto(
  id: string,
  password: string,
  isAdmin = false
): Promise<FormState> {
  const serviceClient = getServiceClient();

  const { data } = await serviceClient
    .from("guest_photos")
    .select("password, storage_path")
    .eq("id", id)
    .single();

  if (!data) {
    return { success: false, error: "사진을 찾을 수 없습니다." };
  }

  if (isAdmin) {
    if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
      return { success: false, error: "권한이 없습니다." };
    }
  } else {
    const isMatch = await bcrypt.compare(password, data.password);
    if (!isMatch) {
      return { success: false, error: "비밀번호가 일치하지 않습니다." };
    }
  }

  await serviceClient.storage.from("guest-photos").remove([data.storage_path]);

  const { error } = await serviceClient
    .from("guest_photos")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: "삭제에 실패했습니다." };
  }

  return { success: true };
}
