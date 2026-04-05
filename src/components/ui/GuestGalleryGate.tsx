"use client";

import { useGuestGalleryOpen } from "@/hooks/useGuestGalleryOpen";

export default function GuestGalleryGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const open = useGuestGalleryOpen();
  if (!open) return null;
  return <>{children}</>;
}
