import type { Metadata, Viewport } from "next";
import { PWARegister } from "@/components/PWARegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "서울숲 투어 가이드",
  description:
    "서울숲 오프라인 투어를 위한 모바일 가이드. 도슨트 해설 · 포토스팟 · AI 사진 분석.",
  applicationName: "서울숲 투어",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "서울숲 투어",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#2D5F3F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="font-sans antialiased min-h-dvh">
        <div className="mx-auto max-w-[640px] min-h-dvh flex flex-col">
          {children}
        </div>
        <PWARegister />
      </body>
    </html>
  );
}
