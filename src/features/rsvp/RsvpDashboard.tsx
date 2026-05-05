"use client";

import { useState, useCallback, useEffect } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { getRsvpSummary } from "@/features/rsvp/actions";
import type { RsvpSummaryData } from "@/features/rsvp/actions";

const STAT_ITEMS: { key: keyof RsvpSummaryData; label: string }[] = [
  { key: "total", label: "총 응답" },
  { key: "attending", label: "참석" },
  { key: "notAttending", label: "불참" },
  { key: "groomSide", label: "신랑측" },
  { key: "brideSide", label: "신부측" },
  { key: "totalGuests", label: "예상 인원" },
  { key: "mealCount", label: "식사 인원" },
];

export default function RsvpDashboard({ adminPassword }: { adminPassword: string }) {
  const [data, setData] = useState<RsvpSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getRsvpSummary(adminPassword);
    if (result.success && result.data) {
      setData(result.data);
    } else {
      setError(result.error ?? "불러오기 실패");
    }
    setLoading(false);
  }, [adminPassword]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  return (
    <SectionWrapper id="rsvp-dashboard" className="text-center">
      <h2 className="text-lg font-light text-primary mb-2 tracking-wider">
        참석 현황
      </h2>
      <p className="text-xs text-text-muted font-light mb-6">
        RSVP 응답 집계
      </p>

      {loading ? (
        <div className="max-w-sm mx-auto">
          <div className="bg-bg-card border border-border rounded-xl p-5">
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className={`animate-pulse ${i === 6 ? "col-span-2" : ""}`}
                >
                  <div className="h-3 w-12 bg-border/40 rounded mx-auto mb-2" />
                  <div className="h-7 w-10 bg-border/50 rounded mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="max-w-sm mx-auto">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button
            onClick={fetchData}
            className="text-xs text-primary underline underline-offset-2"
          >
            다시 시도
          </button>
        </div>
      ) : (
        data && (
          <div className="max-w-sm mx-auto">
            <div className="bg-bg-card border border-border rounded-xl p-5">
              <div className="grid grid-cols-2 gap-4">
                {STAT_ITEMS.map((item, i) => (
                  <div
                    key={item.key}
                    className={
                      i === STAT_ITEMS.length - 1 && STAT_ITEMS.length % 2 !== 0
                        ? "col-span-2"
                        : ""
                    }
                  >
                    <p className="text-xs text-text-muted mb-1">{item.label}</p>
                    <p className="text-2xl text-primary font-light">
                      {data[item.key]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={fetchData}
              className="mt-4 text-xs text-text-muted underline underline-offset-2"
            >
              새로고침
            </button>
          </div>
        )
      )}
    </SectionWrapper>
  );
}
