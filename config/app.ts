import pkg from "@/package.json";

export const appConfig = {
  name: "QR Code Generator",
  description: "다양한 유형의 QR 코드를 생성할 수 있는 웹 애플리케이션입니다.",
  version: `v${pkg.version}`,
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};
