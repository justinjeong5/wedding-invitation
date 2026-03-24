import { useCallback, useRef, useState } from "react";

const THROTTLE_MS = 5000;
const MIN_LOADING_MS = 300;

export function useThrottledRefresh(fetchFn: () => Promise<void>) {
  const [refreshing, setRefreshing] = useState(false);
  const lastCalledAt = useRef(0);

  const refresh = useCallback(async () => {
    const now = Date.now();
    if (now - lastCalledAt.current < THROTTLE_MS) return;
    lastCalledAt.current = now;

    setRefreshing(true);
    const [result] = await Promise.all([
      fetchFn(),
      new Promise((r) => setTimeout(r, MIN_LOADING_MS)),
    ]);
    setRefreshing(false);
    return result;
  }, [fetchFn]);

  return { refreshing, refresh };
}
