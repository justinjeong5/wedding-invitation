"use client";

import { useState, useEffect } from "react";

export function usePreviewOverride(
  eventName: string,
  defaultFn: () => boolean
): boolean {
  const [value, setValue] = useState(defaultFn);

  useEffect(() => {
    setValue(defaultFn());

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.reset) setValue(defaultFn());
      else setValue(Boolean(detail.value));
    };
    window.addEventListener(eventName, handler);
    return () => window.removeEventListener(eventName, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventName]);

  return value;
}
