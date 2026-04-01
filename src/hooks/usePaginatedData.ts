import { useState, useCallback, useEffect, useRef } from "react";
import { useThrottledRefresh } from "./useThrottledRefresh";

interface UsePaginatedDataOptions<T> {
  fetchFn: (cursor?: string) => Promise<{ items: T[]; hasMore: boolean }>;
  getCursor: (item: T) => string;
}

export function usePaginatedData<T>({ fetchFn, getCursor }: UsePaginatedDataOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadInitial = useCallback(async () => {
    const result = await fetchFn();
    setItems(result.items);
    setHasMore(result.hasMore);
    setLoading(false);
  }, [fetchFn]);

  const { refreshing, cooldown, refresh, silentRefresh } = useThrottledRefresh(loadInitial);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || items.length === 0) return;
    setLoadingMore(true);
    const lastItem = items[items.length - 1];
    const result = await fetchFn(getCursor(lastItem));
    setItems((prev) => [...prev, ...result.items]);
    setHasMore(result.hasMore);
    setLoadingMore(false);
  }, [loadingMore, hasMore, items, fetchFn, getCursor]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") silentRefresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [silentRefresh]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return {
    items,
    setItems,
    loading,
    hasMore,
    loadingMore,
    refreshing,
    cooldown,
    refresh,
    reload: loadInitial,
    sentinelRef,
  };
}
