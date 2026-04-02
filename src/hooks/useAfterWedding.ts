"use client";

import { useState, useEffect } from "react";
import { isAfterWedding } from "@/lib/date";

let previewOverride: boolean | null = null;

export function useAfterWedding(): boolean {
  const [afterWedding, setAfterWedding] = useState(
    previewOverride ?? isAfterWedding()
  );

  useEffect(() => {
    setAfterWedding(previewOverride ?? isAfterWedding());

    const handler = (e: Event) => {
      const { enabled } = (e as CustomEvent).detail;
      previewOverride = enabled ? true : null;
      setAfterWedding(enabled ? true : isAfterWedding());
    };
    window.addEventListener("after-wedding-preview", handler);
    return () => window.removeEventListener("after-wedding-preview", handler);
  }, []);

  return afterWedding;
}
