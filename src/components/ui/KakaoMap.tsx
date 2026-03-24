"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        LatLng: new (lat: number, lng: number) => unknown;
        Map: new (container: HTMLElement, options: Record<string, unknown>) => {
          setDraggable: (draggable: boolean) => void;
          setZoomable: (zoomable: boolean) => void;
        };
        Marker: new (options: Record<string, unknown>) => unknown;
      };
    };
  }
}

interface KakaoMapProps {
  lat: number;
  lng: number;
  name: string;
}

export default function KakaoMap({ lat, lng, name }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const kakaoAppKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
    if (!kakaoAppKey || !mapRef.current) return;

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoAppKey}&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (!mapRef.current) return;
        const position = new window.kakao.maps.LatLng(lat, lng);
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: position,
          level: 3,
        });

        new window.kakao.maps.Marker({ map, position, title: name });

        map.setDraggable(false);
        map.setZoomable(false);
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [lat, lng, name]);

  return (
    <div
      ref={mapRef}
      className="w-full h-64 rounded-lg bg-gray-100"
      aria-label={`${name} 지도`}
    />
  );
}
