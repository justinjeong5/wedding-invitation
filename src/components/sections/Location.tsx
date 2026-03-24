"use client";

import dynamic from "next/dynamic";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { WEDDING_CONFIG } from "@/config/wedding";

const KakaoMap = dynamic(() => import("@/components/ui/KakaoMap"), {
  ssr: false,
  loading: () => <div className="w-full h-64 rounded-lg bg-gray-100 animate-pulse" />,
});

function TransportBadge({ label, color, textColor = "white" }: { label: string; color: string; textColor?: string }) {
  return (
    <span
      className="inline-flex items-center justify-center text-xs font-medium rounded-full px-2 py-0.5 leading-none shrink-0 whitespace-nowrap"
      style={{ backgroundColor: color, color: textColor, minHeight: "auto", minWidth: "3.5rem" }}
    >
      {label}
    </span>
  );
}

const subwayColors: Record<string, string> = {
  "2호선": "#3CB44A",
  "8호선": "#E84C8A",
};

const busColors: Record<string, string> = {
  "일반": "#FFCC00",
  "간선": "#3461A5",
  "지선": "#5BB025",
  "광역·직행": "#E00A0E",
  "공항": "#5C4BA5",
};

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
      <div className="mt-12 text-center">
        <div className="mb-6">
          <p className="font-serif text-base text-text-light tracking-[0.15em] font-light">교통 안내</p>
          <div className="mt-2.5 mx-auto w-12 h-px bg-primary/40" />
        </div>

        <div className="border border-border rounded-2xl overflow-hidden divide-y divide-border bg-bg-card text-left">
          {/* Subway */}
          <div className="px-5 py-4">
            <p className="text-xs text-primary font-semibold tracking-[0.12em] mb-3">지하철</p>
            <div className="space-y-1.5">
              {directions.subway.map((s) => (
                <div key={s.line} className="flex items-center gap-2 text-xs text-text-light">
                  <TransportBadge label={s.line} color={subwayColors[s.line] ?? "#888"} />
                  <span>{s.detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bus */}
          <div className="px-5 py-4">
            <p className="text-xs text-primary font-semibold tracking-[0.12em] mb-3">버스</p>
            <div className="space-y-1.5">
              {directions.bus.map((b) => (
                <div key={b.type} className="flex items-center gap-2 text-xs">
                  <TransportBadge label={b.type} color={busColors[b.type] ?? "#888"} textColor={b.type === "일반" ? "#333" : "white"} />
                  <span className="text-text-light">{b.routes}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Car + Parking */}
          <div className="px-5 py-4">
            <p className="text-xs text-primary font-semibold tracking-[0.12em] mb-3">자가용 · 주차</p>
            <div className="space-y-2">
              <div className="flex gap-3 text-xs">
                <span className="text-text-muted w-10 shrink-0">도로명</span>
                <span className="text-text-light">{directions.car.newAddress}</span>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="text-text-muted w-10 shrink-0">지번</span>
                <span className="text-text-light">{directions.car.oldAddress}</span>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="text-text-muted w-10 shrink-0">주차</span>
                <span className="text-text-light">{directions.parking}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
