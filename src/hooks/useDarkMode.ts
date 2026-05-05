"use client";

import { useState, useEffect, useCallback } from "react";

const EVENT = "dark-mode-preview";
const MEDIA = "(prefers-color-scheme: dark)";

type Override = "dark" | "light" | null;

export function useDarkMode(): { isDark: boolean; toggle: () => void } {
  const [override, setOverride] = useState<Override>(null);
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(MEDIA);
    setSystemDark(mql.matches);
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { override?: Override };
      setOverride(detail?.override ?? null);
    };
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("dark", "light");
    if (override === "dark") html.classList.add("dark");
    else if (override === "light") html.classList.add("light");
    return () => {
      html.classList.remove("dark", "light");
    };
  }, [override]);

  const isDark = override === "dark" || (override === null && systemDark);

  const toggle = useCallback(() => {
    setOverride(isDark ? "light" : "dark");
  }, [isDark]);

  return { isDark, toggle };
}
