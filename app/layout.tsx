import type { Metadata } from "next";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { AuthProvider } from "@/components/auth-provider";
import { ClientOnly } from "@/components/client-only";
import { LoadingSpinner } from "@/components/loading-spinner";

export const metadata: Metadata = {
  title: "오픈소스 QR 코드 생성기",
  description:
    "회원가입이나 로그인 없이 누구나 즉시 사용할 수 있는 강력하고 아름다운 정적 QR 코드 생성 도구입니다.",
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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body>
        <div id="root">
          <ClientOnly fallback={<LoadingSpinner />}>
            <AuthProvider>{children}</AuthProvider>
          </ClientOnly>
          <Toaster richColors closeButton />
          <TailwindIndicator />
        </div>
      </body>
    </html>
  );
}
