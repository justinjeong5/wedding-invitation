"use client";

import { useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useKakaoMap } from "@/hooks/useKakaoMap";
import KakaoMapModal from "@/components/ui/KakaoMapModal";

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        LatLng: new (lat: number, lng: number) => unknown;
        Map: new (
          container: HTMLElement,
          options: Record<string, unknown>
        ) => {
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
  const [modalOpen, setModalOpen] = useState(false);
  const loaded = useKakaoMap(mapRef, { lat, lng, name, interactive: false });

  return (
    <>
      <div className="relative w-full h-64 rounded-lg overflow-hidden">
        <div ref={mapRef} className="w-full h-full" aria-hidden="true" />

        {/* 터치 블로킹 오버레이 — 페이지 스크롤 허용, 지도 인터랙션 차단 */}
        <div className="absolute inset-0 z-10" />

        {/* 확대 버튼 */}
        {loaded && (
          <button
            type="button"
            className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full pl-2.5 pr-3 h-8 border border-border/60 shadow-sm active:scale-95 transition-transform"
            onClick={() => setModalOpen(true)}
            aria-label={`${name} 지도 크게 보기`}
            style={{ minHeight: "auto" }}
          >
            <svg
              viewBox="0 0 16 16"
              className="w-3.5 h-3.5 text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4"
              />
            </svg>
            <span className="text-[11px] text-text-light font-medium tracking-wide">
              지도 크게 보기
            </span>
          </button>
        )}

        {!loaded && (
          <div className="absolute inset-0 bg-border/20 animate-pulse flex items-center justify-center">
            <span className="text-sm text-text-muted">
              지도를 불러오는 중...
            </span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <KakaoMapModal
            lat={lat}
            lng={lng}
            name={name}
            onClose={() => setModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
