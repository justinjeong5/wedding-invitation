"use client";

import dynamic from "next/dynamic";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { WEDDING_CONFIG } from "@/config/wedding";

const KakaoMap = dynamic(() => import("@/components/ui/KakaoMap"), {
  ssr: false,
  loading: () => <div className="w-full h-64 rounded-lg bg-gray-100 animate-pulse" />,
});

function SubwayBadge({ line }: { line: string }) {
  const colors: Record<string, string> = {
    "2호선": "#3CB44A",
    "8호선": "#E84C8A",
  };
  return (
    <span
      className="inline-flex items-center justify-center text-white text-[10px] font-medium rounded-full px-1.5 py-0.5 leading-none"
      style={{ backgroundColor: colors[line] ?? "#888", minHeight: "auto" }}
    >
      {line}
    </span>
  );
}

export default function Location() {
  const { venue } = WEDDING_CONFIG;
  const { directions } = venue;

  return (
    <SectionWrapper id="location" className="text-center">
      <h2 className="text-lg font-light text-primary mb-8 tracking-wider">
        오시는 길
      </h2>

      <div className="mb-4">
        <p className="text-base font-normal">{venue.name}</p>
        <p className="text-sm text-text-light font-light mt-1">
          예식 {venue.hall} · 연회 {venue.banquet}
        </p>
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
                <path d="M7 6v12h3V11.4L14 18h3V6h-3v6.6L10 6H7z" />
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

      {/* Directions */}
      <div className="mt-10 text-left space-y-6">
        {/* Subway */}
        <div>
          <h3 className="text-xs font-medium text-primary mb-2.5 tracking-wider">
            지하철
          </h3>
          <div className="space-y-2">
            {directions.subway.map((s) => (
              <div key={s.line} className="flex items-center gap-2 text-xs text-text-light">
                <SubwayBadge line={s.line} />
                <span>{s.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bus */}
        <div>
          <h3 className="text-xs font-medium text-primary mb-2.5 tracking-wider">
            버스
          </h3>
          <div className="space-y-1.5">
            {directions.bus.map((b) => (
              <div key={b.type} className="flex text-xs">
                <span className="text-text-muted w-16 shrink-0">{b.type}</span>
                <span className="text-text-light">{b.routes}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-text-muted/80 mt-2">
            * 그 외 다양한 노선 이용 가능
          </p>
        </div>

        {/* Car */}
        <div>
          <h3 className="text-xs font-medium text-primary mb-2.5 tracking-wider">
            자가용
          </h3>
          <div className="space-y-1.5 text-xs">
            <div className="flex">
              <span className="text-text-muted w-16 shrink-0">도로명</span>
              <span className="text-text-light">{directions.car.newAddress}</span>
            </div>
            <div className="flex">
              <span className="text-text-muted w-16 shrink-0">지번</span>
              <span className="text-text-light">{directions.car.oldAddress}</span>
            </div>
          </div>
        </div>

        {/* Parking */}
        <div>
          <h3 className="text-xs font-medium text-primary mb-2.5 tracking-wider">
            주차
          </h3>
          <p className="text-xs text-text-light">{directions.parking}</p>
        </div>
      </div>
    </SectionWrapper>
  );
}
