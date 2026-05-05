import { NextResponse } from "next/server";
import { Resend } from "resend";

const ALERT_EMAIL = "justin.jeong5@gmail.com";
const THROTTLE_MS = 60_000;
const MAX_FIELD_LEN = 2000;
const MAX_STACK_LEN = 8000;
let lastSentAt = 0;

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sanitize = (v: unknown, max = MAX_FIELD_LEN) => {
  if (typeof v !== "string") return "";
  return escapeHtml(v.slice(0, max));
};

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

  let info: Record<string, unknown>;
  try {
    info = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const section = sanitize(info.section, 200) || "-";
  const message = sanitize(info.message) || "-";
  const url = sanitize(info.url, 500) || "-";
  const userAgent = sanitize(info.userAgent, 500) || "-";
  const stack = sanitize(info.stack, MAX_STACK_LEN);

  const resend = new Resend(apiKey);
  const timestamp = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

  try {
    await resend.emails.send({
      from: "Wedding Alert <onboarding@resend.dev>",
      to: ALERT_EMAIL,
      subject: `[청첩장 장애] ${section} 에러 발생`,
      html: `
        <h2 style="color:#c0392b;">청첩장 런타임 에러</h2>
        <table style="border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:4px 12px 4px 0;color:#888;">시간</td><td>${escapeHtml(timestamp)}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#888;">섹션</td><td>${section}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#888;">에러</td><td>${message}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#888;">URL</td><td>${url}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#888;">UA</td><td style="font-size:12px;">${userAgent}</td></tr>
        </table>
        ${stack ? `<pre style="margin-top:16px;padding:12px;background:#f5f5f5;border-radius:8px;font-size:12px;overflow:auto;max-height:300px;">${stack}</pre>` : ""}
      `,
    });
    return NextResponse.json({ sent: true });
  } catch (e) {
    console.error("Failed to send error email:", e);
    return NextResponse.json({ error: "send failed" }, { status: 500 });
  }
}
