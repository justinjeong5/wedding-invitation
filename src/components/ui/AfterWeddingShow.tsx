"use client";

import { useAfterWedding } from "@/hooks/useAfterWedding";

export default function AfterWeddingShow({
  children,
}: {
  children: React.ReactNode;
}) {
  const afterWedding = useAfterWedding();
  if (!afterWedding) return null;
  return <>{children}</>;
}
