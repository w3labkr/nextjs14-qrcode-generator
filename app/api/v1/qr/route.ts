import { NextRequest, NextResponse } from "next/server";
import { generateQrCode, QrCodeOptions } from "@/app/actions/qr-code";

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
    const base64Data = qrCodeDataUrl.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    const headers = new Headers();
    headers.set("Content-Type", `image/${options.type}`);
    headers.set(
      "Content-Disposition",
      `inline; filename="qrcode.${options.type}"`,
    );

    return new NextResponse(buffer, { status: 200, headers });
  } catch (error) {
    console.error(error);
    return new NextResponse("Failed to generate QR code", { status: 500 });
  }
}
