"use client";

import { useState, useEffect } from "react";
import { loadKakaoSDK } from "@/lib/kakao";

export function useKakaoSDK() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadKakaoSDK()
      .then(() => setReady(true))
      .catch(() => {});
  }, []);

  return ready;
}
