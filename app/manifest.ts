import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "오픈소스 QR 코드 생성기",
    short_name: "QR Generator",
    description:
      "Next.js 14 기반의 오픈소스 QR 코드 생성기 - 7가지 QR 코드 유형 지원",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "16x16 32x32 48x48",
        type: "image/x-icon",
      },
    ],
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#000000",
    categories: ["utilities", "productivity"],
    lang: "ko",
    scope: "/",
  };
}
