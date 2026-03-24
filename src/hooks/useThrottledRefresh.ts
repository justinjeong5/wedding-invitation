import { useCallback, useRef, useState } from "react";

const THROTTLE_MS = 5000;

export function useThrottledRefresh(fetchFn: () => Promise<void>) {
  const [refreshing, setRefreshing] = useState(false);
  const lastCalledAt = useRef(0);

  const refresh = useCallback(async () => {
    const now = Date.now();
    if (now - lastCalledAt.current < THROTTLE_MS) return;
    lastCalledAt.current = now;

    setRefreshing(true);
    await fetchFn();
    setRefreshing(false);
  }, [fetchFn]);

  return { refreshing, refresh };
}
