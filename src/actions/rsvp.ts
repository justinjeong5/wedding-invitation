"use server";

import { supabase, getServiceClient } from "@/lib/supabase";
import bcrypt from "bcryptjs";

interface RsvpData {
  id: string;
  name: string;
  side: string;
  attendance: boolean;
  guest_count: number;
  meal: boolean;
  message: string | null;
}

interface RsvpFormState {
  success: boolean;
  error?: string;
  data?: RsvpData;
}

export async function submitRsvp(
  _prevState: RsvpFormState,
  formData: FormData
): Promise<RsvpFormState> {
  const name = formData.get("name") as string;
  const side = formData.get("side") as string;
  const attendance = formData.get("attendance") === "true";
  const guestCount = parseInt(formData.get("guest_count") as string, 10) || 1;
  const meal = formData.get("meal") === "true";
  const message = (formData.get("message") as string) || null;
  const password = formData.get("password") as string;

  if (!name || !side || !password) {
    return { success: false, error: "이름, 소속, 비밀번호를 입력해주세요." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();

  const { error } = await supabase.from("rsvp").insert({
    id,
    name,
    side,
    attendance,
    guest_count: attendance ? guestCount : 0,
    meal: attendance ? meal : false,
    message,
    password: hashedPassword,
  });

  if (error) {
    return { success: false, error: "전송에 실패했습니다. 다시 시도해주세요." };
  }

  return {
    success: true,
    data: {
      id,
      name,
      side,
      attendance,
      guest_count: attendance ? guestCount : 0,
      meal: attendance ? meal : false,
      message,
    },
  };
}

export async function verifyRsvpPassword(
  id: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const serviceClient = getServiceClient();

  const { data } = await serviceClient
    .from("rsvp")
    .select("password")
    .eq("id", id)
    .single();

  if (!data) {
    return { success: false, error: "참석 정보를 찾을 수 없습니다." };
  }

  const isMatch = await bcrypt.compare(password, data.password);
  if (!isMatch) {
    return { success: false, error: "비밀번호가 일치하지 않습니다." };
  }

  return { success: true };
}

export async function updateRsvp(
  _prevState: RsvpFormState,
  formData: FormData
): Promise<RsvpFormState> {
  const id = formData.get("id") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const side = formData.get("side") as string;
  const attendance = formData.get("attendance") === "true";
  const guestCount = parseInt(formData.get("guest_count") as string, 10) || 1;
  const meal = formData.get("meal") === "true";
  const message = (formData.get("message") as string) || null;

  if (!id || !name || !side || !password) {
    return { success: false, error: "필수 항목이 누락되었습니다." };
  }

  const serviceClient = getServiceClient();

  const { data: existing } = await serviceClient
    .from("rsvp")
    .select("password")
    .eq("id", id)
    .single();

  if (!existing) {
    return { success: false, error: "참석 정보를 찾을 수 없습니다." };
  }

  const isMatch = await bcrypt.compare(password, existing.password);
  if (!isMatch) {
    return { success: false, error: "비밀번호가 일치하지 않습니다." };
  }

  const { error } = await serviceClient
    .from("rsvp")
    .update({
      name,
      side,
      attendance,
      guest_count: attendance ? guestCount : 0,
      meal: attendance ? meal : false,
      message,
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: "수정에 실패했습니다. 다시 시도해주세요." };
  }

  return {
    success: true,
    data: {
      id,
      name,
      side,
      attendance,
      guest_count: attendance ? guestCount : 0,
      meal: attendance ? meal : false,
      message,
    },
  };
}

export async function deleteRsvp(
  id: string,
  password: string
): Promise<RsvpFormState> {
  const serviceClient = getServiceClient();

  const { data } = await serviceClient
    .from("rsvp")
    .select("password")
    .eq("id", id)
    .single();

  if (!data) {
    return { success: false, error: "참석 정보를 찾을 수 없습니다." };
  }

  const isMatch = await bcrypt.compare(password, data.password);
  if (!isMatch) {
    return { success: false, error: "비밀번호가 일치하지 않습니다." };
  }

  const { error } = await serviceClient.from("rsvp").delete().eq("id", id);
  if (error) {
    return { success: false, error: "삭제에 실패했습니다." };
  }

  return { success: true };
}
