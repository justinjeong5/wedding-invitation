"use client";

import { useEffect, useRef, useState } from "react";

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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const kakaoAppKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
    if (!kakaoAppKey || !mapRef.current) return;

    // SDK가 이미 로드되어 있으면 스크립트 추가 없이 바로 초기화
    if (window.kakao?.maps) {
      window.kakao.maps.load(() => {
        if (!mapRef.current) return;
        const position = new window.kakao.maps.LatLng(lat, lng);
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: position,
          level: 3,
        });
        new window.kakao.maps.Marker({ map, position, title: name });
        setLoaded(true);
      });
      return;
    }

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
        setLoaded(true);
      });
    };

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [lat, lng, name]);

  return (
    <div className="relative w-full h-64 rounded-lg overflow-hidden">
      <div
        ref={mapRef}
        className="w-full h-full"
        aria-label={`${name} 지도`}
      />
      {!loaded && (
        <div className="absolute inset-0 bg-border/20 animate-pulse flex items-center justify-center">
          <span className="text-sm text-text-muted">지도를 불러오는 중...</span>
        </div>
      )}
    </div>
  );
}
