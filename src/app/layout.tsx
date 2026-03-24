import type { Metadata, Viewport } from "next";
import { Noto_Serif_KR } from "next/font/google";
import { WEDDING_CONFIG } from "@/config/wedding";
import "./globals.css";

const notoSerifKR = Noto_Serif_KR({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(WEDDING_CONFIG.meta.siteUrl),
  title: WEDDING_CONFIG.meta.title,
  description: WEDDING_CONFIG.meta.description,
  openGraph: {
    title: WEDDING_CONFIG.meta.title,
    description: WEDDING_CONFIG.meta.description,
    images: [WEDDING_CONFIG.meta.ogImage],
    type: "website",
    url: WEDDING_CONFIG.meta.siteUrl,
    siteName: WEDDING_CONFIG.meta.title,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={notoSerifKR.variable}>
      {/* 여기까지 읽은 사람은 개발자겠죠? 축하해주세요 🙏 */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              setTimeout(function(){
                console.log(
                  "%c💒 정경하 ♥ 전우림 %c\\n\\n" +
                  "%c여기까지 오셨다면 개발자시군요!%c\\n" +
                  "저희 결혼을 축하해주셔서 감사합니다 🙏\\n\\n" +
                  "%cbuilt with Next.js + Tailwind + ☕ + 💕%c\\n",
                  "font-size:24px;font-weight:bold;color:#8B7355;",
                  "",
                  "font-size:14px;color:#333;",
                  "font-size:13px;color:#666;",
                  "font-size:11px;color:#aaa;font-style:italic;",
                  ""
                );
              }, 500);
            `,
          }}
        />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
