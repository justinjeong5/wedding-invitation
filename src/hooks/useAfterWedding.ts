"use client";

import { isAfterWedding } from "@/lib/date";
import { usePreviewOverride } from "./usePreviewOverride";

export function useAfterWedding(): boolean {
  return usePreviewOverride("after-wedding-preview", isAfterWedding);
}
