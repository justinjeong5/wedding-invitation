"use client";

import { useState, useEffect } from "react";
import { isGuestGalleryOpen } from "@/lib/date";

export function useGuestGalleryOpen(): boolean {
  const [open, setOpen] = useState(isGuestGalleryOpen());

  useEffect(() => {
    setOpen(isGuestGalleryOpen());
  }, []);

  return open;
}
