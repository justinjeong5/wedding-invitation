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
        <p className="text-xs text-text-muted mt-2">{venue.address}</p>
        <p className="text-xs text-text-muted mt-1">
          Tel. {venue.tel}
        </p>
      </div>

      <KakaoMap
        lat={venue.coordinates.lat}
        lng={venue.coordinates.lng}
        name={venue.name}
      />

      {/* Navigation Buttons */}
      <div className="flex gap-4 mt-5 justify-center">
        {[
          {
            href: venue.kakaoMapUrl,
            label: "카카오맵",
            bg: "#FEE500",
            icon: (
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#3C1E1E">
                <path d="M12 3C6.48 3 2 6.54 2 10.86c0 2.8 1.86 5.27 4.66 6.67l-.9 3.34c-.08.28.24.52.49.36l3.96-2.64c.58.08 1.18.13 1.79.13 5.52 0 10-3.54 10-7.86S17.52 3 12 3z" />
              </svg>
            ),
          },
          {
            href: venue.naverMapUrl,
            label: "네이버지도",
            bg: "#03C75A",
            icon: (
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
                <path d="M13.5 12.3V18h-3v-5.7L7 6h3.3l1.8 3.6L13.8 6H17l-3.5 6.3z" />
              </svg>
            ),
          },
          {
            href: venue.tmapUrl,
            label: "티맵",
            bg: "#EF4040",
            icon: (
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
                <path d="M7 7h10v3h-3.5v8h-3V10H7V7z" />
              </svg>
            ),
          },
        ].map(({ href, label, bg, icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5"
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center shadow-sm"
              style={{ backgroundColor: bg, minHeight: "auto" }}
            >
              {icon}
            </div>
            <span className="text-[11px] text-text-light">{label}</span>
          </a>
        ))}
      </div>

      {(venue.transport || venue.parking) && (
        <div className="text-xs text-text-muted mt-4 space-y-1">
          {venue.transport && <p>{venue.transport}</p>}
          {venue.parking && <p>{venue.parking}</p>}
        </div>
      )}
    </SectionWrapper>
  );
}
