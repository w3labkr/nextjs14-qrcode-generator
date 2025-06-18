import type { Metadata } from "next";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { CookieConsent } from "@/components/cookie-consent";

export const metadata: Metadata = {
  title: "오픈소스 QR 코드 생성기",
  description:
    "회원가입이나 로그인 없이 누구나 즉시 사용할 수 있는 강력하고 아름다운 정적 QR 코드 생성 도구입니다.",
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
      </head>
      <body>
        {children}
        <Toaster richColors closeButton />
        <TailwindIndicator />
        <CookieConsent />
      </body>
    </html>
  );
}
