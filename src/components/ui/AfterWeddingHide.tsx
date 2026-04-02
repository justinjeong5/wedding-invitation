"use client";

import { useAfterWedding } from "@/hooks/useAfterWedding";

export default function AfterWeddingHide({
  children,
}: {
  children: React.ReactNode;
}) {
  const afterWedding = useAfterWedding();
  if (afterWedding) return null;
  return <>{children}</>;
}
