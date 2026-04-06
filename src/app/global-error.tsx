"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, background: "#FAF9F7" }}>
        <main
          style={{
            minHeight: "100dvh",
            maxWidth: 480,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 20px",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <p
            style={{
              fontSize: 14,
              color: "#4A4540",
              fontWeight: 300,
              marginBottom: 8,
            }}
          >
            페이지를 불러오지 못했습니다
          </p>
          <p
            style={{
              fontSize: 12,
              color: "#9E9A94",
              fontWeight: 300,
              marginBottom: 32,
            }}
          >
            잠시 후 다시 시도해주세요
          </p>
          <button
            onClick={reset}
            style={{
              padding: "10px 24px",
              fontSize: 12,
              color: "#8B7355",
              background: "transparent",
              border: "1px solid rgba(139,115,85,0.3)",
              borderRadius: 9999,
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
        </main>
      </body>
    </html>
  );
}
