"use client";

import { usePreviewOverride } from "@/hooks/usePreviewOverride";
import { isSubmissionClosed } from "@/lib/date";

export function useSubmissionOpen(): boolean {
  return usePreviewOverride(
    "submission-open-preview",
    () => !isSubmissionClosed()
  );
}
