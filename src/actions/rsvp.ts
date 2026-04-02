"use server";

import { supabase, getServiceClient } from "@/lib/supabase";
import { hashPassword, verifyPassword } from "@/lib/auth";
import type { FormState } from "@/types";

interface RsvpData {
  id: string;
  name: string;
  side: string;
  attendance: boolean;
  guest_count: number;
  meal: boolean;
  message: string | null;
}

interface RsvpFormState extends FormState {
  data?: RsvpData;
}

const NOT_FOUND = "참석 정보를 찾을 수 없습니다.";

export async function submitRsvp(
  _prevState: RsvpFormState,
  formData: FormData
): Promise<RsvpFormState> {
  const name = formData.get("name") as string;
  const side = formData.get("side") as string;
  const attendance = formData.get("attendance") === "true";
  const guestCount = Math.max(1, Math.min(10, parseInt(formData.get("guest_count") as string, 10) || 1));
  const meal = formData.get("meal") === "true";
  const message = (formData.get("message") as string) || null;
  const password = formData.get("password") as string;

  if (!name || !side || !password) {
    return { success: false, error: "이름, 소속, 비밀번호를 입력해주세요." };
  }

  if (side !== "groom" && side !== "bride") {
    return { success: false, error: "소속을 올바르게 선택해주세요." };
  }

  if (name.length > 50) {
    return { success: false, error: "이름은 50자 이내로 입력해주세요." };
  }

  if (password.length > 50) {
    return { success: false, error: "비밀번호는 50자 이내로 입력해주세요." };
  }

  if (message && message.length > 500) {
    return { success: false, error: "메시지는 500자 이내로 입력해주세요." };
  }

  const hashedPassword = await hashPassword(password);
  const id = crypto.randomUUID();

  const visitor_id = (formData.get("visitor_id") as string) || null;

  const { error } = await supabase.from("rsvp").insert({
    id,
    name,
    side,
    attendance,
    guest_count: attendance ? guestCount : 0,
    meal: attendance ? meal : false,
    message,
    password: hashedPassword,
    visitor_id,
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
): Promise<FormState> {
  return verifyPassword("rsvp", id, password, NOT_FOUND);
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
  const guestCount = Math.max(1, Math.min(10, parseInt(formData.get("guest_count") as string, 10) || 1));
  const meal = formData.get("meal") === "true";
  const message = (formData.get("message") as string) || null;

  if (!id || !name || !side || !password) {
    return { success: false, error: "필수 항목이 누락되었습니다." };
  }

  if (side !== "groom" && side !== "bride") {
    return { success: false, error: "소속을 올바르게 선택해주세요." };
  }

  const verify = await verifyPassword("rsvp", id, password, NOT_FOUND);
  if (!verify.success) return verify;

  const serviceClient = getServiceClient();
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
  const verify = await verifyPassword("rsvp", id, password, NOT_FOUND);
  if (!verify.success) return verify;

  const serviceClient = getServiceClient();
  const { error } = await serviceClient.from("rsvp").delete().eq("id", id);
  if (error) {
    return { success: false, error: "삭제에 실패했습니다." };
  }

  return { success: true };
}
