import { NextResponse } from "next/server";
import { Resend } from "resend";

const ALERT_EMAIL = "justin.jeong5@gmail.com";
const THROTTLE_MS = 60_000;
let lastSentAt = 0;

export async function POST(req: Request) {
  const now = Date.now();
  if (now - lastSentAt < THROTTLE_MS) {
    return NextResponse.json({ throttled: true });
  }
  lastSentAt = now;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY not set — skipping error email");
    return NextResponse.json({ skipped: true });
  }

  const info = await req.json();
  const resend = new Resend(apiKey);
  const timestamp = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

  try {
    await resend.emails.send({
      from: "Wedding Alert <onboarding@resend.dev>",
      to: ALERT_EMAIL,
      subject: `[청첩장 장애] ${info.section ?? "알 수 없는 섹션"} 에러 발생`,
      html: `
        <h2 style="color:#c0392b;">청첩장 런타임 에러</h2>
        <table style="border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:4px 12px 4px 0;color:#888;">시간</td><td>${timestamp}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#888;">섹션</td><td>${info.section ?? "-"}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#888;">에러</td><td>${info.message}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#888;">URL</td><td>${info.url ?? "-"}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#888;">UA</td><td style="font-size:12px;">${info.userAgent ?? "-"}</td></tr>
        </table>
        ${info.stack ? `<pre style="margin-top:16px;padding:12px;background:#f5f5f5;border-radius:8px;font-size:12px;overflow:auto;max-height:300px;">${info.stack}</pre>` : ""}
      `,
    });
    return NextResponse.json({ sent: true });
  } catch (e) {
    console.error("Failed to send error email:", e);
    return NextResponse.json({ error: "send failed" }, { status: 500 });
  }
}
