"use client";

import { useEffect, useState } from "react";

interface UseKakaoMapOptions {
  lat: number;
  lng: number;
  name: string;
  interactive?: boolean;
}

export function useKakaoMap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  { lat, lng, name, interactive = true }: UseKakaoMapOptions
) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const kakaoAppKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
    if (!kakaoAppKey || !containerRef.current) return;

    const init = () => {
      if (!containerRef.current) return;
      const position = new window.kakao.maps.LatLng(lat, lng);
      const map = new window.kakao.maps.Map(containerRef.current, {
        center: position,
        level: 3,
      });
      if (!interactive) {
        map.setDraggable(false);
        map.setZoomable(false);
      }
      new window.kakao.maps.Marker({ map, position, title: name });
      setLoaded(true);
    };

    if (window.kakao?.maps) {
      window.kakao.maps.load(init);
      return;
    }

    const existing = document.querySelector(
      'script[src*="dapi.kakao.com/v2/maps"]'
    ) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", () => window.kakao.maps.load(init));
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoAppKey}&autoload=false`;
    script.async = true;
    script.onload = () => window.kakao.maps.load(init);
    document.head.appendChild(script);
  }, [lat, lng, name, interactive, containerRef]);

  return loaded;
}
