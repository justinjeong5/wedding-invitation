"use client";

import { useState, useEffect } from "react";
import { isGuestGalleryOpen } from "@/lib/date";

let previewOverride: boolean | null = null;

export function useGuestGalleryOpen(): boolean {
  const [open, setOpen] = useState(previewOverride ?? isGuestGalleryOpen());

  useEffect(() => {
    setOpen(previewOverride ?? isGuestGalleryOpen());

    const handler = (e: Event) => {
      const { enabled } = (e as CustomEvent).detail;
      previewOverride = enabled ? true : null;
      setOpen(enabled ? true : isGuestGalleryOpen());
    };
    window.addEventListener("guest-gallery-preview", handler);
    return () => window.removeEventListener("guest-gallery-preview", handler);
  }, []);

  return open;
}
