"use client";

import { isGuestGalleryOpen } from "@/lib/date";
import { usePreviewOverride } from "./usePreviewOverride";

export function useGuestGalleryOpen(): boolean {
  return usePreviewOverride("guest-gallery-preview", isGuestGalleryOpen);
}
