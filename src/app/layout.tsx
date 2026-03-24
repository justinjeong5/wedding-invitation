import type { Metadata, Viewport } from "next";
import { Noto_Serif_KR, Noto_Sans_KR } from "next/font/google";
import { WEDDING_CONFIG } from "@/config/wedding";
import "./globals.css";

const notoSerifKR = Noto_Serif_KR({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
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
    <html lang="ko" className={`${notoSerifKR.variable} ${notoSansKR.variable}`}>
      <body>{children}</body>
    </html>
  );
}
