import { useCallback, useEffect, useRef, useState } from "react";

const THROTTLE_MS = 5000;
const MIN_LOADING_MS = 300;

export function useThrottledRefresh(fetchFn: () => Promise<void>) {
  const [refreshing, setRefreshing] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const lastCalledAt = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = useCallback(() => {
    setCooldown(THROTTLE_MS / 1000);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const refresh = useCallback(async () => {
    const now = Date.now();
    if (now - lastCalledAt.current < THROTTLE_MS) return;
    lastCalledAt.current = now;

    setRefreshing(true);
    await Promise.all([
      fetchFn(),
      new Promise((r) => setTimeout(r, MIN_LOADING_MS)),
    ]);
    setRefreshing(false);
    startCooldown();
  }, [fetchFn, startCooldown]);

  return { refreshing, cooldown, refresh };
}
