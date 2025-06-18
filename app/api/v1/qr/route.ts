import { generateQrCode, QrCodeOptions } from "@/app/actions/qr-code";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const options: QrCodeOptions = {
    text: searchParams.get("text") || "",
    type: (searchParams.get("type") as QrCodeOptions["type"]) || "png",
    width: Number(searchParams.get("width")) || 400,
    margin: Number(searchParams.get("margin")) || 10,
    color: {
      dark: searchParams.get("color[dark]") || "#000000",
      light: searchParams.get("color[light]") || "#ffffff",
    },
    dotsOptions: {
      type: (searchParams.get("dotsOptions[type]") as any) || "rounded",
      color: searchParams.get("dotsOptions[color]") || "#000000",
    },
    cornersSquareOptions: {
      type:
        (searchParams.get("cornersSquareOptions[type]") as any) ||
        "extra-rounded",
      color: searchParams.get("cornersSquareOptions[color]") || "#000000",
    },
    logo: searchParams.get("logo") || undefined,
  };

  if (!options.text) {
    return new NextResponse("Missing 'text' query parameter", { status: 400 });
  }

  try {
    const qrCodeDataUrl = await generateQrCode(options);

    // SVG의 경우 URL 인코딩된 형태로 반환되므로 다르게 처리
    if (options.type === "svg") {
      // SVG data URL에서 실제 SVG 콘텐츠 추출
      const svgContent = decodeURIComponent(qrCodeDataUrl.split(",")[1]);

      const headers = new Headers();
      headers.set("Content-Type", "image/svg+xml");
      headers.set("Content-Disposition", `inline; filename="qrcode.svg"`);

      return new NextResponse(svgContent, { status: 200, headers });
    } else {
      // PNG, JPEG 등 기타 형식은 base64 디코딩
      const base64Data = qrCodeDataUrl.split(",")[1];
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const headers = new Headers();
      headers.set("Content-Type", `image/${options.type}`);
      headers.set(
        "Content-Disposition",
        `inline; filename="qrcode.${options.type}"`,
      );

      return new NextResponse(bytes.buffer, { status: 200, headers });
    }
  } catch (error) {
    console.error(error);
    return new NextResponse("Failed to generate QR code", { status: 500 });
  }
}
