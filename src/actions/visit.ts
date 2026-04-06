"use server";

import { supabase, getServiceClient } from "@/lib/supabase";
import { isAdminPassword } from "@/lib/auth";

export async function recordVisit(visitorId: string) {
  try {
    await supabase.from("visits").insert({ visitor_id: visitorId });
  } catch (e) {
    console.error("Failed to record visit:", e);
  }
}

export interface DailyStat {
  date: string;
  visits: number;
  uniqueVisitors: number;
}

export interface VisitStats {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  todayUniqueVisitors: number;
  returningVisitors: number;
  avgVisitsPerVisitor: number;
  dailyStats: DailyStat[];
}

export async function getVisitStats(adminPassword: string): Promise<{
  success: boolean;
  data?: VisitStats;
  error?: string;
}> {
  if (!isAdminPassword(adminPassword)) {
    return { success: false, error: "권한이 없습니다." };
  }

  try {
    const serviceClient = getServiceClient();
    const { data, error } = await serviceClient
      .from("visits")
      .select("visitor_id, created_at");

    if (error || !data) {
      console.error("Visit stats query error:", error);
      return { success: false, error: error?.message ?? "데이터를 불러오는데 실패했습니다." };
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const allVisitorIds = data.map((r) => r.visitor_id);
    const uniqueSet = new Set(allVisitorIds);

    const todayRows = data.filter((r) => r.created_at >= todayStart);
    const todayUniqueSet = new Set(todayRows.map((r) => r.visitor_id));

    // 재방문자: 2회 이상 방문한 고유 방문자
    const visitCounts = new Map<string, number>();
    for (const vid of allVisitorIds) {
      visitCounts.set(vid, (visitCounts.get(vid) || 0) + 1);
    }
    const returningVisitors = [...visitCounts.values()].filter((c) => c >= 2).length;

    // 최근 7일 일별 통계
    const dailyStats: DailyStat[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayStart = d.toISOString();
      const dayEnd = new Date(d.getTime() + 86400000).toISOString();
      const dayRows = data.filter((r) => r.created_at >= dayStart && r.created_at < dayEnd);
      dailyStats.push({
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        visits: dayRows.length,
        uniqueVisitors: new Set(dayRows.map((r) => r.visitor_id)).size,
      });
    }

    return {
      success: true,
      data: {
        totalVisits: data.length,
        uniqueVisitors: uniqueSet.size,
        todayVisits: todayRows.length,
        todayUniqueVisitors: todayUniqueSet.size,
        returningVisitors,
        avgVisitsPerVisitor: uniqueSet.size > 0
          ? Math.round((data.length / uniqueSet.size) * 10) / 10
          : 0,
        dailyStats,
      },
    };
  } catch (e) {
    console.error("Visit stats error:", e);
    return { success: false, error: e instanceof Error ? e.message : "알 수 없는 오류" };
  }
}
