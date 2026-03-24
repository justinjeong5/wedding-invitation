"use server";

import { supabase } from "@/lib/supabase";

interface RsvpFormState {
  success: boolean;
  error?: string;
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

  if (!name || !side) {
    return { success: false, error: "이름과 소속을 입력해주세요." };
  }

  const { error } = await supabase.from("rsvp").insert({
    name,
    side,
    attendance,
    guest_count: attendance ? guestCount : 0,
    meal: attendance ? meal : false,
    message,
  });

  if (error) {
    return { success: false, error: "전송에 실패했습니다. 다시 시도해주세요." };
  }

  return { success: true };
}
