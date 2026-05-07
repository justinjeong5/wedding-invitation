"use client";

import { isDataDisposed } from "@/lib/date";
import { usePreviewOverride } from "./usePreviewOverride";

export function useDataDisposed(): boolean {
  return usePreviewOverride("data-disposed-preview", isDataDisposed);
}
