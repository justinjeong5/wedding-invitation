"use server";

import { supabase } from "@/lib/supabase";

export async function recordVisit(visitorId: string) {
  try {
    await supabase.from("visits").insert({ visitor_id: visitorId });
  } catch (e) {
    console.error("Failed to record visit:", e);
  }
}
