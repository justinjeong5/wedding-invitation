"use server";

import { supabase } from "@/lib/supabase";

export async function recordVisit(visitorId: string) {
  await supabase.from("visits").insert({ visitor_id: visitorId });
}
