"use server";

import { supabase, getServiceClient } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { hashPassword } from "@/lib/auth";
import type { FormState, GuestPhoto } from "@/types";

const ADMIN_PASSWORD = process.env.GUEST_GALLERY_ADMIN_PASSWORD ?? "";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const MAGIC_BYTES: [string, number[]][] = [
  ["image/jpeg", [0xff, 0xd8, 0xff]],
  ["image/png", [0x89, 0x50, 0x4e, 0x47]],
  ["image/webp", [0x52, 0x49, 0x46, 0x46]], // RIFF
];

function verifyMagicBytes(buffer: Buffer, mime: string): boolean {
  const entry = MAGIC_BYTES.find(([m]) => m === mime);
  if (!entry) return true; // HEIC 등은 magic bytes 검증 생략
  const [, expected] = entry;
  return expected.every((byte, i) => buffer[i] === byte);
}

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

  if (name.length > 50) {
    return { success: false, error: "이름은 50자 이내로 입력해주세요." };
  }

  if (caption && caption.length > 50) {
    return { success: false, error: "캡션은 50자 이내로 입력해주세요." };
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return { success: false, error: "JPG, PNG, WebP, HEIC 형식만 업로드할 수 있습니다." };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "파일 크기는 5MB 이하여야 합니다." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (!verifyMagicBytes(buffer, file.type)) {
    return { success: false, error: "올바른 이미지 파일이 아닙니다." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "webp";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const serviceClient = getServiceClient();

  const { error: uploadError } = await serviceClient.storage
    .from("guest-photos")
    .upload(fileName, buffer, {
      contentType: file.type,
      cacheControl: "31536000",
    });

  if (uploadError) {
    return { success: false, error: "사진 업로드에 실패했습니다." };
  }

  const hashedPassword = await hashPassword(password);

  const visitor_id = (formData.get("visitor_id") as string) || null;

  const { error: dbError } = await serviceClient.from("guest_photos").insert({
    storage_path: fileName,
    name,
    caption,
    password: hashedPassword,
    visitor_id,
  });

  if (dbError) {
    await serviceClient.storage.from("guest-photos").remove([fileName]);
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

export async function verifyAdminPassword(password: string): Promise<boolean> {
  return !!ADMIN_PASSWORD && password === ADMIN_PASSWORD;
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
