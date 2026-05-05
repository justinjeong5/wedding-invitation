"use client";

import { useState, useCallback, useEffect } from "react";
import { useAdminMode } from "@/hooks/useAdminMode";
import { getVisitStats } from "@/actions/visit";
import type { VisitStats, DailyStat } from "@/actions/visit";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div>
      <p className="text-[10px] text-text-muted mb-0.5">{label}</p>
      <p className="text-xl text-primary font-light">{value}</p>
      {sub && <p className="text-[10px] text-text-muted/70">{sub}</p>}
    </div>
  );
}

function MiniBar({ stats }: { stats: DailyStat[] }) {
  const maxVisits = Math.max(...stats.map((s) => s.visits), 1);

  return (
    <div className="mt-4">
      <p className="text-[10px] text-text-muted mb-2">최근 7일</p>
      <div className="flex items-end gap-1 h-16">
        {stats.map((s) => (
          <div key={s.date} className="flex-1 flex flex-col items-center gap-0.5">
            <span className="text-[8px] text-text-muted/70">{s.visits}</span>
            <div
              className="w-full bg-primary/20 rounded-t"
              style={{
                height: `${Math.max((s.visits / maxVisits) * 100, 4)}%`,
                minHeight: 2,
              }}
            >
              <div
                className="w-full bg-primary/60 rounded-t"
                style={{
                  height: `${maxVisits > 0 ? (s.uniqueVisitors / maxVisits) * 100 : 0}%`,
                  minHeight: s.uniqueVisitors > 0 ? 2 : 0,
                }}
              />
            </div>
            <span className="text-[8px] text-text-muted/60">{s.date}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-1.5 justify-center">
        <span className="flex items-center gap-1 text-[8px] text-text-muted/70">
          <span className="inline-block w-2 h-2 bg-primary/20 rounded-sm" />
          방문
        </span>
        <span className="flex items-center gap-1 text-[8px] text-text-muted/70">
          <span className="inline-block w-2 h-2 bg-primary/60 rounded-sm" />
          고유 방문자
        </span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { isAdmin, adminPasswordRef } = useAdminMode();
  const [data, setData] = useState<VisitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(true);

  const fetchData = useCallback(async () => {
    const pw = adminPasswordRef.current;
    if (!pw) return;
    setLoading(true);
    setError(null);
    const result = await getVisitStats(pw);
    if (result.success && result.data) {
      setData(result.data);
    } else {
      setError(result.error ?? "불러오기 실패");
    }
    setLoading(false);
  }, [adminPasswordRef]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isAdmin) fetchData();
  }, [isAdmin, fetchData]);

  if (!isAdmin) return null;

  return (
    <div className="max-w-[480px] mx-auto px-5 pt-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-2 text-left"
        style={{ minHeight: "auto" }}
      >
        <span className="text-xs font-medium text-primary tracking-wider">
          방문자 통계
        </span>
        <svg
          viewBox="0 0 24 24"
          className={`w-4 h-4 text-text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="bg-bg-card border border-border rounded-xl p-4 mb-4">
          {loading ? (
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-2.5 w-10 bg-border/40 rounded mb-1.5" />
                  <div className="h-5 w-8 bg-border/50 rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-2">
              <p className="text-xs text-red-500 mb-2">{error}</p>
              <button
                onClick={fetchData}
                className="text-[10px] text-primary underline underline-offset-2"
              >
                다시 시도
              </button>
            </div>
          ) : data && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <StatCard label="총 방문" value={data.totalVisits} />
                <StatCard label="고유 방문자" value={data.uniqueVisitors} />
                <StatCard
                  label="재방문자"
                  value={data.returningVisitors}
                  sub={data.uniqueVisitors > 0
                    ? `${Math.round((data.returningVisitors / data.uniqueVisitors) * 100)}%`
                    : undefined}
                />
                <StatCard label="오늘 방문" value={data.todayVisits} />
                <StatCard label="오늘 고유" value={data.todayUniqueVisitors} />
                <StatCard
                  label="인당 방문"
                  value={`${data.avgVisitsPerVisitor}회`}
                />
              </div>
              <MiniBar stats={data.dailyStats} />
              <div className="flex justify-end mt-3">
                <button
                  onClick={fetchData}
                  className="text-[10px] text-text-muted underline underline-offset-2"
                >
                  새로고침
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
