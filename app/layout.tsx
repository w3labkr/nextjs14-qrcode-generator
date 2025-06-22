import type { Metadata } from "next";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: "오픈소스 QR 코드 생성기",
  description:
    "회원가입이나 로그인 없이 누구나 즉시 사용할 수 있는 강력하고 아름다운 정적 QR 코드 생성 도구입니다.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "QR Generator",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "오픈소스 QR 코드 생성기",
    title: "오픈소스 QR 코드 생성기",
    description: "7가지 QR 코드 유형을 지원하는 무료 온라인 생성기",
  },
  twitter: {
    card: "summary",
    title: "오픈소스 QR 코드 생성기",
    description: "7가지 QR 코드 유형을 지원하는 무료 온라인 생성기",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="QR Generator" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Toaster richColors closeButton />
        <TailwindIndicator />
      </body>
    </html>
  );
}
