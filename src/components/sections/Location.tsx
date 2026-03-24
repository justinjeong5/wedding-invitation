"use client";

import dynamic from "next/dynamic";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { WEDDING_CONFIG } from "@/config/wedding";

const KakaoMap = dynamic(() => import("@/components/ui/KakaoMap"), {
  ssr: false,
  loading: () => <div className="w-full h-64 rounded-lg bg-gray-100 animate-pulse" />,
});

export default function Location() {
  const { venue } = WEDDING_CONFIG;

  return (
    <SectionWrapper id="location" className="text-center">
      <h2 className="text-lg font-light text-primary mb-8 tracking-wider">
        오시는 길
      </h2>

      <div className="mb-4">
        <p className="text-base font-normal">{venue.name}</p>
        <p className="text-sm text-text-light font-light mt-1">{venue.hall}</p>
        <p className="text-xs text-text-muted font-sans mt-2">{venue.address}</p>
        <p className="text-xs text-text-muted font-sans mt-1">
          Tel. {venue.tel}
        </p>
      </div>

      <KakaoMap
        lat={venue.coordinates.lat}
        lng={venue.coordinates.lng}
        name={venue.name}
      />

      {/* Navigation Buttons */}
      <div className="flex gap-2 mt-4 justify-center font-sans">
        <a
          href={venue.kakaoMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 max-w-[120px] py-2.5 text-xs bg-[#FEE500] text-[#191919] rounded-lg text-center font-medium"
        >
          카카오맵
        </a>
        <a
          href={venue.naverMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 max-w-[120px] py-2.5 text-xs bg-[#03C75A] text-white rounded-lg text-center font-medium"
        >
          네이버지도
        </a>
        <a
          href={venue.tmapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 max-w-[120px] py-2.5 text-xs bg-[#EF4040] text-white rounded-lg text-center font-medium"
        >
          티맵
        </a>
      </div>

      {venue.parking && (
        <p className="text-xs text-text-muted font-sans mt-4">{venue.parking}</p>
      )}
    </SectionWrapper>
  );
}
